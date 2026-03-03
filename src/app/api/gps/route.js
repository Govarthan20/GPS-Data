import { query } from '../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Auto-register a device by IP address.
 * If the device is new, create a vehicle entry for it.
 * Returns the UUID of the vehicle associated with this device IP.
 */
async function getOrCreateVehicleByDevice(deviceIp) {
    const deviceName = `Device-${deviceIp}`;

    // Check if a vehicle already exists for this device IP
    const existing = await query(
        `SELECT id FROM vehicles WHERE plate_number = $1 LIMIT 1`,
        [deviceIp]
    );

    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    }

    // Auto-register a new vehicle for this device
    console.log(`New device connected: ${deviceIp}. Auto-registering as a vehicle...`);
    const newVehicle = await query(
        `INSERT INTO vehicles (name, plate_number, type, status, driver_name, fuel_level)
         VALUES ($1, $2, 'sedan', 'in_use', $3, 100)
         RETURNING id`,
        [deviceName, deviceIp, deviceIp]
    );

    console.log(`Registered new vehicle for device ${deviceIp}: ID ${newVehicle.rows[0].id}`);
    return newVehicle.rows[0].id;
}

export async function POST(request) {
    try {
        let body;

        // Handle both JSON and application/x-www-form-urlencoded
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            body = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            body = Object.fromEntries(formData.entries());
        } else {
            try {
                body = await request.json();
            } catch (e) {
                body = {};
            }
        }

        // device_ip is sent by our udp-gps-receiver to identify the phone
        const device_ip = body.device_ip;
        const latitude = body.latitude !== undefined ? body.latitude : (body.lat !== undefined ? body.lat : body.lt);
        const longitude = body.longitude !== undefined ? body.longitude : (body.lng !== undefined ? body.lng : (body.lon !== undefined ? body.lon : body.ln));
        const speed = body.speed ?? body.spd;
        const heading = body.heading ?? body.dir ?? body.course;
        const accuracy = body.accuracy ?? body.acc;
        const altitude = body.altitude ?? body.alt;

        if (!device_ip || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: device_ip, latitude, longitude' },
                { status: 400 }
            );
        }

        // Get or create the vehicle UUID for this device
        const vehicle_id = await getOrCreateVehicleByDevice(device_ip);

        const result = await query(
            `INSERT INTO gps_locations 
            (vehicle_id, latitude, longitude, speed, heading, accuracy, altitude) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
                vehicle_id,
                parseFloat(latitude),
                parseFloat(longitude),
                speed ? parseFloat(speed) : 0,
                heading ? parseFloat(heading) : 0,
                accuracy ? parseFloat(accuracy) : 0,
                altitude ? parseFloat(altitude) : 0
            ]
        );

        return NextResponse.json({ success: true, vehicle_id, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Error saving GPS POST data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    return NextResponse.json({
        message: "Live GPS ingestion endpoint.",
        usage: {
            POST: "Send a JSON body with keys: device_ip, latitude, longitude. Optional: speed, heading, accuracy, altitude.",
        }
    });
}

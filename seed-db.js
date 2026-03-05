import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function seedDatabase() {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding database with mock vehicles and assignments...\n');

        // Insert a vehicle that is 'in_use'
        // Insert a few other vehicles too
        const vehicleRes1 = await client.query(`
            INSERT INTO vehicles (name, plate_number, type, status, driver_name, fuel_level)
            VALUES ('Toyota Camry', 'DEF-123', 'sedan', 'in_use', 'Alice', 60)
            RETURNING id;
        `);
        const vId1 = vehicleRes1.rows[0].id;

        const vehicleRes2 = await client.query(`
            INSERT INTO vehicles (name, plate_number, type, status, driver_name, fuel_level)
            VALUES ('Ford Transit', 'VAN-999', 'van', 'in_use', 'Bob', 85)
            RETURNING id;
        `);
        const vId2 = vehicleRes2.rows[0].id;

        const vehicleRes3 = await client.query(`
            INSERT INTO vehicles (name, plate_number, type, status, driver_name, fuel_level)
            VALUES ('Honda CRV', 'SUV-777', 'suv', 'available', 'Charlie', 100)
            RETURNING id;
        `);
        const vId3 = vehicleRes3.rows[0].id;

        // Insert some assignments for the in_use vehicles
        // One due in 15 minutes, one due in 1 hour and 15 mins
        await client.query(`
            INSERT INTO vehicle_assignments (vehicle_id, assigned_to, department, purpose, estimated_end)
            VALUES ($1, 'Sales Team', 'Sales', 'Client Meeting Downtown', NOW() + INTERVAL '15 minutes')
        `, [vId1]);

        await client.query(`
            INSERT INTO vehicle_assignments (vehicle_id, assigned_to, department, purpose, estimated_end)
            VALUES ($1, 'Logistics', 'Delivery', 'Warehouse transfer', NOW() + INTERVAL '75 minutes')
        `, [vId2]);

        // Insert some mock GPS locations so they appear on the map too
        await client.query(`
            INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading)
            VALUES ($1, 19.0760, 72.8777, 45, 90)
        `, [vId1]);

        await client.query(`
            INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading)
            VALUES ($1, 19.0800, 72.8800, 30, 45)
        `, [vId2]);

        await client.query(`
            INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading)
            VALUES ($1, 19.1000, 72.9000, 0, 0)
        `, [vId3]);

        console.log('✅ Mock data seeded successfully!');

    } catch (err) {
        console.error('❌ Error seeding database:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDatabase();

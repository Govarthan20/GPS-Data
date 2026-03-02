import { query } from '../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        if (type === 'vehicles') {
            const result = await query('SELECT * FROM vehicles ORDER BY created_at ASC');
            return NextResponse.json(result.rows);
        }

        if (type === 'positions') {
            const result = await query('SELECT * FROM vehicle_latest_positions');
            return NextResponse.json(result.rows);
        }

        if (type === 'assignments') {
            const result = await query('SELECT * FROM vehicle_assignments WHERE actual_end IS NULL ORDER BY estimated_end ASC');
            return NextResponse.json(result.rows);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { vehicle_id, latitude, longitude, speed, heading, accuracy, altitude } = body;

        if (!vehicle_id || latitude === undefined || longitude === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO gps_locations 
            (vehicle_id, latitude, longitude, speed, heading, accuracy, altitude) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [vehicle_id, latitude, longitude, speed || 0, heading || 0, accuracy || 0, altitude || 0]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error saving GPS data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

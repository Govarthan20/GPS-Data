import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function fixDevice() {
    const client = await pool.connect();
    try {
        console.log('Searching for device 192.168.1.33...');

        const result = await client.query(`
            SELECT id FROM vehicles WHERE plate_number = '192.168.1.33'
        `);

        if (result.rows.length === 0) {
            console.log('Vehicle not found, maybe it has not registered yet.');
        } else {
            const vehicleId = result.rows[0].id;
            // Check if it already has an active assignment
            const assigns = await client.query(`
                SELECT id FROM vehicle_assignments WHERE vehicle_id = $1 AND actual_end IS NULL
            `, [vehicleId]);

            if (assigns.rows.length > 0) {
                console.log('Device already has an active assignment.');
            } else {
                await client.query(`
                    INSERT INTO vehicle_assignments (vehicle_id, assigned_to, department, purpose, estimated_end)
                    VALUES ($1, 'Mobile User (You)', 'Operations', 'Live Real-Time Tracker Testing', NOW() + INTERVAL '28 minutes')
                `, [vehicleId]);
                console.log('✅ Successfully added an estimated wait time for your device!');
            }
        }
    } catch (err) {
        console.error('❌ Error updating database:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixDevice();

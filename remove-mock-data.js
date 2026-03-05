import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function removeMockData() {
    const client = await pool.connect();
    try {
        console.log('🧹 Removing mock data from the database...\n');

        // Delete the mock vehicles. 
        // Our SQL schema uses ON DELETE CASCADE for gps_locations and vehicle_assignments,
        // so deleting the vehicles will also wipe out their associated trips and map locations.
        const result = await client.query(`
            DELETE FROM vehicles 
            WHERE plate_number IN ('DEF-123', 'VAN-999', 'SUV-777');
        `);

        console.log(`✅ Removed ${result.rowCount} mock vehicle(s) (and their associated assignments/locations) successfully.`);
        console.log('   (Your live Device connection is still safely preserved!)');
    } catch (err) {
        console.error('❌ Error removing mock data:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

removeMockData();

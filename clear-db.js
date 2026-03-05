import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function clearDatabase() {
    const client = await pool.connect();
    try {
        console.log('⚠️  Clearing all data from the database...\n');

        // Show counts before deletion
        const vehiclesBefore = await client.query('SELECT COUNT(*) FROM vehicles;');
        const gpsBefore = await client.query('SELECT COUNT(*) FROM gps_locations;');
        const assignmentsBefore = await client.query('SELECT COUNT(*) FROM vehicle_assignments;');

        console.log('📊 Current row counts:');
        console.log(`   vehicles:            ${vehiclesBefore.rows[0].count}`);
        console.log(`   gps_locations:       ${gpsBefore.rows[0].count}`);
        console.log(`   vehicle_assignments: ${assignmentsBefore.rows[0].count}`);
        console.log('');

        // TRUNCATE all tables in one go (CASCADE handles FK constraints)
        await client.query('TRUNCATE TABLE vehicles, gps_locations, vehicle_assignments CASCADE;');

        console.log('✅ All tables have been cleared successfully!');
        console.log('   vehicles, gps_locations, vehicle_assignments → 0 rows');
    } catch (err) {
        console.error('❌ Error clearing database:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

clearDatabase();

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function checkData() {
    try {
        const result = await pool.query('SELECT * FROM gps_locations ORDER BY timestamp DESC LIMIT 5;');
        if (result.rows.length === 0) {
            console.log('No data found in the database. Sensagram app has not sent any valid data yet.');
        } else {
            console.log('--- RECENT DATA RECEIVED FROM SENSAGRAM ---');
            console.table(result.rows);
        }
    } catch (err) {
        console.error('Error fetching data:', err.message);
    } finally {
        await pool.end();
    }
}

checkData();

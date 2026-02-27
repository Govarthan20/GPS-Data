import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres.jdbncgakyfikjwltcssj:87JlK3n8MAdA2XBh@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function run() {
    console.log('🔌 Connecting to Supabase PostgreSQL...');

    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // Read the schema SQL file
        const schemaPath = path.join(__dirname, 'supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('📦 Running schema SQL...');
        await client.query(schemaSql);
        console.log('✅ Schema created successfully!\n');

        // Verify tables
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        console.log('📋 Tables in database:');
        result.rows.forEach((row, i) => {
            console.log(`   ${i + 1}. ${row.table_name}`);
        });

        // Check vehicle count
        const vehicleCount = await client.query('SELECT COUNT(*) FROM vehicles;');
        console.log(`\n🚗 Vehicles seeded: ${vehicleCount.rows[0].count}`);

        // Check GPS data
        const gpsCount = await client.query('SELECT COUNT(*) FROM gps_locations;');
        console.log(`📍 GPS records: ${gpsCount.rows[0].count}`);

        // Check assignments
        const assignCount = await client.query('SELECT COUNT(*) FROM vehicle_assignments;');
        console.log(`📝 Assignments: ${assignCount.rows[0].count}`);

        console.log('\n🎉 Database setup complete!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('🔒 Connection closed.');
    }
}

run();

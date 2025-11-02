const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d43qa3jipnbc73c7jt4g-a.oregon-postgres.render.com',
    user: 'parcel_delivery_parcel_user',
    password: 'kMmz1SPlgvkMBtKPwq58O579D71Ip1Je',
    database: 'parcel_delivery_parcel',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to new database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('📦 Creating parcels table...');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS parcels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await client.query(createTableQuery);
        console.log('✅ Parcels table created successfully!');

        console.log('🔍 Creating index...');
        const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_parcels_id ON parcels(id);`;
        await client.query(createIndexQuery);
        console.log('✅ Index created successfully!');

        console.log('🔍 Verifying table structure...');
        const tableInfo = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'parcels'
            ORDER BY ordinal_position;
        `);
        console.log('📊 Table structure:');
        tableInfo.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        console.log('🧪 Inserting sample data...');
        const insertDataQuery = `
            INSERT INTO parcels (name, description, status) VALUES 
                ('Sample Parcel 1', 'This is a sample parcel for testing', 'pending'),
                ('Sample Parcel 2', 'Another sample parcel', 'in_transit')
            ON CONFLICT DO NOTHING
            RETURNING id, name, status;
        `;
        const insertResult = await client.query(insertDataQuery);
        console.log('✅ Sample data inserted:');
        insertResult.rows.forEach(row => {
            console.log(`   - Parcel ID ${row.id}: ${row.name} (${row.status})`);
        });

        const countQuery = await client.query('SELECT COUNT(*) FROM parcels');
        console.log(`📊 Total parcels in database: ${countQuery.rows[0].count}`);

        console.log('\n🎉 Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

setupDatabase();


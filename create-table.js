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

async function createTable() {
    try {
        console.log('Connecting to Render database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('Creating parcels table...');
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
        console.log('✅ Table created successfully!');

        console.log('Creating index...');
        const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_parcels_id ON parcels(id);`;
        await client.query(createIndexQuery);
        console.log('✅ Index created successfully!');

        console.log('Verifying table exists...');
        const verifyQuery = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'parcels'
            );
        `);
        console.log('Table exists:', verifyQuery.rows[0].exists);

        const countQuery = await client.query('SELECT COUNT(*) FROM parcels');
        console.log('Current parcel count:', countQuery.rows[0].count);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

createTable();


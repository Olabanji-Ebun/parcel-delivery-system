const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins for development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// PostgreSQL connection pool
const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize database - create table if it doesn't exist
async function initializeDatabase() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL successfully");
        
        // Create parcels table if it doesn't exist
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
        console.log("Parcels table verified/created successfully");
        
        // Create index if it doesn't exist
        const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_parcels_id ON parcels(id);`;
        await client.query(createIndexQuery);
        console.log("Index verified/created successfully");
    } catch (err) {
        console.error("Error connecting to PostgreSQL:", err.message);
        console.error("Connection details:", {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 5432
        });
    }
}

// Initialize database on startup
initializeDatabase();

// ✅ Root route for Render health check or info
app.get('/', (req, res) => {
    const appName = process.env.APP_NAME || 'parcel-delivery-system';
    const apiVersion = process.env.API_VERSION || 'v1';
    res.json({ 
        message: `${appName} API is running.`,
        version: apiVersion,
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    client.query('SELECT 1', (err) => {
        if (err) {
            console.error('Database health check failed:', err.message);
            return res.status(500).json({ 
                status: 'unhealthy', 
                error: err.message,
                database: 'disconnected'
            });
        }
        res.status(200).json({ 
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    });
});

// Database connection check route
app.get('/db-status', (req, res) => {
    res.json({
        connected: !client.ended,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT || 5432
    });
});

// Register parcel route
app.post('/register-parcel', (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing required fields' });

    const query = 'INSERT INTO parcels (name, description) VALUES ($1, $2) RETURNING id';
    client.query(query, [name, description], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error', message: err.message });

        const parcelId = result.rows[0].id; // Get the auto-generated id
        res.status(200).json({ message: 'Parcel registered successfully!', parcelId });
    });
});

// Track parcel route
app.get('/track-parcel/:id', (req, res) => {
    const parcelID = req.params.id;

    const query = 'SELECT * FROM parcels WHERE id = $1';
    client.query(query, [parcelID], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', message: err.message });

        if (results.rows.length > 0) {
            res.status(200).json(results.rows[0]);
        } else {
            res.status(404).json({ message: 'Parcel not found', suggestion: 'Please check the tracking number' });
        }
    });
});

// Error middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
const appName = process.env.APP_NAME || 'parcel-delivery-system';
const nodeEnv = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`🚀 ${appName} server is running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${nodeEnv}`);
    console.log(`🔗 Server running at http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Initialize database - create table if it doesn't exist
async function initializeDatabase() {
    try {
        console.log("Checking database connection...");
        
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
        await db.query(createTableQuery);
        console.log("Parcels table verified/created successfully");
        
        // Create index if it doesn't exist
        const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_parcels_id ON parcels(id);`;
        await db.query(createIndexQuery);
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

// ✅ Root route
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
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({ 
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Database health check failed:', err.message);
        res.status(500).json({
            status: 'unhealthy',
            error: err.message,
            database: 'disconnected'
        });
    }
});

// Get all parcels
app.get('/parcels', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM parcels ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// Register parcel route
app.post('/register-parcel', async (req, res) => {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Valid name is required' });
    }

    try {
        const query = 'INSERT INTO parcels (name, description) VALUES ($1, $2) RETURNING id';
        const result = await db.query(query, [name.trim(), description ? description.trim() : '']);
        const parcelId = result.rows[0].id;
        res.status(200).json({ message: 'Parcel registered successfully!', parcelId });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// Track parcel route
app.get('/track-parcel/:id', async (req, res) => {
    const parcelID = req.params.id;

    try {
        const query = 'SELECT * FROM parcels WHERE id = $1';
        const result = await db.query(query, [parcelID]);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Parcel not found', suggestion: 'Please check the tracking number' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// Update parcel status
app.put('/parcels/:id/status', async (req, res) => {
    const parcelID = req.params.id;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    try {
        const query = 'UPDATE parcels SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        const result = await db.query(query, [status, parcelID]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Status updated successfully', parcel: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// Delete parcel
app.delete('/parcels/:id', async (req, res) => {
    const parcelID = req.params.id;

    try {
        const query = 'DELETE FROM parcels WHERE id = $1 RETURNING id';
        const result = await db.query(query, [parcelID]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Parcel deleted successfully' });
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// Error middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    const appName = process.env.APP_NAME || 'parcel-delivery-system';
    const nodeEnv = process.env.NODE_ENV || 'development';

    app.listen(PORT, () => {
        console.log(`🚀 ${appName} server is running`);
        console.log(`📍 Port: ${PORT}`);
        console.log(`🌍 Environment: ${nodeEnv}`);
        console.log(`🔗 Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;

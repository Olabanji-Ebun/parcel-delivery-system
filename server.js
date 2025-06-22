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
});

client.connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL:", err.stack);
  });

// ✅ Root route for Render health check or info
app.get('/', (req, res) => {
    res.send('Parcel Delivery API is running.');
});

// Health check route
app.get('/health', (req, res) => {
    client.query('SELECT 1', (err) => {
        if (err) return res.status(500).json({ status: 'unhealthy', error: err.message });
        res.status(200).json({ status: 'healthy' });
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
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

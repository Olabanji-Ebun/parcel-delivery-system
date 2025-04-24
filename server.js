const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: [
        'https://olabanji-ebun.github.io',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'parcel_delivery',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.on('connection', () => {
    console.log('New database connection established');
});

pool.on('error', (err) => {
    console.error('Database pool error:', err);
});

// ✅ Root route for Render health check or info
app.get('/', (req, res) => {
    res.send('Parcel Delivery API is running.');
});

// Optional: Redirect to frontend if desired
// app.get('/', (req, res) => res.redirect('https://olabanji-ebun.github.io/'));

// Health check
app.get('/health', (req, res) => {
    pool.query('SELECT 1', (err) => {
        if (err) return res.status(500).json({ status: 'unhealthy', error: err.message });
        res.status(200).json({ status: 'healthy' });
    });
});

// Register parcel
app.post('/register-parcel', (req, res) => {
    const { id, name, description } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });

    const query = 'INSERT INTO parcels (id, name, description) VALUES (?, ?, ?)';
    pool.query(query, [id, name, description], (err) => {
        if (err) return res.status(500).json({ error: 'Database error', message: err.message });
        res.status(200).json({ message: 'Parcel registered successfully!', parcelId: id });
    });
});

// Track parcel
app.get('/track-parcel/:id', (req, res) => {
    const parcelID = req.params.id;

    const query = 'SELECT * FROM parcels WHERE id = ?';
    pool.query(query, [parcelID], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', message: err.message });

        if (results.length > 0) {
            res.status(200).json(results[0]);
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

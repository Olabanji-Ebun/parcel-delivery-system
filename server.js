const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

// Updated CORS configuration
const corsOptions = {
    origin: [
        'https://olabanji-ebun.github.io',
        'http://localhost:3000',
    ],
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Replaced single connection with connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // Added environment variable
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'parcel_delivery',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connection event listeners for debugging
pool.on('connection', (connection) => {
    console.log('New database connection established');
});

pool.on('error', (err) => {
    console.error('Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    pool.query('SELECT 1', (err) => {
        if (err) {
            console.error('Health check failed:', err);
            return res.status(500).json({ status: 'unhealthy', error: err.message });
        }
        res.status(200).json({ status: 'healthy' });
    });
});

// Parcel registration endpoint with improved logging
app.post('/register-parcel', (req, res) => {
    console.log('Register parcel request:', req.body);
    const { id, name, description } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO parcels (id, name, description) VALUES (?, ?, ?)';
    pool.query(query, [id, name, description], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database operation failed',
                message: err.message
            });
        }
        console.log('Parcel registered successfully:', { id, name });
        res.status(200).json({ 
            message: 'Parcel registered successfully!',
            parcelId: id
        });
    });
});

// Parcel tracking endpoint with improved logging
app.get('/track-parcel/:id', (req, res) => {
    const parcelID = req.params.id;
    console.log('Tracking request for parcel:', parcelID);
    
    const query = 'SELECT * FROM parcels WHERE id = ?';
    pool.query(query, [parcelID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database operation failed',
                message: err.message
            });
        }
        
        if (results.length > 0) {
            console.log('Parcel found:', results[0]);
            res.status(200).json(results[0]);
        } else {
            console.log('Parcel not found:', parcelID);
            res.status(404).json({ 
                message: 'Parcel not found',
                suggestion: 'Please check the tracking number and try again'
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong on our end'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database configuration:', {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'parcel_delivery'
    });
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server and database pool...');
    pool.end();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Closing server and database pool...');
    pool.end();
    process.exit(0);
});
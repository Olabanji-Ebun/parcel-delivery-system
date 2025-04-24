const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based API
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
    'https://olabanji-ebun.github.io',
    'http://localhost:3000'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('Blocked CORS request from:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Database configuration with connection retry
const createPool = () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'parcel_delivery',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: process.env.DB_SSL === 'true' ? { 
            rejectUnauthorized: false 
        } : null
    });

    pool.on('connection', (connection) => {
        console.log('New DB connection established. Thread ID:', connection.threadId);
    });

    pool.on('error', (err) => {
        console.error('Database pool error:', {
            code: err.code,
            message: err.message,
            sqlState: err.sqlState,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
        
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Attempting to reconnect to database...');
            setTimeout(createPool, 2000);
        }
    });

    return pool;
};

let pool = createPool();

// Enhanced health check
app.get('/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS db_status');
        const [tables] = await pool.query('SHOW TABLES');
        
        res.status(200).json({
            status: 'healthy',
            database: {
                connection: true,
                tables: tables.length,
                version: rows[0].db_status
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).json({
            status: 'unhealthy',
            error: {
                code: err.code,
                message: err.message,
                sqlState: err.sqlState
            },
            config: {
                host: pool.config.connectionConfig.host,
                user: pool.config.connectionConfig.user,
                database: pool.config.connectionConfig.database
            }
        });
    }
});

// Parcel registration with validation
app.post('/register-parcel', async (req, res) => {
    try {
        const { id, name, description } = req.body;
        
        // Enhanced validation
        if (!id || !name) {
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Missing required fields',
                required: ['id', 'name'],
                received: { id, name, description }
            });
        }

        if (id.length > 50 || name.length > 100) {
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Field length exceeded',
                limits: {
                    id: 50,
                    name: 100
                }
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO parcels (id, name, description) VALUES (?, ?, ?)',
            [id, name, description]
        );

        console.log('Parcel registered:', { id, name });
        res.status(201).json({
            success: true,
            message: 'Parcel registered successfully',
            parcelId: id,
            insertedId: result.insertId
        });
    } catch (err) {
        console.error('Registration error:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'DuplicateError',
                message: 'Parcel ID already exists',
                suggestion: 'Please use a different tracking number'
            });
        }

        res.status(500).json({
            error: 'DatabaseError',
            message: err.message || 'Failed to register parcel',
            code: err.code,
            sqlState: err.sqlState
        });
    }
});

// Enhanced tracking endpoint
app.get('/track-parcel/:id', async (req, res) => {
    try {
        const parcelID = req.params.id;
        
        if (!parcelID || parcelID.length > 50) {
            return res.status(400).json({
                error: 'ValidationError',
                message: 'Invalid parcel ID',
                maxLength: 50
            });
        }

        const [results] = await pool.execute(
            'SELECT * FROM parcels WHERE id = ?',
            [parcelID]
        );

        if (results.length === 0) {
            return res.status(404).json({
                error: 'NotFound',
                message: 'Parcel not found',
                trackingNumber: parcelID,
                suggestion: 'Please verify the tracking number'
            });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Tracking error:', err);
        res.status(500).json({
            error: 'DatabaseError',
            message: err.message || 'Failed to track parcel',
            code: err.code,
            sqlState: err.sqlState
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'NotFound',
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'ServerError',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
});

// Server startup
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Database config:', {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        ssl: process.env.DB_SSL
    });
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    
    try {
        await pool.end();
        console.log('Database pool closed');
        
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        
        setTimeout(() => {
            console.error('Force shutdown after timeout');
            process.exit(1);
        }, 10000);
    } catch (err) {
        console.error('Shutdown error:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
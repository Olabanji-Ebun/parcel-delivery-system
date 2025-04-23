const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const corsOptions = {
    origin: [
        'https://olabanji-ebun.github.io/parcel-delivery-system/',
        'http://localhost:3000', // local URL
    ],//frontend URL
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
  app.use(cors(corsOptions));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'parcel_delivery'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the MySQL database');
});

app.post('/register-parcel', (req, res) => {
    const { id, name, description } = req.body;
    const query = 'INSERT INTO parcels (id, name, description) VALUES (?, ?, ?)';
    db.query(query, [id, name, description], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Parcel registered successfully!' });
    });
});

app.get('/track-parcel/:id', (req, res) => {
    const parcelID = req.params.id;
    const query = 'SELECT * FROM parcels WHERE id = ?';
    db.query(query, [parcelID], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
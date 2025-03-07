const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Supabase connection string
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

pool.connect()
    .then(() => {
        console.log('Connected to Supabase database');
    })
    .catch((err) => {
        console.error('Error connecting to the database', err);
    });

module.exports = pool;
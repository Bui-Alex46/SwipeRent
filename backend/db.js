const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

pool.connect()
    .then(() => {
        console.log('Connected to Supabase database');
    })
    .catch((err) => {
        console.error('Error connecting to the database', err);
    });

module.exports = pool;
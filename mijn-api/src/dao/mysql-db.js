const mysql = require('mysql2');
require('dotenv').config();

const isLocal = process.env.ENVIRONMENT === 'local';

const pool = mysql.createPool({
  host: isLocal ? process.env.LOCAL_DB_HOST : process.env.DB_HOST,
  user: isLocal ? process.env.LOCAL_DB_USER : process.env.DB_USER,
  password: isLocal ? process.env.LOCAL_DB_PASSWORD : process.env.DB_PASSWORD,
  database: isLocal ? process.env.LOCAL_DB_NAME : process.env.DB_NAME,
  port: isLocal ? process.env.LOCAL_DB_PORT : process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isLocal
    ? false // geen SSL voor lokale DB
    : { rejectUnauthorized: false } // accepteer zelf-ondertekend certificaat voor Railway
});


pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connectie mislukt:', err.message);
  } else {
    console.log('✅ Verbonden met de', isLocal ? 'lokale' : 'online', 'database');
    connection.release();
  }
});

module.exports = pool;

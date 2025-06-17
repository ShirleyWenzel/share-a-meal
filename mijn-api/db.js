const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // je standaard XAMPP gebruiker
  password: '',         // XAMPP heeft standaard geen wachtwoord
  database: 'share-a-meal'
});

module.exports = pool.promise();
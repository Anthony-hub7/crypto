const mysql = require('mysql2');

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('../config/config');
const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});


db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL 🎉');
});

module.exports = db;

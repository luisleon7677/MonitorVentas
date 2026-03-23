const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'sales.db');
const db = new Database(dbPath);

// Create sales table
db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto TEXT,
        campaña TEXT,
        codigo TEXT,
        precio REAL NOT NULL,
        red_social TEXT CHECK(red_social IN ('facebook', 'tiktok', 'instagram', 'otros')) NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        departamento TEXT NOT NULL,
        cantidad_ventas INTEGER NOT NULL DEFAULT 0,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;

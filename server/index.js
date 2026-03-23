const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a sale
app.post('/api/sales', (req, res) => {
    const { codigo, precio, red_social, producto, campaña } = req.body;
    if (!precio || !red_social) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('INSERT INTO sales (codigo, precio, red_social, producto, campaña) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(codigo || '', precio, red_social, producto || '', campaña || '');
        res.status(201).json({ id: info.lastInsertRowid, codigo, precio, red_social, producto, campaña });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sales with pagination
app.get('/api/sales', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM sales');
        const { count } = countStmt.get();

        const salesStmt = db.prepare('SELECT * FROM sales ORDER BY fecha DESC LIMIT ? OFFSET ?');
        const sales = salesStmt.all(limit, offset);

        res.json({
            data: sales,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a sale
app.patch('/api/sales/:id', (req, res) => {
    const { id } = req.params;
    const { codigo, precio, red_social, producto, campaña } = req.body;

    if (!precio || !red_social) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('UPDATE sales SET codigo = ?, precio = ?, red_social = ?, producto = ?, campaña = ? WHERE id = ?');
        const info = stmt.run(codigo || '', precio, red_social, producto || '', campaña || '', id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        res.json({ id, codigo, precio, red_social, producto, campaña });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a sale
app.delete('/api/sales/:id', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats of social media sources (global)
app.get('/api/stats/sources', (req, res) => {
    try {
        const stmt = db.prepare('SELECT red_social as name, COUNT(*) as value FROM sales GROUP BY red_social');
        const stats = stmt.all();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats by brand (producto)
app.get('/api/stats/brands', (req, res) => {
    try {
        const countStmt = db.prepare(`
            SELECT producto as name, COUNT(*) as value 
            FROM sales 
            WHERE producto IS NOT NULL AND producto != '' 
            GROUP BY producto 
            ORDER BY value DESC
        `);
        const brandsCount = countStmt.all();

        const revenueStmt = db.prepare(`
            SELECT producto as name, SUM(precio) as value 
            FROM sales 
            WHERE producto IS NOT NULL AND producto != '' 
            GROUP BY producto 
            ORDER BY value DESC
        `);
        const brandsRevenue = revenueStmt.all();

        res.json({ brandsCount, brandsRevenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats by campaign (campaña)
app.get('/api/stats/campaigns', (req, res) => {
    try {
        const countStmt = db.prepare(`
            SELECT campaña as name, COUNT(*) as value 
            FROM sales 
            WHERE campaña IS NOT NULL AND campaña != '' 
            GROUP BY campaña 
            ORDER BY value DESC
        `);
        const campaignsCount = countStmt.all();

        const revenueStmt = db.prepare(`
            SELECT campaña as name, SUM(precio) as value 
            FROM sales 
            WHERE campaña IS NOT NULL AND campaña != '' 
            GROUP BY campaña 
            ORDER BY value DESC
        `);
        const campaignsRevenue = revenueStmt.all();

        res.json({ campaignsCount, campaignsRevenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Client CRUD operations
app.post('/api/clients', (req, res) => {
    const { nombre, departamento, cantidad_ventas } = req.body;
    if (!nombre || !departamento) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('INSERT INTO clients (nombre, departamento, cantidad_ventas) VALUES (?, ?, ?)');
        const info = stmt.run(nombre, departamento, cantidad_ventas || 0);
        res.status(201).json({ id: info.lastInsertRowid, nombre, departamento, cantidad_ventas });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/clients', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM clients');
        const { count } = countStmt.get();

        const clientsStmt = db.prepare('SELECT * FROM clients ORDER BY fecha_registro DESC LIMIT ? OFFSET ?');
        const clients = clientsStmt.all(limit, offset);

        res.json({
            data: clients,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, departamento, cantidad_ventas } = req.body;

    if (!nombre || !departamento) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('UPDATE clients SET nombre = ?, departamento = ?, cantidad_ventas = ? WHERE id = ?');
        const info = stmt.run(nombre, departamento, cantidad_ventas, id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json({ id, nombre, departamento, cantidad_ventas });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../front/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

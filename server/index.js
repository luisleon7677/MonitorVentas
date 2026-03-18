const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a sale
app.post('/api/sales', (req, res) => {
    const { codigo, precio, red_social } = req.body;
    if (!codigo || !precio || !red_social) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('INSERT INTO sales (codigo, precio, red_social) VALUES (?, ?, ?)');
        const info = stmt.run(codigo, precio, red_social);
        res.status(201).json({ id: info.lastInsertRowid, codigo, precio, red_social });
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
    const { codigo, precio, red_social } = req.body;

    if (!codigo || !precio || !red_social) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('UPDATE sales SET codigo = ?, precio = ?, red_social = ? WHERE id = ?');
        const info = stmt.run(codigo, precio, red_social, id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        res.json({ id, codigo, precio, red_social });
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

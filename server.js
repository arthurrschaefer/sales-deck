require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('./database.sqlite');

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize DB structure
const fs = require('fs');
const schema = fs.readFileSync('./schema.sql', 'utf8');
db.exec(schema);

// --- AUTH MIDDLEWARE ---
const protect = (req, res, next) => {
    req.session.loggedIn ? next() : res.status(401).send('Unauthorized');
};

// --- ROUTES ---
app.post('/api/login', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// Redirect Gateway
app.get('/go/:slug', (req, res) => {
    db.get('SELECT id, url FROM resources WHERE slug = ?', [req.params.slug], (err, row) => {
        if (!row) return res.status(404).send('Not Found');
        db.run('UPDATE resources SET clicks = clicks + 1 WHERE id = ?', [row.id]);
        res.redirect(row.url);
    });
});

// Submit Feedback (Public)
app.post('/api/feedback', (req, res) => {
    const { resource_id, status, comment, user_identity } = req.body;
    db.run('INSERT INTO feedback (resource_id, status, comment, user_identity) VALUES (?,?,?,?)', 
    [resource_id, status, comment, user_identity || 'Anonymous']);
    res.json({ success: true });
});

// Admin: Get Data
app.get('/api/admin/stats', protect, (req, res) => {
    db.all('SELECT r.*, (SELECT COUNT(*) FROM feedback f WHERE f.resource_id = r.id) as feedback_count FROM resources r', (err, rows) => {
        res.json(rows);
    });
});

// Admin: Add Link
app.post('/api/admin/resources', protect, (req, res) => {
    const { title, url, slug } = req.body;
    db.run('INSERT INTO resources (title, url, slug) VALUES (?,?,?)', [title, url, slug], (err) => {
        if (err) return res.status(400).send("Slug exists");
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('Live at http://localhost:3000'));
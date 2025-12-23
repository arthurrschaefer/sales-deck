require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();
const db = new sqlite3.Database('./database.sqlite');

// --- CONFIGURATION & MIDDLEWARE ---
app.use(express.json());
app.use(express.static('public')); // Serves files from the /public folder
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Database structure from schema.sql
const schema = fs.readFileSync('./schema.sql', 'utf8');
db.exec(schema);

// --- AUTH MIDDLEWARE ---
// Prevents unauthorized access to admin data
const protect = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(401).send('Unauthorized: Please login');
    }
};

// --- PUBLIC ROUTES ---

// Root Redirect: Send visitors to the login page by default
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Auth Route: Check admin password
app.post('/api/login', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: "Invalid Password" });
});

// Redirect Gateway: Tracks clicks and sends users to the resource
app.get('/go/:slug', (req, res) => {
    db.get('SELECT id, url FROM resources WHERE slug = ?', [req.params.slug], (err, row) => {
        if (!row) return res.status(404).send('Resource Not Found');
        
        // Increment click count
        db.run('UPDATE resources SET clicks = clicks + 1 WHERE id = ?', [row.id]);
        
        // Redirect to destination (YouTube, Drive, Help Center, etc.)
        res.redirect(row.url);
    });
});

// Submit Feedback: Publicly accessible for sales team members
app.post('/api/feedback', (req, res) => {
    const { resource_id, status, comment, user_identity } = req.body;
    const stmt = db.prepare(`
        INSERT INTO feedback (resource_id, status, comment, user_identity) 
        VALUES (?, ?, ?, ?)
    `);
    stmt.run(resource_id, status, comment, user_identity || 'Anonymous');
    stmt.finalize();
    res.json({ success: true });
});

// --- PROTECTED ADMIN ROUTES ---

// Get Stats: Returns all resources and their feedback counts
app.get('/api/admin/stats', protect, (req, res) => {
    const query = `
        SELECT r.*, 
        (SELECT COUNT(*) FROM feedback f WHERE f.resource_id = r.id) as feedback_count 
        FROM resources r
    `;
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add Link: Create a new tracked resource
app.post('/api/admin/resources', protect, (req, res) => {
    const { title, url, slug } = req.body;
    db.run('INSERT INTO resources (title, url, slug) VALUES (?, ?, ?)', [title, url, slug], (err) => {
        if (err) return res.status(400).send("Error: Slug must be unique");
        res.json({ success: true });
    });
});

// Logout: End admin session
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sales Tracker running at http://localhost:${PORT}`);
});
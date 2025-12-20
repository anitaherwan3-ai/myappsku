const express = require('express');
const router = express.Router();
const { readDb } = require('../db');

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    
    // Check main users (officers table) and initial admin
    const user = db.users.find(u => u.email === email && u.password === password) || 
                 db.officers.find(o => o.email === email && o.password === password);

    if (user) {
        // In real app, generate JWT here. We use a simple mock token.
        res.json({
            token: 'mock-token-' + user.id,
            user: user
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' });
});

module.exports = router;
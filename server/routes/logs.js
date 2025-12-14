const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// GET Logs
// Jika Admin: Ambil semua logs + nama petugas.
// Jika Petugas: Hanya logs milik sendiri.
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    
    let query = '';
    let params = [];

    if (user.role === 'admin') {
        // Join table to get officer Name
        query = `SELECT l.*, o.name as officerName, o.teamId 
                 FROM officer_logs l 
                 JOIN officers o ON l.officerId = o.id 
                 ORDER BY l.date DESC, l.startTime DESC`;
    } else {
        query = `SELECT l.*, o.name as officerName, o.teamId 
                 FROM officer_logs l
                 JOIN officers o ON l.officerId = o.id
                 WHERE l.officerId = ? 
                 ORDER BY l.date DESC, l.startTime DESC`;
        params = [user.id];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
    const { id, date, startTime, endTime, activity, location } = req.body;
    const officerId = req.user.id; // Force use ID from token for security

    try {
        const db = getDB();
        await db.query(
            'INSERT INTO officer_logs (id, officerId, date, startTime, endTime, activity, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, officerId, date, startTime, endTime, activity, location]
        );
        res.status(201).json({ message: 'Log added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    const { date, startTime, endTime, activity, location } = req.body;
    const user = req.user;

    try {
        const db = getDB();
        
        // Security check for non-admin: Ensure they own the log
        if (user.role !== 'admin') {
            const [check] = await db.query('SELECT officerId FROM officer_logs WHERE id = ?', [req.params.id]);
            if (check.length === 0) return res.status(404).json({error: 'Log not found'});
            if (check[0].officerId !== user.id) return res.status(403).json({error: 'Unauthorized'});
        }

        await db.query(
            'UPDATE officer_logs SET date=?, startTime=?, endTime=?, activity=?, location=? WHERE id=?',
            [date, startTime, endTime, activity, location, req.params.id]
        );
        res.json({ message: 'Log updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    const user = req.user;
    try {
        const db = getDB();

        // Security check for non-admin
        if (user.role !== 'admin') {
            const [check] = await db.query('SELECT officerId FROM officer_logs WHERE id = ?', [req.params.id]);
            if (check.length === 0) return res.status(404).json({error: 'Log not found'});
            if (check[0].officerId !== user.id) return res.status(403).json({error: 'Unauthorized'});
        }

        await db.query('DELETE FROM officer_logs WHERE id=?', [req.params.id]);
        res.json({ message: 'Log deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
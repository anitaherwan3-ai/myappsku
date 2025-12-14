const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
      const db = getDB();
      const [rows] = await db.query('SELECT * FROM activities ORDER BY startDate DESC');
      res.json(rows);
  } catch(err) {
      res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { id, name, startDate, endDate, host, location, status } = req.body;
  try {
    const db = getDB();
    await db.query(
        'INSERT INTO activities (id, name, startDate, endDate, host, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, startDate, endDate, host, location, status]
    );
    res.status(201).json({ message: 'Activity created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { name, startDate, endDate, host, location, status } = req.body;
  try {
    const db = getDB();
    await db.query(
        'UPDATE activities SET name=?, startDate=?, endDate=?, host=?, location=?, status=? WHERE id=?',
        [name, startDate, endDate, host, location, status, req.params.id]
    );
    res.json({ message: 'Activity updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDB();
    await db.query('DELETE FROM activities WHERE id=?', [req.params.id]);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
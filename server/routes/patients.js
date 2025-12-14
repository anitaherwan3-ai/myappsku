const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// Helper to construct Update Query dynamically
const buildUpdateQuery = (table, id, data) => {
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== '_id');
    if (keys.length === 0) return null;
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => data[k]);
    return { sql: `UPDATE ${table} SET ${setClause} WHERE id = ?`, values: [...values, id] };
};

// Helper to construct Insert Query dynamically
const buildInsertQuery = (table, data) => {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    const values = keys.map(k => data[k]);
    return { sql: `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values };
};

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query('SELECT * FROM patients ORDER BY visitDate DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const q = buildInsertQuery('patients', req.body);
    await db.query(q.sql, q.values);
    res.status(201).json({ message: 'Patient added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const q = buildUpdateQuery('patients', req.params.id, req.body);
    if(q) await db.query(q.sql, q.values);
    res.json({ message: 'Patient updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDB();
    await db.query('DELETE FROM patients WHERE id=?', [req.params.id]);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
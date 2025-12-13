const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// Get All
router.get('/', authenticate, async (req, res) => {
  const db = getDB();
  try {
    const patients = await db.all('SELECT * FROM patients ORDER BY visitDate DESC');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', authenticate, async (req, res) => {
  const db = getDB();
  const p = req.body;
  
  // Helper to construct query dynamically
  const keys = Object.keys(p);
  const values = Object.values(p);
  const placeholders = keys.map(() => '?').join(',');

  const query = `INSERT INTO patients (${keys.join(',')}) VALUES (${placeholders})`;

  try {
    await db.run(query, values);
    res.status(201).json({ message: 'Patient added', id: p.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', authenticate, async (req, res) => {
  const db = getDB();
  const p = req.body;
  const { id } = req.params;

  const updates = Object.keys(p).map(key => `${key} = ?`).join(',');
  const values = [...Object.values(p), id];

  const query = `UPDATE patients SET ${updates} WHERE id = ?`;

  try {
    await db.run(query, values);
    res.json({ message: 'Patient updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', authenticate, async (req, res) => {
  const db = getDB();
  try {
    await db.run('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
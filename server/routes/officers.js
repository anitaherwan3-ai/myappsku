const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
      const db = getDB();
      const [rows] = await db.query('SELECT id, email, name, teamId, role FROM officers');
      res.json(rows);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { id, email, name, teamId, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDB();
    await db.query(
        'INSERT INTO officers (id, email, name, teamId, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [id, email, name, teamId, hashedPassword, role]
    );
    res.status(201).json({ message: 'Officer created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { email, name, teamId, password, role } = req.body;
  try {
    const db = getDB();
    let sql = 'UPDATE officers SET email=?, name=?, teamId=?, role=? WHERE id=?';
    let params = [email, name, teamId, role, req.params.id];

    if (password && password.length > 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = 'UPDATE officers SET email=?, name=?, teamId=?, role=?, password=? WHERE id=?';
        params = [email, name, teamId, role, hashedPassword, req.params.id];
    }
    
    await db.query(sql, params);
    res.json({ message: 'Officer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDB();
    await db.query('DELETE FROM officers WHERE id=?', [req.params.id]);
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
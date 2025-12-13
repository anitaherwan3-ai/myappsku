const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const db = getDB();
  // Usually we don't send passwords back, but for sync with current frontend logic we might
  // For security, let's keep it safe and let frontend handle empty passwords on edit
  const officers = await db.all('SELECT id, email, name, teamId, role FROM officers');
  res.json(officers);
});

router.post('/', authenticate, async (req, res) => {
  const db = getDB();
  const { id, email, name, teamId, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO officers (id, email, name, teamId, password, role) VALUES (?,?,?,?,?,?)',
      [id, email, name, teamId, hashedPassword, role]
    );
    res.status(201).json({ message: 'Officer created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const db = getDB();
  const { email, name, teamId, password, role } = req.body;
  try {
    if (password && password.length > 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'UPDATE officers SET email=?, name=?, teamId=?, password=?, role=? WHERE id=?',
            [email, name, teamId, hashedPassword, role, req.params.id]
        );
    } else {
        await db.run(
            'UPDATE officers SET email=?, name=?, teamId=?, role=? WHERE id=?',
            [email, name, teamId, role, req.params.id]
        );
    }
    res.json({ message: 'Officer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const db = getDB();
  try {
    await db.run('DELETE FROM officers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
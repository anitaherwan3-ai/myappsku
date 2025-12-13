const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { SECRET_KEY } = require('../middleware');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  try {
    const user = await db.get('SELECT * FROM officers WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'User tidak ditemukan.' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Password salah.' });

    // Create Token
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '12h' });

    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
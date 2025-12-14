const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { SECRET_KEY } = require('../middleware');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDB();
    const [rows] = await db.query('SELECT * FROM officers WHERE email = ?', [email]);
    
    if (rows.length === 0) return res.status(400).json({ error: 'User tidak ditemukan.' });
    
    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Password salah.' });

    // Create Token
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '12h' });

    // Return user info
    const { password: _, ...userObj } = user;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
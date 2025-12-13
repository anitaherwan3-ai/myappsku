const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// --- NEWS ---
router.get('/news', async (req, res) => {
  const db = getDB();
  const news = await db.all('SELECT * FROM news ORDER BY date DESC');
  res.json(news);
});

router.post('/news', authenticate, async (req, res) => {
  const db = getDB();
  const { id, title, date, content, imageUrl } = req.body;
  try {
    await db.run(
      'INSERT INTO news (id, title, date, content, imageUrl) VALUES (?,?,?,?,?)',
      [id, title, date, content, imageUrl]
    );
    res.status(201).json({ message: 'News created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/news/:id', authenticate, async (req, res) => {
  const db = getDB();
  const { title, date, content, imageUrl } = req.body;
  try {
    await db.run(
      'UPDATE news SET title=?, date=?, content=?, imageUrl=? WHERE id=?',
      [title, date, content, imageUrl, req.params.id]
    );
    res.json({ message: 'News updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/news/:id', authenticate, async (req, res) => {
  const db = getDB();
  await db.run('DELETE FROM news WHERE id = ?', [req.params.id]);
  res.json({ message: 'News deleted' });
});

// --- CAROUSEL ---
router.get('/carousel', async (req, res) => {
  const db = getDB();
  const items = await db.all('SELECT * FROM carousel');
  res.json(items);
});

router.post('/carousel', authenticate, async (req, res) => {
  const db = getDB();
  const { id, imageUrl, title, subtitle } = req.body;
  try {
    await db.run(
      'INSERT INTO carousel (id, imageUrl, title, subtitle) VALUES (?,?,?,?)',
      [id, imageUrl, title, subtitle]
    );
    res.status(201).json({ message: 'Carousel item created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/carousel/:id', authenticate, async (req, res) => {
  const db = getDB();
  await db.run('DELETE FROM carousel WHERE id = ?', [req.params.id]);
  res.json({ message: 'Carousel item deleted' });
});

module.exports = router;
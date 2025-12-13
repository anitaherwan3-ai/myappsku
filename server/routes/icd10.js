const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', async (req, res) => {
  const db = getDB();
  const icd10 = await db.all('SELECT * FROM icd10 LIMIT 1000'); // Limit just in case
  res.json(icd10);
});

router.post('/', authenticate, async (req, res) => {
  const db = getDB();
  const items = Array.isArray(req.body) ? req.body : [req.body];
  
  try {
    // Bulk insert using transaction for speed
    await db.run('BEGIN TRANSACTION');
    const stmt = await db.prepare('INSERT OR REPLACE INTO icd10 (code, name) VALUES (?, ?)');
    for (const item of items) {
        await stmt.run(item.code, item.name);
    }
    await stmt.finalize();
    await db.run('COMMIT');
    res.status(201).json({ message: `Imported ${items.length} ICD10 codes` });
  } catch (err) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

router.put('/:code', authenticate, async (req, res) => {
    const db = getDB();
    const { name } = req.body;
    await db.run('UPDATE icd10 SET name = ? WHERE code = ?', [name, req.params.code]);
    res.json({ message: 'Updated' });
});

router.delete('/:code', authenticate, async (req, res) => {
    const db = getDB();
    await db.run('DELETE FROM icd10 WHERE code = ?', [req.params.code]);
    res.json({ message: 'Deleted' });
});

module.exports = router;
const express = require('express');
const { getDB } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
      const db = getDB();
      const [rows] = await db.query('SELECT * FROM icd10 LIMIT 1000');
      res.json(rows);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  
  try {
    const db = getDB();
    const values = items.map(item => [item.code, item.name]);
    
    // MySQL Bulk Insert with ON DUPLICATE KEY UPDATE
    await db.query(
        'INSERT INTO icd10 (code, name) VALUES ? ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [values]
    );
    
    res.status(201).json({ message: `Imported/Updated ${items.length} ICD10 codes` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:code', authenticate, async (req, res) => {
    try {
        const db = getDB();
        await db.query('UPDATE icd10 SET name=? WHERE code=?', [req.body.name, req.params.code]);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:code', authenticate, async (req, res) => {
    try {
        const db = getDB();
        await db.query('DELETE FROM icd10 WHERE code=?', [req.params.code]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
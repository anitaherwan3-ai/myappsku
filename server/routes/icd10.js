const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

router.get('/icd10', (req, res) => {
    const db = readDb();
    res.json(db.icd10 || []);
});

router.post('/icd10', (req, res) => {
    const db = readDb();
    const newItem = req.body;
    // Avoid duplicates
    if (!db.icd10.find(x => x.code === newItem.code)) {
        db.icd10.push(newItem);
        writeDb(db);
    }
    res.json(newItem);
});

router.post('/icd10/batch', (req, res) => {
    const db = readDb();
    const list = req.body.list || [];
    let added = 0;
    list.forEach(item => {
        if (!db.icd10.find(x => x.code === item.code)) {
            db.icd10.push(item);
            added++;
        }
    });
    if (added > 0) writeDb(db);
    res.json({added});
});

router.put('/icd10/:code', (req, res) => {
    const db = readDb();
    const index = db.icd10.findIndex(x => x.code === req.params.code);
    if (index !== -1) {
        db.icd10[index] = { ...db.icd10[index], ...req.body };
        writeDb(db);
        res.json(db.icd10[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/icd10/:code', (req, res) => {
    const db = readDb();
    db.icd10 = db.icd10.filter(x => x.code !== req.params.code);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;
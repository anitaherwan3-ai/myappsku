const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

router.get('/officers', (req, res) => {
    const db = readDb();
    res.json(db.officers || []);
});

router.post('/officers', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: Date.now().toString() };
    db.officers.push(newItem);
    writeDb(db);
    res.json(newItem);
});

router.put('/officers/:id', (req, res) => {
    const db = readDb();
    const index = db.officers.findIndex(x => x.id === req.params.id);
    if (index !== -1) {
        db.officers[index] = { ...db.officers[index], ...req.body };
        writeDb(db);
        res.json(db.officers[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/officers/:id', (req, res) => {
    const db = readDb();
    db.officers = db.officers.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;
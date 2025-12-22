
const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

router.get('/patients', (req, res) => {
    const db = readDb();
    const items = db.patients || [];
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (page && limit) {
        const startIndex = (page - 1) * limit;
        const paginatedData = items.slice(startIndex, startIndex + limit);
        return res.json({
            data: paginatedData,
            total: items.length,
            page,
            limit
        });
    }
    
    res.json(items);
});

router.post('/patients', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: req.body.id || Date.now().toString() };
    db.patients.push(newItem);
    writeDb(db);
    res.json(newItem);
});

router.put('/patients/:id', (req, res) => {
    const db = readDb();
    const index = db.patients.findIndex(x => x.id === req.params.id);
    if (index !== -1) {
        db.patients[index] = { ...db.patients[index], ...req.body };
        writeDb(db);
        res.json(db.patients[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/patients/:id', (req, res) => {
    const db = readDb();
    db.patients = db.patients.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;

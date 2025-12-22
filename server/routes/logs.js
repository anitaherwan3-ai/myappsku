
const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

router.get('/logs', (req, res) => {
    const db = readDb();
    const items = db.logs || [];
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

router.post('/logs', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: Date.now().toString() };
    db.logs.push(newItem);
    writeDb(db);
    res.json(newItem);
});

router.put('/logs/:id', (req, res) => {
    const db = readDb();
    const index = db.logs.findIndex(x => x.id === req.params.id);
    if (index !== -1) {
        db.logs[index] = { ...db.logs[index], ...req.body };
        writeDb(db);
        res.json(db.logs[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/logs/:id', (req, res) => {
    const db = readDb();
    db.logs = db.logs.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;

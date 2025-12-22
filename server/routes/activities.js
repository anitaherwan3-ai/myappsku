
const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

router.get('/activities', (req, res) => {
    const db = readDb();
    const items = db.activities || [];
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

router.post('/activities', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: Date.now().toString() };
    db.activities.push(newItem);
    writeDb(db);
    res.json(newItem);
});

router.put('/activities/:id', (req, res) => {
    const db = readDb();
    const index = db.activities.findIndex(x => x.id === req.params.id);
    if (index !== -1) {
        db.activities[index] = { ...db.activities[index], ...req.body };
        writeDb(db);
        res.json(db.activities[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/activities/:id', (req, res) => {
    const db = readDb();
    db.activities = db.activities.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;

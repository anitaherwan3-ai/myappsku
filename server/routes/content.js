const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../db');

// NEWS
router.get('/news', (req, res) => {
    const db = readDb();
    res.json(db.news || []);
});

router.post('/news', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: Date.now().toString() };
    db.news.unshift(newItem); // Add to top
    writeDb(db);
    res.json(newItem);
});

router.put('/news/:id', (req, res) => {
    const db = readDb();
    const index = db.news.findIndex(x => x.id === req.params.id);
    if (index !== -1) {
        db.news[index] = { ...db.news[index], ...req.body };
        writeDb(db);
        res.json(db.news[index]);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

router.delete('/news/:id', (req, res) => {
    const db = readDb();
    db.news = db.news.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

// CAROUSEL
router.get('/carousel', (req, res) => {
    const db = readDb();
    res.json(db.carousel || []);
});

router.post('/carousel', (req, res) => {
    const db = readDb();
    const newItem = { ...req.body, id: Date.now().toString() };
    db.carousel.push(newItem);
    writeDb(db);
    res.json(newItem);
});

router.delete('/carousel/:id', (req, res) => {
    const db = readDb();
    db.carousel = db.carousel.filter(x => x.id !== req.params.id);
    writeDb(db);
    res.json({success: true});
});

module.exports = router;
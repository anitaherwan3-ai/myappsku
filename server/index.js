const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;
const { readDb } = require('./db');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large payloads for base64 images

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Root Route
app.get('/', (req, res) => {
    res.send('PCC Server is Running');
});

// Import Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/activities'));
app.use('/api', require('./routes/patients'));
app.use('/api', require('./routes/officers'));
app.use('/api', require('./routes/content'));
app.use('/api', require('./routes/icd10'));
app.use('/api', require('./routes/logs'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
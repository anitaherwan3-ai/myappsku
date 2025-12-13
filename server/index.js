const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const patientRoutes = require('./routes/patients');
const officerRoutes = require('./routes/officers');
const contentRoutes = require('./routes/content');
const icd10Routes = require('./routes/icd10');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Increase limit for Base64 image uploads
app.use(express.json({ limit: '10mb' })); 

// Initialize DB & Start Server
initDB().then(() => {
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/officers', officerRoutes);
  app.use('/api/content', contentRoutes); // News & Carousel
  app.use('/api/icd10', icd10Routes);

  app.get('/', (req, res) => {
    res.send('PCC Sumsel Backend API is Running');
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});
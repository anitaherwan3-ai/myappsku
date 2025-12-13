const express = require('express');
const cors = require('cors');
const path = require('path');
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
app.use(express.json({ limit: '10mb' })); 

// Initialize DB & Start Server
initDB().then(() => {
  
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/officers', officerRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/icd10', icd10Routes);

  // SERVE FRONTEND (Production Mode)
  // Assumes the frontend build is in a folder named 'dist' or 'build' one level up
  // or inside the server folder. Adjust path as necessary for your deployment.
  // For this example, we assume standard Vite build output to '../dist'
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  // Catch-all route to serve index.html for Client-Side Routing
  app.get('*', (req, res) => {
    // If requesting API that doesn't exist, return 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API Endpoint Not Found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});
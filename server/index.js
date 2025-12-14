const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const patientRoutes = require('./routes/patients');
const officerRoutes = require('./routes/officers');
const contentRoutes = require('./routes/content');
const icd10Routes = require('./routes/icd10');
const logRoutes = require('./routes/logs');

const app = express();
// Di Shared Hosting, Port ditentukan oleh Passenger/cPanel via process.env.PORT
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
  app.use('/api/logs', logRoutes);

  // --- SERVE FRONTEND (Shared Hosting Logic) ---
  // Prioritas 1: Cari folder 'dist' di direktori yang sama (struktur cPanel)
  // Prioritas 2: Cari folder '../dist' (struktur development lokal)
  
  let staticPath = null;
  const localDist = path.join(__dirname, 'dist');
  const parentDist = path.join(__dirname, '../dist');
  const localBuild = path.join(__dirname, 'build');
  const parentBuild = path.join(__dirname, '../build');

  if (fs.existsSync(localDist)) {
    staticPath = localDist;
  } else if (fs.existsSync(localBuild)) {
    staticPath = localBuild;
  } else if (fs.existsSync(parentDist)) {
    staticPath = parentDist;
  } else if (fs.existsSync(parentBuild)) {
    staticPath = parentBuild;
  }

  // Jika folder build ditemukan, serve file statis
  if (staticPath) {
    console.log(`📂 Serving Frontend from: ${staticPath}`);
    app.use(express.static(staticPath));

    // Handle SPA Routing
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
          return res.status(404).json({ error: 'API Endpoint Not Found' });
      }
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.send('Backend Running. Frontend build folder (dist) not found.');
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database', err);
});
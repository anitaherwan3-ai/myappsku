const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Tambahkan fs
const { initDB } = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const patientRoutes = require('./routes/patients');
const officerRoutes = require('./routes/officers');
const contentRoutes = require('./routes/content');
const icd10Routes = require('./routes/icd10');
const logRoutes = require('./routes/logs'); // New Route

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
  app.use('/api/logs', logRoutes); // Register logs

  // SERVE FRONTEND (Production Mode)
  const distPath = path.join(__dirname, '../dist');

  // Hanya serve static files jika folder dist ada
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  // Catch-all route
  app.get('*', (req, res) => {
    // Jika request API tapi salah endpoint
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API Endpoint Not Found' });
    }
    
    // Cek apakah index.html ada
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback message jika mode development atau belum build
      res.send(`
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h1>Server Backend Berjalan (Port ${PORT})</h1>
          <p>Error: Folder <code>dist</code> tidak ditemukan.</p>
          <hr/>
          <h3>Cara Menjalankan Aplikasi:</h3>
          <p><strong>Mode Development (Disarankan):</strong> Buka terminal baru, jalankan <code>npm run dev</code> di folder root (bukan folder server).</p>
          <p><strong>Mode Production:</strong> Jalankan <code>npm run build</code> di folder root untuk membuat folder dist.</p>
        </div>
      `);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});
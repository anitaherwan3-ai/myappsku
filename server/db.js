const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

async function initDB() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true 
  };

  try {
    // 1. Cek Koneksi & Buat Database jika belum ada
    const tempConnection = await mysql.createConnection(dbConfig);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS pcc_sumsel`);
    await tempConnection.end();

    // 2. Koneksi ke Database Spesifik
    pool = mysql.createPool({
      ...dbConfig,
      database: 'pcc_sumsel',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`✅ Connected to MySQL Database: pcc_sumsel`);

    // 3. Buat/Update Struktur Tabel (Safe Migration)
    await createTables();
    
    // 4. Isi Data Awal (Seeding) hanya jika kosong
    await seedData();

  } catch (err) {
    console.error("❌ MySQL Connection Error:", err.message);
    console.log("Pastikan XAMPP/MySQL sudah berjalan dan user 'root' tanpa password tersedia.");
    process.exit(1);
  }
}

async function createTables() {
  const db = pool;

  // --- 1. TABEL OFFICERS ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS officers (
      id VARCHAR(50) PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100),
      teamId VARCHAR(50),
      password VARCHAR(255),
      role VARCHAR(20) DEFAULT 'petugas'
    )
  `);

  // --- 2. TABEL ACTIVITIES ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255),
      startDate DATE,
      endDate DATE,
      host VARCHAR(100),
      location VARCHAR(255),
      status VARCHAR(20) DEFAULT 'To Do'
    )
  `);

  // --- 3. TABEL OFFICER_LOGS (Tabel Baru untuk Laporan Harian) ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS officer_logs (
      id VARCHAR(50) PRIMARY KEY,
      officerId VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      startTime VARCHAR(10),
      endTime VARCHAR(10),
      activity TEXT,
      location VARCHAR(255),
      FOREIGN KEY (officerId) REFERENCES officers(id) ON DELETE CASCADE
    )
  `);

  // --- 4. TABEL ICD10 ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS icd10 (
      code VARCHAR(20) PRIMARY KEY,
      name TEXT
    )
  `);

  // --- 5. TABEL NEWS ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS news (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255),
      date DATE,
      content TEXT,
      imageUrl TEXT
    )
  `);

  // --- 6. TABEL CAROUSEL ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS carousel (
      id VARCHAR(50) PRIMARY KEY,
      imageUrl TEXT,
      title VARCHAR(255),
      subtitle VARCHAR(255)
    )
  `);

  // --- 7. TABEL PATIENTS ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(50) PRIMARY KEY,
      mrn VARCHAR(50),
      activityId VARCHAR(50),
      name VARCHAR(100),
      gender CHAR(1),
      visitDate DATE,
      category VARCHAR(20),
      FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE
    )
  `);

  // --- 8. AUTO-MIGRATION (PENTING!) ---
  // Kode ini akan mengecek apakah kolom MCU sudah ada di tabel patients lama.
  // Jika belum, akan ditambahkan secara otomatis.
  const patientColumns = [
    "lastModifiedBy VARCHAR(100)", "lastModifiedAt VARCHAR(50)", 
    "dateOfBirth DATE", "age INT", "address TEXT", "phone VARCHAR(20)", "identityNo VARCHAR(50)",
    "height FLOAT", "weight FLOAT", "bloodPressure VARCHAR(20)", "pulse INT", "respiration INT", 
    "bmi FLOAT", "bmiStatus VARCHAR(50)", "historyOfIllness TEXT",
    "subjective TEXT", "physicalExam TEXT", "diagnosisCode VARCHAR(20)", "diagnosisName TEXT", 
    "therapy TEXT", "referralStatus VARCHAR(50)",
    "visusOD VARCHAR(20)", "visusOS VARCHAR(20)", "colorBlind VARCHAR(50)", 
    "rightEar VARCHAR(50)", "leftEar VARCHAR(50)", "nose VARCHAR(50)", "teeth VARCHAR(50)", "tonsil VARCHAR(50)",
    "thorax VARCHAR(100)", "abdomen VARCHAR(100)", "varicocele VARCHAR(50)", "hernia VARCHAR(50)", 
    "hemorrhoids VARCHAR(50)", "varicose VARCHAR(50)", "extremityDeformity VARCHAR(100)",
    "reflexPupil VARCHAR(50)", "reflexPatella VARCHAR(50)", "reflexAchilles VARCHAR(50)",
    "ekgResult VARCHAR(100)", "xrayResult VARCHAR(100)", "labSummary TEXT", 
    "mcuConclusion TEXT", "mcuRecommendation TEXT"
  ];

  console.log("⚙️  Checking database structure...");
  
  for (const colDef of patientColumns) {
    try {
      // Mencoba menambahkan kolom. Jika error "Duplicate column", berarti aman (sudah ada).
      await db.query(`ALTER TABLE patients ADD COLUMN ${colDef}`);
    } catch (err) {
      // Abaikan error jika kolom sudah ada
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn(`Warning updating patient table (${colDef}):`, err.message);
      }
    }
  }

  console.log("✅ Database Tables Verified/Updated.");
}

async function seedData() {
  // Check Admin
  const [rows] = await pool.query("SELECT * FROM officers WHERE email = ?", ['admin@pcc.sumsel.go.id']);
  if (rows.length === 0) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await pool.query(
      "INSERT INTO officers (id, email, name, teamId, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      ['1', 'admin@pcc.sumsel.go.id', 'Administrator', 'ADM-001', hashedPassword, 'admin']
    );
    console.log('Admin user seeded.');
  }

  // Check Activities
  const [actRows] = await pool.query("SELECT COUNT(*) as count FROM activities");
  if (actRows[0].count === 0) {
    console.log("Seeding Dummy Data...");
    
    // Activities
    await pool.query(`INSERT INTO activities VALUES 
    ('act-001', 'Pemeriksaan Kesehatan Berkala ASN', '2024-02-10', '2024-02-12', 'Dinkes Prov Sumsel', 'Aula Kantor Gubernur', 'Done'),
    ('act-002', 'Bakti Sosial HUT Sumsel', '2024-05-15', '2024-05-17', 'PCC Sumsel', 'Plaza Benteng Kuto Besak', 'On Progress')`);

    // ICD10
    await pool.query(`INSERT INTO icd10 VALUES 
    ('I10', 'Essential (primary) hypertension'),
    ('E11', 'Type 2 diabetes mellitus'),
    ('J06.9', 'Acute upper respiratory infection, unspecified'),
    ('A09', 'Infectious gastroenteritis and colitis')`);

    // News
    await pool.query(`INSERT INTO news VALUES 
    ('news-001', 'PCC Sumsel Siap Siaga 24 Jam', '2024-01-01', 'Tim PCC berkomitmen memberikan pelayanan 24 jam.', 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1000')`);

    // Carousel
    await pool.query(`INSERT INTO carousel VALUES 
    ('car-001', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920', 'Layanan Gawat Darurat Terpadu', 'Respon Cepat untuk Masyarakat')`);
    
    // Patients Seed (Hanya jika belum ada data)
    try {
        const pat1 = `INSERT INTO patients (
            id, mrn, activityId, name, gender, age, address, phone, identityNo, visitDate, category, 
            height, weight, bloodPressure, pulse, bmi, bmiStatus, 
            subjective, physicalExam, diagnosisCode, diagnosisName, therapy, referralStatus
        ) VALUES (
            'pat-001', 'RM-20240515-001', 'act-002', 'Bpk. Ahmad Rivai', 'L', 52, 'Jl. Jendral Sudirman', '081200001111', '1671010101010001', '2024-05-15', 'Berobat',
            168, 75, '150/90', 88, 26.57, 'Overweight',
            'Pusing', 'TD Tinggi', 'I10', 'Essential (primary) hypertension', 'Amlodipine', 'Tidak Rujuk'
        )`;
        await pool.query(pat1);
    } catch(e) {
        // Ignore duplicate insert error
    }

    console.log("Dummy Data Seeded.");
  }
}

function getDB() {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}

module.exports = { initDB, getDB };
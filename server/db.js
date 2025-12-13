const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let db;

async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Connected to SQLite Database.');

  // 1. Officers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS officers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      teamId TEXT,
      password TEXT,
      role TEXT
    )
  `);

  // 2. Activities Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT,
      startDate TEXT,
      endDate TEXT,
      host TEXT,
      location TEXT,
      status TEXT
    )
  `);

  // 3. Patients Table (Denormalized for easier mapping)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      mrn TEXT,
      activityId TEXT,
      name TEXT,
      lastModifiedBy TEXT,
      lastModifiedAt TEXT,
      dateOfBirth TEXT,
      age INTEGER,
      gender TEXT,
      address TEXT,
      phone TEXT,
      identityNo TEXT,
      visitDate TEXT,
      category TEXT,
      height REAL,
      weight REAL,
      bloodPressure TEXT,
      pulse INTEGER,
      respiration INTEGER,
      bmi REAL,
      bmiStatus TEXT,
      historyOfIllness TEXT,
      subjective TEXT,
      physicalExam TEXT,
      diagnosisCode TEXT,
      diagnosisName TEXT,
      therapy TEXT,
      referralStatus TEXT,
      visusOD TEXT,
      visusOS TEXT,
      colorBlind TEXT,
      rightEar TEXT,
      leftEar TEXT,
      nose TEXT,
      teeth TEXT,
      tonsil TEXT,
      thorax TEXT,
      abdomen TEXT,
      varicocele TEXT,
      hernia TEXT,
      hemorrhoids TEXT,
      varicose TEXT,
      extremityDeformity TEXT,
      reflexPupil TEXT,
      reflexPatella TEXT,
      reflexAchilles TEXT,
      ekgResult TEXT,
      xrayResult TEXT,
      labSummary TEXT,
      mcuConclusion TEXT,
      mcuRecommendation TEXT,
      FOREIGN KEY(activityId) REFERENCES activities(id) ON DELETE CASCADE
    )
  `);

  // 4. News Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT,
      date TEXT,
      content TEXT,
      imageUrl TEXT
    )
  `);

  // 5. Carousel Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS carousel (
      id TEXT PRIMARY KEY,
      imageUrl TEXT,
      title TEXT,
      subtitle TEXT
    )
  `);

  // 6. ICD10 Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS icd10 (
      code TEXT PRIMARY KEY,
      name TEXT
    )
  `);

  // Seed Admin User if Empty
  const adminCheck = await db.get('SELECT * FROM officers WHERE email = ?', ['admin@pcc.sumsel.go.id']);
  if (!adminCheck) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await db.run(
      'INSERT INTO officers (id, email, name, teamId, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['1', 'admin@pcc.sumsel.go.id', 'Administrator', 'ADM-001', hashedPassword, 'admin']
    );
    console.log('Admin user seeded.');
  }

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { initDB, getDB };
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.json');

// Initialize Database if not exists
if (!fs.existsSync(dbPath)) {
    const initialData = {
        users: [
            {id: '1', email: 'admin@pcc.sumsel.go.id', password: 'admin123', name: 'Administrator', role: 'admin', teamId: 'ADM-001'}
        ],
        activities: [],
        patients: [],
        news: [],
        logs: [],
        officers: [],
        icd10: [],
        carousel: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

const readDb = () => {
    try {
        const data = fs.readFileSync(dbPath);
        return JSON.parse(data);
    } catch (error) {
        return { users: [], activities: [], patients: [], news: [], logs: [], officers: [], icd10: [], carousel: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = { readDb, writeDb };
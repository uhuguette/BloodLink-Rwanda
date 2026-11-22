const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bloodlink.db');

if (DB_PATH !== ':memory:') {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS donors (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name         TEXT    NOT NULL,
    blood_type        TEXT    NOT NULL,
    district          TEXT    NOT NULL,
    phone             TEXT    NOT NULL UNIQUE,
    consent           INTEGER NOT NULL CHECK (consent = 1),
    registered_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    last_confirmed_at TEXT    NOT NULL DEFAULT (datetime('now')),
    status            TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden'))
  );

  CREATE INDEX IF NOT EXISTS idx_donors_search ON donors (blood_type, district, status);
`);

module.exports = db;

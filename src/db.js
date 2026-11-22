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

  CREATE TABLE IF NOT EXISTS rcbt_centres (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    city     TEXT NOT NULL,
    province TEXT NOT NULL,
    phone    TEXT NOT NULL
  );

  -- A seeker reports a number that does not work. Two reports hide the donor.
  CREATE TABLE IF NOT EXISTS reports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id    INTEGER NOT NULL REFERENCES donors (id) ON DELETE CASCADE,
    reported_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  -- NFR 3: every removal is kept, even after the donor row is gone.
  CREATE TABLE IF NOT EXISTS removal_log (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_username TEXT    NOT NULL,
    donor_id       INTEGER NOT NULL,
    donor_summary  TEXT    NOT NULL,
    reason         TEXT,
    removed_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Fill the RCBT contacts the first time the database is created.
if (db.prepare('SELECT COUNT(*) AS n FROM rcbt_centres').get().n === 0) {
  const insert = db.prepare('INSERT INTO rcbt_centres (name, city, province, phone) VALUES (@name, @city, @province, @phone)');
  db.transaction((rows) => rows.forEach((r) => insert.run(r)))(require('./rcbtData'));
}

module.exports = db;

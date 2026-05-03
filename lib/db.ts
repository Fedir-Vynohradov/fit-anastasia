import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "meals.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp   TEXT NOT NULL DEFAULT (datetime('now')),
      date        TEXT NOT NULL,
      image_data  TEXT,
      food_name   TEXT NOT NULL,
      description TEXT,
      calories    REAL NOT NULL DEFAULT 0,
      protein     REAL NOT NULL DEFAULT 0,
      carbs       REAL NOT NULL DEFAULT 0,
      fat         REAL NOT NULL DEFAULT 0,
      fiber       REAL NOT NULL DEFAULT 0,
      confidence  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  `);

  // Migration: add confidence column to existing DBs
  const cols = db.prepare("PRAGMA table_info(meals)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "confidence")) {
    db.exec("ALTER TABLE meals ADD COLUMN confidence TEXT");
  }
}

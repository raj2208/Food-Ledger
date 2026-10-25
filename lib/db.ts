import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS foods (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('homemade', 'packaged')),
  barcode       TEXT,
  serving_label TEXT NOT NULL,
  calories      REAL NOT NULL CHECK (calories >= 0),
  protein_g     REAL NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g       REAL NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g         REAL NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Each log entry snapshots the food's per-serving values at the time it was
-- logged, so editing or deleting a food never rewrites history.
CREATE TABLE IF NOT EXISTS log_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id       INTEGER REFERENCES foods(id) ON DELETE SET NULL,
  eaten_on      TEXT NOT NULL,
  quantity      REAL NOT NULL CHECK (quantity > 0),
  food_name     TEXT NOT NULL,
  serving_label TEXT NOT NULL,
  calories      REAL NOT NULL,
  protein_g     REAL NOT NULL,
  carbs_g       REAL NOT NULL,
  fat_g         REAL NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_log_entries_eaten_on ON log_entries(eaten_on);
`;

const globalForDb = globalThis as unknown as { __foodLedgerDb?: DatabaseSync };

function open(): DatabaseSync {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "food-ledger.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

export function getDb(): DatabaseSync {
  return (globalForDb.__foodLedgerDb ??= open());
}

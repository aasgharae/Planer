-- NeoPlanner lightweight SQLite schema (equivalent to IndexedDB stores)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  cat TEXT DEFAULT 'personal',
  pri TEXT DEFAULT 'normal',
  time TEXT,
  done INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY,
  icon TEXT,
  name TEXT NOT NULL,
  unit TEXT,
  target REAL DEFAULT 1,
  val REAL DEFAULT 0,
  streak INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS history (
  day TEXT PRIMARY KEY,
  score INTEGER,
  done INTEGER,
  total INTEGER,
  xp INTEGER
);
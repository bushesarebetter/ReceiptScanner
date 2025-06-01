CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_key TEXT NOT NULL,
  company_key TEXT NOT NULL,
  image_url TEXT,
  vendor TEXT,
  total REAL,
  date TEXT,
  building_name TEXT,
  status TEXT,
  items_json TEXT, -- JSON string of items
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

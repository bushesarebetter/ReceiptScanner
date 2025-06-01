import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import Database from 'better-sqlite3';

import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const OPENAI_API_KEY = 'ENTER KEY HERE';
if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

app.post('/api/openai', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    console.log('OpenAI response:', text);
    if (!response.ok) return res.status(response.status).send(text);
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: err.message });
  }
});

const db = new Database('./receipts.db');

// Updated schema with all columns you use:
db.prepare(`
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_key TEXT,
    company_key TEXT,
    image_url TEXT,
    vendor TEXT,
    total TEXT,
    date TEXT,
    building_name TEXT,
    status TEXT,
    items_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// POST /api/receipts - Save a new receipt
app.post('/api/receipts', (req, res) => {
  const {
    userKey,
    companyKey,
    imageUrl,
    vendor,
    total,
    date,
    buildingName,
    status,
    items
  } = req.body;

  const itemsJson = JSON.stringify(items || []);

  const sql = `
    INSERT INTO receipts (
      user_key, company_key, image_url, vendor, total, date, building_name, status, items_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const stmt = db.prepare(sql);
    const info = stmt.run(userKey, companyKey, imageUrl, vendor, total, date, buildingName, status, itemsJson);
    res.status(201).json({
      id: info.lastInsertRowid,
      userKey,
      companyKey,
      imageUrl,
      vendor,
      total,
      date,
      buildingName,
      status,
      items
    });
  } catch (err) {
    console.error('Error inserting receipt:', err.message);
    res.status(500).json({ error: 'Failed to save receipt.' });
  }
});

// GET /api/receipts?userKey=... - Retrieve receipts by userKey or companyKey
app.get('/api/receipts', (req, res) => {
  const { userKey, companyKey } = req.query;

  let sql = '';
  let params = [];

  if (userKey) {
    sql = 'SELECT * FROM receipts WHERE user_key = ? ORDER BY created_at DESC';
    params = [userKey];
  } else if (companyKey) {
    sql = 'SELECT * FROM receipts WHERE company_key = ? ORDER BY created_at DESC';
    params = [companyKey];
  } else {
    res.status(400).json({ error: 'Missing userKey or companyKey in query parameters.' });
    return;
  }

  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);

    const receipts = rows.map(row => ({
      id: row.id,
      userKey: row.user_key,
      companyKey: row.company_key,
      imageUrl: row.image_url,
      vendor: row.vendor,
      total: row.total,
      date: row.date,
      buildingName: row.building_name,
      status: row.status,
      items: JSON.parse(row.items_json),
      createdAt: row.created_at
    }));
    console.log(`Retrieved ${receipts.length} receipts for userKey: ${userKey || companyKey}`);
    res.json(receipts);
  } catch (err) {
    console.error('Error retrieving receipts:', err.message);
    res.status(500).json({ error: 'Failed to retrieve receipts.' });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));

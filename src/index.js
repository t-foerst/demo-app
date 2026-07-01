'use strict';

const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const app = express();

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('ok');
  } catch {
    res.status(503).send('db unreachable');
  }
});

app.get('/', async (_req, res) => {
  let count = null;
  let err = null;
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM visits');
    count = result.rows[0].count;
  } catch (e) {
    err = e.message;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderPage(count, err));
});

function renderPage(count, err) {
  const dbHost = process.env.DB_HOST ?? 'unknown';
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Demo App</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: grid;
      place-items: center;
    }
    .card {
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 2.5rem 3rem;
      text-align: center;
      max-width: 480px;
      width: 90%;
    }
    h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.03em; }
    p { color: #94a3b8; line-height: 1.6; margin-top: 0.75rem; }
    .count { font-size: 3.5rem; font-weight: 700; color: #7dd3fc; margin: 1rem 0; }
    .badge {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.3rem 0.8rem;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 999px;
      font-size: 0.75rem;
      color: #7dd3fc;
      letter-spacing: 0.05em;
    }
    .db { margin-top: 0.5rem; font-size: 0.75rem; color: #475569; }
    .error { color: #f87171; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Demo App</h1>
    ${err
      ? `<p class="error">DB-Fehler: ${esc(err)}</p>`
      : `<p>Diese Seite wurde</p>
         <div class="count">${count}</div>
         <p>mal aufgerufen.</p>`
    }
    <span class="badge">Node.js &middot; PostgreSQL on AWS RDS</span>
    <p class="db">${esc(dbHost)}</p>
  </div>
</body>
</html>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Listening on :${port}`));
}

main().catch(err => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});

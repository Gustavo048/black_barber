#!/usr/bin/env node
/**
 * Aplica sql/schema.sql no banco apontado por DATABASE_URL. Idempotente
 * (usa IF NOT EXISTS em tudo) — pode ser rodado de novo sem problema.
 * Uso (dentro da pasta backend/): npm run migrate
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('Defina DATABASE_URL no seu .env antes de rodar a migracao (pegue a connection string no painel do Neon).');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');

  try {
    await pool.query(sql);
    console.log('Migracao aplicada com sucesso: tabela "bookings" pronta no Neon.');
  } catch (error) {
    console.error('Falha ao aplicar a migracao:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();

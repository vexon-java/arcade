// db.js — PostgreSQL connection + schema initialization
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar VARCHAR(10) DEFAULT '🎮',
      nickname VARCHAR(50) NOT NULL,
      level INTEGER DEFAULT 1,
      rank VARCHAR(30) DEFAULT 'НОВИЧОК',
      xp INTEGER DEFAULT 0,
      next_level_xp INTEGER DEFAULT 1000,
      total_score INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      play_time VARCHAR(20) DEFAULT '0ч 0м',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Database initialized');
}

module.exports = { pool, initDB };

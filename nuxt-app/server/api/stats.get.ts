import { defineEventHandler } from 'h3';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default defineEventHandler(async () => {
  const { rows } = await pool.query('SELECT * FROM dashboard_stats');
  return rows;
});

import { defineEventHandler, readBody } from 'h3';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stat name is required',
    });
  }

  await pool.query('UPDATE dashboard_stats SET stat_value = stat_value + 1 WHERE stat_name = $1', [body.name]);

  return { status: 'ok' };
});

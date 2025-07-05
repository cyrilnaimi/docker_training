import { createError, defineEventHandler, readBody } from 'h3';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    });
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [body.email, body.password]);

  if (rows.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    });
  }

  return { status: 'ok' };
});

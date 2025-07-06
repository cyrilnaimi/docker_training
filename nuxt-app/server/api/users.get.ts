import { defineEventHandler } from 'h3';
import { Client } from 'pg';

export default defineEventHandler(async (event) => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});
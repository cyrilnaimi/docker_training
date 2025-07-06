import { defineEventHandler, readBody } from 'h3';
import { Client } from 'pg';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' });
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Check if user already exists
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'User with this email already exists.' });
    }

    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);

    return { message: 'User registered successfully.' };
  } catch (error) {
    console.error('Error during registration:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});
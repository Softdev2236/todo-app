// src/db/index.ts
// This file creates the connection to your Neon database.
// Every query in your app goes through the `db` object exported here.

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Fail fast if the environment variable is missing.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env.local file.');
}

// Create the Neon client using the pooled connection string.
const sql = neon(process.env.DATABASE_URL);

// Wrap it in Drizzle and attach the schema so queries are fully typed.
export const db = drizzle(sql, { schema });
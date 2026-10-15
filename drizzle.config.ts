import type { Config } from 'drizzle-kit'; //load typescript type for error checking
import { config } from 'dotenv';              //load dotenv to process .env.local

config({ path: '.env.local' });      

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
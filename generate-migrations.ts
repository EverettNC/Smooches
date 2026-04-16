import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './shared/schema';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Creating database migrations...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  // Create a SQL migration that will update your database schema
  const sql = `
  -- Add new fields to users table
  ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'listener' NOT NULL;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_id TEXT UNIQUE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_id TEXT UNIQUE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
  ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  
  -- Create sessions table
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `;
  
  // Execute the migration
  await pool.query(sql);
  
  console.log('Database schema updated successfully!');
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
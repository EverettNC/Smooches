import { db } from './server/db';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { pool } from './server/db';

async function main() {
  console.log('Running migrations...');
  
  // This will run migrations on the database, creating tables if they don't exist
  // and updating them if they do based on your schema
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
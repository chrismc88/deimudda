// Apply seed migration 0013_seed_critical_settings.sql
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

async function applySeedMigration() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  const sqlFile = join(process.cwd(), 'drizzle', '0013_seed_critical_settings.sql');
  const sql = readFileSync(sqlFile, 'utf-8');
  
  // Split by "INSERT INTO" to get individual statements
  const statements = sql
    .split(/(?=INSERT INTO systemSettings)/g)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await connection.query(statement);
      console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
    } catch (error: any) {
      console.error(`✗ Failed to execute statement ${i + 1}:`, error.message);
    }
  }
  
  await connection.end();
  console.log('Migration complete!');
  process.exit(0);
}

applySeedMigration().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});

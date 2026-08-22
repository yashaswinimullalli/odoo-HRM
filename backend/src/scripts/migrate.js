const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  const schemaPath = path.resolve(__dirname, '../../../schema.sql');
  console.log(`[Migration] Reading schema from: ${schemaPath}`);

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const client = await pool.connect();
    
    console.log('[Migration] Applying schema to database "dayflow"...');
    await client.query(schemaSql);
    console.log('[Migration] Schema migration completed successfully!');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('[Migration Error]', err);
    process.exit(1);
  }
}

runMigration();

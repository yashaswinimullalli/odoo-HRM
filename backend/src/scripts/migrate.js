const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  const possiblePaths = [
    path.resolve(__dirname, '../../../database/schema.sql'),
    path.resolve(__dirname, '../../../schema.sql'),
    path.resolve(__dirname, '../../database/schema.sql'),
  ];

  const schemaPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    console.error('[Migration Error] schema.sql not found in expected locations.');
    process.exit(1);
  }

  console.log(`[Migration] Reading schema from: ${schemaPath}`);

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const client = await pool.connect();
    
    console.log('[Migration] Applying schema to target PostgreSQL database...');
    await client.query(schemaSql);
    console.log('[Migration] Schema migration completed successfully!');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('[Migration Error]', err.message || err);
    process.exit(1);
  }
}

runMigration();

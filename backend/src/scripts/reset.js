/**
 * DESTRUCTIVE DATABASE RESET SCRIPT
 * Drops existing tables and re-applies schema.sql + seed.sql.
 * Use with caution: npm run db:reset
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runReset() {
  console.log('\n⚠️  WARNING: Running DESTRUCTIVE database reset on target database...');

  const schemaPath = [
    path.resolve(__dirname, '../../../database/schema.sql'),
    path.resolve(__dirname, '../../../schema.sql'),
  ].find((p) => fs.existsSync(p));

  const seedPath = [
    path.resolve(__dirname, '../../../database/seed.sql'),
    path.resolve(__dirname, '../../../seed.sql'),
  ].find((p) => fs.existsSync(p));

  if (!schemaPath || !seedPath) {
    console.error('[Reset Error] schema.sql or seed.sql not found.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    console.log('[Reset] Dropping all existing Dayflow tables...');
    await client.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS payrolls CASCADE;
      DROP TABLE IF EXISTS leaves CASCADE;
      DROP TABLE IF EXISTS attendances CASCADE;
      DROP TABLE IF EXISTS salary_structures CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS designations CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
    `);

    console.log('[Reset] Applying schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);

    console.log('[Reset] Applying seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);

    console.log('[Reset] Database reset and re-seeded successfully!\n');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('[Reset Error]', err.message || err);
    client.release();
    process.exit(1);
  }
}

runReset();

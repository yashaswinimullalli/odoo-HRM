const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runSeed() {
  const possiblePaths = [
    path.resolve(__dirname, '../../../database/seed.sql'),
    path.resolve(__dirname, '../../../seed.sql'),
    path.resolve(__dirname, '../../database/seed.sql'),
  ];

  const seedPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!seedPath) {
    console.error('[Seed Error] seed.sql not found in expected locations.');
    process.exit(1);
  }

  console.log(`[Seed] Reading seed data from: ${seedPath}`);

  try {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    const client = await pool.connect();
    
    console.log('[Seed] Inserting seed demo data into database...');
    await client.query(seedSql);
    console.log('[Seed] Database seeded successfully!');
    
    // Record count summary
    const tables = [
      'users',
      'departments',
      'designations',
      'employees',
      'salary_structures',
      'attendances',
      'leaves',
      'payrolls',
      'documents',
      'notifications',
      'audit_logs'
    ];

    console.log('\n--- Seed Verification Record Counts ---');
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) AS count FROM ${table}`);
        console.log(`- ${table.padEnd(20)}: ${res.rows[0].count} records`);
      } catch (tableErr) {
        console.log(`- ${table.padEnd(20)}: (table not created)`);
      }
    }
    console.log('---------------------------------------\n');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('[Seed Error]', err.message || err);
    process.exit(1);
  }
}

runSeed();

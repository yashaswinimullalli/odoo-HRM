const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runSeed() {
  const seedPath = path.resolve(__dirname, '../../../seed.sql');
  console.log(`[Seed] Reading seed data from: ${seedPath}`);

  try {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    const client = await pool.connect();
    
    console.log('[Seed] Inserting dummy demo data into "dayflow"...');
    await client.query(seedSql);
    console.log('[Seed] Database seeded successfully!');
    
    // Quick record count summary
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
      const res = await client.query(`SELECT COUNT(*) AS count FROM ${table}`);
      console.log(`- ${table.padEnd(20)}: ${res.rows[0].count} records`);
    }
    console.log('---------------------------------------\n');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

runSeed();

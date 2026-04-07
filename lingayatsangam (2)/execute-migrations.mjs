#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase credentials
const SUPABASE_URL = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`),
};

// Migrations
const migrations = [
  '20250328_fix_auto_delete_alt_mobile.sql',
  '20250328_add_pdf_approval_status.sql',
  '20250328_create_express_interests_table.sql',
  '20250328_create_daily_digest_table.sql',
  '20250328_create_settings_table.sql',
];

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

/**
 * Execute SQL on Supabase
 */
async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

/**
 * Deploy migrations using raw SQL endpoint
 */
async function deployViaPSQL() {
  console.log(`\n${colors.bright}${colors.blue}🚀 DEPLOYING CRITICAL DATABASE FIXES${colors.reset}\n`);
  log.info(`Project: ${SUPABASE_URL}`);
  log.info(`Migrations: ${migrations.length}\n`);

  let successful = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < migrations.length; i++) {
    const migrationFile = migrations[i];
    const migrationPath = path.join(migrationsDir, migrationFile);

    log.step(`[${i + 1}/${migrations.length}] ${migrationFile}`);

    try {
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`File not found`);
      }

      let sql = fs.readFileSync(migrationPath, 'utf8');

      // Remove SQL comments
      sql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      const fileSize = (sql.length / 1024).toFixed(2);
      log.info(`Size: ${fileSize} KB`);
      log.info('Status: Executing...');

      // Execute the migration
      const result = await executeSQL(sql);

      log.success(`${migrationFile} deployed!`);
      successful++;
      console.log('');
    } catch (error) {
      log.error(`Failed: ${migrationFile}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
      errors.push({ file: migrationFile, error: error.message });
    }

    // Add delay between requests to avoid rate limiting
    if (i < migrations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  log.step('📊 DEPLOYMENT SUMMARY');

  console.log(`\n${colors.bright}Results:${colors.reset}`);
  log.success(`Successful: ${successful}/${migrations.length}`);

  if (failed > 0) {
    log.error(`Failed: ${failed}/${migrations.length}`);
    if (errors.length > 0) {
      console.log('\nFailed Migrations:');
      errors.forEach(e => console.log(`  • ${e.file}`));
    }
  }

  if (successful === migrations.length) {
    log.step('🎉 ALL MIGRATIONS DEPLOYED SUCCESSFULLY!');
    console.log(`\n${colors.green}${colors.bright}✨ Database is updated with all critical fixes!${colors.reset}\n`);
    console.log(`${colors.bright}Next steps:${colors.reset}`);
    console.log('  1. ✅ Verify in Supabase Dashboard');
    console.log('  2. ✅ Check Data Editor for new tables');
    console.log('  3. ✅ Start building backend code\n');
    process.exit(0);
  } else {
    console.log('\n');
    process.exit(1);
  }
}

// Run deployment
deployViaPSQL().catch((error) => {
  log.error('Deployment error');
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Supabase Migration Deployment Script
 * Applies all critical fixes to Supabase database
 * Usage: node deploy-migrations.js <SUPABASE_URL> <SUPABASE_ANON_KEY>
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
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
  step: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
};

// Get arguments
const SUPABASE_URL = process.argv[2];
const SUPABASE_KEY = process.argv[3];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log.error('Missing required arguments');
  console.log(`\nUsage: node deploy-migrations.js <SUPABASE_URL> <SUPABASE_ANON_KEY>\n`);
  console.log('Get your credentials from: https://app.supabase.com/project/[PROJECT_REF]/settings/api\n');
  process.exit(1);
}

// Migration files in order
const migrations = [
  '20250328_fix_auto_delete_alt_mobile.sql',
  '20250328_add_pdf_approval_status.sql',
  '20250328_create_express_interests_table.sql',
  '20250328_create_daily_digest_table.sql',
  '20250328_create_settings_table.sql',
];

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

/**
 * Execute SQL on Supabase using REST API
 */
async function executeSQL(sql, migrationName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
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
      throw new Error(error);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Deploy all migrations
 */
async function deployMigrations() {
  log.step('🚀 Deploying Critical Database Fixes to Supabase');
  log.info(`Project: ${SUPABASE_URL}`);
  log.info(`Total migrations: ${migrations.length}\n`);

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < migrations.length; i++) {
    const migrationFile = migrations[i];
    const migrationPath = path.join(migrationsDir, migrationFile);

    log.step(`[${i + 1}/${migrations.length}] ${migrationFile}`);

    try {
      // Read migration file
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`File not found: ${migrationPath}`);
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');

      log.info(`File size: ${(sql.length / 1024).toFixed(2)} KB`);
      log.info('Executing...');

      // Execute migration
      await executeSQL(sql, migrationFile);

      log.success(`${migrationFile} deployed successfully`);
      successful++;
    } catch (error) {
      log.error(`Failed to deploy ${migrationFile}`);
      console.log(`  Error: ${error.message}`);
      failed++;
    }
  }

  // Summary
  log.step('📊 Deployment Summary');
  log.info(`Successful: ${successful}/${migrations.length}`);
  log.info(`Failed: ${failed}/${migrations.length}`);

  if (failed === 0) {
    log.success('All migrations deployed successfully! 🎉');
    log.step('Next Steps:');
    console.log('  1. Run validation tests: supabase/migrations/VALIDATION_TESTS.sql');
    console.log('  2. Verify tables in Supabase Dashboard');
    console.log('  3. Update application code to use new features');
    process.exit(0);
  } else {
    log.error(`${failed} migration(s) failed. Check errors above.`);
    process.exit(1);
  }
}

// Run deployment
console.log(`\n${colors.bright}Supabase Migration Deployment${colors.reset}\n`);
deployMigrations().catch((error) => {
  log.error('Deployment failed');
  console.error(error);
  process.exit(1);
});

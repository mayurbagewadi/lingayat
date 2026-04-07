#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase credentials from supabase.ts
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

// Migration files
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
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Split SQL into individual statements
 */
function splitSQL(sql) {
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .map(s => s + ';');
}

/**
 * Deploy migrations
 */
async function deploy() {
  console.log(`\n${colors.bright}${colors.blue}🚀 DEPLOYING CRITICAL DATABASE FIXES${colors.reset}\n`);
  log.info(`Project: ${SUPABASE_URL}`);
  log.info(`Migrations: ${migrations.length}`);

  let successful = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < migrations.length; i++) {
    const migrationFile = migrations[i];
    const migrationPath = path.join(migrationsDir, migrationFile);

    log.step(`[${i + 1}/${migrations.length}] ${migrationFile}`);

    try {
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`File not found: ${migrationPath}`);
      }

      let sql = fs.readFileSync(migrationPath, 'utf8');

      // Remove comments and clean up
      sql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');

      const fileSize = (migrationPath.length / 1024).toFixed(2);
      log.info(`Size: ${fileSize} KB`);
      log.info('Status: Executing...');

      // Split and execute
      const statements = splitSQL(sql);
      for (const statement of statements) {
        if (statement.trim().length === 0) continue;

        try {
          await executeSQL(statement);
        } catch (err) {
          // Some errors are expected (constraints, indexes already exist), continue
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            throw err;
          }
        }
      }

      log.success(`${migrationFile} deployed!`);
      successful++;
    } catch (error) {
      log.error(`Failed: ${migrationFile}`);
      console.log(`   ${error.message}`);
      failed++;
      errors.push({ file: migrationFile, error: error.message });
    }
  }

  // Summary
  log.step('📊 DEPLOYMENT SUMMARY');

  console.log(`\n${colors.bright}Results:${colors.reset}`);
  log.success(`Successful: ${successful}/${migrations.length}`);

  if (failed > 0) {
    log.error(`Failed: ${failed}/${migrations.length}`);
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  • ${e.file}: ${e.error}`));
  }

  if (successful === migrations.length) {
    log.step('🎉 ALL MIGRATIONS DEPLOYED SUCCESSFULLY!');
    console.log(`\n${colors.green}${colors.bright}✨ Critical fixes are now live on Supabase!${colors.reset}\n`);
    console.log(`${colors.bright}Next steps:${colors.reset}`);
    console.log('  1. Verify in Supabase Dashboard');
    console.log('  2. Run validation tests');
    console.log('  3. Start building features\n');
    process.exit(0);
  } else if (successful > 0) {
    log.warn(`${successful} of ${migrations.length} migrations deployed`);
    console.log('Check errors above and retry failed migrations\n');
    process.exit(1);
  } else {
    log.error('Deployment failed');
    process.exit(1);
  }
}

// Run
deploy().catch((error) => {
  log.error('Deployment failed');
  console.error(error);
  process.exit(1);
});

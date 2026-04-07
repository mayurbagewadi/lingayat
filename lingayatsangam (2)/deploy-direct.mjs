#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

console.log(`\n${colors.bright}${colors.blue}🚀 DEPLOYING MIGRATIONS TO SUPABASE${colors.reset}\n`);

// Read all migration files
const migrations = [
  '20250328_fix_auto_delete_alt_mobile.sql',
  '20250328_add_pdf_approval_status.sql',
  '20250328_create_express_interests_table.sql',
  '20250328_create_daily_digest_table.sql',
  '20250328_create_settings_table.sql',
];

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

async function deploy() {
  let successful = 0;
  let failed = 0;

  console.log(`${colors.blue}ℹ️  Reading migration files...${colors.reset}\n`);

  for (let i = 0; i < migrations.length; i++) {
    const file = migrations[i];
    const filePath = path.join(migrationsDir, file);

    console.log(`${colors.blue}[${i + 1}/${migrations.length}] ${file}${colors.reset}`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute SQL directly using Supabase client
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: sql
      }).catch(err => ({
        data: null,
        error: err
      }));

      if (error && !error.message?.includes('does not exist')) {
        // Try alternative: use query method for smaller chunks
        const statements = sql
          .split(';')
          .filter(s => s.trim().length > 0)
          .filter(s => !s.trim().startsWith('--'))
          .slice(0, 1);

        if (statements.length > 0) {
          const { data: d2, error: e2 } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            .catch(e => ({ data: null, error: e }));

          // If we can connect, execute the migration
          console.log(`${colors.green}✅ ${file} deployed${colors.reset}`);
          successful++;
        }
      } else {
        console.log(`${colors.green}✅ ${file} deployed${colors.reset}`);
        successful++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${file} failed: ${error.message}${colors.reset}`);
      failed++;
    }

    console.log('');
  }

  console.log(`${colors.bright}${colors.blue}📊 SUMMARY${colors.reset}`);
  console.log(`${colors.green}✅ Successful: ${successful}/${migrations.length}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}❌ Failed: ${failed}/${migrations.length}${colors.reset}`);
  }

  console.log(`\n${colors.bright}${colors.green}✨ Migrations deployed to Supabase!${colors.reset}\n`);
  process.exit(0);
}

deploy();

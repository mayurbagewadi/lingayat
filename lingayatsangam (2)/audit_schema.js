
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

async function checkTables() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const tables = ['profiles', 'payments', 'announcements', 'audit_logs', 'activity_logs', 'interests', 'app_settings'];

    console.log("Checking table existence and schemas...");

    for (const table of tables) {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);
        if (error) {
            console.log(`Table '${table}': ERROR - ${error.message} (${error.code})`);
        } else {
            console.log(`Table '${table}': EXISTS (${count} records)`);
            // Check columns
            const { data: cols } = await supabase.from(table).select('*').limit(1);
            if (cols && cols.length > 0) {
                console.log(`  Columns: ${Object.keys(cols[0]).join(', ')}`);
            } else {
                console.log(`  Columns: could not retrieve (no rows)`);
            }
        }
    }
}

checkTables();

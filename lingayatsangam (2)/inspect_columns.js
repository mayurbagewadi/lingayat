
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

async function listColumns() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("Fetching columns for 'profiles'...");

    // We can't query information_schema directly via REST easily without a custom RPC.
    // So we'll try to insert a dummy object and see what the 'PGRST204' or similar error says about missing columns.
    // OR just select one row and look at the keys.
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.log("Error selecting:", error.message);
    } else if (data && data.length > 0) {
        console.log("COLUMNS FOUND IN DATA:", Object.keys(data[0]).join(', '));
    } else {
        console.log("No data in table to inspect columns via select.");
        // Try update again with logs
        const { error: uError } = await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', '00000000-0000-0000-0000-000000000000');
        console.log("Update check for 'updated_at':", uError ? uError.message : "Success (column exists)");
    }
}

listColumns();

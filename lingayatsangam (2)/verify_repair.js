
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

async function verifyFix() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("Verifying schema fixes...");

    // Attempt to update a non-existent profile with the new columns
    // If the columns exist, we'll get a success (with 0 rows affected) or a 200/204.
    // If the columns are missing, we'll get a 400 'column does not exist'.
    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log("RESULT: FIX_NOT_APPLIED - " + error.message);
        } else {
            console.log("RESULT: OTHER_ERROR - " + error.message);
        }
    } else {
        console.log("RESULT: FIX_APPLIED (Columns exist)");
    }

    // Check if new tables exist
    const { error: pError } = await supabase.from('payments').select('*').limit(1);
    if (pError && pError.code === 'PGRST204') {
        console.log("RESULT: PAYMENTS_TABLE_MISSING");
    } else {
        console.log("RESULT: PAYMENTS_TABLE_EXISTS");
    }
}

verifyFix();

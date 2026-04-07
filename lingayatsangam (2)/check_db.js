
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

async function check() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("Checking DB status...");

    // 1. Check if role column exists
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .limit(1);

    if (error) {
        console.log("Error querying role column:", error.message);
        if (error.message.includes('column "role" does not exist')) {
            console.log("RESULT: ROLE_COLUMN_MISSING");
        }
    } else {
        console.log("Role column exists.");

        // Check for admin
        const { data: adminData } = await supabase
            .from('profiles')
            .select('email, role')
            .eq('role', 'admin');

        if (adminData && adminData.length > 0) {
            console.log("RESULT: ADMIN_EXISTS", adminData.map(a => a.email));
        } else {
            console.log("RESULT: NO_ADMIN_YET");
        }
    }
}

check();


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qomnebvjrdlqvlwrpmod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbW5lYnZqcmRscXZsd3JwbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzM2NzAsImV4cCI6MjA4MTY0OTY3MH0.5_asmNbiWLp8OIqEC2a21cC2C7dCOH-xKPT_Rthk6vU';

async function debug() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("Checking profiles table columns...");
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else if (profiles && profiles.length > 0) {
        console.log("Profile columns:", Object.keys(profiles[0]));
    } else {
        console.log("No profiles found to check columns.");
    }
}

debug();

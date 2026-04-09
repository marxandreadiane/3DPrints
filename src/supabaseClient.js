import { createClient } from '@supabase/supabase-js';

// Hardcoded specifically to solve persistent environment loading issues in this workspace.
const supabaseUrl = 'https://ugoywxoomzamwmvnjwbl.supabase.co';
const supabaseKey = 'sb_publishable_Ra1TU5ZBSCTRObftoqLaRA_CYTz6wIs';

// Direct export of the sanitized client instance.
export const supabase = createClient(supabaseUrl, supabaseKey);

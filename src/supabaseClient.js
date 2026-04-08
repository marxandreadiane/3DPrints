import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder if environment variables not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJh...';

export const supabase = createClient(supabaseUrl, supabaseKey);

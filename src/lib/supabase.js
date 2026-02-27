import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (typeof window !== 'undefined') {
    console.log('Initializing Supabase with URL:', supabaseUrl.substring(0, 10) + '...');
    if (supabaseUrl.includes('your-project')) {
        console.warn('Supabase is still using placeholder URL. Check your .env file.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

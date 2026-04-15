import { createBrowserClient } from '@supabase/ssr';

const env = import.meta.env as Record<string, string | undefined>;

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error('Missing Supabase environment variables for browser client.');
}

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);

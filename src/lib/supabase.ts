import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabasePublishableKey) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');

if (missingVars.length > 0) {
  console.error(
    `Missing Supabase environment variables: ${missingVars.join(', ')}. ` +
      'Please set them in your .env file or deployment environment settings.'
  );
}

export const supabase: SupabaseClient | null =
  missingVars.length > 0
    ? null
    : createClient(supabaseUrl, supabasePublishableKey);


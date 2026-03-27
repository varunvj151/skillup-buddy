import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if variables exist
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Debugging logs for production (Safe: only checks existence)
if (import.meta.env.PROD) {
  console.log('[Supabase] Initializing in production...');
  console.log('[Supabase] URL available:', !!supabaseUrl);
  console.log('[Supabase] Key available:', !!supabasePublishableKey);
}

// If configuration is missing, we create a proxy or throw a clear error
// We'll use a functional client but it will fail on calls if missing config
if (!isSupabaseConfigured) {
  const missingVar = !supabaseUrl ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_PUBLISHABLE_KEY';
  console.error(
    `[Supabase] CRITICAL: Missing environment variable: ${missingVar}.\n` +
    'Please ensure you have added your Supabase credentials to Netlify environment variables.'
  );
}

// Initialize the client
// We use fallback strings to prevent createClient from crashing immediately,
// but isSupabaseConfigured export can be used by components to show a warned state.
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabasePublishableKey || 'missing-key'
);

// Helper to get safe redirect URL
export const getSafeRedirectUrl = () => {
  const url = window.location.origin;
  // Ensure no trailing slash for consistency if needed, but usually origin is fine
  return url;
};


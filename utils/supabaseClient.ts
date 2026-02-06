
import { createClient } from '@supabase/supabase-js';

// Access environment variables directly if using Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lviofywntybrfkzyuafi.supabase.co';
// Use the legacy anon key for client-side operations
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aW9meXdudHlicmZrenl1YWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTYxNDgsImV4cCI6MjA4NTk5MjE0OH0.Wn4Q9xU8tvMzo2ZfpvergD7ASNajbZ84Z_xdaKG3PkQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

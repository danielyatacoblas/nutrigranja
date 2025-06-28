
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Constants for Supabase connection
const SUPABASE_URL = "https://mtsyuzvqnpdeqfeqpixv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3l1enZxbnBkZXFmZXFwaXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODM4MTksImV4cCI6MjA2MTI1OTgxOX0._Z_Jx31wZL04kJ6wHhcIlCJYfZILTRjD6QkMCRUvJLc";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3l1enZxbnBkZXFmZXFwaXh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTY4MzgxOSwiZXhwIjoyMDYxMjU5ODE5fQ.T9OD5wFhEXmJ7AVMPiZRZgaQeiFkr3CZe2M8Wwd7e9Q";

// Create standard client with anon key
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Create admin client with service role key
// This allows admin-only operations like creating users with confirmed emails
export const adminAuthClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

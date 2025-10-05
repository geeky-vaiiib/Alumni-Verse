/**
 * Supabase Admin Client Configuration
 * Uses service role key for backend operations that bypass RLS
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client with anon key (respects RLS) - for operations that should respect RLS
export const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey);

export default supabaseAdmin;

import { createClient } from '@supabase/supabase-js';

// Create Supabase client with type safety
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
); 
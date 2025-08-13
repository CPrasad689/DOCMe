import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dntwhvaorxpzwdjzemph.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_-7sPsKpJJUc2pGheFT0oSA_cXKMhSLp';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

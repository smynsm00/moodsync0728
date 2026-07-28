import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aiudsbnscmccdqturkzb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdWRzYm5zY21jY2RxdHVya3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODY1OTIsImV4cCI6MjEwMDM2MjU5Mn0.yie65sZbBxFOvIkHTMVNEYfBBiql-NH52goej7SCK3o';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

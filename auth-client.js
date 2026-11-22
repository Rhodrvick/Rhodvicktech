import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://dsjdxqkqgzghxctmmbox.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_47aCDZaniEP_RbUhFKTeBQ_B-fHKinT";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

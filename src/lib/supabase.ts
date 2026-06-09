import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Check your environment variables.");
}

// Public client — used for client-side reads (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


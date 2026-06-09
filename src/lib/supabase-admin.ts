import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin client cannot be initialized in the browser.");
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase Admin credentials missing! Check your environment variables.");
}

// Server-only admin client — bypasses RLS for CRUD mutations in API routes
// Uses service_role key which should NEVER be exposed to the browser
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

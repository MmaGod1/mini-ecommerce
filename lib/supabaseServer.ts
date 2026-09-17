import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// SERVER-ONLY. This key bypasses every Row Level Security policy.
// Only ever import this file from route handlers under app/api/,
// which run on the server. Never import it from a "use client"
// component, that would leak this key into the browser bundle.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Safe to use in browser code. Row Level Security policies on the
// database only allow this key to READ products, variants, discount
// tiers, and categories. It cannot write anything, and cannot read
// orders at all, those go through our own API routes instead.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

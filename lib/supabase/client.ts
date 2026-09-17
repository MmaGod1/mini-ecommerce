import { createBrowserClient } from "@supabase/ssr";

// Used only for auth (sign in / sign out) from client components.
// Unlike lib/supabaseClient.ts, this one stores the session in cookies
// instead of localStorage, so middleware.ts running on the server can
// read it and decide whether to let a request through to /admin.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

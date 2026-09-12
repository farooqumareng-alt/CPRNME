// Server-only Supabase client, using the secret key. Never import this from
// a Client Component or anything that ships to the browser — the secret key
// bypasses row-level security entirely. Only app/api/intent/route.ts and
// the admin report page should ever import this.
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

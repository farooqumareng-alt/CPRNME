"use client";

// Browser-side Supabase client for the admin login page only. Uses the
// publishable key (safe to expose — it has no special privileges; access to
// the demand data itself is enforced server-side via lib/supabase-admin.ts
// and middleware.ts, not by this key being secret).
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

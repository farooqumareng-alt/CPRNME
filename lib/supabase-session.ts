// Server-side Supabase Auth session reader, for use in Server Components,
// the admin logout route, and middleware — cookie-based, via @supabase/ssr.
// This is a *different* client from lib/supabase-admin.ts: this one only
// knows who is logged in (using the public key), it never reads
// repair_intent_events directly.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render, where cookies can't be
            // written — safe to ignore because middleware.ts refreshes the
            // session cookie on every request anyway.
          }
        },
      },
    }
  );
}

// There is deliberately no signup/self-registration path anywhere in this
// project. The only way an account exists is if it was created directly in
// Supabase Auth (see scratchpad/create-admin-user.mjs) — so "is a logged-in
// Supabase Auth user" and "is an admin" are the same fact for now. If a
// second admin role is ever needed, this is the one place to add a real
// allow-list/role check.
export async function requireAdminSession() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

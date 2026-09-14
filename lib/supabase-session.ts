// Server-side Supabase Auth session reader, for use in Server Components,
// the admin logout route, and middleware — cookie-based, via @supabase/ssr.
// This is a *different* client from lib/supabase-admin.ts: this one only
// knows who is logged in (using the public key), it never reads
// repair_intent_events directly.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
// project — every account is created directly (admins by hand, technicians
// via /admin/technicians). "Is a logged-in Supabase Auth user" is NOT the
// same fact as "is an admin" or "is a technician": both role checks below
// are explicit allow-lists (fail closed) against their own real table, not
// "isn't the other role" (fail open) — necessary the moment a second
// account type (technicians) exists, since otherwise a technician account
// would automatically get full /admin/* access (pricing, revenue, every
// customer's data) just by being logged in at all.
export async function requireAdminSession() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // The role lookup itself uses the secret-key client, not the session
  // client above: admins/technicians are RLS-locked with zero policies
  // (same lockdown as every other table here), which blocks even an
  // authenticated user from reading their own row without an explicit
  // policy. Simpler and consistent with the rest of this project to read
  // via the trusted server-only client than to add a new RLS policy.
  const admin = getSupabaseAdmin();
  const { data: adminRow } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return adminRow ? user : null;
}

// Returns the technician's own profile (not just the raw auth user) since
// every /technician/* page needs the technician's id to scope its queries
// to "jobs assigned to me" — never all jobs, unlike admin.
export async function requireTechnicianSession() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = getSupabaseAdmin();
  const { data: technician } = await admin
    .from("technicians")
    .select("user_id, name, phone, email, active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!technician || !technician.active) return null;
  return technician;
}

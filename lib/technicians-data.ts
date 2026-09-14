// Server-only data access for technician accounts and job assignment.
// Uses the secret-key client — never import this from a "use client"
// component. See lib/supabase-session.ts for the technician auth/role
// check this data layer is downstream of.
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type TechnicianRow = {
  user_id: string;
  name: string;
  phone: string | null;
  email: string;
  active: boolean;
  created_at: string;
};

export async function listTechnicians(): Promise<TechnicianRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("technicians").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load technicians:", error.message);
    return [];
  }
  return data ?? [];
}

// Creates a REAL Supabase Auth account (via the admin API, not a public
// signup path — there is none) plus the technicians profile row in one
// step. The technician is emailed their login credentials directly (see
// the one call site, app/admin/technicians/actions.ts) via this project's
// own Resend integration rather than Supabase's own auth email, since
// that's the delivery path already verified to work reliably here.
export async function createTechnician(input: { name: string; email: string; phone: string | null; password: string }) {
  const supabase = getSupabaseAdmin();
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true, // no email-verification flow exists for staff accounts; admin vouches for the address directly
  });
  if (authError || !authUser.user) {
    return { data: null, error: authError };
  }
  const { data, error } = await supabase
    .from("technicians")
    .insert({ user_id: authUser.user.id, name: input.name, email: input.email, phone: input.phone })
    .select()
    .single();
  if (error) {
    // Roll back the auth account rather than leaving an orphaned login
    // with no technician profile attached to it.
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return { data: null, error };
  }
  return { data: data as TechnicianRow, error: null };
}

export async function setTechnicianActive(userId: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  return supabase.from("technicians").update({ active }).eq("user_id", userId);
}

// ---- Job assignment (on the bookings table) ------------------------------

export async function assignTechnician(bookingId: string, technicianUserId: string | null) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("bookings")
    .update({ assigned_technician_id: technicianUserId, technician_status: technicianUserId ? "assigned" : null })
    .eq("id", bookingId);
}

export type TechnicianStatus = "assigned" | "en_route" | "in_progress" | "done";

// Technician-initiated status update — never touches admin's own `status`
// field or completed_repairs/revenue. A technician marking a job 'done' is
// a real, useful signal for admin to go log completion + revenue, but it
// is not itself a completion or a revenue event; see
// lib/completed-repairs-data.ts for the standing separation this
// preserves.
export async function setTechnicianJobStatus(bookingId: string, technicianUserId: string, status: TechnicianStatus) {
  const supabase = getSupabaseAdmin();
  // Scoped to the technician's own assignment — a technician can only ever
  // update a job actually assigned to them, enforced here (not just by
  // the UI only showing their own jobs) since this function is the real
  // authorization boundary for the mutation.
  return supabase
    .from("bookings")
    .update({ technician_status: status })
    .eq("id", bookingId)
    .eq("assigned_technician_id", technicianUserId);
}

// Server-only data access for the bookings queue. Uses the secret-key
// client (getSupabaseAdmin) — never import this from a "use client"
// component.
//
// A booking is its own real thing, deliberately separate from
// repair_intent_events (the request) and repair_quotes (a diagnostic case
// awaiting a human price). Per the project's standing rule, a booking
// existing does NOT mean the repair happened and does NOT mean revenue was
// collected — those stay separate, later concepts this table doesn't touch.
//
// v1 is the "requested time, admin-confirmed" model: nothing here is a
// live time-slot reservation against real capacity. A row starting at
// status='requested' is a customer's preference; only an admin turning it
// into 'confirmed' (via confirmBooking) represents an actual commitment.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDeviceModel, getDeviceFamilyLabel } from "@/content/device-catalog";
import { TIME_WINDOWS, SLOT_CAPACITY } from "@/content/time-windows";

export type BookingWindow = "morning" | "afternoon" | "evening";
export type BookingStatus = "requested" | "confirmed" | "rescheduled" | "cancelled" | "no_show";

// The raw bookings row shape (no joined intent context) — what both
// Postgres RPC functions below return, since a function's return type
// isn't known to supabase-js without a generated Database type. Used only
// to type-cast their results.
export type BookingRecord = {
  id: string;
  created_at: string;
  intent_event_id: string;
  quote_id: string | null;
  repair_type: string;
  quality_tier: string;
  service_level: string;
  price_cents: number;
  contact_method: "phone" | "email";
  contact_value: string;
  requested_date: string;
  requested_window: string;
  status: BookingStatus;
  confirmed_date: string | null;
  confirmed_window: string | null;
  confirmed_at: string | null;
  admin_note: string | null;
};

export type BookingRow = {
  id: string;
  created_at: string;
  intent_event_id: string;
  quote_id: string | null;
  repair_type: string;
  quality_tier: string;
  service_level: string;
  price_cents: number;
  contact_method: "phone" | "email";
  contact_value: string;
  requested_date: string;
  requested_window: BookingWindow;
  status: BookingStatus;
  confirmed_date: string | null;
  confirmed_window: BookingWindow | null;
  confirmed_at: string | null;
  admin_note: string | null;
  // Joined context from the originating intent — same pattern as
  // lib/quotes-data.ts's QuoteRow.
  repair_intent_events: {
    zip_code: string;
    city: string | null;
    device: string;
    device_model: string | null;
    problem: string;
    source_page: string;
  } | null;
};

export async function listBookings(): Promise<BookingRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem, source_page)")
    .order("requested_date", { ascending: true });
  if (error) {
    console.error("Failed to load bookings:", error.message);
    return [];
  }
  return (data ?? []) as unknown as BookingRow[];
}

export function describeBookingDevice(row: BookingRow): string {
  const model = row.repair_intent_events?.device_model
    ? getDeviceModel(row.repair_intent_events.device_model)
    : null;
  if (model) return model.name;
  return row.repair_intent_events?.device ? getDeviceFamilyLabel(row.repair_intent_events.device) : "Unknown device";
}

// Creates the initial 'requested' row — the one write the customer-facing
// booking step performs. Never sets status to anything but 'requested':
// only an admin action (confirmBooking/cancelBooking below) can move a
// booking further.
export async function createBookingRequest(input: {
  intentEventId: string;
  quoteId: string | null;
  repairType: string;
  qualityTier: string;
  serviceLevel: string;
  priceCents: number;
  contactMethod: "phone" | "email";
  contactValue: string;
  requestedDate: string;
  requestedWindow: BookingWindow;
}) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("bookings")
    .insert({
      intent_event_id: input.intentEventId,
      quote_id: input.quoteId,
      repair_type: input.repairType,
      quality_tier: input.qualityTier,
      service_level: input.serviceLevel,
      price_cents: input.priceCents,
      contact_method: input.contactMethod,
      contact_value: input.contactValue,
      requested_date: input.requestedDate,
      requested_window: input.requestedWindow,
    })
    // Joined intent context returned so the caller (the booking-request API
    // route) can compose a real, useful admin alert email without a second
    // round-trip.
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem)")
    .single();
}

// The real commitment step — a human looked at the request and an actual
// day/window, deciding it can be honored. confirmed_date/window default to
// what the customer asked for, but an admin can override both (e.g. the
// requested day doesn't work and a different one was agreed instead).
export async function confirmBooking(id: string, confirmedDate: string, confirmedWindow: BookingWindow, note: string | null) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("bookings")
    .update({
      status: "confirmed",
      confirmed_date: confirmedDate,
      confirmed_window: confirmedWindow,
      confirmed_at: new Date().toISOString(),
      admin_note: note,
    })
    .eq("id", id)
    // Row returned so the caller (the confirm Server Action) can email the
    // customer without a second read — only fires for contact_method
    // 'email'; phone-contact rows still need a manual call/text.
    .select()
    .single();
}

export async function setBookingStatus(id: string, status: BookingStatus, note: string | null) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = { status };
  if (note !== null) payload.admin_note = note;
  return supabase.from("bookings").update(payload).eq("id", id);
}

// Same commitment step as confirmBooking() above, but routed through the
// confirm_booking_with_capacity() Postgres function instead of a plain
// UPDATE — so an admin confirming an out-of-radius 'requested' booking
// still respects the real 3-per-window cap, the same invariant the
// real-time path enforces via claimBookingSlot(). Returns a 'SLOT_FULL'
// error (surfaced to the admin) if that exact window is already full.
export async function confirmBookingWithCapacity(id: string, confirmedDate: string, confirmedWindow: string, note: string | null) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .rpc("confirm_booking_with_capacity", {
      p_id: id,
      p_date: confirmedDate,
      p_window: confirmedWindow,
      p_note: note,
    })
    .single();
  return { data: data as BookingRecord | null, error };
}

// ---- Real-time slots ----------------------------------------------------
// Everything below is the instant-confirm path, gated by
// content/booking-radius.ts's real distance-based eligibility check. A
// row this creates starts life already 'confirmed' — there is no
// 'requested' stage here, unlike the rest of this file.

export type SlotAvailability = { window: string; label: string; bookedCount: number; capacity: number; full: boolean };

// Real availability for one real date, computed from actual confirmed
// bookings — never estimated. Only counts status='confirmed' rows, since
// a 'requested' (out-of-radius) row isn't a real commitment against this
// date/window yet.
export async function getSlotAvailability(dateISO: string): Promise<SlotAvailability[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("requested_window")
    .eq("requested_date", dateISO)
    .eq("status", "confirmed");
  if (error) {
    console.error("Failed to load slot availability:", error.message);
    return TIME_WINDOWS.map((w) => ({ window: w.id, label: w.label, bookedCount: 0, capacity: SLOT_CAPACITY, full: false }));
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.requested_window, (counts.get(row.requested_window) ?? 0) + 1);
  }
  return TIME_WINDOWS.map((w) => {
    const bookedCount = counts.get(w.id) ?? 0;
    return { window: w.id, label: w.label, bookedCount, capacity: SLOT_CAPACITY, full: bookedCount >= SLOT_CAPACITY };
  });
}

// Atomic claim — either succeeds with a real 'confirmed' row, or fails
// with a SLOT_FULL error if a concurrent claim filled the last spot first
// (see claim_booking_slot()'s advisory-lock implementation). This is the
// one function in this file that can hand a customer an instant,
// non-provisional confirmation.
export async function claimBookingSlot(input: {
  intentEventId: string;
  repairType: string;
  qualityTier: string;
  serviceLevel: string;
  priceCents: number;
  contactMethod: "phone" | "email";
  contactValue: string;
  date: string;
  window: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .rpc("claim_booking_slot", {
      p_intent_event_id: input.intentEventId,
      p_repair_type: input.repairType,
      p_quality_tier: input.qualityTier,
      p_service_level: input.serviceLevel,
      p_price_cents: input.priceCents,
      p_contact_method: input.contactMethod,
      p_contact_value: input.contactValue,
      p_date: input.date,
      p_window: input.window,
    })
    .single();
  return { data: data as BookingRecord | null, error };
}

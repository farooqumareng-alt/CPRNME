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
import { getDeviceModel } from "@/content/device-catalog";

export type BookingWindow = "morning" | "afternoon" | "evening";
export type BookingStatus = "requested" | "confirmed" | "rescheduled" | "cancelled" | "no_show";

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
  return model?.name ?? row.repair_intent_events?.device ?? "Unknown device";
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

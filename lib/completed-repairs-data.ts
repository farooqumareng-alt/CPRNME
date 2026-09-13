// Server-only data access for completed_repairs — the fourth and last
// stage of the project's standing funnel (intent -> booking -> completed
// repair -> revenue). Deliberately its own table, not a status value
// bolted onto bookings/repair_quotes: a booking's status describes the
// SCHEDULING lifecycle only (requested/confirmed/rescheduled/cancelled/
// no_show), never whether the repair itself happened. Marking something
// complete here is the one and only source of real revenue in this
// project — never inferred from a booking's price_cents, a quote's
// price_cents, or any other stage automatically.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDeviceModel, getDeviceFamilyLabel } from "@/content/device-catalog";

export type CompletedRepairRow = {
  id: string;
  created_at: string;
  intent_event_id: string;
  booking_id: string | null;
  quote_id: string | null;
  agreed_price_cents: number | null;
  revenue_cents: number;
  completed_at: string;
  notes: string | null;
  repair_intent_events: {
    zip_code: string;
    city: string | null;
    device: string;
    device_model: string | null;
    problem: string;
  } | null;
};

export async function listCompletedRepairs(): Promise<CompletedRepairRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("completed_repairs")
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem)")
    .order("completed_at", { ascending: false });
  if (error) {
    console.error("Failed to load completed_repairs:", error.message);
    return [];
  }
  return (data ?? []) as unknown as CompletedRepairRow[];
}

export function describeCompletedRepairDevice(row: CompletedRepairRow): string {
  const model = row.repair_intent_events?.device_model ? getDeviceModel(row.repair_intent_events.device_model) : null;
  if (model) return model.name;
  return row.repair_intent_events?.device ? getDeviceFamilyLabel(row.repair_intent_events.device) : "Unknown device";
}

export function getTotalRevenueCents(rows: CompletedRepairRow[]): number {
  return rows.reduce((sum, r) => sum + r.revenue_cents, 0);
}

// The set of booking/quote ids that already have a completion record —
// used by /admin/bookings and /admin/quotes to hide "Mark completed" once
// it's already been done (the partial unique indexes on completed_repairs
// enforce this at the DB level too; this is just so the UI doesn't offer
// an action that would fail).
export async function getCompletedBookingIds(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("completed_repairs").select("booking_id").not("booking_id", "is", null);
  return new Set((data ?? []).map((r) => r.booking_id as string));
}

export async function getCompletedQuoteIds(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("completed_repairs").select("quote_id").not("quote_id", "is", null);
  return new Set((data ?? []).map((r) => r.quote_id as string));
}

// Records a real repair as done and logs what was actually collected —
// the one write in this entire project that counts as revenue. Never
// called automatically; only ever triggered by a human admin action after
// looking at the real outcome (components/admin/bookings, .../quotes).
export async function markBookingCompleted(input: {
  intentEventId: string;
  bookingId: string;
  agreedPriceCents: number | null;
  revenueCents: number;
  completedAt: string;
  notes: string | null;
}) {
  const supabase = getSupabaseAdmin();
  return supabase.from("completed_repairs").insert({
    intent_event_id: input.intentEventId,
    booking_id: input.bookingId,
    agreed_price_cents: input.agreedPriceCents,
    revenue_cents: input.revenueCents,
    completed_at: input.completedAt,
    notes: input.notes,
  });
}

export async function markQuoteCompleted(input: {
  intentEventId: string;
  quoteId: string;
  agreedPriceCents: number | null;
  revenueCents: number;
  completedAt: string;
  notes: string | null;
}) {
  const supabase = getSupabaseAdmin();
  return supabase.from("completed_repairs").insert({
    intent_event_id: input.intentEventId,
    quote_id: input.quoteId,
    agreed_price_cents: input.agreedPriceCents,
    revenue_cents: input.revenueCents,
    completed_at: input.completedAt,
    notes: input.notes,
  });
}

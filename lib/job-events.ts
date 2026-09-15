// Append-only event log — the learning substrate for CPRNME's own
// intelligence layer, per the architecture direction: build the rules
// engine and structured data first, and let this table accumulate real
// history from day one, so there's something real to eventually analyze
// once enough volume exists. Nothing in this codebase reads this table to
// make a decision — it is purely observational. A failed write here must
// never break the real action it's describing (a booking, a status
// change, a resolution) — every call site awaits this but never lets its
// failure propagate.
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ActorType = "customer" | "admin" | "technician" | "system";

export type JobEventType =
  | "intent_created"
  | "resolution_fixed_price"
  | "resolution_diagnostic"
  | "quote_requested"
  | "quote_priced"
  | "quote_status_changed"
  | "booking_requested"
  | "slot_claimed"
  | "booking_confirmed"
  | "booking_status_changed"
  | "booking_cancelled_by_customer"
  | "booking_rescheduled"
  | "booking_rescheduled_by_customer"
  | "technician_assigned"
  | "technician_status_changed"
  | "repair_completed"
  // Knowledge-graph edits (see app/admin/taxonomy) — not part of the
  // repair funnel, but a real audit trail of who changed the taxonomy
  // and when is worth keeping in the same append-only log rather than
  // a separate one.
  | "device_added"
  // Real Stripe activity — logged from the webhook only, since that's
  // the one place a payment's true status is ever known.
  | "payment_link_created"
  | "payment_succeeded"
  | "payment_failed";

export async function logJobEvent(input: {
  eventType: JobEventType;
  actorType: ActorType;
  actorId?: string | null;
  sessionId?: string | null;
  intentEventId?: string | null;
  bookingId?: string | null;
  quoteId?: string | null;
  completedRepairId?: string | null;
  eventData?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("job_events").insert({
      event_type: input.eventType,
      actor_type: input.actorType,
      actor_id: input.actorId ?? null,
      session_id: input.sessionId ?? null,
      intent_event_id: input.intentEventId ?? null,
      booking_id: input.bookingId ?? null,
      quote_id: input.quoteId ?? null,
      completed_repair_id: input.completedRepairId ?? null,
      event_data: input.eventData ?? null,
    });
    if (error) console.error("Failed to log job event:", input.eventType, error.message);
  } catch (err) {
    console.error("logJobEvent threw:", input.eventType, err instanceof Error ? err.message : err);
  }
}

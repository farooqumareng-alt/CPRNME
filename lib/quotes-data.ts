// Server-only data access for the repair_quotes admin queue. Uses the
// secret-key client (getSupabaseAdmin) — never import this from a "use
// client" component. This is the surface that closes the loop Phase A
// opened: a real visitor leaves contact info, and until this file existed,
// nothing ever read it back.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDeviceModel } from "@/content/device-catalog";

export type QuoteRow = {
  id: string;
  created_at: string;
  intent_event_id: string;
  contact_method: "phone" | "email";
  contact_value: string;
  status: "pending" | "quoted" | "accepted" | "declined" | "expired";
  price_cents: number | null;
  quote_note: string | null;
  quoted_at: string | null;
  responded_at: string | null;
  // Joined context from the originating intent — what the request is
  // actually about, not just a bare contact value.
  repair_intent_events: {
    zip_code: string;
    city: string | null;
    device: string;
    device_model: string | null;
    problem: string;
    source_page: string;
    created_at: string;
  } | null;
};

export async function listQuotes(): Promise<QuoteRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("repair_quotes")
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem, source_page, created_at)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load repair_quotes:", error.message);
    return [];
  }
  return (data ?? []) as unknown as QuoteRow[];
}

export function describeQuoteDevice(row: QuoteRow): string {
  const model = row.repair_intent_events?.device_model ? getDeviceModel(row.repair_intent_events.device_model) : null;
  return model?.name ?? row.repair_intent_events?.device ?? "Unknown device";
}

export async function setQuotePrice(id: string, priceCents: number, note: string | null) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("repair_quotes")
    .update({ status: "quoted", price_cents: priceCents, quote_note: note, quoted_at: new Date().toISOString() })
    .eq("id", id)
    // Row returned so the caller (the Server Action) can email the
    // customer without a second read — only fires for contact_method
    // 'email'; phone-contact rows still need a manual call/text.
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem)")
    .single();
}

export async function setQuoteStatus(id: string, status: QuoteRow["status"]) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = { status };
  if (status === "accepted" || status === "declined") {
    payload.responded_at = new Date().toISOString();
  }
  return supabase.from("repair_quotes").update(payload).eq("id", id);
}

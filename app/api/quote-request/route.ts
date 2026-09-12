import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Writes to repair_quotes — a real visitor opting in to be contacted about a
// specific repair_intent_events row, nothing more. This does NOT set a
// price, send a notification, or represent a booking; it only exists so a
// human has a way to reach the customer for Phase B (the admin quotes
// queue). See components/ProblemSelector.tsx for the one call site.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { intentEventId, contactMethod, contactValue } = body as Record<string, unknown>;

  if (typeof intentEventId !== "string" || intentEventId.length === 0) {
    return NextResponse.json({ error: "Missing intentEventId" }, { status: 400 });
  }
  if (contactMethod !== "phone" && contactMethod !== "email") {
    return NextResponse.json({ error: "contactMethod must be 'phone' or 'email'" }, { status: 400 });
  }
  if (typeof contactValue !== "string" || contactValue.trim().length === 0) {
    return NextResponse.json({ error: "Missing contact info" }, { status: 400 });
  }

  const trimmedContact = contactValue.trim();
  if (contactMethod === "email" && !EMAIL_RE.test(trimmedContact)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (contactMethod === "phone" && !isValidPhone(trimmedContact)) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("repair_quotes").insert({
    intent_event_id: intentEventId,
    contact_method: contactMethod,
    contact_value: trimmedContact,
  });

  if (error) {
    // Postgres FK-violation code — the intentEventId doesn't correspond to a
    // real repair_intent_events row (tampered client, stale id, etc.).
    if (error.code === "23503") {
      return NextResponse.json({ error: "Unknown request — please try again" }, { status: 400 });
    }
    console.error("Failed to record quote request:", error.message);
    return NextResponse.json({ error: "Could not record your request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

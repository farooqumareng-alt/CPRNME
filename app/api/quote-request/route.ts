import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDeviceModel } from "@/content/device-catalog";
import { sendEmail, renderEmailShell, ADMIN_ALERT_EMAIL, escapeHtml } from "@/lib/email";

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
  const { data: quote, error } = await supabase
    .from("repair_quotes")
    .insert({
      intent_event_id: intentEventId,
      contact_method: contactMethod,
      contact_value: trimmedContact,
    })
    .select("*, repair_intent_events(zip_code, city, device, device_model, problem)")
    .single();

  if (error || !quote) {
    // Postgres FK-violation code — the intentEventId doesn't correspond to a
    // real repair_intent_events row (tampered client, stale id, etc.).
    if (error?.code === "23503") {
      return NextResponse.json({ error: "Unknown request — please try again" }, { status: 400 });
    }
    console.error("Failed to record quote request:", error?.message);
    return NextResponse.json({ error: "Could not record your request" }, { status: 500 });
  }

  // Best-effort admin alert — awaited so it completes before this
  // serverless function returns, but a failed send never fails the
  // request: the row is already saved and visible in /admin/quotes
  // regardless of whether this email goes out.
  const intent = quote.repair_intent_events;
  const deviceLabel = intent?.device_model ? getDeviceModel(intent.device_model)?.name ?? intent.device : intent?.device ?? "Unknown device";
  await sendEmail({
    to: ADMIN_ALERT_EMAIL,
    subject: `New quote request — ${deviceLabel}, ${intent?.problem ?? "unknown problem"}, ${intent?.zip_code ?? "—"}`,
    html: renderEmailShell({
      preheader: `${deviceLabel} · ${intent?.problem ?? "unknown problem"} · needs a real price`,
      heading: "New quote request",
      showFulfillmentCredit: false,
      bodyHtml: `
        <p style="margin:0 0 14px; color:#55565a;">Needs a real price before anything can be shown to the customer.</p>
        <p style="margin:0 0 14px;"><strong>${escapeHtml(deviceLabel)}</strong> — ${escapeHtml(intent?.problem ?? "unknown problem")}</p>
        <p style="margin:0 0 14px;">${escapeHtml(intent?.city ? `${intent.city}, ` : "")}${escapeHtml(intent?.zip_code ?? "—")}</p>
        <p style="margin:0 0 20px;">Contact (${escapeHtml(contactMethod)}): <strong>${escapeHtml(trimmedContact)}</strong></p>
        <p style="margin:0;"><a href="https://www.cprnme.com/admin/quotes" style="display:inline-block; padding:10px 18px; background-color:#2e2f33; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">Review in /admin/quotes</a></p>
      `,
    }),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

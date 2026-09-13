import { NextResponse } from "next/server";
import { createBookingRequest } from "@/lib/bookings-data";
import { qualityTiers, getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";
import { getDeviceModel } from "@/content/device-catalog";
import { sendEmail, ADMIN_ALERT_EMAIL, formatMoney, escapeHtml } from "@/lib/email";

// Writes to bookings — a real visitor asking to reserve a preferred
// day/window for a fixed-price repair they've already seen the real price
// for. This does NOT confirm an appointment; it only records the request
// as status='requested'. See components/ProblemSelector.tsx for the one
// call site, and /admin/bookings for where a human turns this into an
// actual commitment.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_WINDOWS = new Set(["morning", "afternoon", "evening"]);
const VALID_TIERS = new Set<string>(qualityTiers.map((t) => t.id));

function isQualityTier(value: string): value is QualityTier {
  return VALID_TIERS.has(value);
}
const VALID_SERVICE_LEVELS = new Set(["standard", "priority", "urgent"]);

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

  const {
    intentEventId,
    repairType,
    qualityTier,
    serviceLevel,
    priceCents,
    contactMethod,
    contactValue,
    requestedDate,
    requestedWindow,
  } = body as Record<string, unknown>;

  if (typeof intentEventId !== "string" || intentEventId.length === 0) {
    return NextResponse.json({ error: "Missing intentEventId" }, { status: 400 });
  }
  if (typeof repairType !== "string" || repairType.length === 0) {
    return NextResponse.json({ error: "Missing repairType" }, { status: 400 });
  }
  if (typeof qualityTier !== "string" || !isQualityTier(qualityTier)) {
    return NextResponse.json({ error: "Invalid qualityTier" }, { status: 400 });
  }
  if (typeof serviceLevel !== "string" || !VALID_SERVICE_LEVELS.has(serviceLevel)) {
    return NextResponse.json({ error: "Invalid serviceLevel" }, { status: 400 });
  }
  if (typeof priceCents !== "number" || !Number.isFinite(priceCents) || priceCents <= 0) {
    return NextResponse.json({ error: "Invalid priceCents" }, { status: 400 });
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
  if (typeof requestedDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return NextResponse.json({ error: "Invalid requestedDate" }, { status: 400 });
  }
  // Must be today or later — a real calendar constraint, not a guess about
  // capacity (we still don't know capacity; this only rules out the past).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDate = new Date(`${requestedDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < today) {
    return NextResponse.json({ error: "Requested date must be today or later" }, { status: 400 });
  }
  if (typeof requestedWindow !== "string" || !VALID_WINDOWS.has(requestedWindow)) {
    return NextResponse.json({ error: "Invalid requestedWindow" }, { status: 400 });
  }

  const { data: booking, error } = await createBookingRequest({
    intentEventId,
    quoteId: null,
    repairType,
    qualityTier,
    serviceLevel,
    priceCents: Math.round(priceCents),
    contactMethod,
    contactValue: trimmedContact,
    requestedDate,
    requestedWindow: requestedWindow as "morning" | "afternoon" | "evening",
  });

  if (error || !booking) {
    // Postgres FK-violation code — the intentEventId doesn't correspond to
    // a real repair_intent_events row (tampered client, stale id, etc.).
    if (error?.code === "23503") {
      return NextResponse.json({ error: "Unknown request — please try again" }, { status: 400 });
    }
    console.error("Failed to record booking request:", error?.message);
    return NextResponse.json({ error: "Could not record your request" }, { status: 500 });
  }

  // Best-effort admin alert — awaited so it completes before this
  // serverless function returns (a fire-and-forget promise isn't
  // guaranteed to finish once the response is sent), but a failed send
  // never fails the request: the row is already saved and visible in
  // /admin/bookings regardless of whether this email goes out.
  const intent = booking.repair_intent_events;
  const deviceLabel = intent?.device_model ? getDeviceModel(intent.device_model)?.name ?? intent.device : intent?.device ?? "Unknown device";
  await sendEmail({
    to: ADMIN_ALERT_EMAIL,
    subject: `New booking request — ${deviceLabel}, ${intent?.problem ?? "unknown problem"}, ${intent?.zip_code ?? "—"}`,
    html: `
      <p><strong>New booking request</strong></p>
      <p>${escapeHtml(deviceLabel)} — ${escapeHtml(intent?.problem ?? "unknown problem")}</p>
      <p>${escapeHtml(intent?.city ? `${intent.city}, ` : "")}${escapeHtml(intent?.zip_code ?? "—")}</p>
      <p>${escapeHtml(getQualityTierLabel(qualityTier))} · ${escapeHtml(serviceLevel)} · <strong>${formatMoney(booking.price_cents)}</strong></p>
      <p>Requested: <strong>${escapeHtml(requestedDate)}</strong> (${escapeHtml(requestedWindow)})</p>
      <p>Contact (${escapeHtml(contactMethod)}): <strong>${escapeHtml(trimmedContact)}</strong></p>
      <p><a href="https://www.cprnme.com/admin/bookings">Review in /admin/bookings</a></p>
    `,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

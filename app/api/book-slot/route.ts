import { NextResponse } from "next/server";
import { claimBookingSlot } from "@/lib/bookings-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidTimeWindow, getTimeWindowLabel, MAX_ADVANCE_BOOKING_DAYS } from "@/content/time-windows";
import { isEligibleForRealTimeSlots } from "@/content/booking-radius";
import { qualityTiers, getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";
import { getDeviceModel, getDeviceFamilyLabel } from "@/content/device-catalog";
import { sendEmail, renderEmailShell, ADMIN_ALERT_EMAIL, formatMoney, escapeHtml } from "@/lib/email";

// Real-time, instant-confirm booking — the customer's ZIP must be within
// content/booking-radius.ts's real eligibility radius (re-checked here,
// server-side, never trusted from the client alone: the client only makes
// this step visible when eligible, but a request could be forged).
// Returns a real 'confirmed' row on success, or a SLOT_FULL error if a
// concurrent claim took the last spot first — see
// lib/bookings-data.ts's claimBookingSlot() for the atomic guarantee.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  const { intentEventId, repairType, qualityTier, serviceLevel, priceCents, contactMethod, contactValue, date, window } =
    body as Record<string, unknown>;

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
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_BOOKING_DAYS);
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < today || parsedDate > maxDate) {
    return NextResponse.json({ error: `Date must be within the next ${MAX_ADVANCE_BOOKING_DAYS} days` }, { status: 400 });
  }
  if (typeof window !== "string" || !isValidTimeWindow(window)) {
    return NextResponse.json({ error: "Invalid time window" }, { status: 400 });
  }

  // Server-side re-check of the real eligibility radius — the intent
  // event's own recorded ZIP is the source of truth here, not anything
  // the client claims in this request body.
  const supabase = getSupabaseAdmin();
  const { data: intent } = await supabase
    .from("repair_intent_events")
    .select("zip_code, city, device, device_model, problem")
    .eq("id", intentEventId)
    .single();
  if (!intent) {
    return NextResponse.json({ error: "Unknown request — please try again" }, { status: 400 });
  }
  if (!isEligibleForRealTimeSlots(intent.zip_code)) {
    return NextResponse.json({ error: "Real-time booking isn't available for this ZIP yet" }, { status: 400 });
  }

  const { data: booking, error } = await claimBookingSlot({
    intentEventId,
    repairType,
    qualityTier,
    serviceLevel,
    priceCents: Math.round(priceCents),
    contactMethod,
    contactValue: trimmedContact,
    date,
    window,
  });

  if (error || !booking) {
    if (error?.message?.includes("SLOT_FULL")) {
      return NextResponse.json({ error: "SLOT_FULL" }, { status: 409 });
    }
    if (error?.message?.includes("foreign key") || error?.code === "23503") {
      return NextResponse.json({ error: "Unknown request — please try again" }, { status: 400 });
    }
    console.error("Failed to claim booking slot:", error?.message);
    return NextResponse.json({ error: "Could not reserve that time — please try again" }, { status: 500 });
  }

  const deviceLabel = intent.device_model ? getDeviceModel(intent.device_model)?.name ?? getDeviceFamilyLabel(intent.device) : getDeviceFamilyLabel(intent.device);
  const windowLabel = getTimeWindowLabel(window);

  // Admin alert — informational only, since this booking is already real
  // and confirmed; nothing for the admin to decide, unlike the
  // admin-confirmed path's alerts.
  await sendEmail({
    to: ADMIN_ALERT_EMAIL,
    subject: `Instant booking confirmed — ${deviceLabel}, ${intent.problem}, ${intent.zip_code}`,
    html: renderEmailShell({
      preheader: `${deviceLabel} · ${intent.problem} · ${date} ${windowLabel}`,
      heading: "New instant booking (already confirmed)",
      showFulfillmentCredit: false,
      bodyHtml: `
        <p style="margin:0 0 14px;"><strong>${escapeHtml(deviceLabel)}</strong> — ${escapeHtml(intent.problem)}</p>
        <p style="margin:0 0 14px;">${escapeHtml(intent.city ? `${intent.city}, ` : "")}${escapeHtml(intent.zip_code)}</p>
        <p style="margin:0 0 14px;">${escapeHtml(getQualityTierLabel(qualityTier))} · ${escapeHtml(serviceLevel)} · <strong>${formatMoney(booking.price_cents)}</strong></p>
        <p style="margin:0 0 20px;">Confirmed: <strong>${escapeHtml(date)}</strong>, ${escapeHtml(windowLabel)}</p>
        <p style="margin:0;"><a href="https://www.cprnme.com/admin/bookings" style="display:inline-block; padding:10px 18px; background-color:#2e2f33; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">View in /admin/bookings</a></p>
      `,
    }),
  });

  // Real customer confirmation — this one IS truly confirmed, unlike the
  // admin-confirmed path's "we'll confirm shortly" email.
  if (contactMethod === "email") {
    await sendEmail({
      to: trimmedContact,
      subject: "Your CPRNME appointment is confirmed",
      html: renderEmailShell({
        preheader: `Confirmed for ${date}, ${windowLabel} · ${formatMoney(booking.price_cents)}`,
        heading: "Your appointment is confirmed",
        showFulfillmentCredit: true,
        bodyHtml: `
          <p style="margin:0 0 18px;">Your appointment is confirmed for:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; background-color:#f5f5f6; border-radius:8px; margin:0 0 18px;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 4px; font-size:17px; font-weight:700; color:#202124;">${escapeHtml(date)}</p>
              <p style="margin:0; font-size:14px; color:#55565a;">${escapeHtml(windowLabel)}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;">${escapeHtml(getQualityTierLabel(qualityTier))} · ${escapeHtml(serviceLevel)}</p>
          <p style="margin:0; font-size:20px; font-weight:700;">${formatMoney(booking.price_cents)}</p>
        `,
      }),
    });
  }

  return NextResponse.json({ ok: true, confirmedDate: date, confirmedWindow: windowLabel }, { status: 201 });
}

import { notFound } from "next/navigation";
import { getBookingByToken, describeBookingDevice } from "@/lib/bookings-data";
import { getCompletedBookingIds } from "@/lib/completed-repairs-data";
import { getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";
import { getTimeWindowLabel, MAX_ADVANCE_BOOKING_DAYS } from "@/content/time-windows";
import { pageMetadata } from "@/content/seo";
import { ManageBookingClient } from "@/components/ManageBookingClient";
import { cancelBookingAction } from "./actions";

export const dynamic = "force-dynamic";

// Never indexed — every URL here carries one customer's private booking
// token, and there are effectively unlimited such URLs (one per booking).
export const metadata = {
  ...pageMetadata({
    title: "Manage Your Appointment | CPRNME",
    description: "View, reschedule, or cancel your CPRNME repair appointment.",
    path: "/manage-booking",
  }),
  robots: { index: false, follow: false },
};

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatDay(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function ManageBookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Not validated as a UUID before the query — an invalid/garbage token
  // simply won't match any row, which getBookingByToken already handles
  // by returning null, falling through to the same 404 a real-but-unknown
  // token would produce. No information is leaked either way.
  const booking = await getBookingByToken(token);
  if (!booking) notFound();

  const completedIds = await getCompletedBookingIds();
  const isCompleted = completedIds.has(booking.id);
  const deviceLabel = describeBookingDevice(booking);
  const intent = booking.repair_intent_events;

  return (
    <section className="page-hero container" style={{ maxWidth: "560px" }}>
      <h1>Your appointment</h1>

      <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 20, marginTop: 20, textAlign: "left" }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>
          {deviceLabel} — {intent?.problem ?? "unknown problem"}
        </p>
        <p style={{ fontSize: 14, color: "var(--cp-ink-soft)", marginTop: 4 }}>
          {getQualityTierLabel(booking.quality_tier as QualityTier)} · {capitalize(booking.service_level)} ·{" "}
          <strong>${(booking.price_cents / 100).toFixed(2)}</strong>
        </p>

        {isCompleted && (
          <p style={{ marginTop: 14, fontWeight: 700, color: "var(--pass, #2f6f4f)" }}>✓ This repair has been completed.</p>
        )}

        {!isCompleted && booking.status === "cancelled" && (
          <p style={{ marginTop: 14, color: "var(--cp-error)" }}>This appointment has been cancelled.</p>
        )}

        {!isCompleted && booking.status === "no_show" && (
          <p style={{ marginTop: 14, color: "var(--cp-ink-soft)" }}>This appointment was marked as a no-show.</p>
        )}

        {!isCompleted && booking.status === "confirmed" && booking.confirmed_date && (
          <p style={{ marginTop: 14, fontSize: 15 }}>
            Confirmed for <strong>{formatDay(booking.confirmed_date)}</strong>,{" "}
            <strong>{getTimeWindowLabel(booking.confirmed_window ?? "")}</strong>.
          </p>
        )}

        {!isCompleted && booking.status === "requested" && (
          <p style={{ marginTop: 14, fontSize: 15, color: "var(--cp-ink-soft)" }}>
            Requested for {formatDay(booking.requested_date)} ({booking.requested_window}) — we&rsquo;ll
            confirm the exact time with you.
          </p>
        )}

        {!isCompleted && (booking.status === "requested" || booking.status === "confirmed") && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ManageBookingClient token={token} isConfirmed={booking.status === "confirmed"} maxAdvanceDays={MAX_ADVANCE_BOOKING_DAYS} />
            <form action={cancelBookingAction}>
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-tertiary">
                Cancel appointment
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

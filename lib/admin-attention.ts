// Real, deterministic "what needs my attention" queries — composed from
// the same data every other admin page already reads (lib/bookings-data.ts,
// lib/quotes-data.ts, lib/completed-repairs-data.ts), never a new source of
// truth. Every item here is a real exception state computed from real
// timestamps — nothing estimated, nothing from job_events' accumulating
// history (that's observational only, not a decision input; see
// lib/job-events.ts). This is the deterministic front door the
// architecture direction called for: admin deals with exceptions, the
// system surfaces them from what's actually true right now.
import { listBookings, describeBookingDevice } from "@/lib/bookings-data";
import { listQuotes, describeQuoteDevice } from "@/lib/quotes-data";
import { listCompletedRepairs, getCompletedBookingIds, getTotalRevenueCents } from "@/lib/completed-repairs-data";

export type AttentionItem = {
  severity: "high" | "medium" | "low";
  message: string;
  href: string;
};

const HOUR_MS = 60 * 60 * 1000;

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / HOUR_MS;
}

// The business operates in North Texas — "today" means the calendar day in
// America/Chicago, not UTC and not whatever timezone the server process
// happens to run in (Vercel's functions run in UTC). This matters for real
// hours every evening: Supabase/Postgres returns created_at/confirmed_at/
// completed_at as UTC timestamptz strings, so naively slicing the first 10
// characters gives the UTC calendar date — wrong by a full day for a
// Chicago-time event any time after 6-7pm local (when UTC has already
// rolled to the next date). Caught this via a real timezone-boundary test
// during verification, not a hypothetical.
const BUSINESS_TZ = "America/Chicago";
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

function toBusinessDateISO(date: Date): string {
  return dateFormatter.format(date); // en-CA formats as YYYY-MM-DD
}

function todayISO(): string {
  return toBusinessDateISO(new Date());
}

// Converts a UTC timestamptz string (created_at, confirmed_at,
// completed_at) to its America/Chicago calendar date — use this, never a
// raw .slice(0, 10), for any "did this happen today" comparison against a
// timestamptz column. confirmed_date/requested_date are plain `date`
// columns (a day the customer/admin picked directly, no time component,
// no UTC conversion involved) and compare correctly as plain strings —
// they don't need this conversion.
function timestamptzToBusinessDate(iso: string): string {
  return toBusinessDateISO(new Date(iso));
}

export async function getAttentionItems(): Promise<AttentionItem[]> {
  const [bookings, quotes, completedIds] = await Promise.all([listBookings(), listQuotes(), getCompletedBookingIds()]);
  const items: AttentionItem[] = [];
  const today = todayISO();

  for (const b of bookings) {
    const deviceLabel = describeBookingDevice(b);
    if (b.status === "requested") {
      const age = hoursSince(b.created_at);
      items.push({
        severity: age > 24 ? "high" : "medium",
        message: `${deviceLabel} booking requested ${Math.round(age)}h ago — still awaiting confirmation`,
        href: "/admin/bookings",
      });
    }
    if (b.status === "confirmed" && !b.assigned_technician_id && !completedIds.has(b.id)) {
      items.push({
        severity: "high",
        message: `${deviceLabel} is confirmed for ${b.confirmed_date ?? b.requested_date} but has no technician assigned`,
        href: "/admin/bookings",
      });
    }
    if (b.status === "confirmed" && b.confirmed_date && b.confirmed_date < today && !completedIds.has(b.id)) {
      items.push({
        severity: "high",
        message: `${deviceLabel} was confirmed for ${b.confirmed_date} (in the past) but was never marked completed`,
        href: "/admin/bookings",
      });
    }
    if (b.status === "confirmed" && b.technician_status === "done" && !completedIds.has(b.id)) {
      items.push({
        severity: "medium",
        message: `${deviceLabel} — technician marked the job done, but it still needs completion + revenue logged`,
        href: "/admin/bookings",
      });
    }
  }

  for (const q of quotes) {
    const deviceLabel = describeQuoteDevice(q);
    if (q.status === "pending") {
      const age = hoursSince(q.created_at);
      items.push({
        severity: age > 12 ? "high" : "medium",
        message: `${deviceLabel} quote request needs a price (waiting ${Math.round(age)}h)`,
        href: "/admin/quotes",
      });
    }
    if (q.status === "quoted" && q.quoted_at) {
      const age = hoursSince(q.quoted_at);
      if (age > 48) {
        items.push({
          severity: "low",
          message: `${deviceLabel} was quoted ${Math.round(age)}h ago with no response yet`,
          href: "/admin/quotes",
        });
      }
    }
  }

  const order = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

export type TodaySummary = {
  requestedToday: number;
  confirmedToday: number;
  completedToday: number;
  revenueTodayCents: number;
  pendingQuotes: number;
  awaitingConfirmation: number;
};

export async function getTodaySummary(): Promise<TodaySummary> {
  const [bookings, quotes, completedRepairs] = await Promise.all([listBookings(), listQuotes(), listCompletedRepairs()]);
  const today = todayISO();

  const requestedToday = bookings.filter((b) => timestamptzToBusinessDate(b.created_at) === today).length;
  const confirmedToday = bookings.filter((b) => b.confirmed_at && timestamptzToBusinessDate(b.confirmed_at) === today).length;
  const completedToday = completedRepairs.filter((r) => timestamptzToBusinessDate(r.completed_at) === today);
  const pendingQuotes = quotes.filter((q) => q.status === "pending").length;
  const awaitingConfirmation = bookings.filter((b) => b.status === "requested").length;

  return {
    requestedToday,
    confirmedToday,
    completedToday: completedToday.length,
    revenueTodayCents: getTotalRevenueCents(completedToday),
    pendingQuotes,
    awaitingConfirmation,
  };
}

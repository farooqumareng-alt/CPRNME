import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { listBookings, describeBookingDevice, type BookingRow, type BookingWindow } from "@/lib/bookings-data";
import { getCompletedBookingIds } from "@/lib/completed-repairs-data";
import { listTechnicians, type TechnicianRow } from "@/lib/technicians-data";
import { getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";
import { TIME_WINDOWS, getTimeWindowLabel } from "@/content/time-windows";
import { confirmBookingAction, setBookingStatusAction, markBookingCompletedAction, assignTechnicianAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_ORDER: Record<BookingRow["status"], number> = {
  requested: 0,
  confirmed: 1,
  rescheduled: 2,
  no_show: 3,
  cancelled: 4,
};

const TECHNICIAN_STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  en_route: "En route",
  in_progress: "In progress",
  done: "Done",
};

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

// Parsed as local midnight, matching the date <input> the customer filled
// in — see components/ProblemSelector.tsx's todayISO() comment.
function formatDay(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function AdminBookingsPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/bookings");

  const [bookings, completedIds, technicians] = await Promise.all([listBookings(), getCompletedBookingIds(), listTechnicians()]);
  const sorted = [...bookings].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.requested_date.localeCompare(b.requested_date);
  });
  const requestedCount = bookings.filter((b) => b.status === "requested").length;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Admin
        </span>
        <nav style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
          <a href="/admin">Today</a>
          <a href="/admin/demand">Demand</a>
          <a href="/admin/pricing">Pricing</a>
          <a href="/admin/quotes">Quotes</a>
          <a href="/admin/revenue">Revenue</a>
          <a href="/admin/technicians">Technicians</a>
          <a href="/admin/taxonomy">Taxonomy</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Booking requests</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        A real visitor picked a preferred day and time for a fixed-price repair. Nothing here is
        confirmed until you confirm it below.{" "}
        {requestedCount > 0 ? `${requestedCount} awaiting confirmation.` : "Nothing waiting on you right now."}
      </p>

      {sorted.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No booking requests yet.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            This appears the moment a real visitor picks a preferred time after seeing a fixed
            price — nothing here is seeded or simulated.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          {sorted.map((b) => (
            <BookingCard key={b.id} booking={b} isCompleted={completedIds.has(b.id)} technicians={technicians} />
          ))}
        </div>
      )}
    </main>
  );
}

function BookingCard({ booking, isCompleted, technicians }: { booking: BookingRow; isCompleted: boolean; technicians: TechnicianRow[] }) {
  const intent = booking.repair_intent_events;
  const deviceLabel = describeBookingDevice(booking);

  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>
            {deviceLabel} — {intent?.problem ?? "unknown problem"}
          </p>
          <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 2 }}>
            {intent?.city ? `${intent.city}, ` : ""}
            {intent?.zip_code ?? "—"} · requested {formatDate(booking.created_at)}
          </p>
        </div>
        <StatusPill status={booking.status} />
      </div>

      <p style={{ fontSize: 14, marginTop: 10 }}>
        {getQualityTierLabel(booking.quality_tier as QualityTier)} · {capitalize(booking.service_level)} ·{" "}
        <strong>${(booking.price_cents / 100).toFixed(2)}</strong>
      </p>
      <p style={{ fontSize: 14, marginTop: 4 }}>
        Contact ({booking.contact_method}): <strong>{booking.contact_value}</strong>
      </p>
      {booking.address && (
        <p style={{ fontSize: 14, marginTop: 4 }}>
          Address: <strong>{booking.address}</strong>
        </p>
      )}
      <p style={{ fontSize: 14, marginTop: 4, color: "var(--cp-ink-soft)" }}>
        Requested: <strong style={{ color: "var(--cp-ink)" }}>{formatDay(booking.requested_date)}</strong>{" "}
        ({booking.requested_window})
      </p>

      {booking.status === "confirmed" && booking.confirmed_date && (
        <p style={{ fontSize: 14, marginTop: 4, color: "var(--pass, #2f6f4f)" }}>
          Confirmed: <strong>{formatDay(booking.confirmed_date)}</strong> ({getTimeWindowLabel(booking.confirmed_window ?? "")})
        </p>
      )}
      {booking.admin_note && (
        <p style={{ fontSize: 13, marginTop: 4, color: "var(--cp-ink-soft)" }}>Note: {booking.admin_note}</p>
      )}

      {booking.status === "confirmed" && !isCompleted && (
        <form action={assignTechnicianAction} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <input type="hidden" name="bookingId" value={booking.id} />
          <label style={{ fontSize: 13, color: "var(--cp-ink-soft)" }}>Technician:</label>
          <select
            name="technicianId"
            defaultValue={booking.assigned_technician_id ?? ""}
            style={{ padding: "5px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 13 }}
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.user_id} value={t.user_id}>
                {t.name}
                {t.active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            Save
          </button>
          {booking.technician_status && (
            <span style={{ fontSize: 12.5, color: "var(--cp-ink-soft)" }}>
              Status: <strong style={{ color: "var(--cp-ink)" }}>{TECHNICIAN_STATUS_LABELS[booking.technician_status] ?? booking.technician_status}</strong>
            </span>
          )}
        </form>
      )}

      {isCompleted && (
        <p style={{ fontSize: 14, marginTop: 8, fontWeight: 700, color: "var(--pass, #2f6f4f)" }}>✓ Repair completed</p>
      )}

      {booking.status === "confirmed" && !isCompleted && (
        <form action={markBookingCompletedAction} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, padding: 12, background: "var(--cp-accent-soft)", borderRadius: 8 }}>
          <input type="hidden" name="id" value={booking.id} />
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Amount collected ($)
            <input
              name="revenue"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(booking.price_cents / 100).toFixed(2)}
              required
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 110 }}
            />
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Completed date
            <input
              name="completedDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}
            />
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
            Notes (internal only)
            <input name="notes" style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }} />
          </label>
          <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
            Mark completed
          </button>
        </form>
      )}

      {booking.status === "requested" && (
        <form action={confirmBookingAction} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}>
          <input type="hidden" name="id" value={booking.id} />
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Confirm date
            <input
              name="confirmedDate"
              type="date"
              defaultValue={booking.requested_date}
              required
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}
            />
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Window
            {/* Precise 2-hour windows, same vocabulary the real-time path
                uses — so an admin-confirmed booking counts against the
                same shared capacity pool instead of a separate coarse
                bucket. The customer only ever picked a rough preference
                (shown above as "Requested: ... (morning/afternoon/
                evening)"); this is the admin choosing the actual real
                slot. */}
            <select
              name="confirmedWindow"
              defaultValue=""
              required
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}
            >
              <option value="" disabled>
                Pick a time…
              </option>
              {TIME_WINDOWS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
            Note (internal only)
            <input name="note" style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }} />
          </label>
          <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
            Confirm
          </button>
        </form>
      )}

      {!isCompleted && (booking.status === "requested" || booking.status === "confirmed") && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <StatusButton id={booking.id} status="cancelled" label="Cancel" />
          {booking.status === "confirmed" && <StatusButton id={booking.id} status="no_show" label="Mark no-show" />}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: BookingRow["status"] }) {
  const colors: Record<BookingRow["status"], string> = {
    requested: "var(--gap, #8a5a15)",
    confirmed: "var(--pass, #2f6f4f)",
    rescheduled: "var(--cp-accent-ink)",
    cancelled: "var(--cp-error)",
    no_show: "var(--cp-ink-faint)",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 999,
        background: "var(--cp-accent-soft)",
        color: colors[status],
        whiteSpace: "nowrap",
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setBookingStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
        {label}
      </button>
    </form>
  );
}

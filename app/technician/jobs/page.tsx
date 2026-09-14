import { redirect } from "next/navigation";
import { requireTechnicianSession } from "@/lib/supabase-session";
import { listBookingsForTechnician, describeBookingDevice, type BookingRow } from "@/lib/bookings-data";
import { getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";
import { getTimeWindowLabel } from "@/content/time-windows";
import { updateJobStatusAction } from "./actions";

export const dynamic = "force-dynamic";

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Parsed as local midnight, matching the date <input> the customer/admin
// picked — see components/ProblemSelector.tsx's todayISO() comment.
function formatDay(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  en_route: "En route",
  in_progress: "In progress",
  done: "Done",
};

export default async function TechnicianJobsPage() {
  const technician = await requireTechnicianSession();
  if (!technician) redirect("/admin/login?redirect=/technician/jobs");

  const jobs = await listBookingsForTechnician(technician.user_id);
  // Done jobs sink to the bottom of today's list rather than disappearing —
  // a technician often wants to glance back at what they just finished.
  const sorted = [...jobs].sort((a, b) => {
    const aDone = a.technician_status === "done" ? 1 : 0;
    const bDone = b.technician_status === "done" ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (a.confirmed_date ?? "").localeCompare(b.confirmed_date ?? "");
  });

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Technician
        </span>
        <form action="/admin/logout" method="POST">
          <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
            Log out
          </button>
        </form>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Hi, {technician.name}</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4 }}>
        Only jobs assigned to you appear here — {jobs.length} confirmed {jobs.length === 1 ? "job" : "jobs"}.
      </p>

      {sorted.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No jobs assigned yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          {sorted.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}

function JobCard({ job }: { job: BookingRow }) {
  const intent = job.repair_intent_events;
  const deviceLabel = describeBookingDevice(job);
  const status = job.technician_status ?? "assigned";

  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16, opacity: status === "done" ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 15 }}>
          {deviceLabel} — {intent?.problem ?? "unknown problem"}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 999,
            background: "var(--cp-accent-soft)",
            color: status === "done" ? "var(--pass, #2f6f4f)" : "var(--cp-ink)",
          }}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      {job.confirmed_date && (
        <p style={{ fontSize: 14, marginTop: 8, fontWeight: 600 }}>
          {formatDay(job.confirmed_date)} · {getTimeWindowLabel(job.confirmed_window ?? "")}
        </p>
      )}
      <p style={{ fontSize: 14, marginTop: 4, color: "var(--cp-ink-soft)" }}>
        {getQualityTierLabel(job.quality_tier as QualityTier)} · {capitalize(job.service_level)}
      </p>

      {job.address && (
        <p style={{ fontSize: 14, marginTop: 8 }}>
          <strong>Address:</strong> {job.address}
        </p>
      )}
      <p style={{ fontSize: 14, marginTop: 4 }}>
        <strong>Contact ({job.contact_method}):</strong>{" "}
        {job.contact_method === "phone" ? <a href={`tel:${job.contact_value}`}>{job.contact_value}</a> : <a href={`mailto:${job.contact_value}`}>{job.contact_value}</a>}
      </p>

      {status !== "done" && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {status !== "en_route" && (
            <StatusButton bookingId={job.id} status="en_route" label="Mark en route" />
          )}
          {status !== "in_progress" && (
            <StatusButton bookingId={job.id} status="in_progress" label="Mark in progress" />
          )}
          <StatusButton bookingId={job.id} status="done" label="Mark done" primary />
        </div>
      )}
    </div>
  );
}

function StatusButton({ bookingId, status, label, primary }: { bookingId: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={updateJobStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={primary ? "btn btn-primary" : "btn btn-secondary"} style={{ fontSize: 12, padding: "6px 12px" }}>
        {label}
      </button>
    </form>
  );
}

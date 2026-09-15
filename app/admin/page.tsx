import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { getAttentionItems, getTodaySummary } from "@/lib/admin-attention";

export const dynamic = "force-dynamic";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const SEVERITY_COLOR: Record<string, string> = {
  high: "var(--cp-error)",
  medium: "var(--gap, #8a5a15)",
  low: "var(--cp-ink-soft)",
};
const SEVERITY_DOT: Record<string, string> = { high: "🔴", medium: "🟠", low: "🟡" };

export default async function AdminTodayPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin");

  const [items, summary] = await Promise.all([getAttentionItems(), getTodaySummary()]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Admin
        </span>
        <nav style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
          <a href="/admin/demand">Demand</a>
          <a href="/admin/pricing">Pricing</a>
          <a href="/admin/quotes">Quotes</a>
          <a href="/admin/bookings">Bookings</a>
          <a href="/admin/revenue">Revenue</a>
          <a href="/admin/technicians">Technicians</a>
          <a href="/admin/taxonomy">Taxonomy</a>
          <a href="/admin/payments">Payments</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Today</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        Everything below is computed from real, current data — nothing estimated, nothing from
        accumulated history. This is what actually needs a decision right now.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 24 }}>
        <SummaryTile label="Requested today" value={String(summary.requestedToday)} />
        <SummaryTile label="Confirmed today" value={String(summary.confirmedToday)} />
        <SummaryTile label="Completed today" value={String(summary.completedToday)} />
        <SummaryTile label="Revenue today" value={formatMoney(summary.revenueTodayCents)} />
        <SummaryTile label="Awaiting confirmation" value={String(summary.awaitingConfirmation)} />
        <SummaryTile label="Quotes needing a price" value={String(summary.pendingQuotes)} />
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 32 }}>Needs attention</h2>
      {items.length === 0 ? (
        <div style={{ marginTop: 16, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>Nothing needs attention right now.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            No unconfirmed requests, no unassigned confirmed jobs, nothing overdue.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {items.map((item, i) => (
            <a
              key={i}
              href={item.href}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                border: "1.5px solid var(--cp-line)",
                borderLeft: `4px solid ${SEVERITY_COLOR[item.severity]}`,
                borderRadius: 8,
                padding: "12px 14px",
                textDecoration: "none",
                color: "var(--cp-ink)",
              }}
            >
              <span aria-hidden="true">{SEVERITY_DOT[item.severity]}</span>
              <span style={{ fontSize: 14, color: "var(--cp-ink)" }}>{item.message}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: "14px 16px" }}>
      <p style={{ fontSize: 12, color: "var(--cp-ink-soft)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</p>
    </div>
  );
}

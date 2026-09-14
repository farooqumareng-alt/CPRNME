import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDeviceModel } from "@/content/device-catalog";

export const dynamic = "force-dynamic";

type IntentRow = {
  created_at: string;
  zip_code: string;
  city: string | null;
  device: string;
  device_model: string | null;
  problem: string;
  source_page: string;
};

function countBy<T extends string>(rows: IntentRow[], key: (r: IntentRow) => T) {
  const counts = new Map<T, number>();
  for (const row of rows) {
    const k = key(row);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function withinDays(rows: IntentRow[], days: number, now: number) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return rows.filter((r) => new Date(r.created_at).getTime() >= cutoff).length;
}

export default async function DemandDashboardPage() {
  // Defense in depth — middleware.ts already blocks unauthenticated access
  // to /admin/*, but this page never trusts that alone.
  const user = await requireAdminSession();
  if (!user) {
    redirect("/admin/login?redirect=/admin/demand");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("repair_intent_events")
    .select("created_at, zip_code, city, device, device_model, problem, source_page")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return (
      <main style={{ maxWidth: 720, margin: "60px auto", padding: "0 16px" }}>
        <h1>Demand dashboard</h1>
        <p style={{ color: "var(--cp-error)" }}>Could not load demand data: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as IntentRow[];
  const now = Date.now();

  if (rows.length === 0) {
    return (
      <main style={{ maxWidth: 720, margin: "60px auto", padding: "0 16px" }}>
        <AdminHeader />
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 24 }}>Repair-intent demand</h1>
        <div
          style={{
            marginTop: 24,
            padding: 24,
            border: "1.5px dashed var(--cp-line-strong)",
            borderRadius: 12,
            color: "var(--cp-ink-soft)",
          }}
        >
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No repair-intent data yet.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            This dashboard reads directly from the <code>repair_intent_events</code> table.
            A row is created only when a real visitor selects a device, a problem, enters a
            valid ZIP code, and clicks Continue on the homepage selector. No demo, seeded, or
            placeholder data is ever shown here.
          </p>
        </div>
      </main>
    );
  }

  const byZip = countBy(rows, (r) => r.zip_code);
  const byCity = countBy(rows, (r) => r.city ?? "Unresolved / outside known DFW ZIPs");
  const byDevice = countBy(rows, (r) => r.device);
  const byModel = countBy(rows, (r) => (r.device_model ? getDeviceModel(r.device_model)?.name ?? r.device_model : "Exact model not provided"));
  const byProblem = countBy(rows, (r) => r.problem);
  const bySourcePage = countBy(rows, (r) => r.source_page);
  const first = rows[rows.length - 1]?.created_at;
  const mostRecent = rows[0]?.created_at;

  return (
    <main style={{ maxWidth: 960, margin: "48px auto", padding: "0 16px 80px" }}>
      <AdminHeader />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 24 }}>Repair-intent demand</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 14, marginTop: 4 }}>
        REAL, unfabricated repair-intent events only. This is demand signal, not bookings,
        completed repairs, customers, or revenue — none of those exist in CPRNME yet.
        {rows.length === 5000 && " Showing the most recent 5,000 events."}
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 28 }}>
        <StatTile label="Total repair-intent events" value={rows.length} />
        <StatTile label="Last 30 days" value={withinDays(rows, 30, now)} />
        <StatTile label="Last 90 days" value={withinDays(rows, 90, now)} />
        <StatTile label="Last 180 days" value={withinDays(rows, 180, now)} />
      </section>

      <p style={{ fontSize: 13, color: "var(--cp-ink-faint)", marginTop: 16 }}>
        First recorded: {formatDate(first)} · Most recent: {formatDate(mostRecent)}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 32 }}>
        <BreakdownTable title="Demand by ZIP code" rows={byZip} />
        <BreakdownTable title="Demand by city / community" rows={byCity} />
        <BreakdownTable title="Demand by device" rows={byDevice} />
        <BreakdownTable title="Demand by exact model" rows={byModel} />
        <BreakdownTable title="Demand by problem" rows={byProblem} />
        <BreakdownTable title="Originating page" rows={bySourcePage} />
      </div>
    </main>
  );
}

function AdminHeader() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
        CPRNME Admin
      </span>
      <nav style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
        <a href="/admin">Today</a>
        <a href="/admin/quotes">Quotes</a>
        <a href="/admin/bookings">Bookings</a>
        <a href="/admin/pricing">Pricing</a>
        <a href="/admin/revenue">Revenue</a>
        <a href="/admin/technicians">Technicians</a>
        <form action="/admin/logout" method="POST">
          <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
            Log out
          </button>
        </form>
      </nav>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--cp-ink-soft)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function BreakdownTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div>
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <tbody>
          {rows.slice(0, 15).map(([key, count]) => (
            <tr key={key} style={{ borderTop: "1px solid var(--cp-line)" }}>
              <td style={{ padding: "6px 0", color: "var(--cp-ink)" }}>{key}</td>
              <td style={{ padding: "6px 0", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

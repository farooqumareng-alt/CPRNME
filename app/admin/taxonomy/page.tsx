import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import {
  listDevicesFromDB,
  listProblemsWithCandidates,
  listRepairClassesFromDB,
  getPendingDeviceRegenerationCount,
} from "@/lib/knowledge-graph-data";
import { addDeviceAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTaxonomyPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/taxonomy");

  const [devices, problems, repairClasses, pendingCount] = await Promise.all([
    listDevicesFromDB(),
    listProblemsWithCandidates(),
    listRepairClassesFromDB(),
    getPendingDeviceRegenerationCount(),
  ]);

  const devicesBySeries = new Map<string, typeof devices>();
  for (const d of devices) {
    const key = `${d.family} · ${d.series}`;
    if (!devicesBySeries.has(key)) devicesBySeries.set(key, []);
    devicesBySeries.get(key)!.push(d);
  }

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
          <a href="/admin/bookings">Bookings</a>
          <a href="/admin/revenue">Revenue</a>
          <a href="/admin/technicians">Technicians</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Knowledge graph</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        The real device/repair taxonomy every static page and the pricing engine read from.
      </p>

      <div style={{ marginTop: 16, padding: "12px 16px", background: pendingCount > 0 ? "var(--cp-accent-soft)" : "transparent", border: "1.5px solid var(--cp-line)", borderRadius: 8 }}>
        <p style={{ fontSize: 13.5 }}>
          <strong>Important:</strong> adding a device below updates the real database immediately, but it
          won&rsquo;t appear on the live site by itself. A developer needs to run{" "}
          <code>npx tsx scripts/regenerate-taxonomy.mjs</code> and deploy before it&rsquo;s visible to
          customers.
        </p>
        {pendingCount > 0 && (
          <p style={{ fontSize: 13.5, marginTop: 6, fontWeight: 700 }}>
            {pendingCount} device{pendingCount === 1 ? "" : "s"} added but not yet live.
          </p>
        )}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 32 }}>Add a device</h2>
      <form
        action={addDeviceAction}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, padding: 16, border: "1.5px solid var(--cp-line)", borderRadius: 10 }}
      >
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Id (slug)
          <input name="id" placeholder="iphone-20-pro" required pattern="[a-z0-9-]+" style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 160 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Family
          <select name="family" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}>
            <option value="iphone">iPhone</option>
            <option value="android">Android</option>
            <option value="tablet">Tablet</option>
          </select>
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Manufacturer
          <input name="manufacturer" placeholder="Apple" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 130 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Series
          <input name="series" placeholder="iPhone 20" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 130 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
          Full name (shown to customers)
          <input name="name" placeholder="iPhone 20 Pro" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="isFoldable" /> Foldable
        </label>
        <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
          Add device
        </button>
      </form>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 32 }}>Devices ({devices.length})</h2>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
        {[...devicesBySeries.entries()].map(([key, models]) => (
          <div key={key}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-ink-soft)", textTransform: "uppercase", letterSpacing: "0.02em" }}>{key}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {models.map((m) => (
                <span key={m.id} style={{ fontSize: 12.5, padding: "3px 10px", background: "var(--cp-accent-soft)", borderRadius: 999 }}>
                  {m.name}
                  {m.is_foldable ? " 🦋" : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 32 }}>Problem → repair type map</h2>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13, marginTop: 4 }}>
        Read-only — this is what the pricing engine and eligibility data are keyed against; editing it
        risks changing what a real customer gets priced or diagnosed without realizing the downstream
        effect.
      </p>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {problems.map((p) => (
          <div key={p.id} style={{ border: "1.5px solid var(--cp-line)", borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>
              {p.label} {p.always_diagnostic && <span style={{ fontWeight: 400, color: "var(--cp-ink-faint)", fontSize: 12.5 }}>— always diagnostic</span>}
            </p>
            <p style={{ fontSize: 13, marginTop: 4, color: "var(--cp-ink-soft)" }}>
              Ordinary: {p.ordinaryCandidates.map((c) => c.label).join(", ")}
            </p>
            <p style={{ fontSize: 13, marginTop: 2, color: "var(--cp-ink-soft)" }}>
              Foldable: {p.foldableCandidates.map((c) => c.label).join(", ")}
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 32 }}>Repair classes</h2>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {repairClasses.map((rc) => (
          <p key={rc.id} style={{ fontSize: 13.5 }}>
            <strong>{rc.id}</strong> — {rc.label}: <span style={{ color: "var(--cp-ink-soft)" }}>{rc.examples.join("; ")}</span>
          </p>
        ))}
      </div>
    </main>
  );
}

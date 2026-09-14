import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { listEligibility, getActiveCustomerPriceOptions } from "@/lib/pricing-data";
import { getDeviceModel, deviceCatalog } from "@/content/device-catalog";
import { problems, type RepairType } from "@/content/repair-taxonomy";
import { repairClasses } from "@/content/repair-classes";
import { getQualityTierLabel } from "@/content/quality-tiers";

export const dynamic = "force-dynamic";

// Every repair_type this taxonomy knows about, for the "start a new
// combination" picker — independent of which ones are currently reachable
// from the 7 customer-facing problems, since an admin may want to get
// ahead on eligibility/pricing for a repair type before it's exposed.
const REPAIR_TYPES: RepairType[] = [
  "display_assembly_replacement",
  "battery_replacement",
  "charging_port_replacement",
  "camera_module_replacement",
  "back_glass_replacement",
  "speaker_replacement",
  "diagnostic_hardware_failure",
  "liquid_damage_diagnostic",
  "hinge_repair",
  "inner_display_replacement",
  "outer_display_replacement",
];

export default async function PricingAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/pricing");

  const { q } = await searchParams;
  const rows = await listEligibility(q);
  const activeOptions = await Promise.all(
    rows.map((r) => getActiveCustomerPriceOptions(r.model_id, r.repair_type as RepairType))
  );

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Admin
        </span>
        <nav style={{ display: "flex", gap: 14, fontSize: 13 }}>
          <a href="/admin">Today</a>
          <a href="/admin/demand">Demand</a>
          <a href="/admin/quotes">Quotes</a>
          <a href="/admin/bookings">Bookings</a>
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

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Pricing engine</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        No price shown to a customer skips this machinery. Every fixed price requires an exact model, an
        explicit eligibility decision, and an approved, active pricing record — nothing here is inferred.
      </p>

      <form method="GET" style={{ marginTop: 20 }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by model or repair type…"
          style={{ padding: "8px 12px", border: "1.5px solid var(--cp-line)", borderRadius: 8, fontSize: 14, width: "100%", maxWidth: 360 }}
        />
      </form>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>In progress</h2>
        {rows.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--cp-ink-faint)" }}>
            No model + repair combination has an eligibility record yet — start one below.
          </p>
        ) : (
          <table style={{ width: "100%", fontSize: 13.5, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--cp-ink-faint)", fontSize: 11.5, textTransform: "uppercase" }}>
                <th style={{ padding: "6px" }}>Model</th>
                <th>Repair</th>
                <th>Class</th>
                <th>Eligible</th>
                <th>Active, sellable tiers</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const model = getDeviceModel(r.model_id);
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--cp-line)" }}>
                    <td style={{ padding: "6px" }}>{model?.name ?? r.model_id}</td>
                    <td>{r.repair_type.replace(/_/g, " ")}</td>
                    <td>{r.repair_class ?? "—"}</td>
                    <td>{r.eligible ? "Yes" : "No"}</td>
                    <td>
                      {activeOptions[i].length === 0
                        ? "—"
                        : activeOptions[i]
                            .map((o) => `${getQualityTierLabel(o.qualityTier)}: $${(o.priceCents / 100).toFixed(2)}`)
                            .join(", ")}
                    </td>
                    <td>
                      <a href={`/admin/pricing/manage?model=${r.model_id}&repairType=${r.repair_type}`} className="link-button">
                        Manage
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 32, border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Start a new model + repair combination</h2>
        <form method="GET" action="/admin/pricing/manage" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Model
            <select name="model" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, minWidth: 220 }}>
              <option value="">Select a model…</option>
              {deviceCatalog.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.manufacturer} {m.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Repair type
            <select name="repairType" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, minWidth: 220 }}>
              <option value="">Select a repair type…</option>
              {REPAIR_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">
            Open
          </button>
        </form>
        <p style={{ fontSize: 12, color: "var(--cp-ink-faint)", marginTop: 10 }}>
          Customer-facing problems today: {problems.map((p) => p.label).join(" · ")}. Repair classes:{" "}
          {repairClasses.map((c) => `${c.id} (${c.label})`).join(", ")}.
        </p>
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import {
  getEligibility,
  getMarketObservations,
  getMarketStats,
  getPricingHistory,
} from "@/lib/pricing-data";
import { getDeviceModel } from "@/content/device-catalog";
import { repairClasses } from "@/content/repair-classes";
import {
  saveEligibilityAction,
  addMarketObservationAction,
  activatePricingRecordAction,
  setStatusAction,
} from "../actions";
import { PricingCalculatorForm } from "../PricingCalculatorForm";

export const dynamic = "force-dynamic";

export default async function ManagePricingPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; repairType?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/pricing");

  const { model: modelId, repairType } = await searchParams;
  if (!modelId || !repairType) {
    redirect("/admin/pricing");
  }

  const device = getDeviceModel(modelId);
  const [eligibility, observations, market, history] = await Promise.all([
    getEligibility(modelId, repairType),
    getMarketObservations(modelId, repairType),
    getMarketStats(modelId, repairType),
    getPricingHistory(modelId, repairType),
  ]);

  const activeRecord = history.find((r) => r.status === "active") ?? null;
  const draftRecord = history.find((r) => r.status !== "active" && r.status !== "retired") ?? null;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <a href="/admin/pricing" style={{ fontSize: 13, color: "var(--cp-ink-soft)" }}>
        &larr; All pricing
      </a>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
        {device?.name ?? modelId} &middot; {repairType.replace(/_/g, " ")}
      </h1>
      {!device && (
        <p style={{ color: "var(--cp-error)", fontSize: 13.5 }}>
          Warning: &quot;{modelId}&quot; is not in the current device catalog. Verify the model id before proceeding.
        </p>
      )}

      <section style={{ marginTop: 28, border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Eligibility</h2>
        <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginBottom: 10 }}>
          Eligible means CPRNME can confidently identify this exact repair for this exact model without
          hands-on diagnosis — it does not mean a price exists, and it does not mean the device can&apos;t be
          repaired otherwise.
        </p>
        <form action={saveEligibilityAction} style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <input type="hidden" name="modelId" value={modelId} />
          <input type="hidden" name="repairType" value={repairType} />
          <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" name="eligible" defaultChecked={eligibility?.eligible ?? false} />
            Eligible for fixed pricing
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Repair class
            <select name="repairClass" defaultValue={eligibility?.repair_class ?? ""} style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}>
              <option value="">Not assigned</option>
              {repairClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
            Notes
            <input name="notes" defaultValue={eligibility?.notes ?? ""} style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }} />
          </label>
          <button type="submit" className="btn btn-secondary">
            Save eligibility
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24, border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Market research (anchor, not CPRNME&apos;s price)</h2>
        {observations.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--cp-ink-faint)" }}>No observations recorded yet.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", marginBottom: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--cp-ink-faint)", fontSize: 11.5, textTransform: "uppercase" }}>
                <th style={{ padding: "4px 6px" }}>Competitor</th>
                <th>Price</th>
                <th>Quality</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--cp-line)" }}>
                  <td style={{ padding: "4px 6px" }}>{o.competitor}</td>
                  <td>${(o.advertised_price_cents / 100).toFixed(2)}</td>
                  <td>{o.part_quality ?? "—"}</td>
                  <td>{o.service_method ?? "—"}</td>
                  <td>{o.observed_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={addMarketObservationAction} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <input type="hidden" name="modelId" value={modelId} />
          <input type="hidden" name="repairType" value={repairType} />
          <input name="competitor" placeholder="Competitor name" required style={inputStyle} />
          <input name="location" placeholder="Location" style={inputStyle} />
          <input name="advertisedPrice" type="number" step="0.01" placeholder="Advertised price ($)" required style={inputStyle} />
          <input name="partQuality" placeholder="Part quality" style={inputStyle} />
          <input name="warranty" placeholder="Warranty" style={inputStyle} />
          <select name="serviceMethod" defaultValue="" style={inputStyle}>
            <option value="">Method (mobile/storefront)</option>
            <option value="mobile">Mobile</option>
            <option value="storefront">Storefront</option>
          </select>
          <input name="diagnosticFee" type="number" step="0.01" placeholder="Diagnostic fee ($)" style={inputStyle} />
          <input name="sourceUrl" placeholder="Source URL" style={inputStyle} />
          <input name="observedDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} style={inputStyle} />
          <button type="submit" className="btn btn-secondary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
            Add observation
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Economics &amp; price decision</h2>
        <PricingCalculatorForm
          modelId={modelId}
          repairType={repairType}
          existing={draftRecord ?? activeRecord}
          market={market}
          defaultRepairClass={eligibility?.repair_class ?? null}
        />
      </section>

      <section style={{ marginTop: 24, border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Price history &amp; status</h2>
        {history.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--cp-ink-faint)" }}>No pricing records saved yet — save a draft above first.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--cp-ink-faint)", fontSize: 11.5, textTransform: "uppercase" }}>
                <th style={{ padding: "4px 6px" }}>Status</th>
                <th>Approved price</th>
                <th>Outcome</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--cp-line)" }}>
                  <td style={{ padding: "6px" }}>
                    <StatusPill status={r.status} />
                  </td>
                  <td>{r.approved_customer_price_cents !== null ? `$${(r.approved_customer_price_cents / 100).toFixed(2)}` : "—"}</td>
                  <td>{r.outcome ?? "—"}</td>
                  <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {r.status !== "active" && r.status !== "retired" && (
                      <>
                        <StatusButton id={r.id} status="business_review" label="Send to review" />
                        <StatusButton id={r.id} status="approved" label="Mark approved" />
                        {r.status === "approved" && r.approved_customer_price_cents !== null && (
                          <form action={activatePricingRecordAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: "4px 10px" }}>
                              Activate
                            </button>
                          </form>
                        )}
                      </>
                    )}
                    {r.status === "active" && (
                      <StatusButton id={r.id} status="paused" label="Pause" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p style={{ fontSize: 12, color: "var(--cp-ink-faint)", marginTop: 20 }}>
        Only a record with status &quot;active&quot; and an approved customer price is ever read by the
        customer-facing resolution engine. Everything above it is an internal workflow.
      </p>
    </main>
  );
}

const inputStyle = { padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 13 };

function StatusPill({ status }: { status: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--cp-accent-soft)" }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }}>
        {label}
      </button>
    </form>
  );
}

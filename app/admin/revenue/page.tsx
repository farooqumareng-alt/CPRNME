import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { listCompletedRepairs, describeCompletedRepairDevice, getTotalRevenueCents, type CompletedRepairRow } from "@/lib/completed-repairs-data";

export const dynamic = "force-dynamic";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default async function AdminRevenuePage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/revenue");

  const repairs = await listCompletedRepairs();
  const totalCents = getTotalRevenueCents(repairs);

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
          <a href="/admin/technicians">Technicians</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Revenue</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        Every row here is a repair a human confirmed actually happened, with the amount they actually
        collected — never inferred from a quoted or booked price. This is the only revenue figure in
        CPRNME; nothing elsewhere in the admin implies revenue on its own.
      </p>

      <div style={{ marginTop: 24, padding: 24, background: "var(--cp-accent-soft)", borderRadius: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-ink-soft)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Total revenue collected
        </p>
        <p style={{ fontSize: 36, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{formatMoney(totalCents)}</p>
        <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 4 }}>
          Across {repairs.length} completed {repairs.length === 1 ? "repair" : "repairs"}
        </p>
      </div>

      {repairs.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No completed repairs yet.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            This fills in the moment you mark a confirmed booking or an accepted quote completed, from
            /admin/bookings or /admin/quotes — nothing here is seeded or estimated.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {repairs.map((r) => (
            <RepairRow key={r.id} repair={r} />
          ))}
        </div>
      )}
    </main>
  );
}

function RepairRow({ repair }: { repair: CompletedRepairRow }) {
  const intent = repair.repair_intent_events;
  const deviceLabel = describeCompletedRepairDevice(repair);
  const variance = repair.agreed_price_cents !== null ? repair.revenue_cents - repair.agreed_price_cents : null;

  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 15 }}>
          {deviceLabel} — {intent?.problem ?? "unknown problem"}
        </p>
        <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 2 }}>
          {intent?.city ? `${intent.city}, ` : ""}
          {intent?.zip_code ?? "—"} · completed {formatDate(repair.completed_at)}
          {repair.booking_id ? " · via booking" : repair.quote_id ? " · via quote" : ""}
        </p>
        {repair.notes && <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 6 }}>Note: {repair.notes}</p>}
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{formatMoney(repair.revenue_cents)}</p>
        {variance !== null && variance !== 0 && (
          <p style={{ fontSize: 12, color: variance > 0 ? "var(--pass, #2f6f4f)" : "var(--cp-error)", marginTop: 2 }}>
            {variance > 0 ? "+" : ""}
            {formatMoney(variance)} vs. agreed {formatMoney(repair.agreed_price_cents!)}
          </p>
        )}
      </div>
    </div>
  );
}

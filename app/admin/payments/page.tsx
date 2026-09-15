import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { getPaymentSettings, type PaymentTiming } from "@/lib/payment-settings-data";
import { listAllPayments, type PaymentRow } from "@/lib/payments-data";
import { setPaymentSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const TIMING_LABELS: Record<PaymentTiming, string> = {
  at_completion: "At completion",
  deposit_and_balance: "Deposit + balance",
  full_at_booking: "Full at booking",
};

const STATUS_COLORS: Record<PaymentRow["status"], string> = {
  pending: "var(--gap, #8a5a15)",
  paid: "var(--pass, #2f6f4f)",
  failed: "var(--cp-error)",
  expired: "var(--cp-ink-faint)",
  refunded: "var(--cp-ink-faint)",
};

export default async function AdminPaymentsPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/payments");

  const [settings, payments] = await Promise.all([getPaymentSettings(), listAllPayments()]);
  const totalPaidCents = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount_cents, 0);

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
          <a href="/admin/taxonomy">Taxonomy</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Payments</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        Real Stripe activity. A payment showing &ldquo;Paid&rdquo; here means Stripe confirmed the
        charge — it does not by itself mean a repair happened; that is still only ever logged at{" "}
        <a href="/admin/revenue">/admin/revenue</a> when you mark a job completed.
      </p>

      <section style={{ marginTop: 24, padding: 20, border: "1.5px solid var(--cp-line)", borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>When customers pay</h2>
        <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 4 }}>
          One global setting governs every new booking. Changing it does not affect payments already
          sent or collected.
        </p>
        <SettingsForm settings={settings} />
      </section>

      <section style={{ marginTop: 24, padding: 20, background: "var(--cp-accent-soft)", borderRadius: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-ink-soft)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Total collected via Stripe
        </p>
        <p style={{ fontSize: 32, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{formatMoney(totalPaidCents)}</p>
        <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 4 }}>
          Across {payments.filter((p) => p.status === "paid").length} paid {payments.filter((p) => p.status === "paid").length === 1 ? "charge" : "charges"}
        </p>
      </section>

      {payments.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No payment links sent yet.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            These appear automatically when a booking requires upfront payment, or when you send one
            manually from a booking in /admin/bookings.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          {payments.map((p) => (
            <div
              key={p.id}
              style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>
                  {formatMoney(p.amount_cents)} · {p.purpose}
                </p>
                <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 2 }}>
                  {formatDate(p.created_at)}
                  {p.booking_id ? " · booking" : p.quote_id ? " · quote" : ""}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "var(--cp-accent-soft)",
                  color: STATUS_COLORS[p.status],
                }}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function SettingsForm({ settings }: { settings: Awaited<ReturnType<typeof getPaymentSettings>> }) {
  return (
    <form action={setPaymentSettingsAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
      {(Object.keys(TIMING_LABELS) as PaymentTiming[]).map((timing) => (
        <label key={timing} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input type="radio" name="paymentTiming" value={timing} defaultChecked={settings.payment_timing === timing} />
          {TIMING_LABELS[timing]}
        </label>
      ))}

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingLeft: 24 }}>
        <span style={{ fontSize: 13, color: "var(--cp-ink-soft)" }}>Deposit amount (only used for &ldquo;Deposit + balance&rdquo;):</span>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="radio" name="depositType" value="flat" defaultChecked={settings.deposit_type === "flat"} />
          Flat $
          <input
            name="depositFlat"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.deposit_flat_cents ? (settings.deposit_flat_cents / 100).toFixed(2) : ""}
            style={{ padding: "5px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 90 }}
          />
        </label>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="radio" name="depositType" value="percentage" defaultChecked={settings.deposit_type === "percentage"} />
          <input
            name="depositPercentage"
            type="number"
            step="1"
            min="1"
            max="100"
            defaultValue={settings.deposit_percentage ?? ""}
            style={{ padding: "5px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 70 }}
          />
          %
        </label>
      </div>

      <div>
        <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
          Save
        </button>
      </div>
    </form>
  );
}

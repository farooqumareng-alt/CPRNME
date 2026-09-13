import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { listQuotes, describeQuoteDevice, type QuoteRow } from "@/lib/quotes-data";
import { setQuotePriceAction, setQuoteStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_ORDER: Record<QuoteRow["status"], number> = {
  pending: 0,
  quoted: 1,
  accepted: 2,
  declined: 3,
  expired: 4,
};

export default async function AdminQuotesPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/quotes");

  const quotes = await listQuotes();
  const sorted = [...quotes].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const pendingCount = quotes.filter((q) => q.status === "pending").length;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Admin
        </span>
        <nav style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
          <a href="/admin/demand">Demand</a>
          <a href="/admin/pricing">Pricing</a>
          <a href="/admin/bookings">Bookings</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Repair quote requests</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        Every row here is a real visitor who left contact info because their request needed a look before a
        price could be shown. {pendingCount > 0 ? `${pendingCount} awaiting review.` : "Nothing waiting on you right now."}
      </p>

      {sorted.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No quote requests yet.</p>
          <p style={{ marginTop: 8, fontSize: 14.5 }}>
            This appears the moment a real visitor leaves a phone number or email after a request that
            needed review — nothing here is seeded or simulated.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          {sorted.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </div>
      )}
    </main>
  );
}

function QuoteCard({ quote }: { quote: QuoteRow }) {
  const intent = quote.repair_intent_events;
  const deviceLabel = describeQuoteDevice(quote);

  return (
    <div style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>
            {deviceLabel} — {intent?.problem ?? "unknown problem"}
          </p>
          <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 2 }}>
            {intent?.city ? `${intent.city}, ` : ""}
            {intent?.zip_code ?? "—"} · from {intent?.source_page ?? "—"} · requested {formatDate(quote.created_at)}
          </p>
        </div>
        <StatusPill status={quote.status} />
      </div>

      <p style={{ fontSize: 14, marginTop: 10 }}>
        Contact ({quote.contact_method}): <strong>{quote.contact_value}</strong>
      </p>

      {quote.price_cents !== null && (
        <p style={{ fontSize: 14, marginTop: 4, color: "var(--cp-ink-soft)" }}>
          Quoted price: <strong style={{ color: "var(--cp-ink)" }}>${(quote.price_cents / 100).toFixed(2)}</strong>
          {quote.quote_note ? ` — ${quote.quote_note}` : ""}
        </p>
      )}

      {(quote.status === "pending" || quote.status === "quoted") && (
        <form action={setQuotePriceAction} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}>
          <input type="hidden" name="id" value={quote.id} />
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Price ($)
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={quote.price_cents !== null ? (quote.price_cents / 100).toFixed(2) : ""}
              required
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 110 }}
            />
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 180 }}>
            Note (shown internally only)
            <input
              name="note"
              defaultValue={quote.quote_note ?? ""}
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6 }}
            />
          </label>
          <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
            {quote.status === "pending" ? "Send quote" : "Update quote"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {quote.status === "quoted" && (
          <>
            <StatusButton id={quote.id} status="accepted" label="Mark accepted" />
            <StatusButton id={quote.id} status="declined" label="Mark declined" />
          </>
        )}
        {quote.status !== "expired" && quote.status !== "accepted" && (
          <StatusButton id={quote.id} status="expired" label="Mark expired" />
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: QuoteRow["status"] }) {
  const colors: Record<QuoteRow["status"], string> = {
    pending: "var(--gap, #8a5a15)",
    quoted: "var(--cp-accent-ink)",
    accepted: "var(--pass, #2f6f4f)",
    declined: "var(--cp-error)",
    expired: "var(--cp-ink-faint)",
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
      {status}
    </span>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setQuoteStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
        {label}
      </button>
    </form>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

import { getStripe } from "@/lib/stripe";
import { pageMetadata } from "@/content/seo";

export const dynamic = "force-dynamic";

// Never indexed — a thank-you page reached only via a Stripe redirect
// carrying a one-time session id, not a page anyone should land on
// directly from search.
export const metadata = {
  ...pageMetadata({
    title: "Payment Received | CPRNME",
    description: "Your CPRNME payment was received.",
    path: "/pay/success",
  }),
  robots: { index: false, follow: false },
};

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// This page is purely a friendly confirmation for the customer — it never
// marks anything paid. The real payment status only ever changes from
// Stripe's signed webhook event (app/api/webhooks/stripe/route.ts),
// since a customer could otherwise land on this URL, or even guess a
// session id, without having actually paid.
export default async function PaySuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let amountCents: number | null = null;
  let paid = false;
  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      amountCents = session.amount_total;
      paid = session.payment_status === "paid";
    } catch {
      // Unknown/garbage session id — fall through to the generic message.
    }
  }

  return (
    <section className="page-hero container" style={{ maxWidth: "560px", textAlign: "center" }}>
      <h1>{paid ? "Payment received" : "Thank you"}</h1>
      {paid && amountCents !== null ? (
        <p style={{ fontSize: 18, marginTop: 12 }}>
          We received your payment of <strong>{formatMoney(amountCents)}</strong>.
        </p>
      ) : (
        <p style={{ fontSize: 16, marginTop: 12, color: "var(--cp-ink-soft)" }}>
          If your bank is still finishing this payment, you&rsquo;ll get an email confirmation shortly.
        </p>
      )}
      <p style={{ marginTop: 20 }}>
        <a href="/" className="btn btn-secondary">
          Back to CPRNME
        </a>
      </p>
    </section>
  );
}

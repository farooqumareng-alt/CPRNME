import { pageMetadata } from "@/content/seo";

export const metadata = {
  ...pageMetadata({
    title: "Payment Cancelled | CPRNME",
    description: "Your CPRNME payment was cancelled.",
    path: "/pay/cancelled",
  }),
  robots: { index: false, follow: false },
};

export default function PayCancelledPage() {
  return (
    <section className="page-hero container" style={{ maxWidth: "560px", textAlign: "center" }}>
      <h1>Payment cancelled</h1>
      <p style={{ fontSize: 16, marginTop: 12, color: "var(--cp-ink-soft)" }}>
        No charge was made. The payment link you were sent is still valid if you&rsquo;d like to try again.
      </p>
      <p style={{ marginTop: 20 }}>
        <a href="/" className="btn btn-secondary">
          Back to CPRNME
        </a>
      </p>
    </section>
  );
}

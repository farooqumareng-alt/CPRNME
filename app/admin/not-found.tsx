// Catches unmatched URLs under /admin/* (e.g. a typo'd sub-path) before
// they'd otherwise bubble up to the true root app/not-found.tsx, which
// renders the public marketing header/footer/mobile CTA bar. Deliberately
// minimal and chrome-free, matching the plain inline-styled look of the
// other /admin/* pages — no public nav, no customer CTA.
export default function AdminNotFound() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--cp-ink-faint)",
        }}
      >
        CPRNME Admin
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Page not found</h1>
      <p style={{ marginTop: 8 }}>That admin page doesn&rsquo;t exist.</p>
      <nav style={{ display: "flex", gap: 14, fontSize: 13, marginTop: 20 }}>
        <a href="/admin">Today</a>
        <a href="/admin/demand">Demand</a>
        <a href="/admin/pricing">Pricing</a>
        <a href="/admin/quotes">Quotes</a>
        <a href="/admin/bookings">Bookings</a>
        <a href="/admin/revenue">Revenue</a>
        <a href="/admin/technicians">Technicians</a>
        <a href="/admin/taxonomy">Taxonomy</a>
      </nav>
    </main>
  );
}

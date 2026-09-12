// Server component — no client JS needed. Links use absolute paths
// ("/#find-repair", "/iphone-repair") rather than bare anchors: now that
// Phase 4 adds real pages, a bare "#find-repair" clicked from one of those
// pages would try to scroll an anchor that doesn't exist there instead of
// navigating home. On narrow screens the link list is hidden and
// MobileCtaBar takes over as the primary action.
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <a href="/" className="logo">
          CPRNME
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/repairs">Repairs</a>
          <a href="/locations">Locations</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <a href="/#find-repair" className="btn btn-primary btn-compact">
          Find My Repair
        </a>
      </div>
    </header>
  );
}

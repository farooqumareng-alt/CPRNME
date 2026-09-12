import { businessInfo, getFulfillmentLine } from "@/content/business-info";

// Server component. Phone number and the CPRNME/FixVise relationship line
// are now real, confirmed facts (see content/business-info.ts) — everything
// else here stays deliberately minimal: no address, hours, or specific
// service-area names, since the city list within "DFW area" hasn't been
// provided yet.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-logo">CPRNME</p>
          <p className="footer-tagline">Cell Phone Repair Near Me.</p>
          <p className="footer-phone">
            <a href={`tel:${businessInfo.phone.e164}`}>{businessInfo.phone.display}</a>
          </p>
        </div>
        <nav aria-label="Footer">
          <a href="/#find-repair">Find My Repair</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#faq">FAQ</a>
          <a href="/repairs">All Repairs</a>
        </nav>
        <p className="footer-note">
          CPRNME helps you find and start the right phone repair. {getFulfillmentLine()}
        </p>
      </div>
    </footer>
  );
}

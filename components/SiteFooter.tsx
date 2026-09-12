import { businessInfo, getFulfillmentCredit } from "@/content/business-info";

// Server component. Deliberately minimal: no address or hours, since those
// aren't confirmed. The fulfillment provider is credited only as a small
// "Powered by <domain>" line, per direction — no provider brand name or
// description of the relationship appears anywhere on the site.
export function SiteFooter() {
  const credit = getFulfillmentCredit();

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
        {credit && (
          <p className="footer-credit">
            <a href={credit.href} rel="noopener">
              {credit.text}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}

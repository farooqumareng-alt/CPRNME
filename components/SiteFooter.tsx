import { businessInfo, getFulfillmentCredit } from "@/content/business-info";
import { TrackedLink } from "@/components/TrackedLink";
import { FindRepairLink } from "@/components/FindRepairLink";

// Server component apart from the Find My Repair link (see
// FindRepairLink.tsx). Deliberately minimal: no address or hours, since
// those aren't confirmed. The fulfillment provider is credited only as a
// small "Powered by <domain>" line, per direction — no provider brand name
// or description of the relationship appears anywhere on the site.
export function SiteFooter() {
  const credit = getFulfillmentCredit();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-logo">CPRNME</p>
          <p className="footer-tagline">{businessInfo.fullName}.</p>
          <p className="footer-phone">
            <TrackedLink event="call_click" eventData={{ location: "footer" }} href={`tel:${businessInfo.phone.e164}`}>
              {businessInfo.phone.display}
            </TrackedLink>
          </p>
        </div>
        <nav aria-label="Footer">
          <FindRepairLink>Find My Repair</FindRepairLink>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#faq">FAQ</a>
          <a href="/repairs">All Repairs</a>
          <a href="/locations">Locations</a>
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

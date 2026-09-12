import { businessInfo } from "@/content/business-info";
import { TrackedLink } from "@/components/TrackedLink";

// Server component apart from the tracked Call link. "Call" was withheld
// until a real phone number existed (Phase 2, Section 8); it now does.
export function MobileCtaBar() {
  return (
    <div className="mobile-cta-bar">
      <TrackedLink
        event="call_click"
        eventData={{ location: "mobile_cta_bar" }}
        href={`tel:${businessInfo.phone.e164}`}
        className="btn btn-secondary"
      >
        Call
      </TrackedLink>
      <a href="/#find-repair" className="btn btn-primary">
        Find My Repair
      </a>
    </div>
  );
}

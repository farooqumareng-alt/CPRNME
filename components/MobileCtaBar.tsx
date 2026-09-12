import { businessInfo } from "@/content/business-info";

// Server component — plain anchors, no JS required. "Call" was withheld
// until a real phone number existed (Phase 2, Section 8); it now does.
export function MobileCtaBar() {
  return (
    <div className="mobile-cta-bar">
      <a href={`tel:${businessInfo.phone.e164}`} className="btn btn-secondary">
        Call
      </a>
      <a href="/#find-repair" className="btn btn-primary">
        Find My Repair
      </a>
    </div>
  );
}

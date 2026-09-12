import { businessInfo } from "@/content/business-info";

// Organization + WebSite JSON-LD — unblocked now that the domain is
// confirmed. Deliberately omits fields that would otherwise have to be
// invented:
//   - no `logo` (no real logo asset exists yet)
//   - no `sameAs` (no confirmed social profiles)
//   - no `address` / `areaServed` (service territory not confirmed — only
//     "DFW area" in general, no specific city list yet)
// Add each once the underlying fact is real, not before.
//
// The Organization now carries a stable `@id` — the Phase 10 audit flagged
// its absence as a gap: without one, a Service schema (see
// ServiceSchema.tsx) has no way to reference this Organization except by
// repeating the whole object on every page. `@id` fixes that.
export const ORGANIZATION_ID = `${businessInfo.siteUrl}/#organization`;

export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: businessInfo.brandName,
        alternateName: businessInfo.fullName,
        url: businessInfo.siteUrl,
        telephone: businessInfo.phone.e164,
      },
      {
        "@type": "WebSite",
        name: businessInfo.brandName,
        url: businessInfo.siteUrl,
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

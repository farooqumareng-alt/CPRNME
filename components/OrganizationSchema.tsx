import { businessInfo } from "@/content/business-info";

// Organization + WebSite JSON-LD. Still deliberately omits:
//   - `logo` (no real logo asset exists yet)
//   - `sameAs` (no confirmed social profiles)
//   - `address` (no public street address confirmed)
// Add each once the underlying fact is real, not before.
//
// `areaServed` is now included — coverage across the 12-county DFW
// territory was explicitly confirmed as live, not a plan. Listed at the
// county level to match the actual granularity of that confirmation,
// rather than naming only the ~42 cities that happen to have a page built
// so far (page count is a content-completeness question, not a coverage
// one — see content/location-publish-rule.ts).
//
// The Organization carries a stable `@id` — the Phase 10 audit flagged its
// absence as a gap: without one, a Service schema (see ServiceSchema.tsx)
// has no way to reference this Organization except by repeating the whole
// object on every page. `@id` fixes that.
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
        areaServed: businessInfo.serviceRegion.counties.map((county) => ({
          "@type": "AdministrativeArea",
          name: `${county} County, TX`,
        })),
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

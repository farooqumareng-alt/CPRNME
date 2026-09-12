import { businessInfo } from "@/content/business-info";
import { ORGANIZATION_ID } from "@/components/OrganizationSchema";

// Service JSON-LD — the gap the Phase 10 audit found: no repair page
// carried any structured Service data. Deliberately minimal and purely
// descriptive:
//   - `provider` links to the Organization by @id rather than repeating it
//   - no `areaServed` (territory still unconfirmed)
//   - no `offers`, price, or `aggregateRating` (nothing to report honestly)
// Add those once — and only once — the underlying facts are real.
export function ServiceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${businessInfo.siteUrl}${path}`,
    serviceType: name,
    provider: { "@id": ORGANIZATION_ID },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

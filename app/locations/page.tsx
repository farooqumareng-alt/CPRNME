import { pageMetadata } from "@/content/seo";
import { getPublishedLocationPages } from "@/content/location-pages";
import { businessInfo } from "@/content/business-info";

export const metadata = pageMetadata({
  title: "Phone Repair Locations | CPRNME",
  description: "Every city where CPRNME currently connects customers with phone repair, across the DFW area.",
  path: "/locations",
});

export default function LocationsIndexPage() {
  const pages = getPublishedLocationPages();

  // Group by county for the index — the most useful grouping for a visitor
  // scanning for their area, not an internal detail like tier.
  const byCounty = new Map<string, typeof pages>();
  for (const p of pages) {
    const county = p.city.counties[0]; // primary county
    if (!byCounty.has(county)) byCounty.set(county, []);
    byCounty.get(county)!.push(p);
  }
  const counties = [...byCounty.keys()].sort((a, b) => byCounty.get(b)!.length - byCounty.get(a)!.length);

  return (
    <>
      <section className="page-hero container">
        <h1>Phone Repair Locations</h1>
        <p className="hero-tagline">
          CPRNME connects customers with phone repair across the{" "}
          {businessInfo.serviceRegion.label} — {pages.length} cities and
          growing. Don&rsquo;t see your city listed? Tell us your ZIP code
          on the homepage and we&rsquo;ll confirm what&rsquo;s available.
        </p>
      </section>

      {counties.map((county) => (
        <section key={county} className="section container">
          <h2>{county} County</h2>
          <div className="related-grid" style={{ marginTop: "16px" }}>
            {byCounty.get(county)!.map(({ city, slug }) => (
              <a key={slug} href={`/locations/${slug}`} className="related-card">
                <span className="related-title">{city.name}</span>
                <span className="related-summary">Find your repair in {city.name}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

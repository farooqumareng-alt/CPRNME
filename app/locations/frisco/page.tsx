import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

// Correctly Tier 1 once merged across counties (see location-eligibility.ts's
// header) — Frisco's ZIPs split Denton and Collin counties, and the
// per-fragment tiering that shipped in Phase 9 missed that the two halves
// are one ~120k city.
const city = getCityRecord("Frisco")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Frisco, TX | CPRNME",
  description:
    "Find the right phone repair in Frisco — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/frisco",
});

export default function FriscoLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Frisco, TX"
      h1="Phone Repair in Frisco, TX"
      quickAnswer={
        <>
          CPRNME helps Frisco-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Frisco spans two counties"
      localContext={
        <p>
          Frisco has been one of the fastest-growing cities in the country
          over the past two decades, and it actually straddles the line
          between Denton and Collin counties — a good example of how a
          single city can cross a county boundary in this area. That rapid,
          spread-out growth is part of why repair availability can depend on
          exactly where in Frisco you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Frisco?",
          answer:
            "Coverage can vary by ZIP code and by the specific repair needed. Tell us your device, the problem, and where you are, and we'll confirm what's actually available in your area.",
        },
        {
          question: "Do I need to bring my phone somewhere?",
          answer: (
            <>
              That depends on what&rsquo;s available in your specific area —
              see <a href="/#how-it-works">How It Works</a> for the general
              process.
            </>
          ),
        },
      ]}
    />
  );
}

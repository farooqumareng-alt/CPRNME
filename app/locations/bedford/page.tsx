import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Bedford")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Bedford, TX | CPRNME",
  description:
    "Find the right phone repair in Bedford — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/bedford",
});

export default function BedfordLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Bedford, TX"
      h1="Phone Repair in Bedford, TX"
      quickAnswer={
        <>
          CPRNME helps Bedford-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Bedford is one of the smaller, denser Mid-Cities"
      localContext={
        <p>
          Bedford sits between Hurst and Euless as part of the Mid-Cities
          cluster, and it&rsquo;s one of the more compact cities in that
          group — mostly built out already, with little room left for new
          development. That density means it borders its neighbors closely,
          so we confirm availability by ZIP code rather than city name
          alone.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Bedford?",
          answer:
            "Coverage can vary by ZIP code and by the specific repair needed. Tell us your device, the problem, and where you are, and we'll confirm what's actually available before you book anything.",
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

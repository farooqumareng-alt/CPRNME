import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Garland")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Garland, TX | CPRNME",
  description:
    "Find the right phone repair in Garland — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/garland",
});

export default function GarlandLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Garland, TX"
      h1="Phone Repair in Garland, TX"
      quickAnswer={
        <>
          CPRNME helps Garland-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Garland is one of the older, larger Dallas suburbs"
      localContext={
        <p>
          Garland grew up alongside Dallas rather than as a newer planned
          suburb, and it shows — a historic downtown square sits at its
          center, surrounded by neighborhoods that range from decades-old to
          recently built as the city has continued to expand east toward
          Lake Ray Hubbard. That age range across the city is one reason
          repair availability can vary by ZIP code rather than being the
          same everywhere.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Garland?",
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

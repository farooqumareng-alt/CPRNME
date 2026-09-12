import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("McKinney", "Collin")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in McKinney, TX | CPRNME",
  description:
    "Find the right phone repair in McKinney — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/mckinney",
});

export default function McKinneyLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="McKinney, TX"
      h1="Phone Repair in McKinney, TX"
      quickAnswer={
        <>
          CPRNME helps McKinney-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="McKinney has grown quickly around a historic core"
      localContext={
        <p>
          McKinney has been one of the fastest-growing cities in the
          Metroplex over the past couple of decades, with new neighborhoods
          extending well beyond the historic downtown square that gives the
          city much of its identity. That combination of long-established
          streets near downtown and newer development further out is part
          of why we confirm availability by ZIP code rather than treating
          the whole city as one area.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of McKinney?",
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

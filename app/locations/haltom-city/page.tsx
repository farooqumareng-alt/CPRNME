import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Haltom City")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Haltom City, TX | CPRNME",
  description:
    "Find the right phone repair in Haltom City — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/haltom-city",
});

export default function HaltomCityLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Haltom City, TX"
      h1="Phone Repair in Haltom City, TX"
      quickAnswer={
        <>
          CPRNME helps Haltom City-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Haltom City sits just northeast of downtown Fort Worth"
      localContext={
        <p>
          Haltom City is one of the older, more established suburbs
          bordering Fort Worth directly, built out well before much of the
          newer development further north. Its close, long-established
          borders with Fort Worth and North Richland Hills are part of why
          we confirm availability by ZIP code rather than city name alone.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Haltom City?",
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

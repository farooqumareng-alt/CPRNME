import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Lewisville")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Lewisville, TX | CPRNME",
  description:
    "Find the right phone repair in Lewisville — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/lewisville",
});

export default function LewisvilleLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Lewisville, TX"
      h1="Phone Repair in Lewisville, TX"
      quickAnswer={
        <>
          CPRNME helps Lewisville-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Lewisville is built around its lake and retail corridor"
      localContext={
        <p>
          Lewisville Lake sits along the city&rsquo;s northern edge, and a
          long retail and business corridor runs through the center of
          town, which together shape a city that&rsquo;s more spread out
          than it might first appear. Repair availability can depend on
          exactly where in Lewisville you are, which is why we confirm by
          ZIP code rather than assuming one answer covers the whole city.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Lewisville?",
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

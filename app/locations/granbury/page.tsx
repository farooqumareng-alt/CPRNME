import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Granbury")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Granbury, TX | CPRNME",
  description:
    "Find the right phone repair in Granbury — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/granbury",
});

export default function GranburyLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Granbury, TX"
      h1="Phone Repair in Granbury, TX"
      quickAnswer={
        <>
          CPRNME helps Granbury-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Granbury is the farthest-southwest city CPRNME covers"
      localContext={
        <p>
          Granbury is the county seat of Hood County, built around a
          well-preserved historic courthouse square on the National
          Register of Historic Places, with Lake Granbury forming much of
          the city&rsquo;s southern edge. It&rsquo;s noticeably farther
          from Dallas and Fort Worth than most other cities in this list,
          which is worth knowing when it comes to what&rsquo;s realistically
          available.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Granbury?",
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

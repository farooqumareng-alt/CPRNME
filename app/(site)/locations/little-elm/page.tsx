import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Little Elm")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Little Elm, TX | CPRNME",
  description:
    "Find the right phone repair in Little Elm — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/little-elm",
});

export default function LittleElmLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Little Elm, TX"
      h1="Phone Repair in Little Elm, TX"
      quickAnswer={
        <>
          CPRNME helps Little Elm-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Little Elm sits on a peninsula in Lake Lewisville"
      localContext={
        <p>
          Little Elm has been one of the fastest-growing towns in the
          Metroplex, built out on a peninsula that juts into Lake
          Lewisville, with a lakeside park and beach area that&rsquo;s
          become a regional draw. Almost all of the city&rsquo;s growth has
          happened in the past couple of decades, so availability can still
          vary by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Little Elm?",
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

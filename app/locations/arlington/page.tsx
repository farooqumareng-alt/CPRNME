import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Arlington")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Arlington, TX | CPRNME",
  description:
    "Find the right phone repair in Arlington — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/arlington",
});

export default function ArlingtonLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Arlington, TX"
      h1="Phone Repair in Arlington, TX"
      quickAnswer={
        <>
          CPRNME helps Arlington-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Arlington sits right between Dallas and Fort Worth"
      localContext={
        <p>
          Arlington is best known for its entertainment district — AT&amp;T
          Stadium, Globe Life Field, and Six Flags Over Texas all sit within
          a few miles of each other — plus the University of Texas at
          Arlington near downtown. That mix of dense entertainment venues
          and spread-out residential neighborhoods means repair options can
          vary a fair amount depending on exactly where in Arlington you
          are, which is why we confirm by ZIP code rather than assuming one
          answer covers the whole city.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Arlington?",
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

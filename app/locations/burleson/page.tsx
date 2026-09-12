import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Burleson")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Burleson, TX | CPRNME",
  description:
    "Find the right phone repair in Burleson — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/burleson",
});

export default function BurlesonLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Burleson, TX"
      h1="Phone Repair in Burleson, TX"
      quickAnswer={
        <>
          CPRNME helps Burleson-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Burleson sits just south of Fort Worth"
      localContext={
        <p>
          Burleson is the largest city CPRNME covers in Johnson County,
          growing outward from an older downtown area as Fort Worth&rsquo;s
          southern suburbs have expanded. It&rsquo;s spread across a fairly
          large area for its population, which is part of why repair
          availability can depend on exactly where in Burleson you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Burleson?",
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

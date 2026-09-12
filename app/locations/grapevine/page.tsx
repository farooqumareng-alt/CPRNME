import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Grapevine")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Grapevine, TX | CPRNME",
  description:
    "Find the right phone repair in Grapevine — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/grapevine",
});

export default function GrapevineLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Grapevine, TX"
      h1="Phone Repair in Grapevine, TX"
      quickAnswer={
        <>
          CPRNME helps Grapevine-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Grapevine sits right at DFW Airport's front door"
      localContext={
        <p>
          Grapevine borders the north side of DFW International Airport
          and has built its identity around a well-preserved historic Main
          Street, a cluster of Texas wineries, and Lake Grapevine to the
          north. The mix of a dense tourist-oriented downtown and quieter
          residential streets further out is part of why repair
          availability can vary by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Grapevine?",
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

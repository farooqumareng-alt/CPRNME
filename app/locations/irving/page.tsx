import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Irving")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Irving, TX | CPRNME",
  description:
    "Find the right phone repair in Irving — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/irving",
});

export default function IrvingLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Irving, TX"
      h1="Phone Repair in Irving, TX"
      quickAnswer={
        <>
          CPRNME helps Irving-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Irving is built around a major business district"
      localContext={
        <p>
          Irving is home to Las Colinas, one of the region&rsquo;s largest
          business districts, along with a share of DFW International
          Airport, which sits partly within the city&rsquo;s boundaries. The
          mix of dense commercial areas near the airport and quieter
          residential neighborhoods further south means what&rsquo;s
          available can depend a lot on exactly which part of Irving
          you&rsquo;re in.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Irving?",
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

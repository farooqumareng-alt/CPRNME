import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Coppell")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Coppell, TX | CPRNME",
  description:
    "Find the right phone repair in Coppell — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/coppell",
});

export default function CoppellLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Coppell, TX"
      h1="Phone Repair in Coppell, TX"
      quickAnswer={
        <>
          CPRNME helps Coppell-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Coppell sits between DFW Airport and Las Colinas"
      localContext={
        <p>
          Coppell is a smaller, largely residential city wedged between
          DFW International Airport and the Las Colinas business district
          in Irving. It&rsquo;s mostly built out already, with
          availability that can still depend on exactly which ZIP code
          you&rsquo;re in.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Coppell?",
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

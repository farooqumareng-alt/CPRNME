import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Forney")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Forney, TX | CPRNME",
  description:
    "Find the right phone repair in Forney — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/forney",
});

export default function ForneyLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Forney, TX"
      h1="Phone Repair in Forney, TX"
      quickAnswer={
        <>
          CPRNME helps Forney-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Forney has grown quickly along the I-20 corridor"
      localContext={
        <p>
          Forney sits in Kaufman County just east of Dallas along I-20, and
          it has been one of the faster-growing towns in that direction
          over the past decade or so, with new residential development
          extending well past its original town center. Availability can
          still vary depending on exactly where in Forney you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Forney?",
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

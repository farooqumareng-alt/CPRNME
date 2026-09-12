import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

// Correctly Tier 1 once merged across counties — see app/locations/frisco
// for the same situation. Carrollton's ZIPs split Denton and Dallas
// counties; merged, it's roughly a 120k city.
const city = getCityRecord("Carrollton")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Carrollton, TX | CPRNME",
  description:
    "Find the right phone repair in Carrollton — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/carrollton",
});

export default function CarrolltonLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Carrollton, TX"
      h1="Phone Repair in Carrollton, TX"
      quickAnswer={
        <>
          CPRNME helps Carrollton-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Carrollton sits across two counties too"
      localContext={
        <p>
          Like its neighbor Frisco, Carrollton crosses a county line —
          most of the city sits in Denton County, with a smaller portion
          extending into Dallas County to the south. It&rsquo;s a densely
          built-out suburb with a mix of older neighborhoods near its
          historic core and newer development further out, which is part
          of why we confirm availability by ZIP code rather than treating
          the whole city as one area.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Carrollton?",
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

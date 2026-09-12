import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Euless")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Euless, TX | CPRNME",
  description:
    "Find the right phone repair in Euless — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/euless",
});

export default function EulessLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Euless, TX"
      h1="Phone Repair in Euless, TX"
      quickAnswer={
        <>
          CPRNME helps Euless-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Euless sits right next to DFW Airport"
      localContext={
        <p>
          Euless is one of the Mid-Cities suburbs packed between Fort Worth
          and Dallas, and its northern edge runs close to DFW International
          Airport. That proximity to the airport, combined with how tightly
          it borders Hurst and Bedford, means street-level location matters
          more here than the city name alone — which is why we confirm
          availability by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Euless?",
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

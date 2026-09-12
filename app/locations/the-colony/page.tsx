import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("The Colony")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in The Colony, TX | CPRNME",
  description:
    "Find the right phone repair in The Colony — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/the-colony",
});

export default function TheColonyLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="The Colony, TX"
      h1="Phone Repair in The Colony, TX"
      quickAnswer={
        <>
          CPRNME helps The Colony-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="The Colony sits on Lake Lewisville"
      localContext={
        <p>
          The Colony occupies a peninsula on Lake Lewisville and has become
          known more recently for Grandscape, a large mixed-use retail and
          entertainment development on its western side. The city is fairly
          compact, but availability can still depend on exactly which ZIP
          code you&rsquo;re in.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of The Colony?",
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

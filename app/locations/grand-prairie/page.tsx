import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Grand Prairie", "Dallas")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Grand Prairie, TX | CPRNME",
  description:
    "Find the right phone repair in Grand Prairie — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/grand-prairie",
});

export default function GrandPrairieLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Grand Prairie, TX"
      h1="Phone Repair in Grand Prairie, TX"
      quickAnswer={
        <>
          CPRNME helps Grand Prairie-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Grand Prairie sits right between Dallas and Fort Worth"
      localContext={
        <p>
          Grand Prairie stretches across parts of both Dallas and Tarrant
          counties, which is part of why it&rsquo;s a good example of how
          messy city boundaries can get in this area — a single city that
          crosses county lines. It&rsquo;s known locally for Lone Star Park
          and a growing cluster of entertainment and logistics development
          along its northern edge, alongside older residential areas closer
          to its historic center.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Grand Prairie?",
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

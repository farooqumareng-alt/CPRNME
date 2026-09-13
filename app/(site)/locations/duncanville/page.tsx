import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Duncanville")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Duncanville, TX | CPRNME",
  description:
    "Find the right phone repair in Duncanville — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/duncanville",
});

export default function DuncanvilleLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Duncanville, TX"
      h1="Phone Repair in Duncanville, TX"
      quickAnswer={
        <>
          CPRNME helps Duncanville-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Duncanville sits among Dallas's southern suburbs"
      localContext={
        <p>
          Duncanville is one of the older, more established suburbs
          directly south of Dallas, alongside Cedar Hill and DeSoto. Most
          of the city was built out decades ago rather than recently, which
          gives it a different character than some of the newer, faster-
          growing suburbs further out — though availability can still vary
          by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Duncanville?",
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

import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

// Pilot location page #1 of the small, controlled set that proved out the
// location-page system. Refactored onto the shared LocationPageTemplate once
// 9 more cities needed the same structure — see that component for why
// indexability is never decided here.
const city = getCityRecord("Dallas")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Dallas, TX | CPRNME",
  description:
    "Find the right phone repair in Dallas — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/dallas",
});

export default function DallasLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Dallas, TX"
      h1="Phone Repair in Dallas, TX"
      quickAnswer={
        <>
          CPRNME helps Dallas-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Dallas covers a lot of ground"
      localContext={
        <p>
          Dallas is the largest city in Dallas County, stretching from
          Uptown and Downtown through Oak Cliff, East Dallas, and far North
          Dallas — dozens of ZIP codes in all. Repair options can vary
          depending on exactly where you are, which is why we ask for your
          ZIP code before confirming what&rsquo;s available, rather than
          assuming one answer covers the whole city.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Dallas?",
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

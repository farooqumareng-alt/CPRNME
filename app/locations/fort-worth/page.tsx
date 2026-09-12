import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

// Pilot location page #2 — see app/locations/dallas/page.tsx.
const city = getCityRecord("Fort Worth")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Fort Worth, TX | CPRNME",
  description:
    "Find the right phone repair in Fort Worth — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/fort-worth",
});

export default function FortWorthLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Fort Worth, TX"
      h1="Phone Repair in Fort Worth, TX"
      quickAnswer={
        <>
          CPRNME helps Fort Worth-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Fort Worth spans a wide area"
      localContext={
        <p>
          Fort Worth is the largest city in Tarrant County, covering
          everything from Downtown and Near Southside through the Cultural
          District and far west and south Fort Worth — several dozen ZIP
          codes in all. Repair options can vary depending on exactly where
          you are, which is why we ask for your ZIP code before confirming
          what&rsquo;s available, rather than assuming one answer covers the
          whole city.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Fort Worth?",
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

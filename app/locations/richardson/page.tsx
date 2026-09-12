import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Richardson")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Richardson, TX | CPRNME",
  description:
    "Find the right phone repair in Richardson — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/richardson",
});

export default function RichardsonLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Richardson, TX"
      h1="Phone Repair in Richardson, TX"
      quickAnswer={
        <>
          CPRNME helps Richardson-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Richardson grew up around its tech corridor"
      localContext={
        <p>
          Richardson is best known for the dense cluster of telecom and
          tech companies along its central corridor, alongside the
          University of Texas at Dallas nearby — a mix that brings a lot of
          daytime office population into a city that&rsquo;s also home to
          long-established residential neighborhoods. It also spans a small
          section of Collin County in addition to most of it sitting in
          Dallas County.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Richardson?",
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

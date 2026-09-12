import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Hurst")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Hurst, TX | CPRNME",
  description:
    "Find the right phone repair in Hurst — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/hurst",
});

export default function HurstLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Hurst, TX"
      h1="Phone Repair in Hurst, TX"
      quickAnswer={
        <>
          CPRNME helps Hurst-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Hurst anchors the Mid-Cities shopping corridor"
      localContext={
        <p>
          Hurst sits between Euless and Bedford — together the three are
          sometimes referred to as the &ldquo;HEB&rdquo; area, unrelated to
          the grocery chain of the same initials — and has long been a
          regional shopping hub for the Mid-Cities. It&rsquo;s a compact,
          largely built-out city, with availability that can still vary by
          ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Hurst?",
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

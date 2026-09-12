import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Flower Mound")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Flower Mound, TX | CPRNME",
  description:
    "Find the right phone repair in Flower Mound — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/flower-mound",
});

export default function FlowerMoundLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Flower Mound, TX"
      h1="Phone Repair in Flower Mound, TX"
      quickAnswer={
        <>
          CPRNME helps Flower Mound-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Flower Mound is named for an actual mound"
      localContext={
        <p>
          The town takes its name from a real wildflower-covered hill that
          still sits within a protected preserve near its center — one of
          the more literal city names in the area. Flower Mound has
          deliberately kept more of a rolling, semi-rural feel than some of
          its denser neighbors between Dallas and Fort Worth, spread across
          a fairly large area, which is part of why coverage can vary by
          ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Flower Mound?",
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

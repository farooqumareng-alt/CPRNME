import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Wylie")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Wylie, TX | CPRNME",
  description:
    "Find the right phone repair in Wylie — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/wylie",
});

export default function WylieLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Wylie, TX"
      h1="Phone Repair in Wylie, TX"
      quickAnswer={
        <>
          CPRNME helps Wylie-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Wylie sits at the edge of Collin County near two lakes"
      localContext={
        <p>
          Wylie sits close to both Lake Lavon and Lake Ray Hubbard on the
          eastern edge of Collin County, and has grown considerably as
          development has pushed east from Plano and Richardson. It still
          has a historic downtown core surrounded by newer residential
          neighborhoods, which is part of why availability can vary by ZIP
          code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Wylie?",
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

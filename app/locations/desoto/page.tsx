import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("DeSoto")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in DeSoto, TX | CPRNME",
  description:
    "Find the right phone repair in DeSoto — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/desoto",
});

export default function DeSotoLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="DeSoto, TX"
      h1="Phone Repair in DeSoto, TX"
      quickAnswer={
        <>
          CPRNME helps DeSoto-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="DeSoto sits among Dallas's southern suburbs"
      localContext={
        <p>
          DeSoto is one of a handful of cities directly south of Dallas —
          along with Cedar Hill, Duncanville, and Lancaster — that grew as
          suburban development pushed outward in that direction rather than
          north. The city is mostly residential, with availability that can
          still depend on exactly which ZIP code you&rsquo;re in.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of DeSoto?",
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

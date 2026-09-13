import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Lancaster")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Lancaster, TX | CPRNME",
  description:
    "Find the right phone repair in Lancaster — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/lancaster",
});

export default function LancasterLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Lancaster, TX"
      h1="Phone Repair in Lancaster, TX"
      quickAnswer={
        <>
          CPRNME helps Lancaster-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Lancaster is one of the older towns south of Dallas"
      localContext={
        <p>
          Lancaster has a historic downtown square that predates most of
          the surrounding suburban development, sitting at the southern
          edge of Dallas County. A regional airport just outside downtown
          adds a bit of industrial and logistics activity to what&rsquo;s
          otherwise a mostly residential city, and availability can still
          vary by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Lancaster?",
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

import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Rowlett")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Rowlett, TX | CPRNME",
  description:
    "Find the right phone repair in Rowlett — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/rowlett",
});

export default function RowlettLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Rowlett, TX"
      h1="Phone Repair in Rowlett, TX"
      quickAnswer={
        <>
          CPRNME helps Rowlett-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Rowlett shares Lake Ray Hubbard with Rockwall"
      localContext={
        <p>
          Rowlett sits on the Dallas County side of Lake Ray Hubbard,
          directly across the water from Rockwall, and much of the city
          wraps around the shoreline in a way that makes it feel more
          spread out than its population alone suggests. It was also
          significantly rebuilt in parts after a tornado struck the city in
          2015, so the mix of older and newer construction varies block by
          block.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Rowlett?",
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

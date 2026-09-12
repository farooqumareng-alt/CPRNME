import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Greenville")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Greenville, TX | CPRNME",
  description:
    "Find the right phone repair in Greenville — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/greenville",
});

export default function GreenvilleLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Greenville, TX"
      h1="Phone Repair in Greenville, TX"
      quickAnswer={
        <>
          CPRNME helps Greenville-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Greenville is the farthest-northeast city CPRNME covers"
      localContext={
        <p>
          Greenville is the county seat of Hunt County, sitting well
          northeast of the core Metroplex along the US-69/380 corridor.
          It&rsquo;s more of a standalone regional hub than a Dallas suburb
          in the usual sense, which is worth knowing when it comes to what
          repair options are realistically available this far out.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Greenville?",
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

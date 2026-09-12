import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Cleburne")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Cleburne, TX | CPRNME",
  description:
    "Find the right phone repair in Cleburne — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/cleburne",
});

export default function ClebuneLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Cleburne, TX"
      h1="Phone Repair in Cleburne, TX"
      quickAnswer={
        <>
          CPRNME helps Cleburne-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Cleburne is the county seat of Johnson County"
      localContext={
        <p>
          Cleburne sits south of Burleson and Fort Worth as the county seat
          of Johnson County, with an older downtown built around its
          railroad history. It&rsquo;s farther from the core of the
          Metroplex than most cities CPRNME covers, which is worth knowing
          when it comes to what&rsquo;s realistically available.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Cleburne?",
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

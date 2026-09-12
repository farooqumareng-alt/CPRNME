import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Rockwall")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Rockwall, TX | CPRNME",
  description:
    "Find the right phone repair in Rockwall — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/rockwall",
});

export default function RockwallLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Rockwall, TX"
      h1="Phone Repair in Rockwall, TX"
      quickAnswer={
        <>
          CPRNME helps Rockwall-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Rockwall sits on Lake Ray Hubbard"
      localContext={
        <p>
          Rockwall is the county seat of Rockwall County — the smallest
          county in Texas by area — and much of the city&rsquo;s identity
          is built around its Lake Ray Hubbard shoreline, with a walkable
          harbor district that&rsquo;s grown up along the water in recent
          years. It&rsquo;s a smaller, more compact city than most others
          CPRNME covers, though availability can still vary by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Rockwall?",
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

import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Waxahachie")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Waxahachie, TX | CPRNME",
  description:
    "Find the right phone repair in Waxahachie — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/waxahachie",
});

export default function WaxahachieLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Waxahachie, TX"
      h1="Phone Repair in Waxahachie, TX"
      quickAnswer={
        <>
          CPRNME helps Waxahachie-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Waxahachie is known for its historic courthouse"
      localContext={
        <p>
          Waxahachie is the county seat of Ellis County, and its ornate,
          century-old courthouse and surrounding Victorian-era downtown
          have made it a recognizable filming location for movies and TV
          over the years. It sits at the southern edge of CPRNME&rsquo;s
          current coverage area, noticeably farther from Dallas than most
          other cities on this list.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Waxahachie?",
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

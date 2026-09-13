import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Weatherford")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Weatherford, TX | CPRNME",
  description:
    "Find the right phone repair in Weatherford — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/weatherford",
});

export default function WeatherfordLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Weatherford, TX"
      h1="Phone Repair in Weatherford, TX"
      quickAnswer={
        <>
          CPRNME helps Weatherford-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="Weatherford anchors the western edge of the Metroplex"
      localContext={
        <p>
          Weatherford is the county seat of Parker County and sits
          noticeably farther west than most of the cities CPRNME covers —
          it&rsquo;s long been known for its ranching and cutting-horse
          heritage, with a historic courthouse square at its center. That
          distance from the rest of the Metroplex is worth knowing, since
          it can affect what&rsquo;s realistically available compared to
          cities closer to Dallas or Fort Worth.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Weatherford?",
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

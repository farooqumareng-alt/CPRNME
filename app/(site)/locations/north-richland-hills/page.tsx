import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("North Richland Hills")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in North Richland Hills, TX | CPRNME",
  description:
    "Find the right phone repair in North Richland Hills — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/north-richland-hills",
});

export default function NorthRichlandHillsLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="North Richland Hills, TX"
      h1="Phone Repair in North Richland Hills, TX"
      quickAnswer={
        <>
          CPRNME helps North Richland Hills-area customers find the right
          phone repair. Tell us your device, the problem, and your ZIP
          code, and we&rsquo;ll show you what&rsquo;s actually available in your area.
        </>
      }
      localHeading="North Richland Hills sits among Tarrant County's Mid-Cities"
      localContext={
        <p>
          North Richland Hills is one of a cluster of similarly sized
          suburbs — along with Hurst, Euless, Bedford, and Watauga — packed
          between Fort Worth and the Dallas side of the Metroplex, often
          referred to locally as the Mid-Cities. Their boundaries sit close
          enough together that street-level location matters more than the
          city name alone, which is why we confirm by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of North Richland Hills?",
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

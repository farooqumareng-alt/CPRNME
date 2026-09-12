import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Keller")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Keller, TX | CPRNME",
  description:
    "Find the right phone repair in Keller — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/keller",
});

export default function KellerLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Keller, TX"
      h1="Phone Repair in Keller, TX"
      quickAnswer={
        <>
          CPRNME helps Keller-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Keller sits in the northeast corner of Tarrant County"
      localContext={
        <p>
          Keller is one of several suburbs that grew up along the Tarrant
          and Denton county line north of Fort Worth, with newer
          residential development making up most of the city. It borders
          Southlake and North Richland Hills closely enough that the
          practical boundary between them isn&rsquo;t always obvious, which
          is part of why we confirm availability by ZIP code rather than
          city name alone.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Keller?",
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

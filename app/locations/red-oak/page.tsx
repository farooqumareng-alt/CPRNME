import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Red Oak")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Red Oak, TX | CPRNME",
  description:
    "Find the right phone repair in Red Oak — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/red-oak",
});

export default function RedOakLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Red Oak, TX"
      h1="Phone Repair in Red Oak, TX"
      quickAnswer={
        <>
          CPRNME helps Red Oak-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Red Oak sits along the I-35E growth corridor"
      localContext={
        <p>
          Red Oak is one of the smaller, faster-growing cities along the
          I-35E corridor south of Dallas, between Ovilla and Waxahachie in
          northern Ellis County. Much of its growth has come recently, so
          it&rsquo;s a mix of newer subdivisions and a smaller original
          town core, with availability that can vary by ZIP code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Red Oak?",
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

import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Mansfield")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Mansfield, TX | CPRNME",
  description:
    "Find the right phone repair in Mansfield — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/mansfield",
});

export default function MansfieldLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Mansfield, TX"
      h1="Phone Repair in Mansfield, TX"
      quickAnswer={
        <>
          CPRNME helps Mansfield-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Mansfield sits south of Arlington"
      localContext={
        <p>
          Mansfield has grown substantially over the past couple of
          decades, extending south from the Arlington area with a mix of
          newer residential development around an older historic downtown
          in Tarrant County. That growth has been spread out enough that
          repair availability can still depend on exactly where in
          Mansfield you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Mansfield?",
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

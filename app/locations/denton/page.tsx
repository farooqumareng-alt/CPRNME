import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Denton", "Denton")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Denton, TX | CPRNME",
  description:
    "Find the right phone repair in Denton — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/denton",
});

export default function DentonLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Denton, TX"
      h1="Phone Repair in Denton, TX"
      quickAnswer={
        <>
          CPRNME helps Denton-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Denton is a college town at the edge of the Metroplex"
      localContext={
        <p>
          Denton is home to both the University of North Texas and Texas
          Woman&rsquo;s University, which gives it a much larger student
          population relative to its size than most cities in this area,
          alongside a historic downtown square built around the old county
          courthouse. That mix of a dense university-area population and
          quieter surrounding neighborhoods is part of why repair options
          can vary depending on exactly where in Denton you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Denton?",
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

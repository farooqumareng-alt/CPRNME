import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Cedar Hill")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Cedar Hill, TX | CPRNME",
  description:
    "Find the right phone repair in Cedar Hill — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/cedar-hill",
});

export default function CedarHillLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Cedar Hill, TX"
      h1="Phone Repair in Cedar Hill, TX"
      quickAnswer={
        <>
          CPRNME helps Cedar Hill-area customers find the right phone
          repair. Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Cedar Hill sits among Dallas's hillier southern suburbs"
      localContext={
        <p>
          Cedar Hill is named for the noticeably hillier terrain in this
          part of the Metroplex, and it&rsquo;s home to Cedar Hill State
          Park along Joe Pool Lake on its western edge. It sits alongside
          DeSoto and Duncanville as part of the cluster of suburbs directly
          south of Dallas, with availability that can still vary by ZIP
          code.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Cedar Hill?",
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

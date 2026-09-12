import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Plano")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Plano, TX | CPRNME",
  description:
    "Find the right phone repair in Plano — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/plano",
});

export default function PlanoLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Plano, TX"
      h1="Phone Repair in Plano, TX"
      quickAnswer={
        <>
          CPRNME helps Plano-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Plano runs from corporate campuses to a historic downtown"
      localContext={
        <p>
          Plano has grown into one of the region&rsquo;s major corporate
          hubs, with large office campuses clustered around Legacy West in
          the west of the city, while historic Downtown Plano — built around
          the old railroad depot — keeps a much smaller-town feel on the
          east side. That range, from dense office parks to older
          residential streets, is part of why repair availability can differ
          depending on exactly where in Plano you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Plano?",
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

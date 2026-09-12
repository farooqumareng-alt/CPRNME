import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Mesquite", "Dallas")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Mesquite, TX | CPRNME",
  description:
    "Find the right phone repair in Mesquite — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/mesquite",
});

export default function MesquiteLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Mesquite, TX"
      h1="Phone Repair in Mesquite, TX"
      quickAnswer={
        <>
          CPRNME helps Mesquite-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Mesquite anchors the eastern side of the Dallas area"
      localContext={
        <p>
          Mesquite sits directly east of Dallas and has long been known
          regionally for the Mesquite Championship Rodeo, alongside a mix of
          established residential neighborhoods and newer development
          further from the city&rsquo;s older core. Repair availability can
          depend on exactly where in Mesquite you are, which is why we
          confirm by ZIP code rather than assuming one answer for the whole
          city.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Mesquite?",
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

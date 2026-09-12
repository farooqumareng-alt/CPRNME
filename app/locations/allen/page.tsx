import { LocationPageTemplate } from "@/components/LocationPageTemplate";
import { locationPageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";

const city = getCityRecord("Allen")!;

export const metadata = locationPageMetadata({
  city,
  title: "Phone Repair in Allen, TX | CPRNME",
  description:
    "Find the right phone repair in Allen — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
  path: "/locations/allen",
});

export default function AllenLocationPage() {
  return (
    <LocationPageTemplate
      cityLabel="Allen, TX"
      h1="Phone Repair in Allen, TX"
      quickAnswer={
        <>
          CPRNME helps Allen-area customers find the right phone repair.
          Tell us your device, the problem, and your ZIP code, and
          we&rsquo;ll show you what&rsquo;s actually available before you
          book anything.
        </>
      }
      localHeading="Allen is part of the fast-growing northern Collin County corridor"
      localContext={
        <p>
          Allen sits between McKinney and Plano along the US-75 corridor,
          and like its neighbors it has grown quickly over the past couple
          of decades — the city is probably best known regionally for its
          large, purpose-built high school football stadium. Most of the
          city is fairly recently developed, though repair availability can
          still depend on exactly where in Allen you are.
        </p>
      }
      faqs={[
        {
          question: "Does CPRNME serve every part of Allen?",
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

import { QuickAnswer } from "@/components/QuickAnswer";
import { pageMetadata } from "@/content/seo";
import { getCityRecord } from "@/content/location-eligibility";
import { getPublishDecision } from "@/content/location-publish-rule";

// Pilot location page #1 of the small, controlled set proving out the
// location-page system before it's multiplied across the DFW dataset. The
// noindex directive isn't hand-set — it's read from the same deterministic
// rule (content/location-publish-rule.ts) everything else in the geographic
// architecture uses, so this page's indexability tracks reality
// automatically instead of needing someone to remember to flip a flag.
const city = getCityRecord("Dallas", "Dallas")!;
const decision = getPublishDecision(city);

export const metadata = {
  ...pageMetadata({
    title: "Phone Repair in Dallas, TX | CPRNME",
    description:
      "Find the right phone repair in Dallas — tell us your device, the problem, and your ZIP code, and we'll show you what's available.",
    path: "/locations/dallas",
  }),
  robots: decision === "publish" ? undefined : { index: false, follow: true },
};

export default function DallasLocationPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs container">
        <ol>
          <li>
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
          </li>
          <li>
            <span aria-current="page">Dallas, TX</span>
          </li>
        </ol>
      </nav>

      <section className="page-hero container">
        <h1>Phone Repair in Dallas, TX</h1>
        <QuickAnswer>
          CPRNME helps Dallas-area customers find the right phone repair. Tell
          us your device, the problem, and your ZIP code, and we&rsquo;ll show
          you what&rsquo;s actually available before you book anything.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Dallas covers a lot of ground</h2>
        <div className="prose">
          <p>
            Dallas is the largest city in Dallas County, stretching from
            Uptown and Downtown through Oak Cliff, East Dallas, and far North
            Dallas — dozens of ZIP codes in all. Repair options can vary
            depending on exactly where you are, which is why we ask for your
            ZIP code before confirming what&rsquo;s available, rather than
            assuming one answer covers the whole city.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Repairs available</h2>
        <div className="prose">
          <p>
            <a href="/iphone-repair">iPhone Repair</a> ·{" "}
            <a href="/samsung-android-repair">Samsung / Android Repair</a> ·{" "}
            <a href="/phone-screen-repair">Screen Repair</a> ·{" "}
            <a href="/charging-port-repair">Charging Port Repair</a> ·{" "}
            <a href="/water-damage-phone-repair">Water Damage Repair</a>
          </p>
        </div>
      </section>

      <section className="section container" aria-labelledby="dallas-faq-heading">
        <h2 id="dallas-faq-heading">Common questions</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Does CPRNME serve every part of Dallas?</summary>
            <p>
              Coverage can vary by ZIP code and by the specific repair
              needed. Tell us your device, the problem, and where you are,
              and we&rsquo;ll confirm what&rsquo;s actually available before
              you book anything.
            </p>
          </details>
          <details className="faq-item">
            <summary>Do I need to bring my phone somewhere?</summary>
            <p>
              That depends on what&rsquo;s available in your specific area —
              see <a href="/#how-it-works">How It Works</a> for the general
              process.
            </p>
          </details>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/#find-repair" className="btn btn-primary">
          Find My Repair
        </a>
      </section>
    </>
  );
}

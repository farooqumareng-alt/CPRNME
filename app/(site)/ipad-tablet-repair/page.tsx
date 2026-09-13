import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { ServiceSchema } from "@/components/ServiceSchema";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "iPad & Tablet Repair | CPRNME",
  description:
    "Screen, battery, and charging problems on iPad and other tablets — what's different from repairing a phone.",
  path: "/ipad-tablet-repair",
});

export default function IpadTabletRepairPage() {
  return (
    <>
      <ServiceSchema
        name="iPad & Tablet Repair"
        description="Screen, battery, and charging repair for iPad and other tablets."
        path="/ipad-tablet-repair"
      />
      <div className="container">
        <Breadcrumbs slug="ipad-tablet-repair" />
      </div>

      <section className="page-hero container">
        <h1>iPad &amp; Tablet Repair</h1>
        <QuickAnswer>
          Tablet repair covers the same categories as phone repair — screen,
          battery, charging — but the larger glass and battery mean the repair
          itself is a bigger job than the equivalent phone repair.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>What&rsquo;s different from a phone repair</h2>
        <div className="prose">
          <p>
            A tablet&rsquo;s screen is larger and, on most models, glued down
            more extensively than a phone&rsquo;s — cracked tablet glass is
            more likely to have shifted or lifted at the edges than a cracked
            phone screen, which can affect dust and water resistance even
            after a repair. It&rsquo;s worth asking about when you request
            service.
          </p>
          <p>
            See <a href="/phone-screen-repair">Phone Screen Repair</a> for the
            parts of screen repair that are the same across devices.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Before you request a repair</h2>
        <div className="prose">
          <ul>
            <li>Back up the tablet if it still turns on</li>
            <li>Remove any case or keyboard attachment</li>
            <li>Note the exact model — generation matters more for tablets than it does for most phones</li>
          </ul>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?device=tablet#find-repair" className="btn btn-primary">
          Find My Tablet Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="ipad-tablet-repair" />
      </div>
    </>
  );
}

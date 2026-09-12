import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "Phone Screen Repair | CPRNME",
  description:
    "What screen repair involves across phone brands, and where the process actually differs by device.",
  path: "/phone-screen-repair",
});

export default function PhoneScreenRepairPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="phone-screen-repair" />
      </div>

      <section className="page-hero container">
        <h1>Phone Screen Repair</h1>
        <QuickAnswer>
          Screen repair works the same way in principle across phones —
          replacing a damaged display assembly — but the exact process, parts,
          and considerations differ by brand and model.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>What&rsquo;s true across almost every phone</h2>
        <div className="prose">
          <p>
            On most phones made in the last several years, the front glass is
            fused to the display panel beneath it. That means a cracked corner
            or a spiderweb crack almost never gets fixed by replacing &ldquo;just
            the glass&rdquo; — the repair replaces the full display assembly,
            glass and all. If a screen looks fine but touch doesn&rsquo;t
            register somewhere, that&rsquo;s usually the digitizer layer
            failing, and it points to the same repair.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Where it differs by device</h2>
        <div className="prose">
          <p>
            Screen replacements on iPhones can involve reprogramming
            display-specific settings (True Tone, brightness calibration) that
            are matched to the individual phone at the factory — see{" "}
            <a href="/iphone-screen-repair">iPhone Screen Repair</a> for the
            specifics. Android manufacturers vary more from model to model in
            how the display is assembled and how repairable it is — see{" "}
            <a href="/samsung-android-repair">Samsung / Android Repair</a> for
            what applies today; model-specific screen guidance for Android is
            coming next.
          </p>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/#find-repair" className="btn btn-primary">
          Find My Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="phone-screen-repair" />
      </div>
    </>
  );
}

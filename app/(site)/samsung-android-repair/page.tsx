import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { ServiceSchema } from "@/components/ServiceSchema";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "Samsung / Android Repair | CPRNME",
  description:
    "Screen, battery, charging, and water damage problems on Samsung and other Android phones — what each usually means.",
  path: "/samsung-android-repair",
});

export default function SamsungAndroidRepairPage() {
  return (
    <>
      <ServiceSchema
        name="Samsung / Android Repair"
        description="Screen, battery, charging, and water damage repair for Samsung and other Android phones."
        path="/samsung-android-repair"
      />
      <div className="container">
        <Breadcrumbs slug="samsung-android-repair" />
      </div>

      <section className="page-hero container">
        <h1>Samsung / Android Repair</h1>
        <QuickAnswer>
          Android covers a lot of different manufacturers and designs, so
          &ldquo;Android repair&rdquo; is broader than an iPhone repair — but
          most problems still sort into the same few categories: screen,
          battery, charging, and water damage.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Common Android problems</h2>
        <div className="prose">
          <p>
            <strong>Cracked or unresponsive screen.</strong> See{" "}
            <a href="/phone-screen-repair">Phone Screen Repair</a> for what
            applies across brands — we&rsquo;re building out Samsung- and
            model-specific detail next.
          </p>
          <p>
            <strong>Battery draining fast or shutting down early.</strong> Most
            Android phones show a battery-health estimate somewhere in
            Settings (the exact location varies by manufacturer), which is
            worth checking before assuming a replacement is needed.
          </p>
          <p>
            <strong>Charging port not connecting reliably.</strong> See{" "}
            <a href="/charging-port-repair">Charging Port Repair</a> — often
            debris in the port rather than a hardware failure.
          </p>
          <p>
            <strong>Water exposure.</strong> See{" "}
            <a href="/water-damage-phone-repair">Water Damage Phone Repair</a>{" "}
            for what to do in the first few minutes — it matters more than the
            phone&rsquo;s brand.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Before you request a repair</h2>
        <div className="prose">
          <ul>
            <li>Back up your phone (most Android phones back up to a Google account) if it still turns on</li>
            <li>Remove any case</li>
            <li>Note your exact make and model — parts and repair steps vary more across Android manufacturers than across iPhone generations</li>
          </ul>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?device=android#find-repair" className="btn btn-primary">
          Find My Android Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="samsung-android-repair" />
      </div>
    </>
  );
}

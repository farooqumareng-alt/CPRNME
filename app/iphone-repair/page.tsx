import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "iPhone Repair | CPRNME",
  description:
    "Screen, battery, charging, and water damage repair for iPhone — what each problem usually means and how to get the right fix.",
  path: "/iphone-repair",
});

export default function IPhoneRepairPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="iphone-repair" />
      </div>

      <section className="page-hero container">
        <h1>iPhone Repair</h1>
        <QuickAnswer>
          Most iPhone problems fall into a few categories — screen, battery,
          charging, or water exposure. Tell us your model and what&rsquo;s
          happening, and we&rsquo;ll match it to the right kind of repair.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Common iPhone problems</h2>
        <div className="prose">
          <p>
            <strong>Cracked or unresponsive screen.</strong> The most requested
            iPhone repair. See{" "}
            <a href="/iphone-screen-repair">iPhone Screen Repair</a> for what&rsquo;s
            actually involved.
          </p>
          <p>
            <strong>Battery draining fast or shutting down early.</strong> Often
            fixed with a battery replacement — see{" "}
            <a href="/iphone-battery-replacement">iPhone Battery Replacement</a>{" "}
            for how to check whether that&rsquo;s really the cause.
          </p>
          <p>
            <strong>Charging port not connecting reliably.</strong> See{" "}
            <a href="/charging-port-repair">Charging Port Repair</a> — frequently
            lint or debris rather than a hardware failure.
          </p>
          <p>
            <strong>Water exposure.</strong> See{" "}
            <a href="/water-damage-phone-repair">Water Damage Phone Repair</a>{" "}
            for what to do right away — it matters more than almost anything
            else.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Before you request a repair</h2>
        <div className="prose">
          <ul>
            <li>Back up your phone (iCloud or a computer) if it still turns on</li>
            <li>Remove any case or screen protector</li>
            <li>
              Know your Apple ID sign-in — some repairs (especially screen
              replacements) can prompt a sign-in check
            </li>
            <li>Note your exact model — repair options can vary by model</li>
          </ul>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?device=iphone#find-repair" className="btn btn-primary">
          Find My iPhone Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="iphone-repair" />
      </div>
    </>
  );
}

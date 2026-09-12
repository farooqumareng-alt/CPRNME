import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "iPhone Screen Repair | CPRNME",
  description:
    "What a cracked, unresponsive, or discolored iPhone screen usually means, and what to know before getting it repaired.",
  path: "/iphone-screen-repair",
});

export default function IPhoneScreenRepairPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="iphone-screen-repair" />
      </div>

      <section className="page-hero container">
        <h1>iPhone Screen Repair</h1>
        <QuickAnswer>
          A cracked or unresponsive iPhone screen is almost always a full
          display-assembly replacement, not a glass-only fix — tell us your
          model and what you&rsquo;re seeing, and we&rsquo;ll confirm the exact
          repair.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Why it&rsquo;s usually the &ldquo;whole screen,&rdquo; not just glass</h2>
        <div className="prose">
          <p>
            On every iPhone still in common use, the front glass is fused to
            the display underneath it. A crack in the glass can&rsquo;t be
            peeled off and replaced on its own — the repair replaces the full
            display assembly (glass, display, and touch sensor together).
            &ldquo;Screen repair&rdquo; and &ldquo;glass repair&rdquo; end up
            meaning the same thing in practice.
          </p>
          <p>
            One thing worth knowing going in: iPhone displays are
            serial-matched to the phone at the factory. After a screen
            replacement, some models can show a one-time &ldquo;Unable to
            verify this iPhone has a genuine Apple display&rdquo; notice in
            Settings, or lose True Tone / auto-brightness unless it&rsquo;s
            reprogrammed during the repair. It&rsquo;s a real quirk of how
            iPhones are built, not a sign the repair was done wrong — but it&rsquo;s
            worth asking about when you request service.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Common symptoms</h2>
        <div className="prose">
          <ul>
            <li>Spiderweb or corner cracks in the glass</li>
            <li>Touch not registering in part of the screen, or registering when nothing touched it</li>
            <li>Dim, flickering, or discolored patches</li>
            <li>Lines running across the display</li>
            <li>Screen that&rsquo;s completely black but the phone still makes sounds or vibrates</li>
          </ul>
        </div>
      </section>

      <section className="section container">
        <h2>Before your repair</h2>
        <div className="prose">
          <ul>
            <li>Back up your phone if it still responds at all</li>
            <li>Note whether Face ID still works — it&rsquo;s useful diagnostic information</li>
            <li>Remove your case; a screen protector will need to come off either way</li>
          </ul>
          <p>
            On cost: it depends on the model and exact damage, so we don&rsquo;t
            quote a number here — tell us your model and we&rsquo;ll give you an
            exact price before anything is scheduled.
          </p>
        </div>
      </section>

      <section className="section container" aria-labelledby="isr-faq-heading">
        <h2 id="isr-faq-heading">Questions about screen repair</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Can the screen be repaired if touch still half-works?</summary>
            <p>
              Yes — partial touch failure is one of the more common symptoms and
              doesn&rsquo;t change the repair itself. It&rsquo;s still a full
              display-assembly replacement.
            </p>
          </details>
          <details className="faq-item">
            <summary>Will I lose my data?</summary>
            <p>
              A screen replacement doesn&rsquo;t touch your storage, but any
              repair carries some risk, so backing up first (via iCloud or a
              computer) is worth doing whenever the phone can still connect to
              Wi-Fi.
            </p>
          </details>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?device=iphone&amp;problem=screen#find-repair" className="btn btn-primary">
          Find My iPhone Screen Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="iphone-screen-repair" />
      </div>
    </>
  );
}

import { Suspense } from "react";
import { ProblemSelector } from "@/components/ProblemSelector";
import { pageMetadata } from "@/content/seo";
import { businessInfo } from "@/content/business-info";

export const metadata = pageMetadata({
  title: `CPRNME — ${businessInfo.fullName}`,
  description:
    "Tell us your device and what's wrong with it, and CPRNME will help you find the right phone repair.",
  path: "/",
});

// Static fallback for the Suspense boundary below — visually identical to
// ProblemSelector's own unselected first step, so there's nothing to flash
// past while the client component hydrates and reads ?device=/?problem=.
function ProblemSelectorFallback() {
  return (
    <div className="selector">
      <div className="selector-step">
        <h3>1. What device do you have?</h3>
        <div className="chip-row">
          <span className="chip">iPhone</span>
          <span className="chip">Samsung / Android</span>
          <span className="chip">iPad / Tablet</span>
          <span className="chip">Something else</span>
        </div>
      </div>
    </div>
  );
}

// Phase 3 homepage. Content follows the Architecture Plan (Section 8) with
// Phase 2's corrections applied:
//   - neutral positioning, no service-model claim baked in (correction #2)
//   - device -> problem is framed as the first step, not the whole process
//     (correction #3)
//   - no same-day / pricing / warranty / service-area claims anywhere
//     (correction #5)
//   - a decision-support section ("repair or replace") instead of pushing
//     straight to booking (correction #8)
//   - the CPRNME -> FixVise handoff is described functionally in "How it
//     works" without naming FixVise or asserting a legal relationship
//     (correction #7 — wording still pending your confirmation)
export default function HomePage() {
  return (
    <>
      <section className="hero container">
        <h1>{businessInfo.fullName}</h1>
        <p className="hero-tagline">
          Tell us about your phone, and we&rsquo;ll help you find the right repair
          — and the clearest way to get it done.
        </p>
        <div className="btn-row">
          <a href="#find-repair" className="btn btn-primary">
            Find My Repair
          </a>
          <a href="#how-it-works" className="btn btn-secondary">
            How It Works
          </a>
        </div>
      </section>

      <section id="find-repair" className="section container" aria-labelledby="find-repair-heading">
        <h2 id="find-repair-heading">Find your repair</h2>
        <p className="section-lede">Two quick questions — no account, no commitment.</p>
        <Suspense fallback={<ProblemSelectorFallback />}>
          <ProblemSelector />
        </Suspense>
      </section>

      <section id="how-it-works" className="section container" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading">How it works</h2>
        <ol className="steps-list">
          <li>
            <strong>Tell us your device and the problem.</strong> Two questions —
            that&rsquo;s the whole first step.
          </li>
          <li>
            <strong>We match it to the right kind of repair.</strong> Not every
            cracked screen or dead charging port needs the same fix.
          </li>
          <li>
            <strong>You&rsquo;re connected to complete the details.</strong> Location
            and scheduling happen next, through our scheduling partner.
          </li>
        </ol>
      </section>

      <section
        id="repair-or-replace"
        className="section container decision-support"
        aria-labelledby="ror-heading"
      >
        <h2 id="ror-heading">Not sure it&rsquo;s worth repairing?</h2>
        <p>
          It usually comes down to the phone&rsquo;s age, how common the problem
          is, and what the repair costs relative to keeping the phone.{" "}
          <a href="/guides/repair-vs-replace">See the full breakdown →</a>
        </p>
        <a href="#find-repair" className="btn btn-tertiary">
          Find your repair →
        </a>
      </section>

      <section id="faq" className="section container" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Common questions</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>My iPhone screen is cracked — where can I get it fixed?</summary>
            <p>
              See <a href="/iphone-screen-repair">iPhone Screen Repair</a> for what
              that usually involves, or jump straight to the selector above —
              screen damage is one of the most common repair requests.
            </p>
          </details>
          <details className="faq-item">
            <summary>Can someone repair my phone at my house?</summary>
            <p>
              That depends on what&rsquo;s available where you are. Once you tell
              us your device and the problem, the next step will show you the
              service options that actually apply to you.
            </p>
          </details>
          <details className="faq-item">
            <summary>My phone won&rsquo;t charge — is it the cable or the port?</summary>
            <p>
              Often it&rsquo;s the port, especially with lint or debris buildup —
              but a worn cable or an aging battery can look identical from the
              outside. That&rsquo;s exactly the kind of thing worth having
              assessed rather than guessed at.
            </p>
          </details>
          <details className="faq-item">
            <summary>Is my phone worth repairing?</summary>
            <p>
              See the <a href="/guides/repair-vs-replace">Repair vs. Replace guide</a>{" "}
              — it&rsquo;s rarely a fixed rule, but a few factors make the answer
              clearer.
            </p>
          </details>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="#find-repair" className="btn btn-primary">
          Find My Repair
        </a>
      </section>
    </>
  );
}

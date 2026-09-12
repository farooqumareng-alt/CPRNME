import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";

export const metadata: Metadata = {
  title: "Repair vs. Replace | CPRNME",
  description:
    "What actually determines whether fixing your phone is worth it, versus putting that money toward a new one.",
  alternates: { canonical: "/guides/repair-vs-replace" },
};

export default function RepairVsReplacePage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="guides/repair-vs-replace" />
      </div>

      <section className="page-hero container">
        <h1>Repair vs. Replace: Is Your Phone Worth Fixing?</h1>
        <QuickAnswer>
          It usually comes down to three things: how much life the phone has
          left, how common and well-understood the problem is, and what the
          repair costs relative to keeping the phone another year or two.
          There&rsquo;s no fixed rule that applies to every phone.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>How much life the phone has left</h2>
        <div className="prose">
          <p>
            A phone that&rsquo;s still receiving software updates from its
            manufacturer has real runway left, regardless of its age in years.
            One that&rsquo;s already lost update support is closer to the end
            of its useful life no matter what gets repaired — in that case, a
            repair mainly buys a few more months rather than a few more years.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>How common the problem is</h2>
        <div className="prose">
          <p>
            Some problems are extremely well understood and reliably fixable —
            a cracked screen is the clearest example; it&rsquo;s a known part,
            a known process, and a predictable outcome. Less common problems
            (certain water-damage cases, some motherboard-level issues) carry
            more uncertainty: the repair might not fully resolve everything,
            or something else might surface afterward. The more unusual the
            problem, the more that uncertainty belongs in the decision.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Cost relative to value</h2>
        <div className="prose">
          <p>
            The comparison that actually matters isn&rsquo;t &ldquo;repair cost
            vs. phone&rsquo;s original price&rdquo; — it&rsquo;s repair cost vs.
            what another year or two of using this specific phone is worth to
            you. A relatively expensive repair on a phone you plan to keep for
            years can still be the better deal than replacing it; a cheap
            repair on a phone you were already planning to upgrade soon might
            not be worth doing at all.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>A simple way to think about it</h2>
        <div className="prose">
          <p>
            If the problem is common and well understood, the phone still gets
            software updates, and you weren&rsquo;t already planning to
            replace it — repair is usually the better call. If two or more of
            those aren&rsquo;t true, it&rsquo;s worth getting an exact repair
            price before deciding, so you&rsquo;re comparing real numbers
            instead of guessing.
          </p>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Want to find the right repair?</h2>
        <a href="/#find-repair" className="btn btn-primary">
          Find My Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="guides/repair-vs-replace" />
      </div>
    </>
  );
}

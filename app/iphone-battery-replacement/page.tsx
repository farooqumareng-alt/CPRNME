import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";
import { ServiceSchema } from "@/components/ServiceSchema";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata({
  title: "iPhone Battery Replacement | CPRNME",
  description:
    "How to tell whether your iPhone's battery is actually the problem, and what a battery replacement involves.",
  path: "/iphone-battery-replacement",
});

export default function IPhoneBatteryReplacementPage() {
  return (
    <>
      <ServiceSchema
        name="iPhone Battery Replacement"
        description="Battery replacement for iPhones with reduced capacity, unexpected shutdowns, or fast drain."
        path="/iphone-battery-replacement"
      />
      <div className="container">
        <Breadcrumbs slug="iphone-battery-replacement" />
      </div>

      <section className="page-hero container">
        <h1>iPhone Battery Replacement</h1>
        <QuickAnswer>
          If your iPhone dies well before you expect, shuts down unexpectedly at
          10&ndash;20%, or Battery Health shows significant wear, a battery
          replacement usually resolves it.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Check Battery Health first</h2>
        <div className="prose">
          <p>
            Go to <strong>Settings → Battery → Battery Health &amp; Charging</strong>.
            Apple considers a battery that has dropped below 80% of its
            original capacity to be significantly worn — below that point,
            reduced runtime and unexpected shutdowns under heavy use become a
            lot more likely. It&rsquo;s the single most useful number before
            deciding whether a replacement makes sense.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Battery, or something else?</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>Battery:</strong> capacity shown well below 100% in
              Battery Health, shutdowns under normal use, the phone feeling
              noticeably slower than it used to under load
            </li>
            <li>
              <strong>Charging port or cable:</strong> the phone charges slowly,
              inconsistently, or only at certain angles — that&rsquo;s usually
              a connection problem, not the battery itself
            </li>
            <li>
              <strong>Software:</strong> a sudden battery drain right after an
              update or a new app is sometimes background activity, not
              hardware — worth a restart before assuming it&rsquo;s the battery
            </li>
          </ul>
        </div>
      </section>

      <section className="section container">
        <h2>Before your repair</h2>
        <div className="prose">
          <p>
            A battery replacement doesn&rsquo;t touch your storage, so data
            loss isn&rsquo;t a typical concern the way it can be with a screen
            repair. If your phone is several years old, it&rsquo;s worth a
            quick look at{" "}
            <a href="/guides/repair-vs-replace">Repair vs. Replace</a> before
            booking — sometimes a battery is the right fix, sometimes it&rsquo;s
            not, and that depends on more than just the battery.
          </p>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?device=iphone&amp;problem=battery#find-repair" className="btn btn-primary">
          Find My iPhone Battery Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="iphone-battery-replacement" />
      </div>
    </>
  );
}

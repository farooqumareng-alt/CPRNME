import type { ReactNode } from "react";
import { QuickAnswer } from "@/components/QuickAnswer";

// The shared technical/structural template Dallas and Fort Worth proved
// out — extracted so the next 9 cities reuse the *pattern*, not prose.
// Every prop below is bespoke per city; nothing here fills in a sentence
// template with a city name swapped in. Per the approved two-layer model:
// this component only lays out content — it has no opinion on whether the
// page should be indexable, that's decided by the caller (see
// content/seo.ts's locationPageMetadata) from the dataset-driven publish
// rule, never from anything written here.
export type LocationFaq = { question: string; answer: ReactNode };

export function LocationPageTemplate({
  cityLabel,
  h1,
  quickAnswer,
  localHeading,
  localContext,
  faqs,
}: {
  cityLabel: string; // e.g. "Dallas, TX" — used in the breadcrumb
  h1: string; // e.g. "Phone Repair in Dallas, TX"
  quickAnswer: ReactNode;
  localHeading: string; // e.g. "Dallas covers a lot of ground"
  localContext: ReactNode; // the bespoke, verified local paragraph(s)
  faqs: LocationFaq[];
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs container">
        <ol>
          <li>
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
          </li>
          <li>
            <span aria-current="page">{cityLabel}</span>
          </li>
        </ol>
      </nav>

      <section className="page-hero container">
        <h1>{h1}</h1>
        <QuickAnswer>{quickAnswer}</QuickAnswer>
      </section>

      <section className="section container">
        <h2>{localHeading}</h2>
        <div className="prose">{localContext}</div>
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

      <section className="section container" aria-labelledby="location-faq-heading">
        <h2 id="location-faq-heading">Common questions</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details className="faq-item" key={i}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
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

import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";

export const metadata: Metadata = {
  title: "Charging Port Repair | CPRNME",
  description:
    "Why phones stop charging reliably, how to tell it's the port and not the cable or battery, and what charging port repair involves.",
  alternates: { canonical: "/charging-port-repair" },
};

export default function ChargingPortRepairPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="charging-port-repair" />
      </div>

      <section className="page-hero container">
        <h1>Charging Port Repair</h1>
        <QuickAnswer>
          A phone that charges slowly, intermittently, or only at certain
          cable angles is usually a port problem — often debris, sometimes a
          worn connector — and it&rsquo;s one of the more straightforward
          phone repairs.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Port, cable, or battery?</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>Port:</strong> charging works only at a specific angle,
              stops if the phone is nudged, or a cable feels loose going in —
              often lint or debris built up inside the port
            </li>
            <li>
              <strong>Cable or adapter:</strong> a different cable or charger
              fixes it entirely — the port and phone are fine
            </li>
            <li>
              <strong>Battery:</strong> the phone charges normally but drains
              unusually fast afterward — that&rsquo;s a battery question, not
              a charging-port one
            </li>
          </ul>
          <p>
            The single fastest check: try a different cable and a different
            wall adapter before assuming it&rsquo;s the phone. A flashlight
            can also show obvious lint in the port — but don&rsquo;t try to
            dig it out with anything metal, which can bend the contacts
            inside.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>What the repair involves</h2>
        <div className="prose">
          <p>
            When it is the port, the fix is either a thorough cleaning or a
            port replacement, depending on whether the connector itself is
            damaged. It&rsquo;s a quick, well-understood repair on most
            phones — there&rsquo;s no general reason to put it off, since a
            failing port tends to get less reliable rather than more.
          </p>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?problem=charging#find-repair" className="btn btn-primary">
          Find My Charging Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="charging-port-repair" />
      </div>
    </>
  );
}

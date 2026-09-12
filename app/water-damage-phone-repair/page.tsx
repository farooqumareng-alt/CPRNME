import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedRepairs } from "@/components/RelatedRepairs";
import { QuickAnswer } from "@/components/QuickAnswer";

export const metadata: Metadata = {
  title: "Water Damage Phone Repair | CPRNME",
  description:
    "What to do in the first few minutes after a phone gets wet, and what determines whether it can be repaired.",
  alternates: { canonical: "/water-damage-phone-repair" },
};

export default function WaterDamagePhoneRepairPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs slug="water-damage-phone-repair" />
      </div>

      <section className="page-hero container">
        <h1>Water Damage Phone Repair</h1>
        <QuickAnswer>
          What you do in the first few minutes matters more than almost
          anything else — power it off, don&rsquo;t charge it, and don&rsquo;t
          put it in rice. What happens after that determines whether it can be
          repaired.
        </QuickAnswer>
      </section>

      <section className="section container">
        <h2>Right away</h2>
        <div className="prose">
          <ul>
            <li>Power the phone off if it isn&rsquo;t already — a short caused by water is the main thing that turns "wet" into "damaged"</li>
            <li>Don&rsquo;t plug it in to charge, and don&rsquo;t press the power button repeatedly to test it</li>
            <li>Dry the outside gently — don&rsquo;t shake it, which can push water further in</li>
            <li>Skip the rice. It&rsquo;s a widely repeated fix that does very little; rice dust can also get into the ports</li>
          </ul>
        </div>
      </section>

      <section className="section container">
        <h2>What actually determines the outcome</h2>
        <div className="prose">
          <p>
            Three things matter most: how long the phone was in the water,
            whether it was on or off when it happened, and how quickly it was
            powered down afterward. Fresh water and a quick response give the
            best odds. Saltwater, or a phone that was left on and charging
            while wet, are the harder cases — corrosion sets in faster than
            most people expect, sometimes within hours.
          </p>
          <p>
            There&rsquo;s no way to know for certain a phone is fine just
            because it turns back on — corrosion can show up days later. A
            proper inspection and cleaning is worth doing even if the phone
            seems to be working.
          </p>
        </div>
      </section>

      <section className="section container final-cta">
        <h2>Ready to find your repair?</h2>
        <a href="/?problem=water#find-repair" className="btn btn-primary">
          Find My Water Damage Repair
        </a>
      </section>

      <div className="container">
        <RelatedRepairs slug="water-damage-phone-repair" />
      </div>
    </>
  );
}

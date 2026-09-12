// Confirmed real-world business facts, in one place — the counterpart to
// repair-graph.ts (which governs content structure) for the facts that
// govern metadata, schema, and contact info. Nothing in this file may be
// invented: every field here was explicitly confirmed, and anything not yet
// confirmed stays `null` rather than a guess.
//
// Fulfillment is modeled as a list on purpose: CPRNME is the discovery/
// matching brand, FixVise is today's fulfillment provider, but the brief is
// explicit that CPRNME's architecture must stay provider-agnostic so another
// repair provider can be added later without rewriting copy sitewide. Add a
// provider here; the one place that credits one (the footer) reads from
// this list instead of hardcoding a name.
//
// Per direction: the provider's brand name isn't used in site copy at all —
// only a small "Powered by <domain>" credit, so `domain` is what actually
// renders. `name` is kept for code comments/internal clarity only.

export type FulfillmentProvider = {
  name: string;
  domain: string; // what actually renders, e.g. "fixvise.com"
};

export const businessInfo = {
  brandName: "CPRNME",
  fullName: "Cell Phone Repair Near Me",

  // www, not apex: cprnme.com (apex) 308-redirects to www.cprnme.com, which
  // is where the site actually serves from. Canonical/sitemap/schema URLs
  // need to point at the final serving URL, not one that itself redirects —
  // found during the Phase 7 technical audit (every URL in the site was
  // pointing at the apex, one redirect hop away from where it's actually
  // served).
  siteUrl: "https://www.cprnme.com",
  domain: "cprnme.com", // human-readable form, e.g. for future display — not used to build URLs

  phone: {
    display: "(979) 766-9228",
    e164: "+19797669228",
  },

  // Confirmed: 12 Texas counties (see content/dfw-territory.ts for the full
  // county -> city -> ZIP dataset, sourced from real geographic data, not
  // hand-typed). Framing note, worth getting right in copy: as of OMB
  // Bulletin 23-01 (July 2023), the official Dallas-Fort Worth-Arlington
  // MSA is 11 counties and no longer includes Hood County. CPRNME's
  // territory deliberately keeps Hood in, so call this "the DFW area" or
  // "North Texas" in customer-facing copy — not "the DFW MSA," which would
  // now be technically wrong given Hood's inclusion.
  //
  // This is the taxonomy only. No location pages, nav entries, sitemap
  // coverage, or areaServed schema are built from it yet — that's
  // deliberately separate, later work (see the Phase 7 discussion), and it
  // has to reckon with a fact this dataset can't answer: geographic
  // presence in a county isn't the same as a provider actually being able
  // to fulfill a repair there.
  serviceRegion: {
    label: "DFW area",
    counties: ["Collin", "Dallas", "Denton", "Ellis", "Hunt", "Kaufman", "Rockwall", "Tarrant", "Johnson", "Parker", "Hood", "Wise"],
  },

  fulfillmentProviders: [
    { name: "FixVise", domain: "fixvise.com" },
  ] satisfies FulfillmentProvider[],
};

// A minimal "Powered by <domain>" credit — no provider brand name, no
// description of the relationship, just the domain. Returns null when that
// wouldn't be unambiguous (no provider yet, or more than one — a footer
// credit line isn't the place to start listing multiple partners).
export function getFulfillmentCredit(): { text: string; href: string } | null {
  const providers = businessInfo.fulfillmentProviders;
  if (providers.length !== 1) return null;
  const domain = providers[0].domain;
  return { text: `Powered by ${domain}`, href: `https://${domain}` };
}

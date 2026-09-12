// CPRNME's geography (content/dfw-territory.ts) answers "where might a
// customer be, that CPRNME can meaningfully talk to." This file answers a
// different question — "can a repair actually happen there today" — and
// keeps that answer separate on purpose, per explicit direction: CPRNME
// having a county/city/ZIP on record must never be read as "a provider
// covers it." A ZIP existing in the territory dataset and a ZIP being
// serviceable are two different facts, and only one of them is confirmed
// today.
//
// Nothing here is populated yet, because no real, confirmed provider
// coverage data exists — every location resolves as "unconfirmed" until it
// does. That's the honest default, not a placeholder to fill in casually.
// When real coverage data exists (from FixVise, or a future second
// provider), it plugs in here — nothing else in the codebase needs to
// change shape, because everything else already treats "unconfirmed" as
// the only allowed answer.

export type CoverageStatus = "confirmed" | "unconfirmed";

export function getCoverageStatus(_zip: string): CoverageStatus {
  return "unconfirmed";
}

export function isConfirmedForService(zip: string): boolean {
  return getCoverageStatus(zip) === "confirmed";
}

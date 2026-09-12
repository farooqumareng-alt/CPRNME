// CPRNME's geography (content/dfw-territory.ts) answers "where might a
// customer be, that CPRNME can meaningfully talk to." This file answers a
// different question — "can a repair actually happen there today" — and
// keeps that answer separate on purpose, per explicit direction: CPRNME
// having a county/city/ZIP on record must never be read as "a provider
// covers it" *automatically*.
//
// CONFIRMED: coverage is now live across the full 12-county DFW territory
// dataset — a real, explicit business decision, not an assumption. So
// "confirmed" is defined as "this ZIP is in the verified territory
// dataset" — still a real check against real data, not a blanket `true`.
// A ZIP outside the 12 counties (or a bad/unknown ZIP) correctly still
// resolves as unconfirmed. If coverage is ever scoped back down to specific
// ZIPs, this is the one function that changes — nothing else does.

import { isZipInTerritory } from "./dfw-territory";

export type CoverageStatus = "confirmed" | "unconfirmed";

export function getCoverageStatus(zip: string): CoverageStatus {
  return isZipInTerritory(zip) ? "confirmed" : "unconfirmed";
}

export function isConfirmedForService(zip: string): boolean {
  return getCoverageStatus(zip) === "confirmed";
}

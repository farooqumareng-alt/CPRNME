// The content-quality gate for location pages, established before any get
// built — the geographic equivalent of the device x problem checkpoint
// from Phase 5. A city or ZIP existing in the territory dataset is never
// sufficient reason to publish a page for it.
//
// Population is used as the eligibility signal because it's the one real,
// sourced number in the dataset (see dfw-territory.data.ts's header for
// provenance) — not a guess, and not search-volume data CPRNME doesn't
// have. It's summed across each city's ZIPs, which is an approximation of
// a city's population, not an official Census figure — good enough to rank
// relative size, not precise enough to publish as a stated fact anywhere.
//
// Eligibility here is necessary, not sufficient: a Tier 1/2 city still
// needs genuine, unique local content before a page ships — the same
// Section 20 quality gate ("would this still be useful if Google
// disappeared?") applies to a location page exactly as it does to a
// service page. This module answers "is it even worth trying," not
// "publish this."
//
// CORRECTED after the Phase 9 Tier-2 review: tiering is computed by real
// city identity, merged across every county a city's ZIPs fall into — not
// per county-fragment. The original version tiered "Frisco (Denton)" and
// "Frisco (Collin)" as two separate ~50-70k cities; merged, Frisco is one
// ~120k city and genuinely Tier 1. Same for Carrollton. A city is one
// place regardless of which county line happens to run through it.

import { dfwTerritoryData, type TerritoryZip } from "./dfw-territory.data";

export type LocationTier = 1 | 2 | 3;

// Tier 1: flagship cities — build first, once Phase 9 is authorized.
// Tier 2: strong candidates — build once the Tier 1 pattern is proven out,
//   same discipline as the Android/iPad pages pausing after Phase 5.
// Tier 3: real communities, kept in the dataset for ZIP lookup and future
//   provider matching, but not populous enough to support a genuinely
//   distinct page — publishing one anyway is the thin-page pattern this
//   whole project has ruled out from the start.
const TIER_1_MIN_POPULATION = 100_000;
const TIER_2_MIN_POPULATION = 30_000;

export type CityRecord = {
  name: string;
  counties: string[]; // every county this city's ZIPs fall under, largest share first
  population: number; // summed across all counties
  zipCount: number;
  tier: LocationTier;
  zips: TerritoryZip[]; // combined across all counties — used by the coverage check
};

export function getAllCityRecords(): CityRecord[] {
  const byName = new Map<string, { counties: { county: string; population: number }[]; population: number; zips: TerritoryZip[] }>();

  for (const county of dfwTerritoryData) {
    for (const city of county.cities) {
      const population = city.zips.reduce((sum, z) => sum + z.population, 0);
      const cur = byName.get(city.name) ?? { counties: [], population: 0, zips: [] };
      cur.counties.push({ county: county.county, population });
      cur.population += population;
      cur.zips.push(...city.zips);
      byName.set(city.name, cur);
    }
  }

  const records: CityRecord[] = [];
  for (const [name, v] of byName) {
    const counties = v.counties.sort((a, b) => b.population - a.population).map((c) => c.county);
    records.push({
      name,
      counties,
      population: v.population,
      zipCount: v.zips.length,
      tier: v.population >= TIER_1_MIN_POPULATION ? 1 : v.population >= TIER_2_MIN_POPULATION ? 2 : 3,
      zips: v.zips,
    });
  }
  return records.sort((a, b) => b.population - a.population);
}

export function getCityRecord(name: string): CityRecord | undefined {
  return getAllCityRecords().find((c) => c.name === name);
}

export function getEligibleForDedicatedPage(): CityRecord[] {
  return getAllCityRecords().filter((c) => c.tier <= 2);
}

export function getTier3Communities(): CityRecord[] {
  return getAllCityRecords().filter((c) => c.tier === 3);
}

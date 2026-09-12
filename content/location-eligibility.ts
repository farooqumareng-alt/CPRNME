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

import { dfwTerritoryData } from "./dfw-territory.data";

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
  county: string;
  population: number;
  zipCount: number;
  tier: LocationTier;
};

export function getAllCityRecords(): CityRecord[] {
  const records: CityRecord[] = [];
  for (const county of dfwTerritoryData) {
    for (const city of county.cities) {
      const population = city.zips.reduce((sum, z) => sum + z.population, 0);
      records.push({
        name: city.name,
        county: county.county,
        population,
        zipCount: city.zips.length,
        tier: population >= TIER_1_MIN_POPULATION ? 1 : population >= TIER_2_MIN_POPULATION ? 2 : 3,
      });
    }
  }
  return records.sort((a, b) => b.population - a.population);
}

export function getEligibleForDedicatedPage(): CityRecord[] {
  return getAllCityRecords().filter((c) => c.tier <= 2);
}

export function getTier3Communities(): CityRecord[] {
  return getAllCityRecords().filter((c) => c.tier === 3);
}

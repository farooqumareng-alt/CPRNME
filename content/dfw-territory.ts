// The lookup API over the generated dataset in dfw-territory.data.ts. Page
// generation, areaServed schema, "do you serve my area" lookups, and future
// provider matching should all go through these functions rather than
// reading dfwTerritoryData directly — so if the data source ever changes
// (e.g. a paid USPS feed replacing the free one), only this file's
// internals need to change, not every caller.
//
// Deliberately NOT built yet, on purpose (see the Phase 7 discussion this
// shipped alongside): location pages, nav entries, sitemap coverage, or any
// areaServed / LocalBusiness schema using this data. This module exists so
// that work can start from real, structured data instead of a hand-typed
// city list, whenever it's authorized.
import { dfwTerritoryData, type TerritoryCity, type TerritoryZip } from "./dfw-territory.data";

export { dfwTerritoryData };
export type { TerritoryCounty, TerritoryCity, TerritoryZip } from "./dfw-territory.data";

export function getCounties(): string[] {
  return dfwTerritoryData.map((c) => c.county);
}

export function getCitiesInCounty(county: string): TerritoryCity[] {
  return dfwTerritoryData.find((c) => c.county === county)?.cities ?? [];
}

// Every city, flattened, with the county it belongs to — a city that spans
// county lines (e.g. Grand Prairie) appears once per county it's recorded
// under, since that's a real fact about the city, not a data bug.
export function getAllCities(): { name: string; county: string }[] {
  return dfwTerritoryData.flatMap((c) => c.cities.map((city) => ({ name: city.name, county: c.county })));
}

export function findByZip(zip: string): { zip: TerritoryZip; city: string; county: string } | undefined {
  for (const county of dfwTerritoryData) {
    for (const city of county.cities) {
      const match = city.zips.find((z) => z.zip === zip);
      if (match) return { zip: match, city: city.name, county: county.county };
    }
  }
  return undefined;
}

export function isZipInTerritory(zip: string): boolean {
  return findByZip(zip) !== undefined;
}

export function getTerritoryTotals() {
  const zipCount = dfwTerritoryData.reduce((n, c) => n + c.cities.reduce((m, city) => m + city.zips.length, 0), 0);
  const cityCount = dfwTerritoryData.reduce((n, c) => n + c.cities.length, 0);
  return { countyCount: dfwTerritoryData.length, cityCount, zipCount };
}

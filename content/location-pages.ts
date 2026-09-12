// The registry connecting a CityRecord (content/location-eligibility.ts) to
// an actual built page. Deliberately explicit rather than auto-slugified —
// a couple of names (DeSoto -> desoto, not de-soto) don't follow a
// mechanical rule, and guessing wrong here would silently 404 or silently
// drop a page from the sitemap. Every entry corresponds to a real folder
// under app/locations/.
//
// This is the one list that has to be kept in sync by hand when a new
// location page is built — everything downstream (sitemap, the /locations
// index, nav) reads from this instead of re-deriving it.

export const builtLocationSlugs: Record<string, string> = {
  // Tier 1
  Dallas: "dallas",
  "Fort Worth": "fort-worth",
  Arlington: "arlington",
  Plano: "plano",
  Garland: "garland",
  Irving: "irving",
  "Grand Prairie": "grand-prairie",
  McKinney: "mckinney",
  Mesquite: "mesquite",
  Denton: "denton",
  Frisco: "frisco",
  Carrollton: "carrollton",
  Lewisville: "lewisville",
  // Tier 2
  Richardson: "richardson",
  Keller: "keller",
  Allen: "allen",
  Weatherford: "weatherford",
  "Flower Mound": "flower-mound",
  "North Richland Hills": "north-richland-hills",
  Mansfield: "mansfield",
  Euless: "euless",
  Burleson: "burleson",
  Rockwall: "rockwall",
  Rowlett: "rowlett",
  DeSoto: "desoto",
  Wylie: "wylie",
  "The Colony": "the-colony",
  Granbury: "granbury",
  Bedford: "bedford",
  Waxahachie: "waxahachie",
  Grapevine: "grapevine",
  "Cedar Hill": "cedar-hill",
  Cleburne: "cleburne",
  Hurst: "hurst",
  Coppell: "coppell",
  Duncanville: "duncanville",
  Lancaster: "lancaster",
  "Red Oak": "red-oak",
  "Little Elm": "little-elm",
  Greenville: "greenville",
  Forney: "forney",
  "Haltom City": "haltom-city",
};

export function getBuiltLocationSlug(cityName: string): string | undefined {
  return builtLocationSlugs[cityName];
}

// The actual answer to "which location pages should be linked, sitemapped,
// and indexed today" — combines three independent facts (a page exists, the
// city is eligible, coverage is confirmed) rather than assuming any one of
// them implies the others. Import cycle note: pulls in location-eligibility
// and location-publish-rule, both of which stay free of any dependency back
// on this file.
import { getAllCityRecords, type CityRecord } from "./location-eligibility";
import { getPublishDecision } from "./location-publish-rule";

export type PublishedLocationPage = { city: CityRecord; slug: string };

export function getPublishedLocationPages(): PublishedLocationPage[] {
  const pages: PublishedLocationPage[] = [];
  for (const city of getAllCityRecords()) {
    const slug = getBuiltLocationSlug(city.name);
    if (!slug) continue; // no page built for this city yet
    if (getPublishDecision(city) !== "publish") continue; // exists-no-claim or lookup-only
    pages.push({ city, slug });
  }
  return pages.sort((a, b) => b.city.population - a.city.population);
}

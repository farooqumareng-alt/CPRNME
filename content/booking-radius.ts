// Real-time slot booking eligibility — a real, sourced, generated list,
// not hand-typed. Gates ONLY the new instant-confirm booking feature; it
// does NOT redefine CPRNME's published service territory
// (content/dfw-territory.ts still covers all 12 counties regardless, and
// every ZIP below still gets the existing admin-confirmed booking-request
// flow unchanged).
//
// Source: US Census Bureau 2024 Gazetteer Files, ZCTA national file
// (https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip),
// INTPTLAT/INTPTLONG columns (each ZCTA's Census-defined internal point).
// Center point: ZIP 76131 at (32.881821, -97.345943). Distance computed
// with the standard Haversine great-circle formula; threshold <= 75 miles,
// per direction. Of the 267 ZIPs in content/dfw-territory.data.ts, exactly
// 4 fall outside 75 miles — all small Hunt County towns on the territory's
// far eastern edge:
//
//   75428  Commerce, Hunt County    — 87.0 mi
//   75422  Campbell, Hunt County    — 84.3 mi
//   75453  Lone Oak, Hunt County    — 82.4 mi
//   75496  Wolfe City, Hunt County  — 81.2 mi
//
// Regenerate this list (not hand-edit it) if the territory, the radius, or
// the center ZIP ever changes: re-run the Haversine computation against
// every ZIP in content/dfw-territory.data.ts using the same Gazetteer
// source.
export const ZIPS_BEYOND_BOOKING_RADIUS = new Set<string>(["75428", "75422", "75453", "75496"]);

export function isEligibleForRealTimeSlots(zip: string): boolean {
  return !ZIPS_BEYOND_BOOKING_RADIUS.has(zip);
}

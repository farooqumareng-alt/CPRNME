// The deterministic rule agreed before any location page was built:
// eligibility (tier) and honesty (confirmed provider coverage) are two
// separate questions, and a page's indexability depends on both — never
// tier alone. Made explicit here as code, not left as a principle someone
// has to remember to apply correctly by hand.
//
//   Tier 1 or 2, coverage confirmed   -> publish, indexable
//   Tier 1 or 2, coverage unconfirmed -> the page can exist, but stays
//                                        noindexed and makes no service claim
//   Tier 3                            -> ZIP/location lookup only, no page ever
//
// CORRECTED: this used to hardcode Tier 2 to "future-candidate" regardless
// of coverage — accurate back when no Tier 2 pages existed yet (Phase 9),
// but wrong the moment all 29 Tier 2 pages were actually built (Phase 11).
// That's a real bug this rule shipped with: it conflated "has this tier's
// pages been built yet" with "is coverage confirmed," when those are two
// separate facts. Whether a page exists at all is content/location-pages.ts's
// job (its registry only lists cities with a real built page); this
// function now answers the coverage question alone, for any tier that can
// have a page.
//
// Today, coverage is confirmed for every ZIP in the 12-county territory
// dataset (see provider-availability.ts) — a real, explicit business
// decision, not the unconfirmed default this rule originally shipped with.

import type { CityRecord } from "./location-eligibility";
import { isConfirmedForService } from "./provider-availability";

export type PublishDecision = "publish" | "exists-no-claim" | "lookup-only";

export function getPublishDecision(city: CityRecord): PublishDecision {
  if (city.tier === 3) return "lookup-only";
  const coverageConfirmed = city.zips.some((z) => isConfirmedForService(z.zip));
  return coverageConfirmed ? "publish" : "exists-no-claim";
}

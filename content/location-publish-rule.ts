// The deterministic rule agreed before any location page was built:
// eligibility (tier) and honesty (confirmed provider coverage) are two
// separate questions, and a page's indexability depends on both — never
// tier alone. Made explicit here as code, not left as a principle someone
// has to remember to apply correctly by hand.
//
//   Tier 1 + coverage confirmed   -> publish, indexable
//   Tier 1 + coverage unconfirmed -> the page can exist, but stays
//                                    noindexed and makes no service claim
//   Tier 2                        -> future candidate, not built yet
//   Tier 3                        -> ZIP/location lookup only, no page ever
//
// Today, provider-availability.ts resolves every ZIP as "unconfirmed" (see
// its own header for why) — so every Tier 1 city currently lands on
// "exists-no-claim," including the pilot pages this rule was written for.
// That's expected, not a bug: the rule is what keeps a page from silently
// starting to claim coverage the moment tier alone would suggest it should.

import type { CityRecord } from "./location-eligibility";
import { isConfirmedForService } from "./provider-availability";

export type PublishDecision = "publish" | "exists-no-claim" | "future-candidate" | "lookup-only";

export function getPublishDecision(city: CityRecord): PublishDecision {
  if (city.tier === 3) return "lookup-only";
  const coverageConfirmed = city.zips.some((z) => isConfirmedForService(z.zip));
  if (city.tier === 1) return coverageConfirmed ? "publish" : "exists-no-claim";
  return "future-candidate"; // tier 2
}

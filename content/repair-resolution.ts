// The one place "known repair = known price, unknown cause = diagnostic
// first" is actually enforced — every other file in this taxonomy just
// supplies data this function reads. A symptom is never permanently
// labeled here; the same problem can resolve to a fixed price for one
// exact model and diagnostic for another, because eligibility and pricing
// are both keyed on the exact model, not the symptom or the repair type.
import { isFoldable } from "./device-catalog";
import { getCandidateRepairTypes, type RepairType } from "./repair-taxonomy";
import { isEligible } from "./repair-eligibility";
import { getActivePrice } from "./repair-pricing";

export type ResolutionResult =
  | { outcome: "fixed_price"; repairType: RepairType; priceCents: number }
  | { outcome: "diagnostic" };

export function resolveRepair(modelId: string | null, problemId: string): ResolutionResult {
  // No exact model — "I don't know my model," an "other" device, or a
  // model this catalog doesn't recognize. Can never be fixed-price.
  if (!modelId) {
    return { outcome: "diagnostic" };
  }

  const candidates = getCandidateRepairTypes(problemId, isFoldable(modelId));
  const eligibleCandidates = candidates.filter((rt) => isEligible(modelId, rt));

  // Zero eligible candidates, or more than one still-ambiguous eligible
  // candidate for this exact model — not confidently resolvable to a
  // single repair either way.
  if (eligibleCandidates.length !== 1) {
    return { outcome: "diagnostic" };
  }

  const repairType = eligibleCandidates[0];
  const priceCents = getActivePrice(modelId, repairType);

  // Recognized, eligible repair type — just no active approved price yet.
  // Never substitute an estimate here.
  if (priceCents === null) {
    return { outcome: "diagnostic" };
  }

  return { outcome: "fixed_price", repairType, priceCents };
}

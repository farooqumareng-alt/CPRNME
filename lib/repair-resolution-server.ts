// The server-side, database-backed successor to the old
// content/repair-resolution.ts. Same enforcement rule ("known repair =
// known price, unknown cause = diagnostic first"), now reading real
// eligibility and pricing data from Supabase instead of an empty static
// array. This must only ever be called from server code (an API route) —
// never imported into a "use client" file, since it goes through
// lib/pricing-data.ts's secret-key client.
import { isFoldable } from "@/content/device-catalog";
import { getCandidateRepairTypes, type RepairType } from "@/content/repair-taxonomy";
import { isRepairEligible, getActiveCustomerPrice } from "@/lib/pricing-data";

export type ResolutionResult =
  | { outcome: "fixed_price"; repairType: RepairType; priceCents: number }
  | { outcome: "diagnostic" };

export async function resolveRepairServer(modelId: string | null, problemId: string): Promise<ResolutionResult> {
  // No exact model — can never be fixed-price.
  if (!modelId) {
    return { outcome: "diagnostic" };
  }

  const candidates = getCandidateRepairTypes(problemId, isFoldable(modelId));
  const eligibleFlags = await Promise.all(candidates.map((rt) => isRepairEligible(modelId, rt)));
  const eligibleCandidates = candidates.filter((_, i) => eligibleFlags[i]);

  // Zero eligible candidates, or more than one still-ambiguous eligible
  // candidate for this exact model — not confidently resolvable either way.
  if (eligibleCandidates.length !== 1) {
    return { outcome: "diagnostic" };
  }

  const repairType = eligibleCandidates[0];
  const priceCents = await getActiveCustomerPrice(modelId, repairType);

  // Eligible, but no active approved price. Per direction: this MUST NOT
  // fall back to an estimate, a range, or "starting at" — only diagnostic.
  if (priceCents === null) {
    return { outcome: "diagnostic" };
  }

  return { outcome: "fixed_price", repairType, priceCents };
}

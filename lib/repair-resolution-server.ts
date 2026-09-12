// The server-side, database-backed resolution engine. Same enforcement
// rule ("known repair = known price, unknown cause = diagnostic first"),
// now returning a LIST of quality-tier options rather than one price —
// per the quality-tier architecture, a repair can have several sellable
// options (Economy, OEM, ...) at once; the customer chooses. This must
// only ever be called from server code (an API route) — never imported
// into a "use client" file, since it goes through lib/pricing-data.ts's
// secret-key client.
import { isFoldable } from "@/content/device-catalog";
import { getCandidateRepairTypes, type RepairType } from "@/content/repair-taxonomy";
import type { QualityTier } from "@/content/quality-tiers";
import { isRepairEligible, getActiveCustomerPriceOptions, getServiceLevels } from "@/lib/pricing-data";

export type QualityOption = { qualityTier: QualityTier; priceCents: number };
export type ServiceLevelOption = { level: "standard" | "priority" | "urgent"; feeCents: number };

export type ResolutionResult =
  | { outcome: "fixed_price"; repairType: RepairType; options: QualityOption[]; serviceLevels: ServiceLevelOption[] }
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
  const options = await getActiveCustomerPriceOptions(modelId, repairType);

  // Eligible, but no active + sellable quality tier exists yet. Per
  // direction: this MUST NOT fall back to an estimate, a range, or
  // "starting at" — only diagnostic. An empty options list means exactly
  // the same thing null used to mean in the single-price version.
  if (options.length === 0) {
    return { outcome: "diagnostic" };
  }

  const serviceLevelRows = await getServiceLevels();
  const serviceLevels = serviceLevelRows.filter((r) => r.active).map((r) => ({ level: r.level, feeCents: r.fee_cents }));

  return { outcome: "fixed_price", repairType, options, serviceLevels };
}

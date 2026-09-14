// The server-side, database-backed resolution engine. Same enforcement
// rule ("known repair = known price, unknown cause = diagnostic first"),
// now returning a LIST of quality-tier options rather than one price —
// per the quality-tier architecture, a repair can have several sellable
// options (Economy, OEM, ...) at once; the customer chooses. This must
// only ever be called from server code (an API route) — never imported
// into a "use client" file, since it goes through lib/pricing-data.ts's
// secret-key client.
//
// Every diagnostic outcome now carries a real `reason` code and a plain-
// language `customerMessage` explaining WHY, derived entirely from which
// branch below actually fired — this is the "rules engine explains
// itself" principle: the explanation is exactly as true as the decision,
// since it's the same logic, not a separate narrative bolted on. No AI
// involved; every message is fully enumerable because the decision space
// is fully enumerable.
import { isFoldable } from "@/content/device-catalog";
import { getCandidateRepairTypes, type RepairType } from "@/content/repair-taxonomy";
import type { QualityTier } from "@/content/quality-tiers";
import { isRepairEligible, getActiveCustomerPriceOptions, getServiceLevels } from "@/lib/pricing-data";

export type QualityOption = { qualityTier: QualityTier; priceCents: number };
export type ServiceLevelOption = { level: "standard" | "priority" | "urgent"; feeCents: number };

export type DiagnosticReason =
  | "no_exact_model"
  | "not_eligible_for_fixed_price"
  | "ambiguous_multiple_candidates"
  | "eligible_but_not_priced_yet";

export type ResolutionResult =
  | { outcome: "fixed_price"; repairType: RepairType; options: QualityOption[]; serviceLevels: ServiceLevelOption[] }
  | { outcome: "diagnostic"; reason: DiagnosticReason; customerMessage: string };

const DIAGNOSTIC_MESSAGES: Record<DiagnosticReason, string> = {
  no_exact_model: "We don't have your exact model, so we can't confirm a fixed price yet — we'll take a look and get back to you.",
  not_eligible_for_fixed_price: "We haven't confirmed this repair as a fixed-price option for your exact model yet — we'll take a look and get you a real price.",
  ambiguous_multiple_candidates: "This can have more than one real cause on your exact model, so we'll need to take a quick look before quoting a price.",
  eligible_but_not_priced_yet: "We know what repair this is, but don't have a confirmed price ready for your exact model yet — we'll get you a real quote.",
};

function diagnostic(reason: DiagnosticReason): ResolutionResult {
  return { outcome: "diagnostic", reason, customerMessage: DIAGNOSTIC_MESSAGES[reason] };
}

export async function resolveRepairServer(modelId: string | null, problemId: string): Promise<ResolutionResult> {
  // No exact model — can never be fixed-price.
  if (!modelId) {
    return diagnostic("no_exact_model");
  }

  const candidates = getCandidateRepairTypes(problemId, isFoldable(modelId));
  const eligibleFlags = await Promise.all(candidates.map((rt) => isRepairEligible(modelId, rt)));
  const eligibleCandidates = candidates.filter((_, i) => eligibleFlags[i]);

  if (eligibleCandidates.length === 0) {
    return diagnostic("not_eligible_for_fixed_price");
  }
  // More than one still-ambiguous eligible candidate for this exact model —
  // a real fact about the symptom, not a data gap: e.g. "won't charge"
  // resolving to both the port and the battery being eligible repairs.
  if (eligibleCandidates.length > 1) {
    return diagnostic("ambiguous_multiple_candidates");
  }

  const repairType = eligibleCandidates[0];
  const options = await getActiveCustomerPriceOptions(modelId, repairType);

  // Eligible, but no active + sellable quality tier exists yet. Per
  // direction: this MUST NOT fall back to an estimate, a range, or
  // "starting at" — only diagnostic. An empty options list means exactly
  // the same thing null used to mean in the single-price version.
  if (options.length === 0) {
    return diagnostic("eligible_but_not_priced_yet");
  }

  const serviceLevelRows = await getServiceLevels();
  const serviceLevels = serviceLevelRows.filter((r) => r.active).map((r) => ({ level: r.level, feeCents: r.fee_cents }));

  return { outcome: "fixed_price", repairType, options, serviceLevels };
}

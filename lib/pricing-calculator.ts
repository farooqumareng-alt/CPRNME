// The pricing calculation engine — pure functions only, no database access.
// This is the ONE place the "economic floor" and "outcome" formulas exist;
// both the admin calculator page and pricing_records' stored snapshot call
// through here, so the math can never drift between "what the admin saw"
// and "what got saved."
//
// Nothing here decides a customer price. It computes what the numbers say;
// a human still has to read the result and approve (or not) — see
// app/admin/pricing/actions.ts for where that approval actually happens.

export type EconomicFloorInputs = {
  partAcquisitionCostCents: number;
  partShippingCents: number;
  providerCompensationCents: number;
  paymentProcessingCents: number;
  warrantyReserveCents: number;
  customerSupportAllocationCents: number;
  mobileTravelCostCents: number;
  consumablesCents: number;
  overheadAllocationCents: number;
  otherDirectCostsCents: number;
  requiredContributionFloorCents: number;
};

// Economic Floor = Part Cost + Provider Compensation + Direct Service Costs
// + Warranty Reserve + Payment/Transaction Cost + Required Contribution
// Floor. "Direct service costs" is the sum of every direct-cost field —
// deliberately never collapsed into one opaque "overhead" number upstream,
// only summed here for the floor calculation itself.
export function computeEconomicFloor(inputs: EconomicFloorInputs): number {
  const partCost = inputs.partAcquisitionCostCents + inputs.partShippingCents;
  const directServiceCosts =
    inputs.customerSupportAllocationCents +
    inputs.mobileTravelCostCents +
    inputs.consumablesCents +
    inputs.overheadAllocationCents +
    inputs.otherDirectCostsCents;
  return (
    partCost +
    inputs.providerCompensationCents +
    directServiceCosts +
    inputs.warrantyReserveCents +
    inputs.paymentProcessingCents +
    inputs.requiredContributionFloorCents
  );
}

// CPRNME Contribution = Customer Price - Part Cost - Provider Compensation
// - Direct Service Costs. Deliberately NOT called "profit" — this doesn't
// account for every applicable business overhead, per direction.
export function computeContribution(
  customerPriceCents: number,
  partCostCents: number,
  providerCompensationCents: number,
  directServiceCostsCents: number
): number {
  return customerPriceCents - partCostCents - providerCompensationCents - directServiceCostsCents;
}

export type MarketStats = {
  lowCents: number;
  medianCents: number;
  highCents: number;
  count: number;
};

export function computeMarketStats(observedPricesCents: number[]): MarketStats | null {
  if (observedPricesCents.length === 0) return null;
  const sorted = [...observedPricesCents].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianCents =
    sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  return {
    lowCents: sorted[0],
    medianCents,
    highCents: sorted[sorted.length - 1],
    count: sorted.length,
  };
}

export type PricingOutcome = "healthy" | "market_sensitive" | "not_viable";

// Policy thresholds — NOT a business fact, a configurable default. Nothing
// in this file asserts these are CPRNME's actual approved policy; they're
// clearly-named constants a business reviewer can change in one place,
// exactly as directed ("configurable contribution target/floor").
// Default reasoning: at or below market median is unambiguously healthy;
// above median but still under a 15% markup over the market high is
// merely market-sensitive (needs a human look, not an automatic block);
// beyond that is treated as not economically viable at this market.
export const PRICING_POLICY = {
  marketSensitiveCeilingMultiplier: 1.15,
};

export function classifyOutcome(economicFloorCents: number, market: MarketStats | null): PricingOutcome {
  // No market data at all -- can't compare, so this can never be
  // classified "healthy" by default. Falls to market_sensitive so a human
  // reviews it with the (missing) market context explicitly visible,
  // rather than either silently approving or silently blocking it.
  if (!market) return "market_sensitive";
  if (economicFloorCents <= market.medianCents) return "healthy";
  if (economicFloorCents <= market.highCents * PRICING_POLICY.marketSensitiveCeilingMultiplier) {
    return "market_sensitive";
  }
  return "not_viable";
}

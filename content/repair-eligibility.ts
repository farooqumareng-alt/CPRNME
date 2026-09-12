// Model-specific eligibility — the layer Revision 2 of the taxonomy added.
// Answers "can this exact repair be confidently identified for this exact
// model without hands-on diagnosis," completely independent of price.
// A repair type (even display or battery) is NEVER assumed eligible by
// default; every (model, repair type) combination needs its own explicit
// row here before pricing is ever consulted for it.
//
// Intentionally empty. No eligibility decisions have been made yet — every
// request resolves to diagnostic/quote until real business decisions are
// supplied. See content/repair-resolution.ts for how that's enforced.
import type { RepairType } from "./repair-taxonomy";

export type EligibilityRecord = {
  modelId: string; // a DeviceModel.id from device-catalog.ts
  repairType: RepairType;
  eligible: boolean;
  notes?: string; // internal only — never shown to a customer
};

export const repairEligibility: EligibilityRecord[] = [];

export function isEligible(modelId: string, repairType: RepairType): boolean {
  return repairEligibility.some(
    (r) => r.modelId === modelId && r.repairType === repairType && r.eligible
  );
}

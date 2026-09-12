// The pricing lookup — deliberately the ONLY file that will ever contain a
// dollar amount. Nothing in components/, app/, or the other content/*.ts
// taxonomy files may hard-code a price; everything asks this file's
// function instead, per direction ("the UI should ask the pricing layer
// for the applicable price").
//
// Intentionally empty. Do not add a row here without a real, approved
// price from the business — no competitor pricing, no market estimates, no
// "starting at" placeholders. An empty table here is what makes
// content/repair-resolution.ts safely default to "diagnostic" for every
// request today, with zero risk of showing a fabricated number.
import type { RepairType } from "./repair-taxonomy";

export type PriceRecord = {
  modelId: string; // a DeviceModel.id from device-catalog.ts
  repairType: RepairType;
  priceCents: number;
  active: boolean; // superseding a price = add a new active row, set this false on the old one
  effectiveFrom: string; // ISO date
};

export const repairPricing: PriceRecord[] = [];

// Returns the active price in cents, or null if none exists — callers must
// never substitute an estimate, a range, or a "starting at" value when this
// returns null. Null means "route to diagnostic," full stop.
export function getActivePrice(modelId: string, repairType: RepairType): number | null {
  const match = repairPricing.find(
    (p) => p.modelId === modelId && p.repairType === repairType && p.active
  );
  return match ? match.priceCents : null;
}

// Customer-facing part-quality vocabulary — fixed taxonomy, same status as
// RepairType/RepairClass: doesn't change per business pricing decision, so
// it lives in code, not the pricing database. One vocabulary used
// everywhere (not a display-only naming scheme) — "oled" simply never
// applies outside display repairs, since it isn't a real option for a
// battery or a charging port.
//
// Never all five for every repair. Which tiers genuinely exist for a given
// model + repair is a real-world fact to research, not a table to fill in
// — see repair_quality tracking in pricing_records (quality_tier column)
// and the commercial_decision field (sell / do_not_sell / pending), which
// exists precisely so "OEM exists as a part" doesn't force "OEM must be
// sold as a tier."
export type QualityTier = "economy" | "aftermarket" | "premium_aftermarket" | "oled" | "oem";

// `description` explains the customer benefit of the tier ITSELF, in
// general terms true of the category everywhere it's offered — never a
// specific component claim (part number, supplier, "genuine Samsung," a
// warranty length). Component-specific facts belong on the individual
// pricing_records row (part_type/part_quality/part_supplier/
// part_warranty_info), which is real per-model-per-repair evidence, not
// this fixed, generic text. Never say "OEM = better" as an absolute claim
// here — only that OEM is the option for a customer who specifically wants
// a genuine part and is willing to pay more for it.
export const qualityTiers: { id: QualityTier; label: string; appliesTo: "display_only" | "any"; description: string }[] = [
  { id: "economy", label: "Economy", appliesTo: "any", description: "Best for keeping the repair cost down." },
  { id: "aftermarket", label: "Aftermarket", appliesTo: "any", description: "A balanced option for price and quality." },
  {
    id: "premium_aftermarket",
    label: "Premium Aftermarket",
    appliesTo: "any",
    description: "A higher-grade replacement component for a stronger balance of quality and value.",
  },
  { id: "oled", label: "OLED", appliesTo: "display_only", description: "For customers who want OLED display technology specifically." },
  {
    id: "oem",
    label: "OEM",
    appliesTo: "any",
    description: "For customers who specifically want a genuine OEM component and are willing to pay more for it.",
  },
];

export function getQualityTierLabel(tier: QualityTier): string {
  return qualityTiers.find((t) => t.id === tier)?.label ?? tier;
}

export function getQualityTierDescription(tier: QualityTier): string {
  return qualityTiers.find((t) => t.id === tier)?.description ?? "";
}

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

export const qualityTiers: { id: QualityTier; label: string; appliesTo: "display_only" | "any" }[] = [
  { id: "economy", label: "Economy", appliesTo: "any" },
  { id: "aftermarket", label: "Aftermarket", appliesTo: "any" },
  { id: "premium_aftermarket", label: "Premium Aftermarket", appliesTo: "any" },
  { id: "oled", label: "OLED", appliesTo: "display_only" },
  { id: "oem", label: "OEM", appliesTo: "any" },
];

export function getQualityTierLabel(tier: QualityTier): string {
  return qualityTiers.find((t) => t.id === tier)?.label ?? tier;
}

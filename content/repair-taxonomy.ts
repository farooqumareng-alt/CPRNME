// Customer-language problems (unchanged from the live selector — this file
// just gives them a single source of truth) plus the INTERNAL repair-type
// vocabulary customers never see. A problem maps to multiple *candidate*
// repair types on purpose: per the taxonomy revision, a symptom is never
// permanently "diagnostic" or "standard" — that's decided per exact model
// in repair-eligibility.ts, not here. This file only answers "what could
// this symptom plausibly be," never "what is it."
export type ProblemOption = { id: string; label: string };

// Deliberately still the same 7 options live in production today — this
// build adds the model picker and resolution engine underneath the
// existing problem menu, not a bigger one. Expanding customer-facing
// problem choices (e.g. adding "Back glass is broken" as its own option)
// is a separate decision, not made here.
export const problems: ProblemOption[] = [
  { id: "screen", label: "Screen is cracked" },
  { id: "charging", label: "Won't charge" },
  { id: "battery", label: "Battery drains fast" },
  { id: "power", label: "Won't turn on" },
  { id: "water", label: "Water damage" },
  { id: "camera", label: "Camera issue" },
  { id: "other", label: "Something else" },
];

export type RepairType =
  | "display_assembly_replacement"
  | "battery_replacement"
  | "charging_port_replacement"
  | "camera_module_replacement"
  | "back_glass_replacement" // catalogued for a future "back glass" problem option — not reachable yet, see note above
  | "speaker_replacement" // catalogued for a future "speaker" problem option — not reachable yet
  | "diagnostic_hardware_failure"
  | "liquid_damage_diagnostic"
  // Foldable-only — never used for an ordinary phone or tablet.
  | "hinge_repair"
  | "inner_display_replacement"
  | "outer_display_replacement";

// Ordinary phones and tablets.
const candidateRepairTypes: Record<string, RepairType[]> = {
  screen: ["display_assembly_replacement"],
  // "Won't charge" is a symptom with several real causes — debris, the
  // port itself, the battery, or deeper board-level failure. Never a
  // single guaranteed repair type, per the taxonomy revision.
  charging: ["charging_port_replacement", "battery_replacement", "diagnostic_hardware_failure"],
  // Same principle for battery symptoms: drains-quickly could genuinely be
  // the battery, but could also be software, thermal, or board-level — so
  // battery_replacement is a candidate, not the only outcome.
  battery: ["battery_replacement", "diagnostic_hardware_failure"],
  power: ["diagnostic_hardware_failure"],
  water: ["liquid_damage_diagnostic"],
  camera: ["camera_module_replacement", "diagnostic_hardware_failure"],
  other: ["diagnostic_hardware_failure"],
};

// Foldables (Z Fold/Flip, Pixel Fold) get an entirely different vocabulary
// for the same customer-facing "Screen is cracked" — never the ordinary
// phone's display_assembly_replacement. See device-catalog.ts's
// isFoldable().
const foldableCandidateRepairTypes: Record<string, RepairType[]> = {
  screen: ["inner_display_replacement", "outer_display_replacement", "hinge_repair"],
  charging: ["charging_port_replacement", "battery_replacement", "diagnostic_hardware_failure"],
  battery: ["battery_replacement", "diagnostic_hardware_failure"],
  power: ["diagnostic_hardware_failure"],
  water: ["liquid_damage_diagnostic"],
  camera: ["camera_module_replacement", "diagnostic_hardware_failure"],
  other: ["diagnostic_hardware_failure"],
};

export function getCandidateRepairTypes(problemId: string, isFoldableDevice: boolean): RepairType[] {
  const table = isFoldableDevice ? foldableCandidateRepairTypes : candidateRepairTypes;
  return table[problemId] ?? ["diagnostic_hardware_failure"];
}

// Repair types that are never eligible for fixed pricing, by definition —
// "we need to look at it" is the entire meaning of these two, not a status
// that changes with more eligibility data. Used to decide whether asking
// for an exact model could ever matter for a given problem, before the
// device is even known.
const ALWAYS_DIAGNOSTIC: ReadonlySet<RepairType> = new Set(["diagnostic_hardware_failure", "liquid_damage_diagnostic"]);

// True if this problem has at least one candidate repair type (on an
// ordinary device OR a foldable) that could ever resolve to a fixed price.
// False means every candidate is always-diagnostic — asking for an exact
// model can never change the outcome, so the UI can skip that step
// entirely for this problem, before the customer has even picked a device.
export function canEverBeFixedPrice(problemId: string): boolean {
  const ordinary = candidateRepairTypes[problemId] ?? ["diagnostic_hardware_failure"];
  const foldable = foldableCandidateRepairTypes[problemId] ?? ["diagnostic_hardware_failure"];
  return [...ordinary, ...foldable].some((rt) => !ALWAYS_DIAGNOSTIC.has(rt));
}

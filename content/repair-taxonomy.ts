// Customer-language problems (unchanged from the live selector — this file
// just gives them a single source of truth) plus the INTERNAL repair-type
// vocabulary customers never see. A problem maps to multiple *candidate*
// repair types on purpose: per the taxonomy revision, a symptom is never
// permanently "diagnostic" or "standard" — that's decided per exact model
// in repair_eligibility, not here. This file only answers "what could
// this symptom plausibly be," never "what is it."
//
// The actual problem list, candidate-repair-type edges, and
// always-diagnostic set now live in the `problems`/`repair_types`/
// `problem_repair_candidates` knowledge-graph tables in Supabase (see
// scripts/regenerate-taxonomy.mjs) and are regenerated into
// repair-taxonomy.data.ts, imported below — same reasoning as
// device-catalog.ts's move to a generated file.
import { problemsData, candidateRepairTypesData, foldableCandidateRepairTypesData, alwaysDiagnosticRepairTypes } from "./repair-taxonomy.data";

export type ProblemOption = { id: string; label: string };

// Deliberately still the same 7 options live in production today — this
// build adds the model picker and resolution engine underneath the
// existing problem menu, not a bigger one. Expanding customer-facing
// problem choices (e.g. adding "Back glass is broken" as its own option)
// is a separate decision, not made here.
export const problems: ProblemOption[] = problemsData;

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

export function getCandidateRepairTypes(problemId: string, isFoldableDevice: boolean): RepairType[] {
  const table = isFoldableDevice ? foldableCandidateRepairTypesData : candidateRepairTypesData;
  return table[problemId] ?? ["diagnostic_hardware_failure"];
}

// Repair types that are never eligible for fixed pricing, by definition —
// "we need to look at it" is the entire meaning of these two, not a status
// that changes with more eligibility data. Used to decide whether asking
// for an exact model could ever matter for a given problem, before the
// device is even known.
const ALWAYS_DIAGNOSTIC: ReadonlySet<RepairType> = new Set(alwaysDiagnosticRepairTypes);

// True if this problem has at least one candidate repair type (on an
// ordinary device OR a foldable) that could ever resolve to a fixed price.
// False means every candidate is always-diagnostic — asking for an exact
// model can never change the outcome, so the UI can skip that step
// entirely for this problem, before the customer has even picked a device.
export function canEverBeFixedPrice(problemId: string): boolean {
  const ordinary = candidateRepairTypesData[problemId] ?? ["diagnostic_hardware_failure"];
  const foldable = foldableCandidateRepairTypesData[problemId] ?? ["diagnostic_hardware_failure"];
  return [...ordinary, ...foldable].some((rt) => !ALWAYS_DIAGNOSTIC.has(rt));
}

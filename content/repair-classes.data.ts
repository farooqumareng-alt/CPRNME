// GENERATED DATA — do not hand-edit. Source of truth is the knowledge-graph
// tables in Supabase (see scripts/regenerate-taxonomy.mjs). Regenerate with:
//   npx tsx scripts/regenerate-taxonomy.mjs
// after any change to those tables, then rebuild and re-verify before
// deploying — this file only reflects what was in the database at the
// moment it was generated.
import type { RepairClass } from "./repair-classes";

export const repairClassesData: { id: RepairClass; label: string; examples: string[] }[] = [
  {
    "id": "A",
    "label": "Simple",
    "examples": [
      "Common battery replacement",
      "Straightforward screen replacement on standard phones"
    ]
  },
  {
    "id": "B",
    "label": "Moderate",
    "examples": [
      "Newer phone display replacement",
      "Difficult battery replacement",
      "Charging-port replacement where appropriate"
    ]
  },
  {
    "id": "C",
    "label": "Complex",
    "examples": [
      "Difficult disassembly",
      "Advanced display assemblies",
      "Complicated tablet repairs"
    ]
  },
  {
    "id": "D",
    "label": "Specialist / Diagnostic",
    "examples": [
      "Liquid damage",
      "Board-level issues",
      "Unknown power failure",
      "Multiple interacting faults"
    ]
  }
];

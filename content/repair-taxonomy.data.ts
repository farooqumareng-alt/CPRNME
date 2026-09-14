// GENERATED DATA — do not hand-edit. Source of truth is the knowledge-graph
// tables in Supabase (see scripts/regenerate-taxonomy.mjs). Regenerate with:
//   npx tsx scripts/regenerate-taxonomy.mjs
// after any change to those tables, then rebuild and re-verify before
// deploying — this file only reflects what was in the database at the
// moment it was generated.
import type { RepairType } from "./repair-taxonomy";

export const problemsData: { id: string; label: string }[] = [
  {
    "id": "screen",
    "label": "Screen is cracked"
  },
  {
    "id": "charging",
    "label": "Won't charge"
  },
  {
    "id": "battery",
    "label": "Battery drains fast"
  },
  {
    "id": "power",
    "label": "Won't turn on"
  },
  {
    "id": "water",
    "label": "Water damage"
  },
  {
    "id": "camera",
    "label": "Camera issue"
  },
  {
    "id": "other",
    "label": "Something else"
  }
];

export const candidateRepairTypesData: Record<string, RepairType[]> = {
  "screen": [
    "display_assembly_replacement"
  ],
  "charging": [
    "battery_replacement",
    "charging_port_replacement",
    "diagnostic_hardware_failure"
  ],
  "battery": [
    "battery_replacement",
    "diagnostic_hardware_failure"
  ],
  "power": [
    "diagnostic_hardware_failure"
  ],
  "water": [
    "liquid_damage_diagnostic"
  ],
  "camera": [
    "camera_module_replacement",
    "diagnostic_hardware_failure"
  ],
  "other": [
    "diagnostic_hardware_failure"
  ]
};

export const foldableCandidateRepairTypesData: Record<string, RepairType[]> = {
  "screen": [
    "hinge_repair",
    "inner_display_replacement",
    "outer_display_replacement"
  ],
  "charging": [
    "battery_replacement",
    "charging_port_replacement",
    "diagnostic_hardware_failure"
  ],
  "battery": [
    "battery_replacement",
    "diagnostic_hardware_failure"
  ],
  "power": [
    "diagnostic_hardware_failure"
  ],
  "water": [
    "liquid_damage_diagnostic"
  ],
  "camera": [
    "camera_module_replacement",
    "diagnostic_hardware_failure"
  ],
  "other": [
    "diagnostic_hardware_failure"
  ]
};

export const alwaysDiagnosticRepairTypes: RepairType[] = [
  "diagnostic_hardware_failure",
  "liquid_damage_diagnostic"
];

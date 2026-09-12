// Repair classes — architectural categories for provider-compensation
// difficulty tiers, NOT prices and NOT a pricing decision. Fixed product
// taxonomy, same status as RepairType in repair-taxonomy.ts: this doesn't
// change per business pricing decision, so it lives in code, not the
// pricing database.
export type RepairClass = "A" | "B" | "C" | "D";

export const repairClasses: { id: RepairClass; label: string; examples: string[] }[] = [
  {
    id: "A",
    label: "Simple",
    examples: ["Common battery replacement", "Straightforward screen replacement on standard phones"],
  },
  {
    id: "B",
    label: "Moderate",
    examples: ["Newer phone display replacement", "Difficult battery replacement", "Charging-port replacement where appropriate"],
  },
  {
    id: "C",
    label: "Complex",
    examples: ["Difficult disassembly", "Advanced display assemblies", "Complicated tablet repairs"],
  },
  {
    id: "D",
    label: "Specialist / Diagnostic",
    examples: ["Liquid damage", "Board-level issues", "Unknown power failure", "Multiple interacting faults"],
  },
];

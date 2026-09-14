// Repair classes — architectural categories for provider-compensation
// difficulty tiers, NOT prices and NOT a pricing decision. Fixed product
// taxonomy, same status as RepairType in repair-taxonomy.ts: this doesn't
// change per business pricing decision, so it lives in the knowledge-graph
// tables, not the pricing database.
//
// The actual data lives in the `repair_classes` table in Supabase (see
// scripts/regenerate-taxonomy.mjs) and is regenerated into
// repair-classes.data.ts, imported below.
import { repairClassesData } from "./repair-classes.data";

export type RepairClass = "A" | "B" | "C" | "D";

export const repairClasses: { id: RepairClass; label: string; examples: string[] }[] = repairClassesData;

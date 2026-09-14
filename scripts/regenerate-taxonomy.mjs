// Regenerates content/device-catalog.data.ts, content/repair-taxonomy.data.ts,
// and content/repair-classes.data.ts from the real, admin-editable
// knowledge-graph tables in Supabase (devices, problems, repair_types,
// problem_repair_candidates, repair_classes).
//
// Why generated files exist at all instead of querying the DB live: every
// static page (42 location pages, repair-type pages, the resolution
// engine) imports this data synchronously at build time — that's the
// entire reason CPRNME's public pages are statically generated rather
// than server-rendered on every request. Querying Supabase at build/
// request time for this would either force those pages dynamic or add a
// live round-trip nothing here needs. Same pattern already established by
// content/dfw-territory.data.ts for the same reason.
//
// Run this after any change to the knowledge-graph tables:
//   npx tsx scripts/regenerate-taxonomy.mjs
// Then rebuild and re-verify before deploying — this script only writes
// files, it never itself proves the site still behaves identically.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const envText = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8");
const connectionString = envText.match(/SUPABASE_DB_POOLER_URL=(.+)/)[1].trim();

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

const devices = (await client.query("select id, family, manufacturer, series, name, is_foldable from devices order by family, series, id")).rows;
const problems = (await client.query("select id, label, always_diagnostic from problems order by display_order")).rows;
const repairTypes = (await client.query("select id, label, foldable_only, always_diagnostic from repair_types order by id")).rows;
const candidates = (await client.query("select problem_id, repair_type_id, for_foldable from problem_repair_candidates order by problem_id, for_foldable, repair_type_id")).rows;
const repairClasses = (await client.query("select id, label, examples from repair_classes order by id")).rows;

await client.end();

const HEADER = `// GENERATED DATA — do not hand-edit. Source of truth is the knowledge-graph
// tables in Supabase (see scripts/regenerate-taxonomy.mjs). Regenerate with:
//   npx tsx scripts/regenerate-taxonomy.mjs
// after any change to those tables, then rebuild and re-verify before
// deploying — this file only reflects what was in the database at the
// moment it was generated.
`;

function ts(value) {
  return JSON.stringify(value, null, 2);
}

// ---- device-catalog.data.ts ----------------------------------------------
const deviceCatalogOut = `${HEADER}import type { DeviceModel } from "./device-catalog";

export const deviceCatalog: (DeviceModel & { isFoldable: boolean })[] = ${ts(
  devices.map((d) => ({ id: d.id, family: d.family, manufacturer: d.manufacturer, series: d.series, name: d.name, isFoldable: d.is_foldable }))
)};
`;
fs.writeFileSync(path.join(projectRoot, "content/device-catalog.data.ts"), deviceCatalogOut);

// ---- repair-taxonomy.data.ts ----------------------------------------------
const candidatesByKey = (forFoldable) => {
  const out = {};
  for (const p of problems) {
    out[p.id] = candidates.filter((c) => c.problem_id === p.id && c.for_foldable === forFoldable).map((c) => c.repair_type_id);
  }
  return out;
};

const repairTaxonomyOut = `${HEADER}import type { RepairType } from "./repair-taxonomy";

export const problemsData: { id: string; label: string }[] = ${ts(problems.map((p) => ({ id: p.id, label: p.label })))};

export const candidateRepairTypesData: Record<string, RepairType[]> = ${ts(candidatesByKey(false))};

export const foldableCandidateRepairTypesData: Record<string, RepairType[]> = ${ts(candidatesByKey(true))};

export const alwaysDiagnosticRepairTypes: RepairType[] = ${ts(repairTypes.filter((rt) => rt.always_diagnostic).map((rt) => rt.id))};
`;
fs.writeFileSync(path.join(projectRoot, "content/repair-taxonomy.data.ts"), repairTaxonomyOut);

// ---- repair-classes.data.ts ------------------------------------------------
const repairClassesOut = `${HEADER}import type { RepairClass } from "./repair-classes";

export const repairClassesData: { id: RepairClass; label: string; examples: string[] }[] = ${ts(
  repairClasses.map((rc) => ({ id: rc.id, label: rc.label, examples: rc.examples }))
)};
`;
fs.writeFileSync(path.join(projectRoot, "content/repair-classes.data.ts"), repairClassesOut);

console.log("Regenerated:");
console.log("  content/device-catalog.data.ts —", devices.length, "devices");
console.log("  content/repair-taxonomy.data.ts —", problems.length, "problems,", candidates.length, "candidate edges");
console.log("  content/repair-classes.data.ts —", repairClasses.length, "classes");

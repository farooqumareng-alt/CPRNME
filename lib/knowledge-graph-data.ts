// Server-only data access for the knowledge-graph tables (devices,
// problems, repair_types, problem_repair_candidates, repair_classes) —
// see scripts/regenerate-taxonomy.mjs for how these become the generated
// content/*.data.ts files every static page actually reads.
//
// Important, real limitation this file's callers must be honest about:
// writing here changes the database immediately, but NOT what's live on
// the site. A deployed Vercel serverless function can't run a build
// script against the git-tracked source tree, run `git commit`/`push`,
// or trigger a new deployment — there is no code path from "admin clicks
// a button" to "the live site changes" without a human running
// scripts/regenerate-taxonomy.mjs and deploying. getPendingRegeneration()
// exists so the admin UI can at least say "N changes are waiting" rather
// than silently implying an edit here already went live.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { deviceCatalog as generatedDeviceCatalog } from "@/content/device-catalog.data";
import type { DeviceFamily } from "@/content/device-catalog";

export type DeviceGraphRow = {
  id: string;
  family: DeviceFamily;
  manufacturer: string;
  series: string;
  name: string;
  is_foldable: boolean;
  created_at: string;
};

export async function listDevicesFromDB(): Promise<DeviceGraphRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("devices").select("*").order("family").order("series").order("id");
  if (error) {
    console.error("Failed to load devices:", error.message);
    return [];
  }
  return data ?? [];
}

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function addDevice(input: { id: string; family: DeviceFamily; manufacturer: string; series: string; name: string; isFoldable: boolean }) {
  if (!ID_RE.test(input.id)) {
    return { error: { message: "Id must be lowercase letters, numbers, and hyphens only (e.g. iphone-20-pro)" } };
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("devices")
    .insert({
      id: input.id,
      family: input.family,
      manufacturer: input.manufacturer,
      series: input.series,
      name: input.name,
      is_foldable: input.isFoldable,
    })
    .select()
    .single();
  if (error?.code === "23505") {
    return { error: { message: `A device with id "${input.id}" already exists` } };
  }
  return { data, error };
}

export type ProblemGraphRow = {
  id: string;
  label: string;
  always_diagnostic: boolean;
  ordinaryCandidates: { id: string; label: string }[];
  foldableCandidates: { id: string; label: string }[];
};

// Read-only by design — this is the graph structure the resolution engine
// itself depends on (repair-taxonomy.ts's getCandidateRepairTypes());
// exposing it for editing risks an admin silently changing what a
// customer gets diagnosed as without realizing pricing_records/
// repair_eligibility are keyed to these exact repair_type ids. Shown here
// for transparency (the "knowledge graph you can see" principle), not as
// a form.
export async function listProblemsWithCandidates(): Promise<ProblemGraphRow[]> {
  const supabase = getSupabaseAdmin();
  const [{ data: problems }, { data: repairTypes }, { data: candidates }] = await Promise.all([
    supabase.from("problems").select("id, label, always_diagnostic").order("display_order"),
    supabase.from("repair_types").select("id, label"),
    supabase.from("problem_repair_candidates").select("problem_id, repair_type_id, for_foldable"),
  ]);
  const repairTypeLabel = new Map((repairTypes ?? []).map((rt) => [rt.id, rt.label]));
  return (problems ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    always_diagnostic: p.always_diagnostic,
    ordinaryCandidates: (candidates ?? [])
      .filter((c) => c.problem_id === p.id && !c.for_foldable)
      .map((c) => ({ id: c.repair_type_id, label: repairTypeLabel.get(c.repair_type_id) ?? c.repair_type_id })),
    foldableCandidates: (candidates ?? [])
      .filter((c) => c.problem_id === p.id && c.for_foldable)
      .map((c) => ({ id: c.repair_type_id, label: repairTypeLabel.get(c.repair_type_id) ?? c.repair_type_id })),
  }));
}

export type RepairClassRow = { id: string; label: string; examples: string[] };

export async function listRepairClassesFromDB(): Promise<RepairClassRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("repair_classes").select("id, label, examples").order("id");
  if (error) {
    console.error("Failed to load repair classes:", error.message);
    return [];
  }
  return data ?? [];
}

// Compares the live devices table against what's actually baked into the
// last-generated content/device-catalog.data.ts (imported directly, the
// same file every static page reads) — a real, honest signal for "have
// devices been added since the last regenerate + deploy," not a guess.
export async function getPendingDeviceRegenerationCount(): Promise<number> {
  const liveDevices = await listDevicesFromDB();
  const generatedIds = new Set(generatedDeviceCatalog.map((d) => d.id));
  return liveDevices.filter((d) => !generatedIds.has(d.id)).length;
}

// The real, named device catalog — every model here is a real product,
// verified against current sources rather than guessed (see the taxonomy
// audit this was built from). This file contains ZERO pricing or
// eligibility data on purpose; it only answers "what devices exist,"
// nothing about what CPRNME can price.
//
// The actual data now lives in the `devices` table in Supabase (the
// knowledge-graph layer — see scripts/regenerate-taxonomy.mjs) and is
// regenerated into device-catalog.data.ts, imported below. Add or edit a
// model there and regenerate, rather than hand-editing this file — same
// pattern content/dfw-territory.ts already uses for the same reason
// (every static page needs this synchronously at build time, so it can't
// be a live query, but it also shouldn't be hand-typed TypeScript once
// it's a real, growing catalog).
//
// `family` maps to the existing coarse buckets ProblemSelector.tsx already
// asks about (iphone / android / tablet) — "other" has no catalog entries
// on purpose, since a customer picking "Something else" as their device has
// no exact model to look up.
import { deviceCatalog as generatedDeviceCatalog } from "./device-catalog.data";

export type DeviceFamily = "iphone" | "android" | "tablet";

export type DeviceModel = {
  id: string; // stable slug, e.g. "iphone-15-pro" — used as the FK-equivalent everywhere else
  family: DeviceFamily;
  manufacturer: string;
  series: string; // grouping label for the model picker, e.g. "iPhone 15", "Galaxy A"
  name: string; // full display name shown to the customer
};

export const deviceCatalog: DeviceModel[] = generatedDeviceCatalog;

const byId = new Map(generatedDeviceCatalog.map((m) => [m.id, m]));

export function getDeviceModel(id: string): DeviceModel | undefined {
  return byId.get(id);
}

export function getModelsForFamily(family: DeviceFamily): DeviceModel[] {
  return deviceCatalog.filter((m) => m.family === family);
}

// True for Z Fold/Flip/Pixel Fold-style devices — used to route these to
// their own repair-type vocabulary instead of the ordinary phone one, per
// the taxonomy revision that treats foldables as a distinct architecture,
// not a phone variant. Now a real, stored fact (the `devices` table's
// is_foldable column) rather than a substring heuristic on the id — falls
// back to the old heuristic only for an id the catalog doesn't recognize
// at all, which should never happen in practice.
export function isFoldable(id: string): boolean {
  const model = byId.get(id);
  if (model) return model.isFoldable;
  return id.includes("fold") || id.includes("flip");
}

// Mirrors the four device-family labels components/ProblemSelector.tsx's
// picker step shows (kept as a separate literal array there for its "as
// const" id-union typing) — this copy exists so a server-side fallback (an
// admin-alert email composed when a customer chose "iPhone" but not an
// exact model) shows the same polished label a visitor sees, not the raw
// internal id ("iphone").
const FAMILY_LABELS: Record<string, string> = {
  iphone: "iPhone",
  android: "Samsung / Android",
  tablet: "iPad / Tablet",
  other: "Something else",
};

export function getDeviceFamilyLabel(id: string): string {
  return FAMILY_LABELS[id] ?? id;
}

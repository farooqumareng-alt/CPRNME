// The real, named device catalog — every model here is a real product,
// verified against current sources rather than guessed (see the taxonomy
// audit this was built from). This file contains ZERO pricing or
// eligibility data on purpose; it only answers "what devices exist,"
// nothing about what CPRNME can price. See repair-eligibility.ts and
// repair-pricing.ts for the (currently empty) layers that build on this.
//
// Deliberately not exhaustive — "high-value repair-market coverage," not
// every SKU ever made. Expandable: add a model by adding one row here,
// nothing else in the customer flow needs to change.
//
// `family` maps to the existing coarse buckets ProblemSelector.tsx already
// asks about (iphone / android / tablet) — "other" has no catalog entries
// on purpose, since a customer picking "Something else" as their device has
// no exact model to look up.
export type DeviceFamily = "iphone" | "android" | "tablet";

export type DeviceModel = {
  id: string; // stable slug, e.g. "iphone-15-pro" — used as the FK-equivalent everywhere else
  family: DeviceFamily;
  manufacturer: string;
  series: string; // grouping label for the model picker, e.g. "iPhone 15", "Galaxy A"
  name: string; // full display name shown to the customer
};

export const deviceCatalog: DeviceModel[] = [
  // ---- iPhone (family: iphone) -----------------------------------------
  // Deliberately excludes the iPhone 18 line (Pro, Pro Max, and the
  // first foldable) — announced September 9, 2026, days before this
  // catalog was built. Add once Apple's own site reflects final names.
  { id: "iphone-17-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 17", name: "iPhone 17 Pro Max" },
  { id: "iphone-17-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 17", name: "iPhone 17 Pro" },
  { id: "iphone-air", family: "iphone", manufacturer: "Apple", series: "iPhone 17", name: "iPhone Air" },
  { id: "iphone-17", family: "iphone", manufacturer: "Apple", series: "iPhone 17", name: "iPhone 17" },
  { id: "iphone-17e", family: "iphone", manufacturer: "Apple", series: "iPhone 17", name: "iPhone 17e" },
  { id: "iphone-16-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 16", name: "iPhone 16 Pro Max" },
  { id: "iphone-16-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 16", name: "iPhone 16 Pro" },
  { id: "iphone-16-plus", family: "iphone", manufacturer: "Apple", series: "iPhone 16", name: "iPhone 16 Plus" },
  { id: "iphone-16", family: "iphone", manufacturer: "Apple", series: "iPhone 16", name: "iPhone 16" },
  { id: "iphone-16e", family: "iphone", manufacturer: "Apple", series: "iPhone 16", name: "iPhone 16e" },
  { id: "iphone-15-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 15", name: "iPhone 15 Pro Max" },
  { id: "iphone-15-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 15", name: "iPhone 15 Pro" },
  { id: "iphone-15-plus", family: "iphone", manufacturer: "Apple", series: "iPhone 15", name: "iPhone 15 Plus" },
  { id: "iphone-15", family: "iphone", manufacturer: "Apple", series: "iPhone 15", name: "iPhone 15" },
  { id: "iphone-14-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 14", name: "iPhone 14 Pro Max" },
  { id: "iphone-14-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 14", name: "iPhone 14 Pro" },
  { id: "iphone-14-plus", family: "iphone", manufacturer: "Apple", series: "iPhone 14", name: "iPhone 14 Plus" },
  { id: "iphone-14", family: "iphone", manufacturer: "Apple", series: "iPhone 14", name: "iPhone 14" },
  { id: "iphone-13-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 13", name: "iPhone 13 Pro Max" },
  { id: "iphone-13-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 13", name: "iPhone 13 Pro" },
  { id: "iphone-13", family: "iphone", manufacturer: "Apple", series: "iPhone 13", name: "iPhone 13" },
  { id: "iphone-13-mini", family: "iphone", manufacturer: "Apple", series: "iPhone 13", name: "iPhone 13 mini" },
  { id: "iphone-12-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 12", name: "iPhone 12 Pro Max" },
  { id: "iphone-12-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 12", name: "iPhone 12 Pro" },
  { id: "iphone-12", family: "iphone", manufacturer: "Apple", series: "iPhone 12", name: "iPhone 12" },
  { id: "iphone-12-mini", family: "iphone", manufacturer: "Apple", series: "iPhone 12", name: "iPhone 12 mini" },
  { id: "iphone-se-3", family: "iphone", manufacturer: "Apple", series: "iPhone SE", name: "iPhone SE (3rd generation, 2022)" },
  { id: "iphone-se-2", family: "iphone", manufacturer: "Apple", series: "iPhone SE", name: "iPhone SE (2nd generation, 2020)" },
  { id: "iphone-11-pro-max", family: "iphone", manufacturer: "Apple", series: "iPhone 11", name: "iPhone 11 Pro Max" },
  { id: "iphone-11-pro", family: "iphone", manufacturer: "Apple", series: "iPhone 11", name: "iPhone 11 Pro" },
  { id: "iphone-11", family: "iphone", manufacturer: "Apple", series: "iPhone 11", name: "iPhone 11" },
  { id: "iphone-xs-max", family: "iphone", manufacturer: "Apple", series: "iPhone X/XS", name: "iPhone XS Max" },
  { id: "iphone-xs", family: "iphone", manufacturer: "Apple", series: "iPhone X/XS", name: "iPhone XS" },
  { id: "iphone-xr", family: "iphone", manufacturer: "Apple", series: "iPhone X/XS", name: "iPhone XR" },
  { id: "iphone-x", family: "iphone", manufacturer: "Apple", series: "iPhone X/XS", name: "iPhone X" },
  { id: "iphone-8-plus", family: "iphone", manufacturer: "Apple", series: "iPhone 7/8", name: "iPhone 8 Plus" },
  { id: "iphone-8", family: "iphone", manufacturer: "Apple", series: "iPhone 7/8", name: "iPhone 8" },
  { id: "iphone-7-plus", family: "iphone", manufacturer: "Apple", series: "iPhone 7/8", name: "iPhone 7 Plus" },
  { id: "iphone-7", family: "iphone", manufacturer: "Apple", series: "iPhone 7/8", name: "iPhone 7" },

  // ---- Samsung Galaxy S (family: android) -------------------------------
  { id: "galaxy-s26-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S26", name: "Galaxy S26 Ultra" },
  { id: "galaxy-s26-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S26", name: "Galaxy S26+" },
  { id: "galaxy-s26", family: "android", manufacturer: "Samsung", series: "Galaxy S26", name: "Galaxy S26" },
  { id: "galaxy-s26-fe", family: "android", manufacturer: "Samsung", series: "Galaxy S26", name: "Galaxy S26 FE" },
  { id: "galaxy-s25-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S25", name: "Galaxy S25 Ultra" },
  { id: "galaxy-s25-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S25", name: "Galaxy S25+" },
  { id: "galaxy-s25", family: "android", manufacturer: "Samsung", series: "Galaxy S25", name: "Galaxy S25" },
  { id: "galaxy-s25-edge", family: "android", manufacturer: "Samsung", series: "Galaxy S25", name: "Galaxy S25 Edge" },
  { id: "galaxy-s25-fe", family: "android", manufacturer: "Samsung", series: "Galaxy S25", name: "Galaxy S25 FE" },
  { id: "galaxy-s24-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S24", name: "Galaxy S24 Ultra" },
  { id: "galaxy-s24-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S24", name: "Galaxy S24+" },
  { id: "galaxy-s24", family: "android", manufacturer: "Samsung", series: "Galaxy S24", name: "Galaxy S24" },
  { id: "galaxy-s24-fe", family: "android", manufacturer: "Samsung", series: "Galaxy S24", name: "Galaxy S24 FE" },
  { id: "galaxy-s23-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S23", name: "Galaxy S23 Ultra" },
  { id: "galaxy-s23-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S23", name: "Galaxy S23+" },
  { id: "galaxy-s23", family: "android", manufacturer: "Samsung", series: "Galaxy S23", name: "Galaxy S23" },
  { id: "galaxy-s23-fe", family: "android", manufacturer: "Samsung", series: "Galaxy S23", name: "Galaxy S23 FE" },
  { id: "galaxy-s22-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S22", name: "Galaxy S22 Ultra" },
  { id: "galaxy-s22-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S22", name: "Galaxy S22+" },
  { id: "galaxy-s22", family: "android", manufacturer: "Samsung", series: "Galaxy S22", name: "Galaxy S22" },
  { id: "galaxy-s21-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy S21", name: "Galaxy S21 Ultra" },
  { id: "galaxy-s21-plus", family: "android", manufacturer: "Samsung", series: "Galaxy S21", name: "Galaxy S21+" },
  { id: "galaxy-s21", family: "android", manufacturer: "Samsung", series: "Galaxy S21", name: "Galaxy S21" },
  { id: "galaxy-s21-fe", family: "android", manufacturer: "Samsung", series: "Galaxy S21", name: "Galaxy S21 FE" },

  // ---- Samsung Galaxy A (family: android) -------------------------------
  { id: "galaxy-a56", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A56" },
  { id: "galaxy-a36", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A36" },
  { id: "galaxy-a26", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A26" },
  { id: "galaxy-a16", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A16" },
  { id: "galaxy-a54", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A54" },
  { id: "galaxy-a34", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A34" },
  { id: "galaxy-a14", family: "android", manufacturer: "Samsung", series: "Galaxy A", name: "Galaxy A14" },

  // ---- Samsung Galaxy Z / foldables (family: android) -------------------
  // NOTE: foldables belong here for the coarse device-family bucket, but
  // get their OWN candidate repair-type vocabulary in repair-taxonomy.ts —
  // never treated as an ordinary phone display repair. See that file.
  { id: "galaxy-z-fold8-ultra", family: "android", manufacturer: "Samsung", series: "Galaxy Z (foldable)", name: "Galaxy Z Fold8 Ultra" },
  { id: "galaxy-z-fold8", family: "android", manufacturer: "Samsung", series: "Galaxy Z (foldable)", name: "Galaxy Z Fold8" },
  { id: "galaxy-z-flip8", family: "android", manufacturer: "Samsung", series: "Galaxy Z (foldable)", name: "Galaxy Z Flip8" },
  { id: "galaxy-z-fold6", family: "android", manufacturer: "Samsung", series: "Galaxy Z (foldable)", name: "Galaxy Z Fold6" },
  { id: "galaxy-z-flip6", family: "android", manufacturer: "Samsung", series: "Galaxy Z (foldable)", name: "Galaxy Z Flip6" },

  // ---- Google Pixel (family: android) ------------------------------------
  { id: "pixel-10-pro-fold", family: "android", manufacturer: "Google", series: "Pixel 10", name: "Pixel 10 Pro Fold" },
  { id: "pixel-10-pro-xl", family: "android", manufacturer: "Google", series: "Pixel 10", name: "Pixel 10 Pro XL" },
  { id: "pixel-10-pro", family: "android", manufacturer: "Google", series: "Pixel 10", name: "Pixel 10 Pro" },
  { id: "pixel-10", family: "android", manufacturer: "Google", series: "Pixel 10", name: "Pixel 10" },
  { id: "pixel-10a", family: "android", manufacturer: "Google", series: "Pixel 10", name: "Pixel 10a" },
  { id: "pixel-9-pro-fold", family: "android", manufacturer: "Google", series: "Pixel 9", name: "Pixel 9 Pro Fold" },
  { id: "pixel-9-pro-xl", family: "android", manufacturer: "Google", series: "Pixel 9", name: "Pixel 9 Pro XL" },
  { id: "pixel-9-pro", family: "android", manufacturer: "Google", series: "Pixel 9", name: "Pixel 9 Pro" },
  { id: "pixel-9", family: "android", manufacturer: "Google", series: "Pixel 9", name: "Pixel 9" },
  { id: "pixel-9a", family: "android", manufacturer: "Google", series: "Pixel 9", name: "Pixel 9a" },
  { id: "pixel-8-pro", family: "android", manufacturer: "Google", series: "Pixel 8", name: "Pixel 8 Pro" },
  { id: "pixel-8", family: "android", manufacturer: "Google", series: "Pixel 8", name: "Pixel 8" },
  { id: "pixel-8a", family: "android", manufacturer: "Google", series: "Pixel 8", name: "Pixel 8a" },
  { id: "pixel-7-pro", family: "android", manufacturer: "Google", series: "Pixel 7", name: "Pixel 7 Pro" },
  { id: "pixel-7", family: "android", manufacturer: "Google", series: "Pixel 7", name: "Pixel 7" },
  { id: "pixel-7a", family: "android", manufacturer: "Google", series: "Pixel 7", name: "Pixel 7a" },

  // ---- Motorola (family: android) ----------------------------------------
  // Deliberately limited to the current, verified Edge lineup — the Moto G
  // line is real and high-volume but exact current-year model names
  // weren't confirmed in this pass; add once verified rather than guessed.
  { id: "moto-edge-70", family: "android", manufacturer: "Motorola", series: "Motorola Edge", name: "Motorola Edge 70 / Fusion+" },
  { id: "moto-edge-60-pro", family: "android", manufacturer: "Motorola", series: "Motorola Edge", name: "Motorola Edge 60 Pro" },
  { id: "moto-edge-60-neo", family: "android", manufacturer: "Motorola", series: "Motorola Edge", name: "Motorola Edge 60 Neo" },

  // ---- Apple iPad (family: tablet) ---------------------------------------
  { id: "ipad-pro-13-m5", family: "tablet", manufacturer: "Apple", series: "iPad Pro", name: "iPad Pro 13\" (M5)" },
  { id: "ipad-pro-11-m5", family: "tablet", manufacturer: "Apple", series: "iPad Pro", name: "iPad Pro 11\" (M5)" },
  { id: "ipad-pro-12-9-m4", family: "tablet", manufacturer: "Apple", series: "iPad Pro", name: "iPad Pro 12.9\" (M4)" },
  { id: "ipad-pro-11-m4", family: "tablet", manufacturer: "Apple", series: "iPad Pro", name: "iPad Pro 11\" (M4)" },
  { id: "ipad-air-13-m4", family: "tablet", manufacturer: "Apple", series: "iPad Air", name: "iPad Air 13\" (M4)" },
  { id: "ipad-air-11-m4", family: "tablet", manufacturer: "Apple", series: "iPad Air", name: "iPad Air 11\" (M4)" },
  { id: "ipad-air-13-m2", family: "tablet", manufacturer: "Apple", series: "iPad Air", name: "iPad Air 13\" (M2)" },
  { id: "ipad-air-11-m2", family: "tablet", manufacturer: "Apple", series: "iPad Air", name: "iPad Air 11\" (M2)" },
  { id: "ipad-mini-a17-pro", family: "tablet", manufacturer: "Apple", series: "iPad mini", name: "iPad mini (A17 Pro)" },
  { id: "ipad-11th-gen", family: "tablet", manufacturer: "Apple", series: "iPad", name: "iPad (11th generation, A16)" },
  { id: "ipad-10th-gen", family: "tablet", manufacturer: "Apple", series: "iPad", name: "iPad (10th generation)" },
  { id: "ipad-9th-gen", family: "tablet", manufacturer: "Apple", series: "iPad", name: "iPad (9th generation)" },

  // ---- Samsung Galaxy Tab (family: tablet) -------------------------------
  { id: "galaxy-tab-s11", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S11", name: "Galaxy Tab S11" },
  { id: "galaxy-tab-s10-ultra", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S10", name: "Galaxy Tab S10 Ultra" },
  { id: "galaxy-tab-s10-plus", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S10", name: "Galaxy Tab S10+" },
  { id: "galaxy-tab-s10-fe-plus", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S10", name: "Galaxy Tab S10 FE+" },
  { id: "galaxy-tab-s10-fe", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S10", name: "Galaxy Tab S10 FE" },
  { id: "galaxy-tab-s10-lite", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab S10", name: "Galaxy Tab S10 Lite" },
  { id: "galaxy-tab-a11-plus", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab A", name: "Galaxy Tab A11+" },
  { id: "galaxy-tab-a11", family: "tablet", manufacturer: "Samsung", series: "Galaxy Tab A", name: "Galaxy Tab A11" },
];

const byId = new Map(deviceCatalog.map((m) => [m.id, m]));

export function getDeviceModel(id: string): DeviceModel | undefined {
  return byId.get(id);
}

export function getModelsForFamily(family: DeviceFamily): DeviceModel[] {
  return deviceCatalog.filter((m) => m.family === family);
}

// True for Z Fold/Flip/Pixel Fold-style devices — used to route these to
// their own repair-type vocabulary instead of the ordinary phone one, per
// the taxonomy revision that treats foldables as a distinct architecture,
// not a phone variant.
export function isFoldable(id: string): boolean {
  return id.includes("fold") || id.includes("flip");
}

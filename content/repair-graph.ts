// The internal-linking system called for in the Architecture Plan (Section 13):
// one data file encodes every page as a node, and breadcrumbs / "related"
// components read it — so adding a page means adding a node here, not
// hand-placing links on every page that should point to it.
//
// Deliberately small right now (Phase 4's "first handful"). Two things are
// intentionally absent from every node below, matching open business
// decisions that haven't been made yet:
//   - no on-site/mobile-service claims (service model unconfirmed)
//   - no location nodes (service territory unconfirmed)

export type RepairNode = {
  slug: string; // "" = home, otherwise the route path with no leading slash
  title: string; // full page <h1>
  shortLabel: string; // used in breadcrumbs and related-page cards
  // hub = device page (iPhone Repair). topic = cross-device problem page
  // (Phone Screen Repair, Charging Port Repair). problem = a specific
  // device x problem page (iPhone Screen Repair). guide = decision-support
  // content.
  kind: "home" | "hub" | "topic" | "problem" | "guide";
  parent?: string; // slug of the parent node, for the breadcrumb trail
  related?: string[]; // extra edges beyond parent/child (e.g. cross-device links)
  summary: string; // one line, used on related-page cards
};

export const repairGraph: RepairNode[] = [
  {
    slug: "",
    title: "Cell Phone Repair Near Me",
    shortLabel: "Home",
    kind: "home",
    summary: "Find the right repair for your phone.",
  },
  {
    slug: "iphone-repair",
    title: "iPhone Repair",
    shortLabel: "iPhone Repair",
    kind: "hub",
    parent: "",
    related: ["charging-port-repair", "water-damage-phone-repair", "ipad-tablet-repair"],
    summary: "Screen, battery, charging, and water damage repair for iPhone.",
  },
  {
    slug: "iphone-screen-repair",
    title: "iPhone Screen Repair",
    shortLabel: "iPhone Screen Repair",
    kind: "problem",
    parent: "iphone-repair",
    related: ["phone-screen-repair", "iphone-battery-replacement"],
    summary: "What a cracked or unresponsive iPhone screen actually needs.",
  },
  {
    slug: "iphone-battery-replacement",
    title: "iPhone Battery Replacement",
    shortLabel: "iPhone Battery Replacement",
    kind: "problem",
    parent: "iphone-repair",
    related: ["iphone-screen-repair", "guides/repair-vs-replace"],
    summary: "Why iPhone batteries fade, and how to tell it's time.",
  },
  {
    slug: "phone-screen-repair",
    title: "Phone Screen Repair",
    shortLabel: "Phone Screen Repair",
    kind: "topic",
    parent: "",
    related: ["iphone-screen-repair", "samsung-android-repair"],
    summary: "Cracked-screen repair basics that apply across devices.",
  },
  {
    slug: "samsung-android-repair",
    title: "Samsung / Android Repair",
    shortLabel: "Samsung / Android Repair",
    kind: "hub",
    parent: "",
    related: ["phone-screen-repair", "charging-port-repair", "water-damage-phone-repair", "ipad-tablet-repair"],
    summary: "Screen, battery, charging, and water damage repair for Android phones.",
  },
  {
    slug: "ipad-tablet-repair",
    title: "iPad & Tablet Repair",
    shortLabel: "iPad & Tablet Repair",
    kind: "hub",
    parent: "",
    related: ["phone-screen-repair", "charging-port-repair"],
    summary: "Screen, battery, and charging repair for iPad and other tablets.",
  },
  {
    slug: "charging-port-repair",
    title: "Charging Port Repair",
    shortLabel: "Charging Port Repair",
    kind: "topic",
    parent: "",
    related: ["iphone-repair", "samsung-android-repair"],
    summary: "Why phones stop charging reliably, and how to tell the port is the cause.",
  },
  {
    slug: "water-damage-phone-repair",
    title: "Water Damage Phone Repair",
    shortLabel: "Water Damage Repair",
    kind: "topic",
    parent: "",
    related: ["iphone-repair", "samsung-android-repair"],
    summary: "What to do in the first few minutes, and what happens after that.",
  },
  {
    slug: "guides/repair-vs-replace",
    title: "Repair vs. Replace: Is Your Phone Worth Fixing?",
    shortLabel: "Repair vs. Replace",
    kind: "guide",
    parent: "",
    related: ["iphone-battery-replacement"],
    summary: "What actually determines whether a repair is worth it.",
  },
];

const bySlug = new Map(repairGraph.map((n) => [n.slug, n]));

export function getNode(slug: string): RepairNode | undefined {
  return bySlug.get(slug);
}

// Home -> ... -> this page, for the breadcrumb trail.
export function getBreadcrumbTrail(slug: string): RepairNode[] {
  const trail: RepairNode[] = [];
  let current = bySlug.get(slug);
  while (current) {
    trail.unshift(current);
    current = current.parent !== undefined ? bySlug.get(current.parent) : undefined;
    if (current && trail.some((n) => n.slug === current!.slug)) break; // guard against cycles
  }
  return trail;
}

// Parent + siblings (same parent) + explicit `related` edges, deduped,
// excluding the page itself. Siblings only count when the shared parent is
// a real hub (e.g. iPhone Screen Repair / iPhone Battery Replacement under
// iPhone Repair) — every top-level page technically shares the "home"
// parent, and as more hub/topic pages are added that would make every one
// of them "related" to all the others by accident. Top-level nodes rely on
// their explicit `related` edges instead, which is where the actual
// judgment calls belong.
export function getRelated(slug: string): RepairNode[] {
  const node = bySlug.get(slug);
  if (!node) return [];
  const ids = new Set<string>();
  if (node.parent) {
    ids.add(node.parent);
    for (const sibling of repairGraph) {
      if (sibling.parent === node.parent && sibling.slug !== slug) ids.add(sibling.slug);
    }
  }
  for (const r of node.related ?? []) ids.add(r);
  ids.delete(slug);
  return [...ids].map((s) => bySlug.get(s)).filter((n): n is RepairNode => !!n);
}

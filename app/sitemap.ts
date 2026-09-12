import type { MetadataRoute } from "next";
import { repairGraph } from "@/content/repair-graph";
import { businessInfo } from "@/content/business-info";

// Generated straight from the taxonomy graph, per the "one node -> multiple
// controlled outputs" rule: every route in repair-graph.ts appears here
// automatically, so a page can't be forgotten from the sitemap the way a
// hand-maintained list eventually would be.
export default function sitemap(): MetadataRoute.Sitemap {
  const fromGraph: MetadataRoute.Sitemap = repairGraph.map((node) => ({
    url: node.slug === "" ? businessInfo.siteUrl : `${businessInfo.siteUrl}/${node.slug}`,
    changeFrequency: node.kind === "home" ? "weekly" : "monthly",
    priority: node.kind === "home" ? 1 : node.kind === "hub" ? 0.8 : 0.6,
  }));

  // /repairs is a generated index over the graph, not a graph node itself
  // (it has no breadcrumb trail or "related" edges of its own) — added here
  // by hand for that reason, the one exception to "everything comes from
  // the graph."
  const repairsIndex: MetadataRoute.Sitemap = [
    { url: `${businessInfo.siteUrl}/repairs`, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [...fromGraph, ...repairsIndex];
}

import type { MetadataRoute } from "next";
import { repairGraph } from "@/content/repair-graph";
import { businessInfo } from "@/content/business-info";
import { getPublishedLocationPages } from "@/content/location-pages";

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

  // /repairs and /locations are generated indexes, not graph nodes — added
  // here by hand for that reason.
  const indexes: MetadataRoute.Sitemap = [
    { url: `${businessInfo.siteUrl}/repairs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${businessInfo.siteUrl}/locations`, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Location pages: only the ones getPublishedLocationPages() says are
  // actually confirmed for coverage today — a noindexed exists-no-claim
  // page never appears here. This list grows or shrinks automatically as
  // coverage confirmation changes; nothing here is a hand-maintained list
  // of city names.
  const locations: MetadataRoute.Sitemap = getPublishedLocationPages().map(({ slug, city }) => ({
    url: `${businessInfo.siteUrl}/locations/${slug}`,
    changeFrequency: "monthly",
    priority: city.tier === 1 ? 0.7 : 0.5,
  }));

  return [...fromGraph, ...indexes, ...locations];
}

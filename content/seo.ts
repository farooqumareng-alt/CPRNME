import type { Metadata } from "next";
import { businessInfo } from "./business-info";
import type { CityRecord } from "./location-eligibility";
import { getPublishDecision } from "./location-publish-rule";

// One function building the complete, correct metadata object for a page —
// title, description, canonical, Open Graph, and Twitter Card all derive
// from the same two strings, so a page can't end up with a real <title> but
// a missing or stale social-preview title (found missing entirely for
// every page during the Phase 7 technical audit). The actual share image
// comes from app/opengraph-image.tsx via Next's file-convention — every
// page gets it automatically, nothing to reference here.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string; // e.g. "/" or "/iphone-repair"
}): Metadata {
  const url = path === "/" ? businessInfo.siteUrl : `${businessInfo.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: businessInfo.brandName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Same as pageMetadata(), plus the noindex directive location pages need —
// derived from the dataset-driven publish rule (location-publish-rule.ts),
// never hand-set per page. A page's indexability changes automatically the
// moment its city's coverage status changes; no page file needs editing.
export function locationPageMetadata({
  city,
  title,
  description,
  path,
}: {
  city: CityRecord;
  title: string;
  description: string;
  path: string;
}): Metadata {
  const decision = getPublishDecision(city);
  return {
    ...pageMetadata({ title, description, path }),
    robots: decision === "publish" ? undefined : { index: false, follow: true },
  };
}

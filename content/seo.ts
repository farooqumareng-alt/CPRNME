import type { Metadata } from "next";
import { businessInfo } from "./business-info";

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

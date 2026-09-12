import type { MetadataRoute } from "next";
import { businessInfo } from "@/content/business-info";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${businessInfo.siteUrl}/sitemap.xml`,
  };
}

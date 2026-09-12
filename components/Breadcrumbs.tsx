import { getBreadcrumbTrail } from "@/content/repair-graph";
import { businessInfo } from "@/content/business-info";

// Visual breadcrumbs plus BreadcrumbList JSON-LD — the schema wants absolute
// URLs, which needed a confirmed production domain; that's now set in
// business-info.ts, so both render from the same trail data.
export function Breadcrumbs({ slug }: { slug: string }) {
  const trail = getBreadcrumbTrail(slug);
  if (trail.length <= 1) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((node, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: node.shortLabel,
      item: `${businessInfo.siteUrl}/${node.slug}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol>
        {trail.map((node, i) => {
          const isLast = i === trail.length - 1;
          const href = node.slug === "" ? "/" : `/${node.slug}`;
          return (
            <li key={node.slug || "home"}>
              {isLast ? (
                <span aria-current="page">{node.shortLabel}</span>
              ) : (
                <a href={href}>{node.shortLabel}</a>
              )}
              {!isLast && <span aria-hidden="true"> / </span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

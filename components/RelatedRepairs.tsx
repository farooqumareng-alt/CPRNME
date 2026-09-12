import { getRelated } from "@/content/repair-graph";

export function RelatedRepairs({ slug }: { slug: string }) {
  const related = getRelated(slug);
  if (related.length === 0) return null;

  return (
    <div className="related-block">
      <h3>Related repairs</h3>
      <div className="related-grid">
        {related.map((node) => (
          <a
            key={node.slug}
            href={node.slug === "" ? "/" : `/${node.slug}`}
            className="related-card"
          >
            <span className="related-kind">{labelFor(node.kind)}</span>
            <span className="related-title">{node.shortLabel}</span>
            <span className="related-summary">{node.summary}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function labelFor(kind: string) {
  switch (kind) {
    case "hub":
      return "Device";
    case "topic":
      return "Topic";
    case "problem":
      return "Repair";
    case "guide":
      return "Guide";
    default:
      return "Page";
  }
}

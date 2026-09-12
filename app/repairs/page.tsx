import type { Metadata } from "next";
import { repairGraph } from "@/content/repair-graph";

export const metadata: Metadata = {
  title: "All Repairs | CPRNME",
  description: "Every device, problem, and guide page on CPRNME, in one place.",
  alternates: { canonical: "/repairs" },
};

const KIND_LABEL: Record<string, string> = {
  hub: "By device",
  topic: "By problem",
  guide: "Guides",
};

export default function RepairsIndexPage() {
  const groups: Record<string, typeof repairGraph> = { hub: [], topic: [], guide: [] };
  for (const node of repairGraph) {
    if (node.kind in groups) groups[node.kind].push(node);
  }

  return (
    <>
      <section className="page-hero container">
        <h1>All Repairs</h1>
        <p className="hero-tagline">
          Every device, problem, and guide page CPRNME has published so far —
          this list grows as new pages are added, and nothing here is a dead
          end.
        </p>
      </section>

      {(["hub", "topic", "guide"] as const).map((kind) =>
        groups[kind].length ? (
          <section key={kind} className="section container">
            <h2>{KIND_LABEL[kind]}</h2>
            <div className="related-grid" style={{ marginTop: "16px" }}>
              {groups[kind].map((node) => (
                <a key={node.slug} href={`/${node.slug}`} className="related-card">
                  <span className="related-title">{node.shortLabel}</span>
                  <span className="related-summary">{node.summary}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null
      )}
    </>
  );
}

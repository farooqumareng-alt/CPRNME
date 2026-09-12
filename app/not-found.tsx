import { pageMetadata } from "@/content/seo";

// Replaces Next's bare, unbranded default 404 (found during the Phase 7
// audit rendering an unstyled black-on-white message and, because it uses
// Next's legacy internal <title> element rather than the Metadata API, a
// second literal <title> tag alongside the layout's — invalid HTML, and
// ambiguous about what a browser tab or crawler should show). This page
// uses the Metadata API properly, so there's exactly one <title>, and it's
// noindexed since a 404 has nothing to index.
// No explicit `robots` field: Next automatically adds noindex to the
// not-found boundary's response regardless, so adding one here just
// produced a redundant second <meta name="robots"> tag.
export const metadata = pageMetadata({
  title: "Page Not Found | CPRNME",
  description: "That page doesn't exist. Find your repair from the homepage instead.",
  path: "/404",
});

export default function NotFound() {
  return (
    <section className="page-hero container">
      <h1>Page not found</h1>
      <p className="hero-tagline">
        That page doesn&rsquo;t exist, or it&rsquo;s moved. The device and problem
        selector on the homepage is the fastest way to find what you were
        looking for.
      </p>
      <div className="btn-row">
        <a href="/#find-repair" className="btn btn-primary">
          Find My Repair
        </a>
        <a href="/repairs" className="btn btn-secondary">
          See All Repairs
        </a>
      </div>
    </section>
  );
}

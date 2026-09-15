import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { OrganizationSchema } from "@/components/OrganizationSchema";

// The public marketing site's chrome, previously in the true root layout.
// Moved here (a route-group layout, not the root) specifically so /admin/*
// — which sits outside this group — never renders a "Find My Repair" CTA
// or a customer call button. This has to be a route-group split, not a
// runtime pathname check: a runtime check needs headers()/cookies(),
// either of which opts every page that renders it into dynamic rendering
// — tried that first, it turned all 62 previously-static pages dynamic,
// reverted immediately. A route group costs nothing at request time; the
// split is resolved at build time by which files live in which folder.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // .site-shell reserves bottom space for the fixed MobileCtaBar below —
    // see app/globals.css. Scoped to this wrapper (not the bare <body> in
    // the true root layout) so /admin/* and /technician/*, which render no
    // such bar, don't carry the same dead space.
    <div className="site-shell">
      <OrganizationSchema />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  );
}

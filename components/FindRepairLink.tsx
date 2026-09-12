"use client";

// The one "Find My Repair" link used by the site-wide header, mobile sticky
// bar, and footer — everywhere except the location-page template, which
// already builds its own ?from= link server-side because it knows its own
// city at build time (see LocationPageTemplate.tsx). These three call sites
// don't: they're rendered once from the root layout for every page, so the
// only way to know "are we currently on a location page" is client-side, via
// usePathname(). A tiny client island, not a reason to convert the header,
// footer, or mobile bar themselves to client components.
//
// Off a location page (the vast majority of traffic), this renders exactly
// the plain "/#find-repair" link it's replacing — same href, same behavior.
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isBuiltLocationSlug } from "@/content/location-pages";

export function FindRepairLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const match = pathname?.match(/^\/locations\/([a-z0-9-]+)\/?$/);
  const slug = match?.[1];
  const href = slug && isBuiltLocationSlug(slug) ? `/?from=${slug}#find-repair` : "/#find-repair";

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

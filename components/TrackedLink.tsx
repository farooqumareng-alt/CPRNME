"use client";

import { track } from "@vercel/analytics";
import type { AnchorHTMLAttributes } from "react";

// A plain <a> that fires one custom Vercel Analytics event on click, then
// behaves exactly like a normal link. Used for the two links that need
// tracking but don't otherwise need any interactivity (Call), so the
// server components that use it (SiteFooter, MobileCtaBar) stay server
// components apart from this one small client leaf.
type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  eventData?: Record<string, string | number | boolean>;
};

export function TrackedLink({ event, eventData, onClick, ...anchorProps }: TrackedLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(e) => {
        track(event, eventData);
        onClick?.(e);
      }}
    />
  );
}

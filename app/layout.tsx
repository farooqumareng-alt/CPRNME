import type { Metadata, Viewport } from "next";
import { Manrope, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { businessInfo } from "@/content/business-info";

// Design-system fonts (Phase 2, Section 3): Manrope for headings, Public Sans
// for body copy, IBM Plex Mono reserved for the occasional technical label
// (e.g. step numbers). Self-hosted via next/font — no external request, no
// layout shift.
const heading = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// metadataBase only — title/description/canonical/OG/Twitter are set per
// page via content/seo.ts's pageMetadata(), including the homepage
// (app/page.tsx), so nothing here would ever actually be used as a
// fallback. Kept minimal rather than duplicated.
export const metadata: Metadata = {
  metadataBase: new URL(businessInfo.siteUrl),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// The true, minimal shell — html/body/fonts/Analytics only. The public
// site's chrome (header, footer, mobile CTA bar, Organization schema) now
// lives in app/(site)/layout.tsx, a route-group layout that /admin/*
// deliberately falls outside of. See that file for why this had to be a
// route-group split rather than a runtime check.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

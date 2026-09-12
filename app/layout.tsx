import type { Metadata, Viewport } from "next";
import { Manrope, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { businessInfo } from "@/content/business-info";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { OrganizationSchema } from "@/components/OrganizationSchema";

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

export const metadata: Metadata = {
  metadataBase: new URL(businessInfo.siteUrl),
  title: "CPRNME — Cell Phone Repair Near Me",
  description:
    "Tell us your device and what's wrong with it, and CPRNME will help you find the right phone repair.",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <OrganizationSchema />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <MobileCtaBar />
      </body>
    </html>
  );
}

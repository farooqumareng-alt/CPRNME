import { ImageResponse } from "next/og";
import { businessInfo } from "@/content/business-info";

// Next's file-convention: this applies as the default share-preview image
// for every page automatically — no per-page reference needed, and a
// page-specific one could still override it later by adding its own
// opengraph-image file in that route folder. A generated brand card, not a
// real photo standing in for one — that's exactly the honest option while
// no real photography exists yet.
export const alt = `${businessInfo.brandName} — ${businessInfo.fullName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#f5f5f6",
          padding: "90px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            color: "#64656a",
            textTransform: "uppercase",
            marginBottom: 28,
            display: "flex",
          }}
        >
          {businessInfo.brandName}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: "#202124",
            lineHeight: 1.1,
            maxWidth: 950,
            display: "flex",
          }}
        >
          {businessInfo.fullName}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#55565a",
            marginTop: 36,
            maxWidth: 820,
            display: "flex",
          }}
        >
          Tell us your device and the problem — we&apos;ll help you find the right repair.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 14,
            backgroundColor: "#c6c7c9",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { getStats } from "@/lib/data";

export const runtime = "edge";
export const alt = "RootDB — Can You Root It?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const stats = getStats();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e1e2e",
          color: "#cdd6f4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              letterSpacing: "-2px",
            }}
          >
            Root
            <span style={{ color: "#cba6f7" }}>DB</span>
          </div>
        </div>

        <div
          style={{
            fontSize: "32px",
            color: "#a6adc8",
            marginBottom: "48px",
          }}
        >
          Can you root it?
        </div>

        <div
          style={{
            display: "flex",
            gap: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 700, color: "#a6e3a1" }}>
              {stats.totalDevices}
            </div>
            <div style={{ fontSize: "18px", color: "#a6adc8" }}>Devices</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 700, color: "#89b4fa" }}>
              {stats.totalVariants}
            </div>
            <div style={{ fontSize: "18px", color: "#a6adc8" }}>Variants</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 700, color: "#cba6f7" }}>
              {stats.totalGuides}
            </div>
            <div style={{ fontSize: "18px", color: "#a6adc8" }}>Guides</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
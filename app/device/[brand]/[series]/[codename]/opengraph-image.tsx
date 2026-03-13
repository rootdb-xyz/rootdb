import { ImageResponse } from "next/og";
import { getDevice, getBrands, getTags } from "@/lib/data";
import { calculateRootScore } from "@/lib/utils";

export const runtime = "nodejs"; 
export const alt = "Device Root Status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ brand: string; series: string; codename: string }> }) {
  const { brand, series, codename } = await params;
  const device = await getDevice(brand, series, codename);
  const brands = await getBrands();
  const tags = await getTags();

  const brandName = brands[brand]?.name ?? brand;
  const deviceName = device?.name ?? codename;
  const variantCount = device?.variants?.length ?? 0;
  const rootable = device?.variants?.filter((v) => !v.tags.includes("locked_bootloader")).length ?? 0;
  
  const bestScore = device?.variants && device.variants.length > 0
    ? Math.max(...device.variants.map((v) => calculateRootScore(v, tags)))
    : 0;

  const scoreColor = bestScore >= 75 ? "#a6e3a1" : bestScore >= 50 ? "#89b4fa" : bestScore >= 25 ? "#f9e2af" : "#f38ba8";

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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: "24px", color: "#a6adc8", marginBottom: "8px" }}>
          RootDB
        </div>
        <div style={{ display: "flex", fontSize: "56px", fontWeight: 800, marginBottom: "16px" }}>
          {brandName} {deviceName}
        </div>
        <div
          style={{
            display: "flex", // Explicitly flex (3 blocks)
            gap: "48px",
            marginTop: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, color: scoreColor }}>
              {bestScore}
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#a6adc8" }}>Root Score</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, color: "#a6e3a1" }}>
              {rootable}
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#a6adc8" }}>Rootable</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 800 }}>
              {variantCount}
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#a6adc8" }}>Variants</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

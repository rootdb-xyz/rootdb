import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getDevice,
  getAllDevices,
  getTags,
  getRegions,
  getBrands,
  getGuide,
} from "@/lib/data";
import { calculateRootScore } from "@/lib/utils";
import { VariantCard } from "@/components/variant-card";
import { RemoveDeviceButton } from "@/components/remove-device-button";
import { ChevronRight, Cpu, HelpCircle } from "lucide-react";
import type { Tag, Region } from "@/lib/types";
import { features } from "@/lib/features";

interface Props {
  params: Promise<{ brand: string; series: string; codename: string }>;
}

export async function generateStaticParams() {
  const devices = await getAllDevices(); // Fetch the data first
  return devices.map((d) => ({
    brand: d.brand_id,
    series: d.series_id,
    codename: d.codename,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, series, codename } = await params;
  const device = await getDevice(brand, series, codename); 
  if (!device) return { title: "Device Not Found" };
  const brands = await getBrands();
  const brandName = brands[brand]?.name ?? brand;
  return {
    title: `${brandName} ${device.name} — Root Status`,
    description: `Root status for every ${device.name} variant. ${device.variants.length} model numbers tracked.`,
  };
}

export interface EnrichedVariant {
  model: string;
  regionId: string;
  soc: string;
  carrier?: string;
  tags: string[];
  guideIds: string[];
  affiliateUrl?: string;
  notes?: string;
  score: number;
  region: Region | null;
  resolvedTags: Tag[];
  guideTitles: Record<string, string>;
}

export default async function DevicePage({ params }: Props) {
  const { brand, series, codename } = await params;
  const device = await getDevice(brand, series, codename); // Add await
  if (!device) notFound();

  const tags = await getTags(); // Add await
  const regions = await getRegions(); // Add await
  const brands = await getBrands(); // Add await
  const brandName = brands[brand]?.name ?? brand;

  // Resolve guide titles
  const allGuideIds = new Set<string>();
  for (const v of device.variants) {
    for (const gid of v.guide_ids ?? []) allGuideIds.add(gid);
  }
  const guideTitles: Record<string, string> = {};
  for (const gid of allGuideIds) {
    const g = await getGuide(gid); // Add await inside this loop
    if (g) guideTitles[gid] = g.title;
  }

  // Enrich variants
  const enriched: EnrichedVariant[] = device.variants
    .map((v) => ({
      model: v.model,
      regionId: v.region_id,
      soc: v.soc ?? device.soc,
      carrier: v.carrier,
      tags: v.tags,
      guideIds: v.guide_ids ?? [],
      affiliateUrl: v.affiliate_url,
      notes: v.notes,
      score: calculateRootScore(v, tags),
      region: regions[v.region_id] ?? null,
      resolvedTags: v.tags.map((t) => tags[t]).filter(Boolean),
      guideTitles,
    }))
    .sort((a, b) => b.score - a.score);

  const rootable = enriched.filter((v) => v.score > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 pt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/search?brand=${brand}`} className="capitalize hover:text-foreground transition-colors">{brandName}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{device.name}</span>
      </nav>

      {/* Header */}
      <header className="pt-8 pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {brandName} {device.name}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" />{device.soc}</span>
          {device.ram && <><span className="text-border">•</span><span>RAM: {device.ram}</span></>}
          {device.launch_os && <><span className="text-border">•</span><span>Launch: {device.launch_os}</span></>}
          {device.current_os && <><span className="text-border">•</span><span>Latest: {device.current_os}</span></>}
        </p>
        <p className="mt-3 text-sm">
          <span className="text-ctp-green font-semibold">{rootable}</span>
          <span className="text-muted-foreground"> of {enriched.length} variants rootable</span>
        </p>
      </header>

      {/* Model number helper */}
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-ctp-blue/20 bg-ctp-blue/5 p-4">
        <HelpCircle className="h-5 w-5 shrink-0 text-ctp-blue mt-0.5" />
        <div>
          <p className="text-sm font-medium">Find your exact model number</p>
          <p className="mt-1 text-sm text-muted-foreground">
            On your phone:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">Settings → About Phone → Model Number</code>
          </p>
        </div>
      </div>

      {/* Variant Cards */}
      <section className="mt-8 pb-8">
        <h2 className="mb-4 text-lg font-semibold">
          {enriched.length} Variant{enriched.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-4">
          {enriched.map((ev) => (
            <VariantCard key={ev.model} variant={ev} codename={codename} affiliatesEnabled={features.affiliateLinks} />
          ))}
        </div>
      </section>

      {/* Removal request */}
      <div className="pb-16">
        <RemoveDeviceButton
          brandId={brand}
          seriesId={series}
          codename={codename}
          deviceName={`${brandName} ${device.name}`}
        />
      </div>
    </div>
  );
}
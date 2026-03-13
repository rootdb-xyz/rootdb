import Link from "next/link";
import type { Metadata } from "next";
import { Smartphone, Cpu } from "lucide-react";
import { getAllDevices, getBrands, getTags } from "@/lib/data";
import { calculateRootScore } from "@/lib/utils";
import { ScoreBadge } from "@/components/score-badge";
import { BrowseFilters } from "@/components/browse-filters";

export const metadata: Metadata = {
  title: "Browse Devices",
  description: "Browse every Android device in the RootDB database. Filter by brand, SoC, and root status.",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    status?: string;
    soc?: string;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;

  // 2. Add 'await' to all these calls because they return Promises
  const allDevices = await getAllDevices();
  const brands = await getBrands();
  const tags = await getTags();

  // Collect unique values for filters
  const uniqueBrands = [...new Set(allDevices.map((d) => d.brand_id))].sort();
  const uniqueSocs = [
    ...new Set(
      allDevices.flatMap((d) => {
        const socs = [d.soc];
        d.variants?.forEach((v) => {
          if (v.soc) socs.push(v.soc);
        });
        return socs;
      })
    ),
  ].sort();

  // Filter devices
  let filtered = allDevices;

  if (params.q && params.q.trim().length > 0) {
    const q = params.q.toLowerCase().trim();
    filtered = filtered.filter((d) => {
      const brandName = brands[d.brand_id]?.name ?? d.brand_id;
      if (d.name.toLowerCase().includes(q)) return true;
      if (d.codename.toLowerCase().includes(q)) return true;
      if (brandName.toLowerCase().includes(q)) return true;
      if (`${brandName} ${d.name}`.toLowerCase().includes(q)) return true;
      if (d.variants?.some((v) => v.model.toLowerCase().replace(/-/g, "").includes(q.replace(/-/g, "")))) return true;
      return false;
    });
  }

  if (params.brand) {
    filtered = filtered.filter((d) => d.brand_id === params.brand);
  }

  if (params.soc) {
    filtered = filtered.filter((d) => {
      if (d.soc.toLowerCase().includes(params.soc!.toLowerCase())) return true;
      return d.variants?.some((v) => v.soc?.toLowerCase().includes(params.soc!.toLowerCase()));
    });
  }

  if (params.status === "rootable") {
    filtered = filtered.filter((d) =>
      d.variants?.some((v) => !v.tags.includes("locked_bootloader"))
    );
  } else if (params.status === "locked") {
    filtered = filtered.filter((d) =>
      d.variants?.every((v) => v.tags.includes("locked_bootloader"))
    );
  }

  // Compute best score per device
  const devicesWithScore = filtered.map((d) => {
    const scores = d.variants?.map((v) => calculateRootScore(v, tags)) ?? [0];
    const bestScore = Math.max(...scores);
    const rootableCount = d.variants?.filter((v) => !v.tags.includes("locked_bootloader")).length ?? 0;
    return { ...d, bestScore, rootableCount };
  });

  devicesWithScore.sort((a, b) => b.bestScore - a.bestScore);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">
          {params.q ? (
            <>
              Results for &ldquo;{params.q}&rdquo;
            </>
          ) : (
            "Browse Devices"
          )}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {devicesWithScore.length} device{devicesWithScore.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filters */}
      <BrowseFilters
        brands={uniqueBrands.map((id) => ({ id, name: brands[id]?.name ?? id }))}
        socs={uniqueSocs}
        currentBrand={params.brand}
        currentStatus={params.status}
        currentSoc={params.soc}
        currentQuery={params.q}
      />

      {/* Device grid */}
      {devicesWithScore.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {devicesWithScore.map((d) => {
            const brandName = brands[d.brand_id]?.name ?? d.brand_id;
            return (
              <Link
                key={`${d.brand_id}-${d.series_id}-${d.codename}`}
                href={`/device/${d.brand_id}/${d.series_id}/${d.codename}`}
                className="group flex items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{brandName} {d.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Cpu className="h-3 w-3" />
                    <span className="truncate">{d.soc}</span>
                  </p>
                  <p className="mt-1 text-xs">
                    <span className={d.rootableCount > 0 ? "text-ctp-green" : "text-ctp-red"}>
                      {d.rootableCount}/{d.variants?.length ?? 0} rootable
                    </span>
                  </p>
                </div>
                <ScoreBadge score={d.bestScore} size="sm" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-semibold">No devices found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different filters or{" "}
            <Link href="/contribute" className="text-primary hover:underline">
              add a device
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
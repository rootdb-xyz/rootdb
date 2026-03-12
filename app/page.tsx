import Link from "next/link";
import { Smartphone, BookOpen, Cpu, Layers, TrendingUp, ArrowRight } from "lucide-react";
import { getStats, getAllDevices, getTags, getBrands } from "@/lib/data";
import { calculateRootScore, getScoreTier } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { ScoreBadge } from "@/components/score-badge";

export default function HomePage() {
  const stats = getStats();
  const devices = getAllDevices();
  const tags = getTags();
  const brands = getBrands();

  // Build "highest rated" list
  const scored = devices
    .map((d) => {
      const scores = d.variants?.map((v) => calculateRootScore(v, tags)) ?? [0];
      const bestScore = Math.max(...scores);
      const rootable = d.variants?.filter((v) => !v.tags.includes("locked_bootloader")).length ?? 0;
      return { ...d, bestScore, rootable };
    })
    .filter((d) => d.bestScore > 0)
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pb-20 pt-28">
        <div className="pointer-events-none absolute top-24 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />

        <h1 className="relative z-10 text-center text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Can you{" "}
          <span className="bg-gradient-to-r from-ctp-mauve to-ctp-blue bg-clip-text text-transparent">
            root
          </span>{" "}
          it?
        </h1>

        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-muted-foreground text-lg">
          Search any Android phone by <strong>model number</strong> or{" "}
          <strong>codename</strong>. Instant rootability verdicts — even for US
          carrier&nbsp;variants.
        </p>

        <div className="relative z-10 mt-10 w-full max-w-2xl">
          <SearchBar />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Try{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">SM-S918B</code>,{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Galaxy S24 Ultra</code>, or{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">beyond1</code>
        </p>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={<Smartphone className="h-6 w-6" />} value={stats.totalDevices} label="Devices" />
          <StatCard icon={<Layers className="h-6 w-6" />} value={stats.totalVariants} label="Variants" />
          <StatCard icon={<BookOpen className="h-6 w-6" />} value={stats.totalGuides} label="Guides" />
          <StatCard icon={<Cpu className="h-6 w-6" />} value={stats.totalBrands} label="Brands" />
        </div>
      </section>

      {/* Highest Rated Carousel */}
      {scored.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-ctp-green" />
              Highest Rated for Rooting
            </h2>
            <Link href="/search?status=rootable" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {scored.map((d) => {
              const brandName = brands[d.brand_id]?.name ?? d.brand_id;
              return (
                <Link
                  key={`${d.brand_id}-${d.codename}`}
                  href={`/device/${d.brand_id}/${d.series_id}/${d.codename}`}
                  className="group flex-none w-56 snap-start rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <ScoreBadge score={d.bestScore} size="sm" />
                  </div>
                  <p className="font-semibold truncate">{brandName} {d.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    <span className="truncate">{d.soc}</span>
                  </p>
                  <p className="text-xs mt-1">
                    <span className="text-ctp-green font-medium">{d.rootable}/{d.variants?.length ?? 0}</span>
                    <span className="text-muted-foreground"> rootable</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="group rounded-xl border bg-card p-6 text-center transition-colors hover:border-primary/40">
      <div className="mb-2 flex justify-center text-primary transition-transform group-hover:scale-110">{icon}</div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
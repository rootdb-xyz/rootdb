"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowseFiltersProps {
  brands: { id: string; name: string }[];
  socs: string[];
  currentBrand?: string;
  currentStatus?: string;
  currentSoc?: string;
  currentQuery?: string;
}

export function BrowseFilters({
  brands,
  socs,
  currentBrand,
  currentStatus,
  currentSoc,
  currentQuery,
}: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/search");
  }, [router]);

  const hasFilters = currentBrand || currentStatus || currentSoc || currentQuery;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filters</span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Brand */}
        <select
          value={currentBrand ?? ""}
          onChange={(e) => setFilter("brand", e.target.value || null)}
          className={cn(
            "rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors focus:border-primary focus:outline-none",
            currentBrand && "border-primary/50 bg-primary/5"
          )}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Root status */}
        <select
          value={currentStatus ?? ""}
          onChange={(e) => setFilter("status", e.target.value || null)}
          className={cn(
            "rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors focus:border-primary focus:outline-none",
            currentStatus && "border-primary/50 bg-primary/5"
          )}
        >
          <option value="">Any Status</option>
          <option value="rootable">Has Rootable Variants</option>
          <option value="locked">All Locked</option>
        </select>

        {/* SoC */}
        <select
          value={currentSoc ?? ""}
          onChange={(e) => setFilter("soc", e.target.value || null)}
          className={cn(
            "rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors focus:border-primary focus:outline-none",
            currentSoc && "border-primary/50 bg-primary/5"
          )}
        >
          <option value="">Any SoC</option>
          {socs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {currentQuery && (
            <FilterPill
              label={`"${currentQuery}"`}
              onRemove={() => setFilter("q", null)}
            />
          )}
          {currentBrand && (
            <FilterPill
              label={brands.find((b) => b.id === currentBrand)?.name ?? currentBrand}
              onRemove={() => setFilter("brand", null)}
            />
          )}
          {currentStatus && (
            <FilterPill
              label={currentStatus === "rootable" ? "Rootable" : "All Locked"}
              onRemove={() => setFilter("status", null)}
            />
          )}
          {currentSoc && (
            <FilterPill
              label={currentSoc}
              onRemove={() => setFilter("soc", null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
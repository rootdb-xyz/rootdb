"use client";

import Link from "next/link";
import { AlertTriangle, BookOpen, ShoppingCart, Cpu, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/score-badge";
import type { EnrichedVariant } from "@/app/device/[brand]/[series]/[codename]/page";

const TAG_STYLE: Record<string, string> = {
  "ctp-green": "bg-ctp-green/15 text-ctp-green",
  "ctp-blue": "bg-ctp-blue/15 text-ctp-blue",
  "ctp-red": "bg-ctp-red/15 text-ctp-red",
  "ctp-mauve": "bg-ctp-mauve/15 text-ctp-mauve",
  "ctp-peach": "bg-ctp-peach/15 text-ctp-peach",
  "ctp-teal": "bg-ctp-teal/15 text-ctp-teal",
  "ctp-yellow": "bg-ctp-yellow/15 text-ctp-yellow",
  "ctp-lavender": "bg-ctp-lavender/15 text-ctp-lavender",
  "ctp-sky": "bg-ctp-sky/15 text-ctp-sky",
  "ctp-flamingo": "bg-ctp-flamingo/15 text-ctp-flamingo",
};

interface VariantCardProps {
  variant: EnrichedVariant;
  codename: string;
  affiliatesEnabled: boolean;
}

export function VariantCard({ variant: v, codename, affiliatesEnabled }: VariantCardProps) {
  const locked = v.tags.includes("locked_bootloader");
  const showAffiliate = affiliatesEnabled && !locked && v.affiliateUrl && v.score >= 75;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        locked
          ? "border-ctp-red/30 bg-ctp-red/5"
          : v.score >= 75
            ? "border-ctp-green/20 bg-card hover:border-ctp-green/50"
            : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold font-mono tracking-wide">{v.model}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" />{v.soc}</span>
            <span className="text-border">•</span>
            <span>{v.region?.emoji} {v.region?.name ?? v.regionId}</span>
            {v.carrier && <><span className="text-border">•</span><span>{v.carrier}</span></>}
          </div>
        </div>
        <ScoreBadge score={v.score} />
      </div>

      {v.resolvedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {v.resolvedTags.map((tag) => (
            <span key={tag.id} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TAG_STYLE[tag.color ?? ""] ?? "bg-secondary text-secondary-foreground")}>
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {locked && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-ctp-red/20 bg-ctp-red/10 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-ctp-red mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-ctp-red">Not Rootable</p>
            <p className="mt-0.5 text-muted-foreground">{v.notes ?? v.region?.warning ?? "This variant has a permanently locked bootloader."}</p>
          </div>
        </div>
      )}

      {!locked && (v.guideIds.length > 0 || showAffiliate) && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {v.guideIds.map((gid) => (
              <Link key={gid} href={`/guide/${gid}?model=${encodeURIComponent(v.model)}&codename=${encodeURIComponent(codename)}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <BookOpen className="h-3.5 w-3.5" />
                {v.guideTitles[gid] ?? "Root Guide"}
              </Link>
            ))}
            {showAffiliate && (
              <a href={v.affiliateUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ctp-green/30 bg-ctp-green/10 px-4 py-2 text-sm font-medium text-ctp-green transition-colors hover:bg-ctp-green/20">
                <ShoppingCart className="h-3.5 w-3.5" />
                Buy This Rootable SKU
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </div>

          {showAffiliate && (
            <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              Affiliate link — RootDB earns a small commission at no extra cost to you. We only link to confirmed rootable models.
            </p>
          )}
        </div>
      )}

      {!locked && v.notes && <p className="mt-3 text-xs text-muted-foreground italic">{v.notes}</p>}
    </div>
  );
}
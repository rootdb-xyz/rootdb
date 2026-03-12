"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  BarChart3,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteStats {
  total: number;
  works: number;
  bootloop: number;
  partial: number;
  success_rate: number | null;
  by_version: Record<string, { works: number; bootloop: number; partial: number; total: number }>;
}

interface VotePanelProps {
  guideId: string;
  variantModel: string;
  deviceCodename: string;
}

export function VotePanel({ guideId, variantModel, deviceCodename }: VotePanelProps) {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [result, setResult] = useState<"works" | "bootloop" | "partial" | null>(null);
  const [androidVersion, setAndroidVersion] = useState("");
  const [notes, setNotes] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/vote?guide_id=${encodeURIComponent(guideId)}&model=${encodeURIComponent(variantModel)}`
      );
      const json = await res.json();
      setStats(json);
    } catch { /* silently fail */ }
    setLoading(false);
  }, [guideId, variantModel]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  async function submit() {
    if (!result || !androidVersion.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide_id: guideId,
          device_codename: deviceCodename,
          variant_model: variantModel,
          android_version: androidVersion.trim(),
          result,
          notes: notes.trim() || undefined,
        }),
      });
      setSubmitted(true);
      fetchStats();
    } catch { /* silently fail */ }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Success rate bar ── */}
      {stats && stats.total > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Community Results</h3>
            <span className="text-sm text-muted-foreground">
              ({stats.total} report{stats.total !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Stacked bar */}
          <div className="flex h-6 overflow-hidden rounded-full bg-secondary">
            {stats.works > 0 && (
              <div
                className="flex items-center justify-center bg-ctp-green text-[10px] font-bold text-black/70 transition-all"
                style={{ width: `${(stats.works / stats.total) * 100}%` }}
              >
                {stats.works > 1 && `${Math.round((stats.works / stats.total) * 100)}%`}
              </div>
            )}
            {stats.partial > 0 && (
              <div
                className="flex items-center justify-center bg-ctp-yellow text-[10px] font-bold text-black/70 transition-all"
                style={{ width: `${(stats.partial / stats.total) * 100}%` }}
              />
            )}
            {stats.bootloop > 0 && (
              <div
                className="flex items-center justify-center bg-ctp-red text-[10px] font-bold text-black/70 transition-all"
                style={{ width: `${(stats.bootloop / stats.total) * 100}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-ctp-green" />
              Works ({stats.works})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-ctp-yellow" />
              Partial ({stats.partial})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-ctp-red" />
              Bootloop ({stats.bootloop})
            </span>
          </div>

          {/* Per-version breakdown */}
          {Object.keys(stats.by_version).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                By Android Version
              </h4>
              {Object.entries(stats.by_version)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([ver, v]) => {
                  const pct = Math.round((v.works / v.total) * 100);
                  return (
                    <div key={ver} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 font-mono text-muted-foreground">
                        Android {ver}
                      </span>
                      <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="rounded-full bg-ctp-green transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn(
                        "w-12 text-right font-semibold tabular-nums",
                        pct >= 80 ? "text-ctp-green" : pct >= 50 ? "text-ctp-yellow" : "text-ctp-red"
                      )}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── Vote form ── */}
      {!submitted ? (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">
            Did this guide work for your {variantModel}?
          </h3>

          {/* Result buttons */}
          <div className="grid grid-cols-3 gap-2">
            <ResultButton
              active={result === "works"}
              onClick={() => setResult("works")}
              icon={<ThumbsUp className="h-5 w-5" />}
              label="Works"
              color="ctp-green"
            />
            <ResultButton
              active={result === "partial"}
              onClick={() => setResult("partial")}
              icon={<AlertCircle className="h-5 w-5" />}
              label="Partial"
              color="ctp-yellow"
            />
            <ResultButton
              active={result === "bootloop"}
              onClick={() => setResult("bootloop")}
              icon={<ThumbsDown className="h-5 w-5" />}
              label="Bootloop"
              color="ctp-red"
            />
          </div>

          {/* Android version + notes */}
          {result && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Android version <span className="text-ctp-red">*</span>
                </label>
                <input
                  value={androidVersion}
                  onChange={(e) => setAndroidVersion(e.target.value)}
                  placeholder="e.g. 14, 13, 12"
                  className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any issues, workarounds, or extra info…"
                  rows={2}
                  className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <button
                onClick={submit}
                disabled={!androidVersion.trim() || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Vote
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-ctp-green/20 bg-ctp-green/5 p-5 text-center">
          <ThumbsUp className="mx-auto h-8 w-8 text-ctp-green mb-2" />
          <p className="font-semibold text-ctp-green">Thanks for your report!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your vote helps others know if this guide works.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component ── */

const RESULT_STYLES = {
  "ctp-green": {
    active: "border-ctp-green bg-ctp-green/15 text-ctp-green",
    idle: "border-border hover:border-ctp-green/50",
  },
  "ctp-yellow": {
    active: "border-ctp-yellow bg-ctp-yellow/15 text-ctp-yellow",
    idle: "border-border hover:border-ctp-yellow/50",
  },
  "ctp-red": {
    active: "border-ctp-red bg-ctp-red/15 text-ctp-red",
    idle: "border-border hover:border-ctp-red/50",
  },
} as const;

function ResultButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: keyof typeof RESULT_STYLES;
}) {
  const styles = RESULT_STYLES[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-colors",
        active ? styles.active : styles.idle
      )}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
"use client";

import { useState } from "react";
import { Check, X, Loader2, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  status: string;
  submitted_at: string;
  title: string;
  subtitle?: string;
  content?: string;
}

interface AdminSubmissionListProps {
  type: "devices" | "guides" | "downloads" | "removals";
  submissions: Submission[];
}

export function AdminSubmissionList({ type, submissions }: AdminSubmissionListProps) {
  const [items, setItems] = useState(submissions);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s))
        );
      }
    } catch { /* empty */ }
    setActing(null);
  }

  const pending = items.filter((s) => s.status === "pending");
  const resolved = items.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ctp-yellow mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border bg-card p-6 text-center">
            No pending submissions.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s.id} className="rounded-xl border border-ctp-yellow/20 bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <Clock className="h-4 w-4 text-ctp-yellow shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.title}</p>
                    {s.subtitle && <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(s.submitted_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => act(s.id, "approve")}
                      disabled={acting === s.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-ctp-green/15 px-3 py-1.5 text-sm font-medium text-ctp-green hover:bg-ctp-green/25 transition-colors disabled:opacity-50"
                    >
                      {acting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => act(s.id, "reject")}
                      disabled={acting === s.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-ctp-red/15 px-3 py-1.5 text-sm font-medium text-ctp-red hover:bg-ctp-red/25 transition-colors disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>

                  {/* Expand */}
                  {s.content && (
                    <button
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                {/* Expanded content */}
                {expanded === s.id && s.content && (
                  <div className="border-t px-5 py-4">
                    <pre className="overflow-x-auto rounded-lg bg-secondary p-4 text-xs font-mono leading-relaxed max-h-96 overflow-y-auto">
                      {s.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-2">
            {resolved.slice().reverse().slice(0, 20).map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3",
                  s.status === "approved" ? "border-ctp-green/20 bg-ctp-green/5" : "border-ctp-red/20 bg-ctp-red/5"
                )}
              >
                {s.status === "approved" ? (
                  <CheckCircle2 className="h-4 w-4 text-ctp-green shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-ctp-red shrink-0" />
                )}
                <span className="text-sm truncate flex-1">{s.title}</span>
                <span className="text-xs text-muted-foreground capitalize">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
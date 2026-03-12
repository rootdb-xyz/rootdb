"use client";

import { useState } from "react";
import { Trash2, Send, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface RemoveDeviceButtonProps {
  brandId: string;
  seriesId: string;
  codename: string;
  deviceName: string;
}

const REASONS = [
  "Duplicate entry",
  "Device doesn't exist / wrong info",
  "Merged with another model",
  "Spam / test data",
  "Other",
];

export function RemoveDeviceButton({ brandId, seriesId, codename, deviceName }: RemoveDeviceButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await fetch("/api/remove-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          series_id: seriesId,
          codename,
          name: deviceName,
          reason,
          details: details.trim(),
        }),
      });
      setDone(true);
    } catch {}
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-ctp-green/20 bg-ctp-green/5 p-3 text-sm">
        <CheckCircle2 className="h-4 w-4 text-ctp-green" />
        <span className="text-ctp-green font-medium">Removal request submitted for review.</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ctp-red transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Request device removal
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-ctp-red/20 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">
            Request removal of <strong>{deviceName}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason <span className="text-ctp-red">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select a reason…</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any extra context…"
              rows={2}
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={submit}
            disabled={!reason || submitting}
            className="flex items-center gap-2 rounded-lg bg-ctp-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ctp-red/80 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Removal Request
          </button>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_HOSTS } from "@/lib/file-hosts";

interface MirrorInput {
  label: string;
  url: string;
}

export function FileSubmissionForm() {
  // File info
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tool");
  const [checksum, setChecksum] = useState("");

  // Mirrors
  const [mirrors, setMirrors] = useState<MirrorInput[]>([{ label: "", url: "" }]);

  // Original source
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [originalDownloadUrl, setOriginalDownloadUrl] = useState("");
  const [isDirect, setIsDirect] = useState(false);

  // UI state
  const [hostsOpen, setHostsOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addMirror() {
    setMirrors((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeMirror(i: number) {
    setMirrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMirror(i: number, field: keyof MirrorInput, value: string) {
    setMirrors((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  }

  const validMirrors = mirrors.filter((m) => m.url.trim().startsWith("http"));
  const canSubmit =
    name.trim().length > 0 &&
    validMirrors.length > 0 &&
    sourceUrl.trim().startsWith("http");

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      await fetch("/api/submit-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          version: version.trim() || undefined,
          description: description.trim() || undefined,
          category,
          checksum_sha256: checksum.trim() || undefined,
          mirrors: validMirrors.map((m) => ({
            label: m.label.trim() || guessHostLabel(m.url),
            url: m.url.trim(),
            host: guessHostId(m.url),
          })),
          original: {
            source_url: sourceUrl.trim(),
            source_label: sourceLabel.trim() || "Original Source",
            download_url: originalDownloadUrl.trim() || undefined,
            is_direct: originalDownloadUrl.trim() ? isDirect : undefined,
          },
        }),
      });
      setSubmitted(true);
    } catch {
      /* fail silently for now */
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-ctp-green/20 bg-ctp-green/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-ctp-green mb-3" />
        <h2 className="text-xl font-bold text-ctp-green">Submission Received!</h2>
        <p className="mt-2 text-muted-foreground">
          A moderator will review and add it to the database.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setVersion("");
            setDescription("");
            setChecksum("");
            setMirrors([{ label: "", url: "" }]);
            setSourceUrl("");
            setSourceLabel("");
            setOriginalDownloadUrl("");
            setIsDirect(false);
          }}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ═══ Step 1: Upload to hosts ═══ */}
      <section className="rounded-xl border bg-card p-5">
        <button
          onClick={() => setHostsOpen((p) => !p)}
          className="flex w-full items-center justify-between text-left"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <Upload className="h-5 w-5 text-primary" />
            Step 1 — Upload your file to free hosts
          </h2>
          {hostsOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {hostsOpen && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Upload to <strong>at least one</strong> host. More mirrors = more
              resilience when links die.
            </p>
            {FILE_HOSTS.map((host) => (
              <a
                key={host.id}
                href={host.upload_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-secondary/30 px-4 py-3 transition-colors hover:bg-accent group"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{host.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Max {host.max_size_label} · {host.retention}
                    {host.notes && ` · ${host.notes}`}
                  </p>
                </div>
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open ↗
                </span>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ═══ Step 2: File info ═══ */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Step 2 — File info</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-ctp-red">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magisk, Patched Odin, LineageOS"
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 28.1, 3.14.4"
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this file?"
            rows={2}
            className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="tool">Tool (Magisk, Odin, etc.)</option>
              <option value="rom">Custom ROM</option>
              <option value="recovery">Recovery (TWRP, OrangeFox)</option>
              <option value="kernel">Kernel</option>
              <option value="firmware">Stock Firmware</option>
              <option value="gapps">GApps Package</option>
              <option value="module">Magisk/KSU Module</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              SHA-256 Checksum
            </label>
            <input
              value={checksum}
              onChange={(e) => setChecksum(e.target.value)}
              placeholder="Optional but recommended"
              className="w-full rounded-lg border bg-secondary px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {/* ═══ Step 3: Paste mirror links ═══ */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold">
          Step 3 — Paste your mirror links <span className="text-ctp-red">*</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste the download URLs you got after uploading in Step 1.
        </p>

        <div className="space-y-3">
          {mirrors.map((mirror, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={mirror.url}
                  onChange={(e) => updateMirror(i, "url", e.target.value)}
                  placeholder="https://files.catbox.moe/abc123.zip"
                  className="w-full rounded-lg border bg-secondary px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={mirror.label}
                  onChange={(e) => updateMirror(i, "label", e.target.value)}
                  placeholder={
                    mirror.url
                      ? `Label (auto: ${guessHostLabel(mirror.url)})`
                      : "Label (e.g. Catbox, XDA, Pixeldrain)"
                  }
                  className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {mirrors.length > 1 && (
                <button
                  onClick={() => removeMirror(i)}
                  className="mt-2 rounded-lg border p-2 text-muted-foreground hover:text-ctp-red hover:border-ctp-red/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addMirror}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add another mirror
        </button>
      </section>

      {/* ═══ Step 4: Original source ═══ */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold">
          Step 4 — Original source <span className="text-ctp-red">*</span>
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Source page URL <span className="text-ctp-red">*</span>
          </label>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="e.g. https://xdaforums.com/t/thread.1234567/"
            className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The XDA thread, GitHub release page, or official site.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Source label</label>
          <input
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
            placeholder="e.g. XDA Thread, GitHub Releases"
            className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Original download link
          </label>
          <input
            value={originalDownloadUrl}
            onChange={(e) => setOriginalDownloadUrl(e.target.value)}
            placeholder="e.g. https://xdaforums.com/attachments/odin.12345/"
            className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The download link from the original source (may differ from the source page).
          </p>
        </div>

        {originalDownloadUrl.trim().length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">
              Is the original download link a direct download?
            </label>
            <button
              type="button"
              onClick={() => setIsDirect((p) => !p)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                isDirect ? "bg-ctp-green" : "bg-secondary"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
                  isDirect ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {isDirect ? "Yes — direct link" : "No — requires extra clicks"}
            </span>
          </div>
        )}
      </section>

      {/* ═══ Submit ═══ */}
      <button
        onClick={submit}
        disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        Submit for Review
      </button>
    </div>
  );
}

// ── Helpers ──

function guessHostId(url: string): string {
  if (!url) return "other";
  const u = url.toLowerCase();
  if (u.includes("catbox.moe")) return "catbox";
  if (u.includes("qu.ax")) return "quax";
  if (u.includes("gofile")) return "gofile";
  if (u.includes("pixeldrain")) return "pixeldrain";
  if (u.includes("download.gg")) return "downloadgg";
  if (u.includes("xda")) return "xda";
  if (u.includes("github")) return "github";
  if (u.includes("mega.nz")) return "mega";
  if (u.includes("mediafire")) return "mediafire";
  return "other";
}

function guessHostLabel(url: string): string {
  const map: Record<string, string> = {
    catbox: "Catbox",
    quax: "qu.ax",
    gofile: "Gofile",
    pixeldrain: "Pixeldrain",
    downloadgg: "Download.gg",
    xda: "XDA File Host",
    github: "GitHub",
    mega: "Mega.nz",
    mediafire: "MediaFire",
    other: "Mirror",
  };
  return map[guessHostId(url)] ?? "Mirror";
}
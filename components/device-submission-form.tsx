"use client";

import { useState } from "react";
import {
  Plus, Trash2, Send, CheckCircle2, Loader2, Code, AlertTriangle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantInput {
  model: string;
  soc: string;
  region: string;
  carrier: string;
  bootloader: "unlocked" | "locked" | "unknown";
  notes: string;
}

const EMPTY_VARIANT: VariantInput = {
  model: "", soc: "", region: "global", carrier: "", bootloader: "unknown", notes: "",
};

const REGIONS = [
  { id: "global", label: "Global / International" },
  { id: "us_unlocked", label: "US Unlocked" },
  { id: "us_carrier", label: "US Carrier Locked" },
  { id: "eu", label: "Europe" },
  { id: "kr", label: "South Korea" },
  { id: "cn", label: "China" },
  { id: "in", label: "India" },
  { id: "jp", label: "Japan" },
  { id: "other", label: "Other" },
];

export function DeviceSubmissionForm() {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [codename, setCodename] = useState("");
  const [defaultSoc, setDefaultSoc] = useState("");
  const [ram, setRam] = useState("");
  const [launchOs, setLaunchOs] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([{ ...EMPTY_VARIANT }]);
  const [showYaml, setShowYaml] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  function addVariant() {
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT, soc: defaultSoc }]);
  }
  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateVariant(i: number, field: keyof VariantInput, value: string) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  const validVariants = variants.filter((v) => v.model.trim().length > 0);
  const canSubmit = brand.trim() && name.trim() && validVariants.length > 0;

  function generateYaml(): string {
    const lines: string[] = [];
    lines.push(`name: "${name.trim()}"`);
    if (defaultSoc.trim()) lines.push(`soc: ${defaultSoc.trim()}`);
    if (ram.trim()) lines.push(`ram: ${ram.trim()}`);
    if (launchOs.trim()) lines.push(`launch_os: ${launchOs.trim()}`);
    lines.push(""); lines.push("variants:");

    for (const v of validVariants) {
      lines.push(`  - model: ${v.model.trim()}`);
      if (v.soc.trim() && v.soc.trim() !== defaultSoc.trim()) lines.push(`    soc: ${v.soc.trim()}`);
      lines.push(`    region_id: ${v.region}`);
      if (v.carrier.trim()) lines.push(`    carrier: "${v.carrier.trim()}"`);
      const tags: string[] = [];
      if (v.bootloader === "unlocked") tags.push("unlockable_bootloader");
      if (v.bootloader === "locked") tags.push("locked_bootloader");
      if (tags.length > 0) { lines.push("    tags:"); tags.forEach((t) => lines.push(`      - ${t}`)); }
      else lines.push("    tags: []");
      if (v.notes.trim()) { lines.push(`    notes: >-`); lines.push(`      ${v.notes.trim()}`); }
    }
    return lines.join("\n");
  }

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const slugBrand = brand.trim().toLowerCase().replace(/\s+/g, "-");
      const slugCodename = codename.trim().toLowerCase().replace(/\s+/g, "-") ||
        name.trim().toLowerCase().replace(/\s+/g, "-");

      const res = await fetch("/api/submit-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: slugBrand,
          codename: slugCodename,
          display_name: name.trim(),
          yaml_content: generateYaml(),
          variant_count: validVariants.length,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || `Server returned ${res.status}`);
      } else if (json.ok) {
        setSubmitted(true);
        setSubmissionId(json.id ?? "");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — is the server running?");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-ctp-green/20 bg-ctp-green/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-ctp-green mb-3" />
        <h2 className="text-xl font-bold text-ctp-green">Device Submitted!</h2>
        <p className="mt-2 text-muted-foreground">
          A moderator will review and merge it into the database.
        </p>
        {submissionId && (
          <p className="mt-2 text-xs font-mono text-muted-foreground">
            Submission ID: {submissionId}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Saved to <code className="bg-secondary px-1 rounded">data/submissions/devices/</code>
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setBrand(""); setName(""); setCodename(""); setDefaultSoc("");
            setRam(""); setLaunchOs("");
            setVariants([{ ...EMPTY_VARIANT }]);
            setError(""); setSubmissionId("");
          }}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Submit another device
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-ctp-red/20 bg-ctp-red/5 p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-ctp-red mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ctp-red">Submission failed</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Device Info */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Device Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" required value={brand} onChange={setBrand} placeholder="Samsung, Google, OnePlus…" />
          <Field label="Device Name" required value={name} onChange={setName} placeholder="Galaxy S24 Ultra" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Codename" value={codename} onChange={setCodename} placeholder="e2s (optional)" mono />
          <Field label="Default SoC" value={defaultSoc} onChange={setDefaultSoc} placeholder="Exynos 2400" />
          <Field label="RAM" value={ram} onChange={setRam} placeholder="12GB" />
        </div>
        <Field label="Launch OS" value={launchOs} onChange={setLaunchOs} placeholder="Android 14 (OneUI 6.1)" />
      </section>

      {/* Variants */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Variants ({variants.length})</h2>
          <button onClick={addVariant} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus className="h-4 w-4" /> Add Variant
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Each model number is a separate variant. Snapdragon SM-S928U and Exynos SM-S928B are{" "}
          <strong>different root paths</strong>.
        </p>
        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className={cn("rounded-lg border p-4 space-y-3", v.bootloader === "locked" ? "border-ctp-red/30 bg-ctp-red/5" : "border-border")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Variant {i + 1}</span>
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(i)} className="rounded-lg p-1 text-muted-foreground hover:text-ctp-red"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Model Number" required value={v.model} onChange={(val) => updateVariant(i, "model", val)} placeholder="SM-S928B" mono />
                <Field label="SoC (if different)" value={v.soc} onChange={(val) => updateVariant(i, "soc", val)} placeholder={defaultSoc || "Snapdragon 8 Gen 3"} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <select value={v.region} onChange={(e) => updateVariant(i, "region", e.target.value)} className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <Field label="Carrier" value={v.carrier} onChange={(val) => updateVariant(i, "carrier", val)} placeholder="Verizon, AT&T…" />
                <div>
                  <label className="block text-sm font-medium mb-1">Bootloader</label>
                  <select value={v.bootloader} onChange={(e) => updateVariant(i, "bootloader", e.target.value as VariantInput["bootloader"])}
                    className={cn("w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none",
                      v.bootloader === "locked" && "border-ctp-red/50 text-ctp-red",
                      v.bootloader === "unlocked" && "border-ctp-green/50 text-ctp-green"
                    )}>
                    <option value="unknown">Unknown</option>
                    <option value="unlocked">Unlockable ✓</option>
                    <option value="locked">Permanently Locked ✗</option>
                  </select>
                </div>
              </div>
              <Field label="Notes" value={v.notes} onChange={(val) => updateVariant(i, "notes", val)} placeholder="Any extra info…" />
            </div>
          ))}
        </div>
      </section>

      {/* YAML Preview */}
      {canSubmit && (
        <section className="rounded-xl border bg-card p-5">
          <button onClick={() => setShowYaml((p) => !p)} className="flex w-full items-center justify-between text-left">
            <h2 className="flex items-center gap-2 font-semibold"><Code className="h-5 w-5 text-primary" />YAML Preview</h2>
            {showYaml ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showYaml && <pre className="mt-4 overflow-x-auto rounded-lg bg-secondary p-4 text-xs font-mono leading-relaxed">{generateYaml()}</pre>}
        </section>
      )}

      {/* Submit */}
      <button onClick={submit} disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Submit Device for Review
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-ctp-red ml-0.5">*</span>}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn("w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20", mono && "font-mono")} />
    </div>
  );
}
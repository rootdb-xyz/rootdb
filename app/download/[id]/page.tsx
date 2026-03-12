import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Download,
  ExternalLink,
  FileDown,
  Shield,
  Globe,
  AlertTriangle,
  ArrowDown,
} from "lucide-react";
import { getDownloadEntry, getAllDownloadEntries } from "@/lib/downloads";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllDownloadEntries().map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = getDownloadEntry(id);
  if (!entry) return { title: "File Not Found" };
  return {
    title: `Download ${entry.name}`,
    description: `Download ${entry.name} (${entry.version}) from ${entry.mirrors.length} mirrors.`,
  };
}

const HOST_COLORS: Record<string, string> = {
  xda: "border-ctp-peach/30 hover:border-ctp-peach/60 hover:bg-ctp-peach/5",
  catbox: "border-ctp-mauve/30 hover:border-ctp-mauve/60 hover:bg-ctp-mauve/5",
  quax: "border-ctp-blue/30 hover:border-ctp-blue/60 hover:bg-ctp-blue/5",
  gofile: "border-ctp-teal/30 hover:border-ctp-teal/60 hover:bg-ctp-teal/5",
  downloadgg: "border-ctp-green/30 hover:border-ctp-green/60 hover:bg-ctp-green/5",
  pixeldrain: "border-ctp-sky/30 hover:border-ctp-sky/60 hover:bg-ctp-sky/5",
  github: "border-ctp-lavender/30 hover:border-ctp-lavender/60 hover:bg-ctp-lavender/5",
};
const DEFAULT_HOST_STYLE = "border-border hover:border-primary/50 hover:bg-accent";

export default async function DownloadPage({ params }: Props) {
  const { id } = await params;
  const entry = getDownloadEntry(id);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      {/* File header */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileDown className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold">{entry.name}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 text-sm text-muted-foreground">
          {entry.version && <span>v{entry.version}</span>}
          {entry.category && (
            <>
              <span className="text-border">•</span>
              <span className="capitalize">{entry.category}</span>
            </>
          )}
          <span className="text-border">•</span>
          <span>{entry.mirrors.length} mirror{entry.mirrors.length !== 1 ? "s" : ""}</span>
        </div>
        {entry.description && (
          <p className="mt-3 text-sm text-muted-foreground">{entry.description}</p>
        )}
      </div>

      {/* ═══ Download Directly (Recommended) ═══ */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          <ArrowDown className="h-4 w-4" />
          Download Directly (Recommended)
        </h2>

        <div className="space-y-2">
          {entry.mirrors.map((mirror, i) => (
            <a
              key={i}
              href={mirror.url}
              // NO target="_blank" — browser downloads the file directly
              className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 transition-all ${
                HOST_COLORS[mirror.host] ?? DEFAULT_HOST_STYLE
              }`}
            >
              <Download className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{mirror.label}</p>
                <p className="truncate text-xs text-muted-foreground">{cleanHostDisplay(mirror.url)}</p>
              </div>
              {i === 0 && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Primary
                </span>
              )}
            </a>
          ))}
        </div>

        {entry.mirrors.length > 1 && (
          <p className="mt-3 text-xs text-muted-foreground">
            If one mirror is dead, try another. All mirrors host the same file.
          </p>
        )}
      </section>

      {/* ═══ Original Source ═══ */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          <Globe className="h-4 w-4" />
          Original Source
        </h2>

        <div className="space-y-2">
          {/* Source page — opens in new tab (it's a page, not a file) */}
          <a
            href={entry.original.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{entry.original.source_label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.original.source_url}
              </p>
            </div>
          </a>

          {/* Original download link — actual download, no target="_blank" */}
          {entry.original.download_url && (
            <a
              href={entry.original.download_url}
              // Direct downloads: no target="_blank"
              // Indirect: open in new tab so user can navigate the host
              {...(entry.original.is_direct === false
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <Download className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  Original Download
                  {entry.original.is_direct === true && (
                    <span className="ml-2 rounded-full bg-ctp-green/15 px-2 py-0.5 text-xs font-semibold text-ctp-green">
                      Direct
                    </span>
                  )}
                  {entry.original.is_direct === false && (
                    <span className="ml-2 rounded-full bg-ctp-yellow/15 px-2 py-0.5 text-xs font-semibold text-ctp-yellow">
                      Indirect — opens in new tab
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.original.download_url}
                </p>
              </div>
            </a>
          )}
        </div>
      </section>

      {/* ═══ Checksum ═══ */}
      {entry.checksum_sha256 && entry.checksum_sha256.length > 10 && (
        <details className="mb-8 rounded-xl border bg-card p-5">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-ctp-green" />
            Verify file integrity (SHA-256)
          </summary>
          <code className="mt-3 block break-all rounded-lg bg-secondary p-3 font-mono text-xs">
            {entry.checksum_sha256}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            Windows: <code className="rounded bg-secondary px-1 py-0.5">certutil -hashfile filename SHA256</code>
            {" · "}
            Linux/Mac: <code className="rounded bg-secondary px-1 py-0.5">sha256sum filename</code>
          </p>
        </details>
      )}

      {/* Dead link notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-ctp-yellow/20 bg-ctp-yellow/5 p-4">
        <AlertTriangle className="h-4 w-4 shrink-0 text-ctp-yellow mt-0.5" />
        <p className="text-sm text-muted-foreground">
          All mirrors dead?{" "}
          <Link href="/contribute" className="text-primary hover:underline">
            Submit a new mirror
          </Link>{" "}
          or{" "}
          <Link href="/submit" className="text-primary hover:underline">
            re-upload the file
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

/** Show "catbox.moe" instead of the full URL in subtext */
function cleanHostDisplay(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
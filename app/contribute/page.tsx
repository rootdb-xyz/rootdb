import Link from "next/link";
import type { Metadata } from "next";
import {
  GitPullRequest, Upload, Smartphone, BookOpen, Github,
  ExternalLink, CheckCircle2, Star, LinkIcon, PenTool,
} from "lucide-react";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Help build the largest Android root database.",
};

const WAYS_TO_HELP = [
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Add a Device",
    description: "Submit a phone with exact model numbers and variant bootloader status.",
    href: "/submit/device",
    color: "text-ctp-green", bg: "bg-ctp-green/10", borderHover: "hover:border-ctp-green/50",
    tag: "Easiest",
  },
  {
    icon: <PenTool className="h-6 w-6" />,
    title: "Create a Guide",
    description: "Use the visual editor to build interactive decision-tree root guides.",
    href: "/editor",
    color: "text-ctp-mauve", bg: "bg-ctp-mauve/10", borderHover: "hover:border-ctp-mauve/50",
  },
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Upload a File",
    description: "Drag-and-drop root tools or ROMs. Uploads to free permanent hosts.",
    href: "/upload",
    color: "text-ctp-blue", bg: "bg-ctp-blue/10", borderHover: "hover:border-ctp-blue/50",
  },
  {
    icon: <LinkIcon className="h-6 w-6" />,
    title: "Submit Mirror Links",
    description: "Already have download links? Submit them to the download database.",
    href: "/submit",
    color: "text-ctp-sky", bg: "bg-ctp-sky/10", borderHover: "hover:border-ctp-sky/50",
  },
  {
    icon: <GitPullRequest className="h-6 w-6" />,
    title: "Fix Existing Data",
    description: "Edit YAML files on GitHub and open a pull request.",
    href: siteConfig.github.dataRepoUrl,
    color: "text-ctp-peach", bg: "bg-ctp-peach/10", borderHover: "hover:border-ctp-peach/50",
    external: true,
  },
];

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Star className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold">Contribute to RootDB</h1>
        <p className="mt-2 text-muted-foreground">
          RootDB is 100% community-built. Every contribution helps thousands root safely.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {WAYS_TO_HELP.map((way) => {
          const isExt = !!way.external;
          const props = isExt ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
          return (
            <a key={way.title} href={way.href} {...props}
              className={`group relative flex flex-col rounded-xl border bg-card p-6 transition-all hover:shadow-lg ${way.borderHover}`}>
              {way.tag && <span className="absolute -top-2 right-3 rounded-full bg-ctp-green/15 px-2 py-0.5 text-[10px] font-bold text-ctp-green">{way.tag}</span>}
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${way.bg} ${way.color}`}>{way.icon}</div>
              <h3 className="font-semibold flex items-center gap-2">
                {way.title}
                {isExt && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground flex-1">{way.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-ctp-green"><CheckCircle2 className="h-3 w-3" />Ready</div>
            </a>
          );
        })}
      </div>

      <div className="mt-12 rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold mb-4">
          <Github className="h-5 w-5" /> Trust Score System
        </h2>
        <div className="space-y-2 text-sm">
          <TrustRow action="Device approved" points={10} />
          <TrustRow action="Guide approved" points={15} />
          <TrustRow action="Download submitted" points={5} />
          <TrustRow action="Edit approved" points={3} />
          <TrustRow action="Vote cast" points={1} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          At <strong className="text-foreground">100 points</strong> you become a{" "}
          <span className="text-ctp-green font-semibold">Trusted Contributor</span>{" "}
          — your submissions merge without mod review.
        </p>
      </div>
    </div>
  );
}

function TrustRow({ action, points }: { action: string; points: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{action}</span>
      <span className="font-mono text-xs font-bold text-ctp-green">+{points}</span>
    </div>
  );
}
import type { Metadata } from "next";
import { Trophy, Github, FileText, Smartphone, BookOpen, Upload, ThumbsUp } from "lucide-react";
import { auth, authConfigured } from "@/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Contributions",
};

export default async function ContributionsPage() {
  let user: { name?: string | null; image?: string | null; id?: string } | null = null;

  if (authConfigured) {
    try {
      const session = await auth();
      if (session?.user) user = session.user;
    } catch { /* empty */ }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Github className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-extrabold">Sign in to view contributions</h1>
        <p className="mt-2 text-muted-foreground">
          Your trust score, badges, and contribution history are tied to your GitHub account.
        </p>
        {authConfigured ? (
          <Link href="/api/auth/signin">Sign In With Github</Link>
        ) : (
          <div className="mt-6 rounded-lg border border-ctp-yellow/20 bg-ctp-yellow/5 p-4 text-sm text-left">
            <p className="font-medium text-ctp-yellow mb-2">Auth not configured yet</p>
            <p className="text-muted-foreground text-xs">
              Add <code className="bg-secondary px-1 rounded">AUTH_SECRET</code>,{" "}
              <code className="bg-secondary px-1 rounded">AUTH_GITHUB_ID</code>, and{" "}
              <code className="bg-secondary px-1 rounded">AUTH_GITHUB_SECRET</code> to{" "}
              <code className="bg-secondary px-1 rounded">.env.local</code>
            </p>
          </div>
        )}
      </div>
    );
  }

  // TODO: Load real trust profile from lib/trust.ts using user.id
  // For now show a placeholder

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        {user.image && (
          <img src={user.image} alt="" className="h-16 w-16 rounded-full border-2 border-primary" />
        )}
        <div>
          <h1 className="text-2xl font-extrabold">{user.name ?? "User"}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-ctp-blue/15 px-2.5 py-0.5 text-xs font-semibold text-ctp-blue">
              newcomer
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-extrabold text-primary tabular-nums">0</div>
          <div className="text-xs text-muted-foreground">Trust Score</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-8">
        <StatBox icon={<Smartphone className="h-4 w-4" />} label="Devices" value={0} />
        <StatBox icon={<BookOpen className="h-4 w-4" />} label="Guides" value={0} />
        <StatBox icon={<Upload className="h-4 w-4" />} label="Downloads" value={0} />
        <StatBox icon={<FileText className="h-4 w-4" />} label="Edits" value={0} />
        <StatBox icon={<ThumbsUp className="h-4 w-4" />} label="Votes" value={0} />
      </div>

      {/* Progress to trusted */}
      <div className="rounded-xl border bg-card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-ctp-yellow" />
            Progress to Trusted Contributor
          </h2>
          <span className="text-sm text-muted-foreground">0 / 100</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-ctp-yellow transition-all" style={{ width: "0%" }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Reach 100 trust points and your submissions will bypass moderator review.
        </p>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border bg-card p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-semibold">No contributions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Start by adding a device, creating a guide, or voting on existing guides.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/submit/device" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Add a Device
          </Link>
          <Link href="/editor" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            Create a Guide
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="flex justify-center text-muted-foreground mb-1">{icon}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
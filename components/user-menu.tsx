"use client";

import { useState, useRef, useEffect } from "react";
import { Github, LogOut, ChevronDown, User, Trophy, Settings } from "lucide-react";

interface UserMenuProps {
  user: { name?: string | null; image?: string | null } | null;
  authConfigured: boolean;
}

export function UserMenu({ user, authConfigured }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!authConfigured) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary/50"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border bg-card p-4 shadow-xl text-sm z-50">
            <div className="flex items-start gap-2 mb-3">
              <Settings className="h-4 w-4 shrink-0 text-ctp-yellow mt-0.5" />
              <p className="font-medium text-ctp-yellow">Auth not configured</p>
            </div>
            <p className="text-muted-foreground text-xs mb-2">
              Create a{" "}
              <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub OAuth App
              </a>{" "}
              and add to <code className="rounded bg-secondary px-1 py-0.5">.env.local</code>:
            </p>
            <pre className="rounded bg-secondary p-2 text-[10px] font-mono overflow-x-auto">
{`AUTH_SECRET=run_npx_auth_secret
AUTH_GITHUB_ID=your_client_id
AUTH_GITHUB_SECRET=your_secret`}
            </pre>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Callback: <code className="bg-secondary px-1 rounded">http://localhost:3000/api/auth/callback/github</code>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/api/auth/signin"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Github className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-accent"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-7 w-7 rounded-full border" />
        ) : (
          <User className="h-7 w-7 rounded-full border p-1 text-muted-foreground" />
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border bg-card shadow-xl z-50">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
          </div>
          <a
            href="/contributions"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            <Trophy className="h-4 w-4" />
            My Contributions
          </a>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </div>
      )}
    </div>
  );
}
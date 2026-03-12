"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Smartphone, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/lib/types";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Debounced fetch ──
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await r.json();
        setResults(json.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // ── Click-away ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = useCallback(
    (r: SearchResult) => {
      router.push(`/device/${r.brand_id}/${r.series_id}/${r.codename}`);
      setOpen(false);
    },
    [router]
  );

  function onKey(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIdx((p) => Math.min(p + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIdx((p) => Math.max(p - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (idx >= 0 && results[idx]) go(results[idx]);
        else if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
        break;
      case "Escape":
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={boxRef} className="relative w-full">
      {/* ── Input ── */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIdx(-1);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKey}
          placeholder='Search "SM-S918B" or "Galaxy S24 Ultra"…'
          className="h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-12 text-lg text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
          </button>
        ) : null}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-2xl">
          {results.length > 0 ? (
            <>
              {results.map((r, i) => (
                <button
                  key={`${r.brand_id}-${r.codename}`}
                  onClick={() => go(r)}
                  className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent ${
                    i === idx ? "bg-accent" : ""
                  }`}
                >
                  <Smartphone className="h-8 w-8 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="capitalize">{r.brand_id}</span>
                      <span className="text-border">•</span>
                      <span>{r.soc}</span>
                      <span className="text-border">•</span>
                      <span className={r.rootable_count > 0 ? "text-ctp-green" : "text-ctp-red"}>
                        {r.rootable_count}/{r.variant_count} rootable
                      </span>
                    </p>
                  </div>
                </button>
              ))}
              <div className="border-t px-4 py-2">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setOpen(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </>
          ) : !loading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No devices found.{" "}
              <a href="/contribute" className="text-primary hover:underline">
                Add it to the database?
              </a>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
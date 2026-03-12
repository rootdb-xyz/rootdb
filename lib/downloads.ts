import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const DOWNLOADS_FILE = path.join(process.cwd(), "data", "downloads.yml");

export interface Mirror {
  label: string;
  url: string;
  host: string;
}

export interface OriginalSource {
  source_url: string;
  source_label: string;
  download_url?: string;
  is_direct?: boolean;
}

export interface DownloadEntry {
  id: string;
  name: string;
  description?: string;
  version?: string;
  category?: string;
  mirrors: Mirror[];
  original: OriginalSource;
  checksum_sha256?: string;
}

let cached: { data: DownloadEntry[]; mtime: number } | null = null;

function load(): DownloadEntry[] {
  try {
    const abs = path.resolve(DOWNLOADS_FILE);
    const stat = fs.statSync(abs);
    if (cached && cached.mtime === stat.mtimeMs) return cached.data;

    const raw = fs.readFileSync(abs, "utf-8");
    const data = (yaml.load(raw) as DownloadEntry[]) ?? [];
    cached = { data, mtime: stat.mtimeMs };
    return data;
  } catch {
    return [];
  }
}

export function getAllDownloadEntries(): DownloadEntry[] {
  return load();
}

export function getDownloadEntry(id: string): DownloadEntry | null {
  return load().find((d) => d.id === id) ?? null;
}
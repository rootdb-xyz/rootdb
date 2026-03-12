import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type {
  Brand,
  Tag,
  Region,
  Question,
  Answer,
  Device,
  Guide,
  Block,
  SearchResult,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

// ───── Mtime-aware cache ─────
const cache = new Map<string, { data: unknown; mtime: number }>();

function loadYaml<T>(filePath: string): T | null {
  try {
    const abs = path.resolve(filePath);
    const stat = fs.statSync(abs);
    const hit = cache.get(abs);
    if (hit && hit.mtime === stat.mtimeMs) return hit.data as T;

    const raw = fs.readFileSync(abs, "utf-8");
    const data = yaml.load(raw) as T;
    cache.set(abs, { data, mtime: stat.mtimeMs });
    return data;
  } catch {
    return null;
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (/\.ya?ml$/.test(entry.name)) out.push(full);
    }
  } catch {
    /* dir doesn't exist yet */
  }
  return out;
}

// ═══════ DICTIONARY LOADERS ═══════

export function getTags(): Record<string, Tag> {
  return loadYaml(path.join(DATA_DIR, "dictionaries", "tags.yml")) ?? {};
}
export function getBrands(): Record<string, Brand> {
  return loadYaml(path.join(DATA_DIR, "dictionaries", "brands.yml")) ?? {};
}
export function getRegions(): Record<string, Region> {
  return loadYaml(path.join(DATA_DIR, "dictionaries", "regions.yml")) ?? {};
}
export function getQuestions(): Record<string, Question> {
  return loadYaml(path.join(DATA_DIR, "dictionaries", "questions.yml")) ?? {};
}
export function getAnswers(): Record<string, Answer> {
  return loadYaml(path.join(DATA_DIR, "dictionaries", "answers.yml")) ?? {};
}

// ═══════ DEVICE LOADERS ═══════

export function getAllDevices(): Device[] {
  const dir = path.join(DATA_DIR, "devices");
  return walk(dir).flatMap((file) => {
    const rel = path.relative(dir, file);
    const parts = rel.split(path.sep);
    if (parts.length !== 3) return [];

    const [brand_id, series_id, filename] = parts;
    const codename = filename.replace(/\.ya?ml$/, "");
    const raw = loadYaml<Omit<Device, "brand_id" | "series_id" | "codename">>(file);
    if (!raw || !raw.name) return [];

    return [{ ...raw, brand_id, series_id, codename } as Device];
  });
}

export function getDevice(
  brandId: string,
  seriesId: string,
  codename: string
): Device | null {
  const file = path.join(DATA_DIR, "devices", brandId, seriesId, `${codename}.yml`);
  const raw = loadYaml<Omit<Device, "brand_id" | "series_id" | "codename">>(file);
  if (!raw) return null;
  return { ...raw, brand_id: brandId, series_id: seriesId, codename };
}

// ═══════ GUIDE & BLOCK LOADERS ═══════

export function getGuide(id: string): Guide | null {
  return loadYaml(path.join(DATA_DIR, "guides", `${id}.yml`));
}

export function getAllGuides(): Guide[] {
  return walk(path.join(DATA_DIR, "guides"))
    .map((f) => loadYaml<Guide>(f))
    .filter((g): g is Guide => g !== null);
}

export function getBlock(id: string): Block | null {
  return loadYaml(path.join(DATA_DIR, "blocks", `${id}.yml`));
}

// ═══════ SEARCH ═══════

export function searchDevices(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const devices = getAllDevices();
  const brands = getBrands();

  return devices
    .filter((d) => {
      if (d.codename.toLowerCase().includes(q)) return true;
      if (d.name.toLowerCase().includes(q)) return true;
      const brandName = brands[d.brand_id]?.name ?? d.brand_id;
      if (brandName.toLowerCase().includes(q)) return true;
      if (`${brandName} ${d.name}`.toLowerCase().includes(q)) return true;
      if (d.variants?.some((v) => v.model.toLowerCase().replace(/-/g, "").includes(q.replace(/-/g, "")))) return true;
      return false;
    })
    .map((d) => ({
      codename: d.codename,
      name: d.name,
      brand_id: d.brand_id,
      series_id: d.series_id,
      soc: d.soc,
      image: d.image,
      variant_count: d.variants?.length ?? 0,
      rootable_count:
        d.variants?.filter((v) => !v.tags.includes("locked_bootloader")).length ?? 0,
    }))
    .slice(0, 20);
}

// ═══════ AGGREGATE STATS (FIXED) ═══════

export function getStats() {
  const devices = getAllDevices();
  const guides = getAllGuides();

  // Count unique brands from ACTUAL device files, not brands.yml
  const uniqueBrands = new Set(devices.map((d) => d.brand_id));

  return {
    totalDevices: devices.length,
    totalVariants: devices.reduce((s, d) => s + (d.variants?.length ?? 0), 0),
    totalGuides: guides.length,
    totalBrands: uniqueBrands.size,
  };
}
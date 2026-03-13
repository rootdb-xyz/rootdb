import yaml from "js-yaml";
import "server-only"; // Explicitly mark this as server-side only
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

// ───── Helper to load Node.js modules dynamically ─────
async function getContext() {
  const fs = await import("fs");
  const path = await import("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  return { fs, path, DATA_DIR };
}

// ───── Mtime-aware cache ─────
const cache = new Map<string, { data: unknown; mtime: number }>();

async function loadYaml<T>(filePath: string): Promise<T | null> {
  try {
    const { fs, path } = await getContext();
    const abs = path.resolve(filePath);
    
    // Use fs.promises or synchronous methods (since we are inside an async wrapper)
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

async function walk(dir: string): Promise<string[]> {
  const { fs, path } = await getContext();
  const out: string[] = [];
  try {
    // We can use sync methods here because the wrapper function is async
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Recursive call
        const children = await walk(full);
        out.push(...children);
      }
      else if (/\.ya?ml$/.test(entry.name)) {
        out.push(full);
      }
    }
  } catch {
    /* dir doesn't exist yet */
  }
  return out;
}

// ═══════ DICTIONARY LOADERS ═══════

export async function getTags(): Promise<Record<string, Tag>> {
  const { path, DATA_DIR } = await getContext();
  return (await loadYaml(path.join(DATA_DIR, "dictionaries", "tags.yml"))) ?? {};
}

export async function getBrands(): Promise<Record<string, Brand>> {
  const { path, DATA_DIR } = await getContext();
  return (await loadYaml(path.join(DATA_DIR, "dictionaries", "brands.yml"))) ?? {};
}

export async function getRegions(): Promise<Record<string, Region>> {
  const { path, DATA_DIR } = await getContext();
  return (await loadYaml(path.join(DATA_DIR, "dictionaries", "regions.yml"))) ?? {};
}

export async function getQuestions(): Promise<Record<string, Question>> {
  const { path, DATA_DIR } = await getContext();
  return (await loadYaml(path.join(DATA_DIR, "dictionaries", "questions.yml"))) ?? {};
}

export async function getAnswers(): Promise<Record<string, Answer>> {
  const { path, DATA_DIR } = await getContext();
  return (await loadYaml(path.join(DATA_DIR, "dictionaries", "answers.yml"))) ?? {};
}

// ═══════ DEVICE LOADERS ═══════

export async function getAllDevices(): Promise<Device[]> {
  const { path, DATA_DIR } = await getContext();
  const dir = path.join(DATA_DIR, "devices");
  const files = await walk(dir);

  const results = await Promise.all(files.map(async (file) => {
    const rel = path.relative(dir, file);
    const parts = rel.split(path.sep);
    if (parts.length !== 3) return null;

    const [brand_id, series_id, filename] = parts;
    const codename = filename.replace(/\.ya?ml$/, "");
    const raw = await loadYaml<Omit<Device, "brand_id" | "series_id" | "codename">>(file);
    if (!raw || !raw.name) return null;

    return { ...raw, brand_id, series_id, codename } as Device;
  }));

  return results.filter((d): d is Device => d !== null);
}

export async function getDevice(
  brandId: string,
  seriesId: string,
  codename: string
): Promise<Device | null> {
  const { path, DATA_DIR } = await getContext();
  const file = path.join(DATA_DIR, "devices", brandId, seriesId, `${codename}.yml`);
  const raw = await loadYaml<Omit<Device, "brand_id" | "series_id" | "codename">>(file);
  if (!raw) return null;
  return { ...raw, brand_id: brandId, series_id: seriesId, codename };
}

// ═══════ GUIDE & BLOCK LOADERS ═══════

export async function getGuide(id: string): Promise<Guide | null> {
  const { path, DATA_DIR } = await getContext();
  return loadYaml(path.join(DATA_DIR, "guides", `${id}.yml`));
}

export async function getAllGuides(): Promise<Guide[]> {
  const { path, DATA_DIR } = await getContext();
  const files = await walk(path.join(DATA_DIR, "guides"));
  
  const results = await Promise.all(files.map(f => loadYaml<Guide>(f)));
  return results.filter((g): g is Guide => g !== null);
}

export async function getBlock(id: string): Promise<Block | null> {
  const { path, DATA_DIR } = await getContext();
  return loadYaml(path.join(DATA_DIR, "blocks", `${id}.yml`));
}

// ═══════ SEARCH ═══════

export async function searchDevices(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const [devices, brands] = await Promise.all([
    getAllDevices(),
    getBrands()
  ]);

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

// ═══════ AGGREGATE STATS ═══════

export async function getStats() {
  const [devices, guides] = await Promise.all([
    getAllDevices(),
    getAllGuides()
  ]);

  const uniqueBrands = new Set(devices.map((d) => d.brand_id));

  return {
    totalDevices: devices.length,
    totalVariants: devices.reduce((s, d) => s + (d.variants?.length ?? 0), 0),
    totalGuides: guides.length,
    totalBrands: uniqueBrands.size,
  };
}
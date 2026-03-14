import fs from "fs";
import path from "path";

const LOCAL_STORE_DIR = path.join(process.cwd(), "data", ".local-store");

function isWritable(): boolean {
  try {
    fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function storeGet<T>(key: string): Promise<T | null> {
  try {
    const file = path.join(LOCAL_STORE_DIR, `${key.replace(/[:/]/g, "__")}.json`);
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storeSet<T>(key: string, value: T): Promise<void> {
  if (!isWritable()) return;
  const file = path.join(LOCAL_STORE_DIR, `${key.replace(/[:/]/g, "__")}.json`);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export async function storeDel(key: string): Promise<void> {
  try {
    fs.unlinkSync(path.join(LOCAL_STORE_DIR, `${key.replace(/[:/]/g, "__")}.json`));
  } catch { /* doesn't exist or read-only */ }
}

export async function storeKeys(pattern: string): Promise<string[]> {
  try {
    const prefix = pattern.replace("*", "");
    const files = fs.readdirSync(LOCAL_STORE_DIR);
    return files
      .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
      .map((f) => f.replace(".json", "").replace(/__/g, ":"));
  } catch {
    return [];
  }
}

export async function storeAppend<T>(key: string, item: T): Promise<void> {
  if (!isWritable()) return;
  const list = (await storeGet<T[]>(key)) ?? [];
  list.push(item);
  await storeSet(key, list);
}

export async function storeGetList<T>(key: string): Promise<T[]> {
  return (await storeGet<T[]>(key)) ?? [];
}
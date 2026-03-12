import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DeviceVariant, Tag } from "./types";

// ───── shadcn merge helper ─────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ───── Rootability Score Engine ─────
// Each tag slug maps to a score delta. Tags not listed here fall back to
// the `score_modifier` field in tags.yml, then default to 0.
const BUILTIN_SCORE_MAP: Record<string, number> = {
  unlockable_bootloader: 50,
  kernelsu: 20,
  magisk: 15,
  apatch: 15,
  custom_rom: 10,
  twrp: 10,
  custom_kernel: 5,
  safetynet_pass: 10,
  active_community: 5,
  // Penalties
  locked_bootloader: -100,
  knox_tripped: -10,
  drm_loss: -5,
  no_guides: -15,
};

export function calculateRootScore(
  variant: DeviceVariant,
  tagsDict: Record<string, Tag>
): number {
  let score = 0;
  for (const tagId of variant.tags) {
    score +=
      BUILTIN_SCORE_MAP[tagId] ?? tagsDict[tagId]?.score_modifier ?? 0;
  }
  // Clamp 0‑100
  return Math.max(0, Math.min(100, score));
}

export type ScoreTier = "excellent" | "good" | "limited" | "blocked";

export function getScoreTier(score: number): {
  tier: ScoreTier;
  label: string;
  color: string; // Tailwind class
} {
  if (score >= 75) return { tier: "excellent", label: "Excellent", color: "text-ctp-green" };
  if (score >= 50) return { tier: "good", label: "Good", color: "text-ctp-blue" };
  if (score >= 25) return { tier: "limited", label: "Limited", color: "text-ctp-yellow" };
  return { tier: "blocked", label: "Not Rootable", color: "text-ctp-red" };
}

// ───── File Host Tier Router ─────
export type FileHostTier = "heavyweight" | "midweight" | "lightweight";

const GB = 1024 ** 3;
const MB = 1024 ** 2;

export function getFileHostTier(sizeBytes: number): FileHostTier {
  if (sizeBytes > 5 * GB) return "heavyweight"; // → download.gg
  if (sizeBytes > 256 * MB) return "midweight"; // → gofile.to
  return "lightweight"; // → catbox.moe / qu.ax
}

export function getFileHostMeta(tier: FileHostTier) {
  const hosts: Record<FileHostTier, { name: string; maxLabel: string; api: string }> = {
    heavyweight: { name: "Download.gg", maxLabel: "25 GB", api: "https://download.gg/api" },
    midweight: { name: "Gofile", maxLabel: "5 GB", api: "https://store1.gofile.io/contents/uploadfile" },
    lightweight: { name: "Catbox", maxLabel: "200 MB", api: "https://catbox.moe/user/api.php" },
  };
  return hosts[tier];
}
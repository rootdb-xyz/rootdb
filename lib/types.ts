/* ════════════════════════════════════════
   DICTIONARY TYPES  (data/dictionaries/)
   ════════════════════════════════════════ */

export interface Tag {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  score_modifier?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
}

export interface Region {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  warning?: string;
}

export interface Question {
  id: string;
  text: string;
  help?: string;
}

export interface Answer {
  id: string;
  text: string;
}

/* ════════════════════════════════════════
   DEVICE TYPES      (data/devices/)
   ════════════════════════════════════════ */

export interface DeviceVariant {
  model: string;
  region_id: string;
  soc?: string;          // ← Per-variant SoC; overrides device-level
  carrier?: string;
  tags: string[];
  guide_ids?: string[];
  affiliate_url?: string;
  notes?: string;
}

export interface Device {
  brand_id: string;
  series_id: string;
  codename: string;

  name: string;
  soc: string;           // Device-level default; variants may override
  ram?: string;
  launch_os?: string;
  current_os?: string;
  image?: string;
  variants: DeviceVariant[];
}

/* ════════════════════════════════════════
   GUIDE TYPES       (data/guides/)
   ════════════════════════════════════════ */

export interface GuideConditionBranch {
  answer_id: string;
  inject_blocks: string[];
  next_question_id?: string;
}

export interface GuideCondition {
  question_id: string;
  branches: GuideConditionBranch[];
}

export interface Guide {
  id: string;
  title: string;
  description?: string;
  author?: string;
  updated?: string;
  tags: string[];
  required_tools?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  conditions?: GuideCondition[];
  core_blocks: string[];
}

/* ════════════════════════════════════════
   BLOCK TYPE        (data/blocks/)
   ════════════════════════════════════════ */

export interface Block {
  id: string;
  title?: string;
  content: string;
  warning?: string;
  tip?: string;
}

/* ════════════════════════════════════════
   SEARCH & DISPLAY
   ════════════════════════════════════════ */

export interface SearchResult {
  codename: string;
  name: string;
  brand_id: string;
  series_id: string;
  soc: string;
  variant_count: number;
  rootable_count: number;
  image?: string;
}

/* ════════════════════════════════════════
   USER / VOTING
   ════════════════════════════════════════ */

export type VoteResult = "works" | "bootloop" | "partial";

export interface Vote {
  user_id: string;
  guide_id: string;
  device_codename: string;
  variant_model: string;
  android_version: string;
  result: VoteResult;
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  github_username: string;
  avatar_url: string;
  trust_score: number;
  badges: string[];
  contributions: number;
  joined_at: string;
}

/* ════════════════════════════════════════
   FILE HOSTING
   ════════════════════════════════════════ */

export interface HostedFile {
  id: string;
  filename: string;
  size: number;
  host_tier: "heavyweight" | "midweight" | "lightweight";
  download_url: string;
  monetized_url?: string;
  original_url?: string;
  checksum_sha256?: string;
  uploaded_at: string;
}
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VOTES_DIR = path.join(process.cwd(), "data", "votes");

export interface VotePayload {
  guide_id: string;
  device_codename: string;
  variant_model: string;
  android_version: string;
  result: "works" | "bootloop" | "partial";
  notes?: string;
}

// GET — aggregate votes for a guide+variant combo
export async function GET(req: NextRequest) {
  const guideId = req.nextUrl.searchParams.get("guide_id");
  const model = req.nextUrl.searchParams.get("model");
  if (!guideId) return NextResponse.json({ error: "guide_id required" }, { status: 400 });

  const votes = loadVotes(guideId);
  const filtered = model ? votes.filter((v) => v.variant_model === model) : votes;

  const total = filtered.length;
  const works = filtered.filter((v) => v.result === "works").length;
  const bootloop = filtered.filter((v) => v.result === "bootloop").length;
  const partial = filtered.filter((v) => v.result === "partial").length;

  // Group by android version
  const byVersion: Record<string, { works: number; bootloop: number; partial: number; total: number }> = {};
  for (const v of filtered) {
    if (!byVersion[v.android_version]) {
      byVersion[v.android_version] = { works: 0, bootloop: 0, partial: 0, total: 0 };
    }
    byVersion[v.android_version][v.result]++;
    byVersion[v.android_version].total++;
  }

  return NextResponse.json({
    guide_id: guideId,
    model: model ?? "all",
    total,
    works,
    bootloop,
    partial,
    success_rate: total > 0 ? Math.round((works / total) * 100) : null,
    by_version: byVersion,
    recent: filtered.slice(-10).reverse(),
  });
}

// POST — submit a vote
export async function POST(req: NextRequest) {
  try {
    const body: VotePayload = await req.json();

    if (!body.guide_id || !body.variant_model || !body.android_version || !body.result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["works", "bootloop", "partial"].includes(body.result)) {
      return NextResponse.json({ error: "Invalid result value" }, { status: 400 });
    }

    const vote = {
      ...body,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
    };

    saveVote(body.guide_id, vote);

    return NextResponse.json({ ok: true, vote });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// ── File-based vote storage ──

function votePath(guideId: string): string {
  return path.join(VOTES_DIR, `${guideId}.json`);
}

function loadVotes(guideId: string): (VotePayload & { id: string; created_at: string })[] {
  try {
    const raw = fs.readFileSync(votePath(guideId), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveVote(guideId: string, vote: VotePayload & { id: string; created_at: string }) {
  fs.mkdirSync(VOTES_DIR, { recursive: true });
  const votes = loadVotes(guideId);
  votes.push(vote);
  fs.writeFileSync(votePath(guideId), JSON.stringify(votes, null, 2));
}
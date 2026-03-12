import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBMISSIONS_DIR = path.join(process.cwd(), "data", "submissions", "removals");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.brand_id || !body.codename) {
      return NextResponse.json({ error: "brand_id and codename required" }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const submission = {
      id,
      type: "removal",
      status: "pending",
      submitted_at: new Date().toISOString(),
      device: {
        brand_id: body.brand_id,
        series_id: body.series_id,
        codename: body.codename,
        name: body.name,
      },
      reason: body.reason ?? "",
      details: body.details ?? "",
    };

    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(SUBMISSIONS_DIR, `${id}.json`),
      JSON.stringify(submission, null, 2)
    );

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
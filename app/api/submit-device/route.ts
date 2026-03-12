import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBMISSIONS_DIR = path.join(process.cwd(), "data", "submissions", "devices");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.brand || !body.yaml_content) {
      return NextResponse.json({ error: "brand and yaml_content are required" }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const codename = body.codename || body.display_name?.toLowerCase().replace(/\s+/g, "-") || "unknown";

    const submission = {
      id,
      type: "device",
      status: "pending",
      submitted_at: new Date().toISOString(),
      target_path: `data/devices/${body.brand}/${codename}.yml`,
      display_name: body.display_name ?? codename,
      variant_count: body.variant_count ?? 0,
      yaml_content: body.yaml_content,
    };

    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const filePath = path.join(SUBMISSIONS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));

    console.log(`[RootDB] Device submission saved: ${filePath}`);

    return NextResponse.json({ ok: true, id, path: filePath });
  } catch (err) {
    console.error("[RootDB] Device submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// GET — list pending device submissions
export async function GET() {
  try {
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const files = fs.readdirSync(SUBMISSIONS_DIR).filter((f) => f.endsWith(".json"));
    const submissions = files.map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, f), "utf-8"));
      } catch {
        return null;
      }
    }).filter(Boolean);
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ submissions: [] });
  }
}
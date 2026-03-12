import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBMISSIONS_DIR = path.join(process.cwd(), "data", "submissions", "guides");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.guide_yaml || !body.guide_id) {
      return NextResponse.json({ error: "guide_id and guide_yaml are required" }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const submission = {
      id,
      type: "guide",
      status: "pending",
      submitted_at: new Date().toISOString(),
      guide_id: body.guide_id,
      // The guide YAML file content
      guide_yaml: body.guide_yaml,
      // New blocks that need to be created (array of { id, yaml })
      new_blocks: body.new_blocks ?? [],
      // New questions to add to questions.yml
      new_questions: body.new_questions ?? [],
      // New answers to add to answers.yml
      new_answers: body.new_answers ?? [],
    };

    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const filePath = path.join(SUBMISSIONS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));

    console.log(`[RootDB] Guide submission saved: ${filePath}`);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[RootDB] Guide submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
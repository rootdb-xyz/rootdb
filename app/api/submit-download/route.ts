import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBMISSIONS_DIR = path.join(process.cwd(), "data", "submissions");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.mirrors?.length || !body.original?.source_url) {
      return NextResponse.json(
        { error: "name, at least one mirror, and original source_url are required" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const submission = {
      id,
      status: "pending",
      submitted_at: new Date().toISOString(),
      ...body,
    };

    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(SUBMISSIONS_DIR, `${id}.json`),
      JSON.stringify(submission, null, 2)
    );

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
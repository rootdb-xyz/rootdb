import { NextRequest, NextResponse } from "next/server";
import { storeAppend } from "@/lib/store";
import { createDataPR, isGitHubAppConfigured } from "@/lib/github-pr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.guide_id || !body.guide_yaml) {
      return NextResponse.json(
        { error: "guide_id and guide_yaml required" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const submission: Record<string, unknown> = {
      id,
      type: "guide",
      status: "pending",
      submitted_at: new Date().toISOString(),
      guide_id: body.guide_id,
      guide_yaml: body.guide_yaml,
      new_blocks: body.new_blocks ?? [],
      new_questions: body.new_questions ?? [],
      new_answers: body.new_answers ?? [],
      pr_url: null,
    };

    if (isGitHubAppConfigured()) {
      try {
        const branch = `guide/${body.guide_id}-${id}`;
        const files: { path: string; content: string }[] = [
          { path: `data/guides/${body.guide_id}.yml`, content: body.guide_yaml },
        ];

        for (const block of body.new_blocks ?? []) {
          if (block.id && block.yaml) {
            files.push({ path: `data/blocks/${block.id}.yml`, content: block.yaml });
          }
        }

        const result = await createDataPR({
          title: `Add guide: ${body.guide_id}`,
          body: `## Guide Submission\n\n- **ID:** ${body.guide_id}\n- **Files:** ${files.length}\n- **Submitted via:** rootdb.xyz editor`,
          branch,
          files,
        });

        submission.pr_url = result.pr_url;
        submission.status = "pr_created";
      } catch (err) {
        console.error("[RootDB] GitHub PR failed:", err);
      }
    }

    await storeAppend("submissions:guides", submission);
    return NextResponse.json({ ok: true, id, pr_url: submission.pr_url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
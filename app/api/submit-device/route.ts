import { NextRequest, NextResponse } from "next/server";
import { storeAppend, storeGetList } from "@/lib/store";
import { createDataPR, isGitHubAppConfigured } from "@/lib/github-pr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.brand || !body.yaml_content) {
      return NextResponse.json(
        { error: "brand and yaml_content required" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const codename =
      body.codename ||
      body.display_name?.toLowerCase().replace(/\s+/g, "-") ||
      "unknown";

    const submission: Record<string, unknown> = {
      id,
      type: "device",
      status: "pending",
      submitted_at: new Date().toISOString(),
      target_path: `data/devices/${body.brand}/${codename}.yml`,
      display_name: body.display_name ?? codename,
      variant_count: body.variant_count ?? 0,
      yaml_content: body.yaml_content,
      pr_url: null,
    };

    if (isGitHubAppConfigured()) {
      try {
        const branch = `device/${body.brand}-${codename}-${id}`;
        const result = await createDataPR({
          title: `Add device: ${body.display_name ?? codename}`,
          body: [
            `## New Device Submission`,
            ``,
            `- **Brand:** ${body.brand}`,
            `- **Name:** ${body.display_name ?? codename}`,
            `- **Variants:** ${body.variant_count ?? 0}`,
            `- **Submitted via:** rootdb.xyz web form`,
          ].join("\n"),
          branch,
          files: [
            {
              path: `data/devices/${body.brand}/${codename}.yml`,
              content: body.yaml_content,
            },
          ],
        });

        submission.pr_url = result.pr_url;
        submission.status = "pr_created";
      } catch (err) {
        console.error("[RootDB] GitHub PR failed:", err);
      }
    }

    await storeAppend("submissions:devices", submission);

    return NextResponse.json({
      ok: true,
      id,
      pr_url: submission.pr_url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const submissions = await storeGetList("submissions:devices");
  return NextResponse.json({ submissions });
}
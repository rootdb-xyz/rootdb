import { NextRequest, NextResponse } from "next/server";
import { storeAppend } from "@/lib/store";
import { createDataPR, isGitHubAppConfigured } from "@/lib/github-pr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.mirrors?.length || !body.original?.source_url) {
      return NextResponse.json(
        { error: "name, mirrors, and original.source_url required" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const submission: Record<string, unknown> = {
      id,
      type: "download",
      status: "pending",
      submitted_at: new Date().toISOString(),
      ...body,
      pr_url: null,
    };

    if (isGitHubAppConfigured()) {
      try {
        const yamlLines = [
          `- id: ${slug}${body.version ? `-${body.version}` : ""}`,
          `  name: "${body.name}"`,
          body.description ? `  description: "${body.description}"` : null,
          body.version ? `  version: "${body.version}"` : null,
          `  mirrors:`,
          ...body.mirrors.map(
            (m: { label: string; url: string; host: string }) =>
              `    - label: "${m.label}"\n      url: "${m.url}"\n      host: ${m.host}`
          ),
          `  original:`,
          `    source_url: "${body.original.source_url}"`,
          `    source_label: "${body.original.source_label || "Source"}"`,
          body.original.download_url ? `    download_url: "${body.original.download_url}"` : null,
        ].filter(Boolean).join("\n");

        const branch = `download/${slug}-${id}`;
        const result = await createDataPR({
          title: `Add download: ${body.name}`,
          body: `## Download Submission\n\n- **Name:** ${body.name}\n- **Mirrors:** ${body.mirrors.length}\n\nAppend to \`data/downloads.yml\`:\n\n\`\`\`yaml\n${yamlLines}\n\`\`\``,
          branch,
          files: [{ path: `data/submissions/downloads/${slug}-${id}.yml`, content: yamlLines }],
        });

        submission.pr_url = result.pr_url;
        submission.status = "pr_created";
      } catch (err) {
        console.error("[RootDB] GitHub PR failed:", err);
      }
    }

    await storeAppend("submissions:downloads", submission);
    return NextResponse.json({ ok: true, id, pr_url: submission.pr_url });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
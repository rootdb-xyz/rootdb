import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { storeGet, storeSet } from "@/lib/store";

type SubmissionType = "devices" | "guides" | "downloads" | "removals";

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { type, id, action } = (await req.json()) as {
      type: SubmissionType;
      id: string;
      action: "approve" | "reject";
    };

    if (!type || !id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const key = `submissions:${type}`;
    const list = (await storeGet<{ id: string; status: string }[]>(key)) ?? [];

    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    list[idx] = {
      ...list[idx],
      status: action === "approve" ? "approved" : "rejected",
    };

    await storeSet(key, list);

    console.log(`[Admin] ${admin.name} ${action}d ${type} submission ${id}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
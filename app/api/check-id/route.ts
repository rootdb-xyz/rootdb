import { NextRequest, NextResponse } from "next/server";
import { getBlock, getTags, getQuestions, getAnswers, getAllDevices } from "@/lib/data";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "type and id required" }, { status: 400 });
  }

  switch (type) {
    case "block": {
      const block = await getBlock(id);
      return NextResponse.json({
        exists: !!block,
        data: block ? { id: block.id, title: block.title, content: block.content?.slice(0, 200), warning: block.warning, tip: block.tip } : null,
      });
    }
    case "question": {
      const qs = getQuestions();
      const q = qs[id];
      return NextResponse.json({
        exists: !!q,
        data: q ?? null,
      });
    }
    case "answer": {
      const ans = getAnswers();
      const a = ans[id];
      return NextResponse.json({
        exists: !!a,
        data: a ?? null,
      });
    }
    case "tag": {
      const tags = getTags();
      const t = tags[id];
      return NextResponse.json({
        exists: !!t,
        data: t ?? null,
      });
    }
    case "device": {
      const devices = getAllDevices();
      const d = devices.find((dev) => dev.codename === id);
      return NextResponse.json({
        exists: !!d,
        data: d ? { codename: d.codename, name: d.name, brand_id: d.brand_id } : null,
      });
    }
    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
}
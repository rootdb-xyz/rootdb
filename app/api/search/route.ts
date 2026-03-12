import { NextRequest, NextResponse } from "next/server";
import { searchDevices } from "@/lib/data";

export const revalidate = 60; // ISR: re-read YAML at most once per minute

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = searchDevices(q);
  return NextResponse.json({ results });
}
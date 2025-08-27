// app/api/health/providers/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const show = (k?: string) => (k ? k.slice(0, 8) + "…" : "missing");
  return NextResponse.json({
    openai: show(process.env.OPENAI_API_KEY),
    gemini: show(process.env.GEMINI_API_KEY),
  });
}
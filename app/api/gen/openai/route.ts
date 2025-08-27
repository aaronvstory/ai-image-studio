// app/api/gen/openai/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const {
    prompt,
    size = "1024x1024",             // "1024x1024" | "1792x1024" | "1024x1792"
    quality = "standard",           // "standard" | "hd"
    style = "vivid"                 // "vivid" | "natural"
  } = await req.json();

  const resp = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: size as any,
    quality: quality as any,
    style: style as any,
    n: 1,
    response_format: "url"
  });

  const out: string[] = [];
  for (const d of resp.data || []) {
    if ((d as any).url) {
      out.push((d as any).url);
    } else if ((d as any).b64_json) {
      out.push(`data:image/png;base64,${(d as any).b64_json}`);
    }
  }

  return NextResponse.json({
    provider: "openai",
    model: "dall-e-3",
    images: out,
    texts: []
  });
}
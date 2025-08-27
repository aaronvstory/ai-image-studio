// app/api/gen/gemini-real/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt, imageDataUrls = [] } = await req.json();
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const parts: any[] = [{ text: prompt }];
  for (const url of imageDataUrls) {
    const base64 = url.split(",")[1];
    const mime = url.match(/^data:(.*?);base64,/)?.[1] ?? "image/png";
    parts.push({ inlineData: { mimeType: mime, data: base64 } });
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    const result = await model.generateContent(parts);
    const response = await result.response;

    const images: string[] = [];
    const texts: string[] = [];
    
    // Get text response if available
    const text = response.text();
    if (text) texts.push(text);

    return NextResponse.json({
      provider: "gemini",
      model: "gemini-2.5-flash-image-preview",
      images,
      texts
    });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (/RESOURCE_EXHAUSTED/i.test(msg) && /free_tier/i.test(msg)) {
      return NextResponse.json({
        error: "Gemini key hit Free-tier quotas. Use a Paid AI Studio key and pass it explicitly.",
        docs: "https://ai.google.dev/gemini-api/docs/billing"
      }, { status: 429 });
    }
    return NextResponse.json({ error: "Gemini error", details: msg.slice(0, 600) }, { status: 502 });
  }
}
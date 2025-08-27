// app/api/gen/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt, mode = "generate", imageDataUrls = [] } = await req.json();
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  if (mode === "analyze") {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return NextResponse.json({ provider: "gemini", model: "gemini-2.5-flash", analysis: text });
  }

  // otherwise generate/edit
  const parts: any[] = [{ text: prompt }];
  for (const url of imageDataUrls) {
    const base64 = url.split(",")[1];
    const mime = url.match(/^data:(.*?);base64,/)?.[1] ?? "image/png";
    parts.push({ inlineData: { mimeType: mime, data: base64 } });
  }
  
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
  const result = await model.generateContent(parts);
  const response = await result.response;

  const images: string[] = [];
  const texts: string[] = [];
  
  const text = response.text();
  if (text) texts.push(text);

  return NextResponse.json({ provider: "gemini", model: "gemini-2.5-flash-image-preview", images, texts });
}
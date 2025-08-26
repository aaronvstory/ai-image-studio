import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { z } from "zod";

const transformSchema = z.object({
  mode: z.enum(["upload", "generate"]).default("generate"),
  image: z.string().url().optional(),
  prompt: z.string().min(0).max(800).optional(),
  style: z.string().max(120).optional(),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Track free tier usage
async function checkFreeUsage() {
  const cookieStore = await cookies();
  const freeUsageCount = cookieStore.get("free_usage_count");
  const count = freeUsageCount ? parseInt(freeUsageCount.value) : 0;
  return count;
}

async function incrementFreeUsage() {
  const cookieStore = await cookies();
  const currentCount = await checkFreeUsage();
  cookieStore.set("free_usage_count", String(currentCount + 1), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();

    // Require authentication for any generation
    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please sign in to use image transformation",
        },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const hasPaid = user?.publicMetadata?.hasPaid === true;
    const generationCount: number =
      typeof user?.publicMetadata?.generationCount === "number"
        ? (user?.publicMetadata?.generationCount as number)
        : 0;

    // Check if user has already used their free generation
    if (!hasPaid && generationCount >= 1) {
      return NextResponse.json(
        {
          error: "Free trial limit reached",
          message:
            "You've used your free generation. Please upgrade to continue.",
          requiresPayment: true,
          generationCount: generationCount,
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const parsed = transformSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: parsed.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }
    const { mode, image, prompt, style } = parsed.data;

    if (!prompt && mode === "generate") {
      return NextResponse.json(
        {
          error: "Prompt is required for generation",
        },
        { status: 400 }
      );
    }

    console.log("=== IMAGE TRANSFORMATION REQUEST ===");
    console.log("Mode:", mode);
    console.log("Style:", style);
    console.log("Has Image:", !!image);
    console.log("Prompt:", prompt);
    console.log("User ID:", userId || "Anonymous");
    console.log("Has Paid:", hasPaid);
    console.log("====================================");

    let finalPrompt: string = prompt || "";

    // If an image is uploaded, analyze it first with GPT-4 Vision
    if (mode === "upload" && image) {
      try {
        // Use GPT-4 Vision to describe the image
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe this image in detail, focusing on the main subject, composition, colors, and style. Be specific and thorough.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        });

        const imageDescription =
          visionResponse.choices[0]?.message?.content || "";
        console.log("Image Analysis:", imageDescription);

        // Combine the description with the style transformation
        finalPrompt = `${imageDescription}. Transform this ${
          prompt ? `with the following style: ${prompt}` : ""
        }`;
      } catch (visionError) {
        console.error("GPT-4 Vision error:", visionError);
        // Fallback to using just the prompt if vision fails
        finalPrompt = prompt || "A beautiful artistic image";
      }
    }

    try {
      // Generate image using DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt || "Artistic image",
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("No image data received from OpenAI");
      }

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      // Update user's generation count if not paid
      if (!hasPaid && userId) {
        const client = await clerkClient();
        const newCount = (generationCount || 0) + 1;
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...user?.publicMetadata,
            generationCount: newCount,
          },
        });
      }

      // Log successful generation
      console.log("Image generated successfully");
      console.log("Image URL:", imageUrl);
      console.log("Final prompt used:", finalPrompt);
      console.log("Revised prompt:", revisedPrompt);

      return NextResponse.json({
        success: true,
        imageUrl,
        revisedPrompt,
        finalPrompt,
        metadata: {
          userId: userId || "anonymous",
          timestamp: new Date().toISOString(),
          mode,
          style,
          freeUsage: !hasPaid,
        },
      });
    } catch (openaiError: unknown) {
      console.error("OpenAI API error:", openaiError);

      // Handle specific OpenAI errors
      const oe: any = openaiError;
      if (oe?.error?.code === "content_policy_violation") {
        return NextResponse.json(
          {
            error: "Content policy violation",
            message:
              "Your request violates OpenAI content policy. Please try a different prompt.",
          },
          { status: 400 }
        );
      }

      if (oe?.error?.code === "rate_limit_exceeded") {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
          },
          { status: 429 }
        );
      }

      throw openaiError;
    }
  } catch (error) {
    console.error("Image transformation error:", error);
    return NextResponse.json(
      {
        error: "Image generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check usage status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // If not authenticated, return no access
    if (!userId) {
      return NextResponse.json({
        hasAccess: false,
        remainingFree: 0,
        isPaid: false,
        userId: null,
        requiresAuth: true,
      });
    }

    const user = await currentUser();
    const hasPaid = user?.publicMetadata?.hasPaid === true;
    const generationCount: number =
      typeof user?.publicMetadata?.generationCount === "number"
        ? (user?.publicMetadata?.generationCount as number)
        : 0;

    return NextResponse.json({
      hasAccess: hasPaid || generationCount < 1,
      generationCount,
      remainingFree: Math.max(0, 1 - generationCount),
      isPaid: hasPaid,
      userId: userId,
    });
  } catch (error) {
    console.error("Error checking usage:", error);
    return NextResponse.json(
      {
        hasAccess: false,
        error: "Failed to check usage status",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import OpenAI from "openai";
import { rateLimit, rateLimitHeaders, rateLimitKey } from "@/lib/rate-limit";
import { z } from "zod";

const generateImageSchema = z.object({
  prompt: z.string().min(3).max(800, "Prompt too long (800 char max)"),
  size: z.string().optional(),
  quality: z.string().optional(),
  style: z.string().optional(),
});

// Initialize OpenAI client with fallback for build time
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-for-build',
});

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client and user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Demo mode bypass for testing
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const body = await request.json();

    // Basic rate limiting (per user or IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const key = rateLimitKey(userId, ip);
    const rl = rateLimit(key);
    if (rl.limited) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded", retryAt: rl.reset }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...rateLimitHeaders(rl),
          },
        }
      );
    }

    if (!userId && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize payment status variables
    let hasPaid = false;
    let freeGenerationsUsed = 0;

    // Skip payment check in demo mode
    if (!isDemoMode && user) {
      // Get user metadata to check payment status
      const metadata = user.user_metadata || {};
      hasPaid = metadata.has_paid === true;
      const subscriptionStatus = metadata.subscription_status;
      freeGenerationsUsed = metadata.free_generations_used || 0;

      // Check if user has free generations left or has paid
      if (!hasPaid && freeGenerationsUsed >= 1) {
        return NextResponse.json(
          {
            error: "Payment required",
            message:
              "Your free generation has been used. Please upgrade for unlimited access.",
            requiresPayment: true,
            freeGenerationsUsed,
          },
          { status: 402 }
        );
      }
    }

    // If using free generation, we'll update the counter after successful generation

    const parsed = generateImageSchema.safeParse(body);
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
    const {
      prompt,
      size = "1024x1024",
      quality = "standard",
      style = "vivid",
    } = parsed.data;

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Prompt is required",
        },
        { status: 400 }
      );
    }

    // Production: Remove console logs for security
    if (process.env.NODE_ENV === "development") {
      console.log("=== IMAGE GENERATION REQUEST ===");
      console.log("User ID:", userId);
      console.log("Prompt:", prompt?.substring(0, 50) + "...");
      console.log("Size:", size);
      console.log("Quality:", quality);
      console.log("Style:", style);
      console.log("================================");
    }

    try {
      // Check for demo mode - return placeholder for testing
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

      let imageUrl: string;
      let revisedPrompt: string;

      if (isDemoMode) {
        // Return a placeholder image for demo/testing
        if (process.env.NODE_ENV === "development") {
          console.log("Demo mode: Returning placeholder image");
        }
        // Use a nice duck image from Unsplash
        imageUrl =
          "https://images.unsplash.com/photo-1459682687441-7761439a709d?q=80&w=2110&auto=format&fit=crop";
        revisedPrompt = `Generated in demo mode: ${prompt}`;
      } else {
        // Generate image using DALL-E 3
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: size as any,
          quality: quality as any,
          style: style as any,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error("No image data received from OpenAI");
        }

        imageUrl = response.data[0].url!;
        revisedPrompt = response.data[0].revised_prompt!;
      }

      // Log successful generation (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("Image generated successfully");
        console.log("Image URL:", imageUrl?.substring(0, 80) + "...");
        console.log("Revised prompt:", revisedPrompt?.substring(0, 100) + "...");
      }

      // Update free generation counter if this was a free generation (skip in demo mode)
      if (!isDemoMode && user && !hasPaid && freeGenerationsUsed === 0) {
        try {
          // Update user metadata with incremented free generation count
          const { error } = await supabase.auth.updateUser({
            data: {
              ...user.user_metadata,
              free_generations_used: 1
            }
          });
          
          if (!error && process.env.NODE_ENV === "development") {
            console.log("Updated free generation counter for user:", userId);
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error updating free generation counter:", error);
          }
          // Continue even if metadata update fails
        }
      }

      return NextResponse.json(
        {
          success: true,
          imageUrl,
          revisedPrompt,
          metadata: {
            userId: userId || "demo-user",
            timestamp: new Date().toISOString(),
            originalPrompt: prompt,
            settings: { size, quality, style },
            isFreeGeneration:
              isDemoMode ||
              (!isDemoMode && userId && !hasPaid && freeGenerationsUsed === 0),
          },
        },
        { headers: rateLimitHeaders(rl) }
      );
    } catch (openaiError: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("OpenAI API error:", openaiError);
      }
      const oe: any = openaiError;
      // Handle specific OpenAI errors
      if (oe?.error?.code === "content_policy_violation") {
        return NextResponse.json(
          {
            error: "Content policy violation",
            message:
              "Your prompt violates OpenAI content policy. Please try a different prompt.",
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
    if (process.env.NODE_ENV === "development") {
      console.error("Image generation error:", error);
    }
    return NextResponse.json(
      {
        error: "Image generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's access status
export async function GET(request: NextRequest) {
  try {
    // Check for demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoMode) {
      // In demo mode, always return access
      return NextResponse.json({
        hasAccess: true,
        userId: 'demo-user',
        subscriptionStatus: 'active',
        hasPaid: true,
        freeGenerationsUsed: 0,
        freeGenerationsRemaining: 999,
      });
    }

    // Get Supabase client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        hasAccess: false,
        requiresAuth: true,
      });
    }

    // Get user metadata from Supabase
    const hasPaid = user.user_metadata?.has_paid === true;
    const subscriptionStatus = user.user_metadata?.subscription_status || 'inactive';
    const freeGenerationsUsed = user.user_metadata?.free_generations_used || 0;
    
    // User has access if they've paid OR if they have free generations left
    const hasAccess = (hasPaid && subscriptionStatus === "active") || freeGenerationsUsed < 1;

    return NextResponse.json(
      {
        hasAccess,
        userId: user.id,
        subscriptionStatus,
        hasPaid,
        freeGenerationsUsed,
        freeGenerationsRemaining: Math.max(0, 1 - freeGenerationsUsed),
        metadata: user.user_metadata,
      },
      { headers: rateLimitHeaders(rateLimit(rateLimitKey(user.id, null))) }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error checking access:", error);
    }
    return NextResponse.json(
      {
        hasAccess: false,
        error: "Failed to check access status",
      },
      { status: 500 }
    );
  }
}

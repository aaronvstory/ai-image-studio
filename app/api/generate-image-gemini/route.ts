import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiService } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Request validation schema
const generateRequestSchema = z.object({
  prompt: z.string().min(3).max(8000),
  model: z.enum(['gemini-2.5-flash-image', 'imagen-4']).optional().default('gemini-2.5-flash-image'),
  numberOfImages: z.number().min(1).max(4).optional().default(1),
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '9:16', '16:9']).optional().default('1:1'),
  quality: z.enum(['standard', 'ultra', 'fast']).optional().default('standard'),
  editImage: z.object({
    imageData: z.string(),
    mimeType: z.string().optional()
  }).optional()
});

export async function POST(request: Request) {
  try {
    // Check for demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    // Get Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    if (!isDemoMode) {
      // Get session from cookies
      const cookieStore = await cookies();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check user metadata for payment status
      const user = session.user;
      const hasPaid = user.user_metadata?.hasPaid || false;
      const freeGenerationsUsed = user.user_metadata?.freeGenerationsUsed || 0;
      
      if (!hasPaid && freeGenerationsUsed >= 1) {
        return NextResponse.json(
          { error: 'Free generation limit reached. Please upgrade to continue.' },
          { status: 402 }
        );
      }
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);
    
    // Check Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    // Initialize Gemini service
    const geminiService = new GeminiService(geminiApiKey);
    
    // Generate image(s)
    let result;
    if (validatedData.editImage) {
      // Image-to-image editing
      result = await geminiService.generateImage({
        prompt: validatedData.prompt,
        model: validatedData.model,
        editImage: validatedData.editImage
      });
    } else if (validatedData.numberOfImages > 1 && validatedData.model === 'imagen-4') {
      // Multiple images with Imagen
      result = await geminiService.generateMultipleImages(
        validatedData.prompt,
        validatedData.numberOfImages,
        validatedData.aspectRatio
      );
    } else {
      // Single text-to-image generation
      result = await geminiService.generateImage({
        prompt: validatedData.prompt,
        model: validatedData.model,
        aspectRatio: validatedData.aspectRatio,
        quality: validatedData.quality
      });
    }
    
    if (!result.success || !result.images || result.images.length === 0) {
      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
      );
    }
    
    // Update user metadata if not in demo mode and user hasn't paid
    if (!isDemoMode) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !session.user.user_metadata?.hasPaid) {
        const newFreeGenerationsUsed = (session.user.user_metadata?.freeGenerationsUsed || 0) + 1;
        await supabase.auth.updateUser({
          data: {
            freeGenerationsUsed: newFreeGenerationsUsed
          }
        });
      }
    }
    
    // Return successful response
    return NextResponse.json({
      success: true,
      images: result.images,
      revisedPrompt: result.revisedPrompt || validatedData.prompt,
      model: result.model,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gemini generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
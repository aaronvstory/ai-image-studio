import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs' // Buffer + uploads work reliably in Node

export async function POST(req: Request) {
  try {
    // Check for demo mode or auth bypass
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false'
    
    let user: any = null
    
    if (authRequired && !isDemoMode) {
      // Get Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      user = authUser
      
      // Check user metadata for payment status
      const hasPaid = user.user_metadata?.hasPaid || false
      const freeGenerationsUsed = user.user_metadata?.freeGenerationsUsed || 0
      
      if (!hasPaid && freeGenerationsUsed >= 1) {
        return NextResponse.json(
          { error: 'Free generation limit reached. Please upgrade to continue.' },
          { status: 402 }
        )
      }
    }
    
    // Parse request body
    const { prompt, imageBase64, imageMime = 'image/png' } = await req.json()
    
    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: 'Prompt required (minimum 3 characters)' },
        { status: 400 }
      )
    }
    
    // Check Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }
    
    // Force explicit use of paid GEMINI_API_KEY (prevents GOOGLE_API_KEY override)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    // Build contents for the request
    const parts: any[] = [prompt]
    if (imageBase64) parts.push({ 
      inlineData: { 
        mimeType: imageMime, 
        data: imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') 
      } 
    })

    // Generate image using the new model
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: parts
    })

    // Extract generated images and text
    const outImages: string[] = []
    const outTexts: string[] = []
    for (const part of r.candidates?.[0]?.content?.parts ?? []) {
      if (part?.inlineData?.data) outImages.push(`data:${imageMime};base64,${part.inlineData.data}`)
      if (part?.text) outTexts.push(part.text)
    }
    
    // Update user metadata if not in demo mode and user hasn't paid
    if (!isDemoMode && user && !user.user_metadata?.hasPaid) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const newFreeGenerationsUsed = (user.user_metadata?.freeGenerationsUsed || 0) + 1
      await supabase.auth.updateUser({
        data: {
          freeGenerationsUsed: newFreeGenerationsUsed
        }
      })
    }
    
    // Return successful response
    return NextResponse.json({
      success: true,
      provider: 'gemini',
      model: 'gemini-2.5-flash-image-preview',
      images: outImages,
      texts: outTexts,
      revisedPrompt: outTexts.join(' ') || prompt,
      timestamp: new Date().toISOString(),
      pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
    })
    
  } catch (error: any) {
    console.error('Gemini generation error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate with Gemini',
        details: error.toString(),
        model: 'gemini-2.5-flash-image-preview'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs' // Buffer + uploads work reliably in Node

type GeminiRequestBody = {
  provider: 'google'
  mode?: 'txt2img' | 'img2img' | 'analyze'
  prompt: string
  model?: 'imagen-3' | 'imagen-3-fast'
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  numberOfImages?: 1 | 2 | 3 | 4
  quality?: 'standard' | 'ultra' | 'fast'
  image?: string // For img2img mode
  imageBase64?: string
  imageMime?: string
}

export async function POST(req: NextRequest) {
  try {
    // Check if authentication is required
    const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false'
    
    let user: any = null
    let admin: any = null
    
    if (authRequired) {
      // Get authenticated user
      const supabase = await createServerClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      user = authUser
      admin = createAdminClient()

      // Rate limiting
      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
      const rateLimitKey = `${user.id}:${ip}`
      const { success: rateLimitOk } = await rateLimit(rateLimitKey)
      
      if (!rateLimitOk) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    } else {
      // No auth mode - create mock admin for logging (optional)
      admin = createAdminClient()
    }

    const body = await req.json() as GeminiRequestBody
    const { prompt, mode = 'txt2img', imageBase64, imageMime = 'image/png' } = body
    
    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    // Force explicit use of paid GEMINI_API_KEY (prevents GOOGLE_API_KEY override)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    // Optional preflight analysis with a text model
    if (mode === 'analyze') {
      const analysis = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt]
      })
      
      const analysisText = analysis.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      return NextResponse.json({ 
        provider: 'gemini', 
        model: 'gemini-2.5-flash', 
        analysis: analysisText,
        credits: authRequired ? 'tracked' : 999999 
      })
    }
    
    if (authRequired && user) {
      // Determine credit cost based on number of images
      const creditCost = body.numberOfImages || 1

      // Consume credits atomically
      const { data: consumed } = await admin.rpc('consume_credit', { 
        p_user_id: user.id,
        p_amount: creditCost
      })
      
      if (!consumed) {
        return NextResponse.json({ 
          error: `Insufficient credits. Need ${creditCost} credits for ${creditCost} image(s).`,
          credits_needed: creditCost
        }, { status: 402 })
      }
    }

    try {
      // Default: generate or edit images
      const parts: any[] = [prompt]
      
      // Handle image input for img2img mode
      if ((mode === 'img2img' || imageBase64 || body.image) && (imageBase64 || body.image)) {
        const base64Data = imageBase64 || body.image?.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
        if (base64Data) {
          parts.push({ 
            inlineData: { 
              mimeType: imageMime, 
              data: base64Data
            } 
          })
        }
      }

      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: parts
      })

      const imgs: string[] = []
      const texts: string[] = []
      for (const part of resp.candidates?.[0]?.content?.parts ?? []) {
        if (part?.inlineData?.data) imgs.push(`data:${imageMime};base64,${part.inlineData.data}`)
        if (part?.text) texts.push(part.text)
      }

      // Log generation to database (if auth required)
      if (authRequired && user) {
        await admin.from('generations').insert({
          user_id: user.id,
          provider: 'google',
          model: 'gemini-2.5-flash-image-preview',
          mode: (imageBase64 || body.image) ? 'img2img' : 'txt2img',
          prompt: prompt,
          credits_used: body.numberOfImages || 1
        })

        // Get updated credit balance
        const { data: creditsData } = await admin
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        // Format response to match expected structure
        const formattedImages = imgs.length > 0 
          ? imgs.map(img => ({ url: img, prompt: body.prompt }))
          : []

        return NextResponse.json({
          success: true,
          provider: 'gemini',
          model: 'gemini-2.5-flash-image-preview',
          images: formattedImages,
          image: imgs[0], // For backwards compatibility
          texts,
          credits_remaining: creditsData?.balance ?? 0,
          credits: creditsData?.balance ?? 0,
          numberOfImages: imgs.length || 0,
          aspectRatio: body.aspectRatio || '1:1',
          pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
        })
      } else {
        // No auth mode - unlimited usage
        const formattedImages = imgs.length > 0 
          ? imgs.map(img => ({ url: img, prompt: body.prompt }))
          : []

        return NextResponse.json({
          success: true,
          provider: 'gemini',
          model: 'gemini-2.5-flash-image-preview',
          images: formattedImages,
          image: imgs[0], // For backwards compatibility
          texts,
          credits_remaining: 999999,
          credits: 999999,
          numberOfImages: imgs.length || 0,
          aspectRatio: body.aspectRatio || '1:1',
          pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
        })
      }
      
    } catch (apiError: any) {
      // Refund credits on API failure (if auth required)
      if (authRequired && user) {
        await admin.rpc('refund_credit', { 
          p_user_id: user.id, 
          p_amount: body.numberOfImages || 1
        })
      }
      
      console.error('Gemini API Error:', apiError)
      return NextResponse.json({ 
        error: apiError.message ?? 'Failed to generate image with Gemini',
        details: apiError.toString(),
        model: 'gemini-2.5-flash-image-preview'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Route Error:', error)
    return NextResponse.json({ 
      error: error.message ?? 'Internal server error',
      details: error.toString()
    }, { status: 500 })
  }
}
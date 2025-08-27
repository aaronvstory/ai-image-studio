import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs' // Buffer + uploads work reliably in Node
export const maxDuration = 60

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

      // Rate limiting
      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
      const rateLimitKey = `${user.id}:${ip}`
      const { success: rateLimitOk } = await rateLimit(rateLimitKey)
      
      if (!rateLimitOk) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    // Parse request
    const contentType = req.headers.get('content-type') || ''
    let prompt = ''
    let imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = []
    let variants = 1 // Number of images to generate

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      prompt = String(form.get('prompt') || '')
      variants = Math.min(4, Math.max(1, Number(form.get('variants') || 1)))

      const files = form.getAll('image')
      for (const f of files) {
        if (typeof f === 'object' && 'arrayBuffer' in f) {
          const file = f as File
          const buf = Buffer.from(await file.arrayBuffer())
          imageParts.push({
            inlineData: {
              mimeType: file.type || 'image/png',
              data: buf.toString('base64'),
            },
          })
        }
      }
    } else {
      const body = await req.json()
      prompt = String(body?.prompt || '')
      variants = Math.min(4, Math.max(1, Number(body?.variants || 1)))
      const imageBase64 = body?.imageBase64
      const imageMime = body?.imageMime || 'image/png'

      // Handle base64 data URL or raw base64
      const dataUrl: string | undefined = body?.image || imageBase64
      if (dataUrl) {
        if (dataUrl.startsWith('data:')) {
          const [meta, b64] = dataUrl.split(',')
          const mime = meta.substring(5, meta.indexOf(';'))
          imageParts.push({ 
            inlineData: { 
              mimeType: mime, 
              data: b64 
            } 
          })
        } else {
          imageParts.push({ 
            inlineData: { 
              mimeType: imageMime, 
              data: dataUrl 
            } 
          })
        }
      }
    }

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Prompt is required (minimum 3 characters)' }, { status: 400 })
    }

    // Check and consume credits (if auth required)
    admin = createAdminClient()
    const creditsNeeded = variants // 1 credit per image variant
    
    if (authRequired && user) {
      const { data: consumed } = await admin.rpc('consume_credit', { 
        p_user_id: user.id,
        p_amount: creditsNeeded
      })
      
      if (!consumed) {
        return NextResponse.json({ 
          error: `Insufficient credits. Need ${creditsNeeded} credits.`,
          credits_needed: creditsNeeded
        }, { status: 402 })
      }
    }

    try {
      // Force explicit use of paid GEMINI_API_KEY (prevents GOOGLE_API_KEY override)
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
      
      // Build contents for the request
      const contents: any[] = [prompt]
      if (imageParts.length > 0) {
        contents.push(...imageParts)
      }

      // Generate images using the official nano-banana model ID
      const images: string[] = []
      const texts: string[] = []
      const errors: string[] = []

      // Generate requested number of variants
      for (let i = 0; i < variants; i++) {
        try {
          const r = await ai.models.generateContent({
            // ⬇︎ the official model id for nano-banana
            model: 'gemini-2.5-flash-image-preview',
            contents
          })

          // Extract images and text from response
          for (const p of r.candidates?.[0]?.content?.parts ?? []) {
            if (p?.inlineData?.data) images.push(`data:image/png;base64,${p.inlineData.data}`)
            if (p?.text && i === 0) texts.push(p.text) // Only collect text from first variant
          }
        } catch (e: any) {
          errors.push(e.message)
        }
      }

      if (images.length === 0) {
        // Refund credits on complete failure (if auth required)
        if (authRequired && user) {
          await admin.rpc('add_credits', { 
            p_user_id: user.id, 
            p_delta: creditsNeeded 
          })
        }
        
        return NextResponse.json({ 
          error: 'Failed to generate images. Please check your quota/billing.',
          details: errors,
          model: 'gemini-2.5-flash-image-preview (nano-banana)'
        }, { status: 503 })
      }

      // Log generation (if auth required)
      if (authRequired && user) {
        await admin.from('generations').insert({
          user_id: user.id,
          provider: 'google',
          model: 'gemini-2.5-flash-image-preview',
          mode: imageParts.length > 0 ? 'img2img' : 'txt2img',
          prompt: prompt,
          credits_used: images.length
        })

        // Get updated credit balance
        const { data: creditsData } = await admin
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        return NextResponse.json({
          success: true,
          provider: 'gemini',
          model: 'gemini-2.5-flash-image-preview',
          nickname: 'nano-banana',
          images,
          texts,
          credits_remaining: creditsData?.balance ?? 0,
          pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
        })
      } else {
        // No auth mode - unlimited usage
        return NextResponse.json({
          success: true,
          provider: 'gemini',
          model: 'gemini-2.5-flash-image-preview',
          nickname: 'nano-banana',
          images,
          texts,
          credits_remaining: 999999, // Unlimited
          pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
        })
      }

    } catch (error: any) {
      // Refund credits on error (if auth required)
      if (authRequired && user) {
        await admin.rpc('add_credits', { 
          p_user_id: user.id, 
          p_delta: creditsNeeded 
        })
      }
      
      console.error('Nano-Banana (Gemini) Error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to generate with Gemini',
        model: 'gemini-2.5-flash-image-preview (nano-banana)'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Route Error:', error)
    return NextResponse.json({ 
      error: error.message ?? 'Internal server error' 
    }, { status: 500 })
  }
}
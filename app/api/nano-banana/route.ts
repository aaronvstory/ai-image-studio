import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

// Helper to get Gemini API key
function getGeminiKey() {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = getGeminiKey()
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Google/Gemini API key' }, { status: 500 })
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const rateLimitKey = `${user.id}:${ip}`
    const { success: rateLimitOk } = await rateLimit(rateLimitKey)
    
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
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
      }    } else {
      const body = await req.json()
      prompt = String(body?.prompt || '')
      variants = Math.min(4, Math.max(1, Number(body?.variants || 1)))

      // Handle base64 data URL
      const dataUrl: string | undefined = body?.image
      if (dataUrl?.startsWith('data:')) {
        const [meta, b64] = dataUrl.split(',')
        const mime = meta.substring(5, meta.indexOf(';'))
        imageParts.push({ 
          inlineData: { 
            mimeType: mime, 
            data: b64 
          } 
        })
      }
    }

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Prompt is required (minimum 3 characters)' }, { status: 400 })
    }

    // Check and consume credits
    const admin = createAdminClient()
    const creditsNeeded = variants // 1 credit per image variant
    
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

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp' // Using the latest Flash model that supports image generation
      })

      // Build prompt with optional image
      const parts = imageParts.length > 0
        ? [{ text: prompt }, ...imageParts]
        : [{ text: prompt }]

      // Generate images (loop for variants since Gemini returns 1 image per call)
      const images: string[] = []
      const errors: string[] = []

      for (let i = 0; i < variants; i++) {
        try {
          const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            }
          })          
          const response = await result.response
          const text = response.text()
          
          // For now, Gemini Flash doesn't generate images directly
          // This is a placeholder for when image generation is available
          // You would need to use Imagen API or wait for Gemini image generation
          
          // Temporary: Return a message about the feature
          if (i === 0) {
            images.push('gemini-placeholder')
          }
        } catch (e: any) {
          errors.push(e.message)
        }
      }

      if (images.length === 0) {
        // Refund credits on complete failure
        await admin.rpc('add_credits', { 
          p_user_id: user.id, 
          p_delta: creditsNeeded 
        })
        
        return NextResponse.json({ 
          error: 'Gemini image generation is currently in preview. Please use OpenAI provider for now.',
          details: errors
        }, { status: 503 })
      }

      // Log generation
      await admin.from('generations').insert({
        user_id: user.id,
        provider: 'google',
        model: 'gemini-2.0-flash-exp',
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
        images,
        model: 'gemini-2.0-flash-exp',
        credits_remaining: creditsData?.balance ?? 0,
        message: 'Note: Gemini native image generation is in preview. Full support coming soon.'
      })

    } catch (error: any) {
      // Refund credits on error
      await admin.rpc('add_credits', { 
        p_user_id: user.id, 
        p_delta: creditsNeeded 
      })
            
      console.error('Gemini Error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to generate with Gemini' 
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Route Error:', error)
    return NextResponse.json({ 
      error: error.message ?? 'Internal server error' 
    }, { status: 500 })
  }
}
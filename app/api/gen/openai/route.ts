import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

// Explicitly set OpenAI configuration to avoid OpenRouter interference
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1', // Explicitly set to avoid OpenRouter
  dangerouslyAllowBrowser: false
})

type RequestBody =
  | { provider: 'openai'; mode: 'txt2img'; prompt: string; size?: '1024x1024'|'1024x1792'|'1792x1024'; quality?: 'standard'|'hd'; style?: 'vivid'|'natural' }
  | { provider: 'openai'; mode: 'img2img'; prompt: string; image: string; size?: '1024x1024' }

export async function POST(req: NextRequest) {
  try {
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
    }    const body = await req.json() as RequestBody
    const admin = createAdminClient()

    // Consume credit atomically (1 credit per image)
    const { data: consumed } = await admin.rpc('consume_credit', { 
      p_user_id: user.id,
      p_amount: 1
    })
    
    if (!consumed) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Please add more credits to continue.',
        credits_needed: 1
      }, { status: 402 })
    }

    try {
      let imageUrl: string
      
      if (body.mode === 'txt2img') {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: body.prompt,
          n: 1,
          size: body.size ?? '1024x1024',
          quality: body.quality ?? 'standard',
          style: body.style ?? 'vivid',
          response_format: 'url'
        })
        
        imageUrl = response.data[0]?.url || ''      } else {
        // img2img mode - DALL-E 3 doesn't support direct image editing, use variations
        const imageData = body.image.split(',')[1]
        const imageBuffer = Buffer.from(imageData, 'base64')
        
        const response = await openai.images.createVariation({
          model: 'dall-e-2', // Only DALL-E 2 supports variations
          image: imageBuffer as any, // Type cast for Buffer compatibility
          n: 1,
          size: body.size ?? '1024x1024',
          response_format: 'url'
        })
        
        imageUrl = response.data[0]?.url || ''
      }

      // Log generation to database
      await admin.from('generations').insert({
        user_id: user.id,
        provider: 'openai',
        model: body.mode === 'txt2img' ? 'dall-e-3' : 'dall-e-2',
        mode: body.mode,
        prompt: body.prompt,
        credits_used: 1
      })

      // Get updated credit balance
      const { data: creditsData } = await admin
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)        .single()

      return NextResponse.json({ 
        success: true,
        image: imageUrl,
        credits_remaining: creditsData?.balance ?? 0,
        provider: 'openai',
        model: body.mode === 'txt2img' ? 'dall-e-3' : 'dall-e-2'
      })
      
    } catch (apiError: any) {
      // Refund credit on API failure
      await admin.rpc('refund_credit', { 
        p_user_id: user.id, 
        p_amount: 1 
      })
      
      console.error('OpenAI API Error:', apiError)
      return NextResponse.json({ 
        error: apiError.message ?? 'Failed to generate image with OpenAI' 
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Route Error:', error)
    return NextResponse.json({ 
      error: error.message ?? 'Internal server error' 
    }, { status: 500 })
  }
}
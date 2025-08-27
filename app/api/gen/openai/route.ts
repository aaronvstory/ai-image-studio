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

import { OpenAIGenerationRequest } from '@/types/image-generation'

type RequestBody = OpenAIGenerationRequest

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
    } else {
      // No auth mode - create mock admin for logging (optional)
      admin = createAdminClient()
    }

    const body = await req.json() as RequestBody

    try {
      let imageUrl: string
      
      // Default to txt2img if no mode specified or no image provided
      const mode = body.mode || 'txt2img'
      
      if (mode === 'txt2img' || !body.image) {
        const response = await openai.images.generate({
          model: body.model || 'dall-e-3',
          prompt: body.prompt,
          n: 1,
          size: body.size ?? '1024x1024',
          quality: body.quality ?? 'standard',
          style: body.style ?? 'vivid',
          response_format: 'url'
        })
        
        imageUrl = response.data[0]?.url || ''
      } else {
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

      // Log generation to database (if auth required)
      if (authRequired && user) {
        await admin.from('generations').insert({
          user_id: user.id,
          provider: 'openai',
          model: body.mode === 'txt2img' ? (body.model || 'dall-e-3') : 'dall-e-2',
          mode: body.mode,
          prompt: body.prompt,
          credits_used: 1
        })

        // Get updated credit balance
        const { data: creditsData } = await admin
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        return NextResponse.json({ 
          success: true,
          imageUrl: imageUrl,
          image: imageUrl,
          images: [imageUrl],
          credits_remaining: creditsData?.balance ?? 0,
          provider: 'openai',
          model: (mode === 'txt2img' ? (body.model || 'dall-e-3') : 'dall-e-2') as any,
          numberOfImages: 1
        })
      } else {
        // No auth mode - unlimited usage
        return NextResponse.json({ 
          success: true,
          imageUrl: imageUrl,
          image: imageUrl,
          images: [imageUrl],
          credits_remaining: 999999, // Unlimited
          credits: 999999, // Also include credits field
          provider: 'openai',
          model: (mode === 'txt2img' ? (body.model || 'dall-e-3') : 'dall-e-2') as any,
          numberOfImages: 1
        })
      }
      
    } catch (apiError: any) {
      // Refund credit on API failure (if auth required)
      if (authRequired && user) {
        await admin.rpc('refund_credit', { 
          p_user_id: user.id, 
          p_amount: 1 
        })
      }
      
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
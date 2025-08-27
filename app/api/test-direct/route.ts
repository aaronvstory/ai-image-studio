import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Direct OpenAI test - bypasses all auth and database for testing
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1'
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prompt = body.prompt || 'A simple test image'

    console.log('Direct OpenAI Test:', {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 20) + '...',
      prompt: prompt.substring(0, 50) + '...'
    })

    // Direct OpenAI call - no middleware, no auth, no database
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL returned' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      image: imageUrl,
      message: 'Direct OpenAI test successful!'
    })

  } catch (error: any) {
    console.error('Direct OpenAI Error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to generate image',
      details: {
        type: error.constructor?.name,
        status: error.status,
        code: error.code
      }
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Direct OpenAI test endpoint',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 20) + '...'
  })
}
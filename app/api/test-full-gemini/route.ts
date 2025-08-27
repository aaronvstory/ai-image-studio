import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY!
    const ai = new GoogleGenAI({ apiKey })
    
    // Test 1: Basic text generation (billing check)
    let billingStatus = 'Unknown'
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: ['Return "BILLING_ACTIVE" if this works']
      })
      billingStatus = resp.candidates?.[0]?.content?.parts?.[0]?.text?.includes('BILLING_ACTIVE') 
        ? 'Active' : 'Response received but unexpected'
    } catch (e: any) {
      billingStatus = `Error: ${e.message?.slice(0, 50)}`
    }
    
    // Test 2: Try image generation with simpler prompt
    let imageStatus = 'Not tested'
    let imageError = null
    try {
      const imgResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: ['sky']  // Simplest possible prompt
      })
      
      const parts = imgResp.candidates?.[0]?.content?.parts || []
      const hasImage = parts.some((p: any) => p.inlineData?.data)
      const hasText = parts.some((p: any) => p.text)
      
      imageStatus = hasImage ? 'SUCCESS - Image generated!' : 
                   hasText ? 'Text response only' : 
                   'Empty response'
    } catch (e: any) {
      imageStatus = 'Failed'
      imageError = {
        code: e.status || e.code,
        message: e.message?.slice(0, 200),
        isQuota: e.message?.includes('429') || e.message?.includes('quota')
      }
    }
    
    // Test 3: Check if it's a daily limit vs minute limit
    const timestamp = new Date().toISOString()
    const hoursSinceReset = new Date().getUTCHours() // Hours since UTC midnight
    
    return NextResponse.json({
      timestamp,
      apiKey: apiKey.slice(0, 20) + '...',
      billingStatus,
      imageModel: {
        model: 'gemini-2.5-flash-image-preview',
        status: imageStatus,
        error: imageError
      },
      quotaInfo: {
        hoursSinceUTCMidnight: hoursSinceReset,
        note: 'Daily quotas reset at UTC midnight'
      },
      recommendation: imageError?.isQuota 
        ? 'Quota issue detected. Check Google Cloud Console for: 1) Vertex AI API enabled, 2) Generative AI API enabled, 3) Quota increases needed'
        : 'No specific recommendations'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
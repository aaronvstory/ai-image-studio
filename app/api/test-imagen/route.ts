import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    
    // Try different model variations
    const models = [
      'gemini-2.5-flash-image-preview',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
      'imagen-3',
      'imagegeneration@006'
    ]
    
    const results: any[] = []
    
    for (const model of models) {
      try {
        const resp = await ai.models.generateContent({
          model,
          contents: ['Generate an image of a duck']
        })
        
        results.push({
          model,
          status: 'Success',
          response: resp.candidates?.[0]?.content?.parts?.[0]
        })
      } catch (error: any) {
        results.push({
          model,
          status: 'Failed',
          error: error.message?.slice(0, 100)
        })
      }
    }
    
    return NextResponse.json({
      apiKey: process.env.GEMINI_API_KEY?.slice(0, 10) + '...',
      modelTests: results
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
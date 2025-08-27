import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    
    // Test with regular Gemini Flash (text model) first
    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: ['Say "Hello, billing is working!" if this works']
    })
    
    const textResult = textResp.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    
    // Now try the image preview model
    let imageModelStatus = 'Not tested'
    try {
      const imageResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: ['Generate an image of a happy duck']
      })
      imageModelStatus = 'Success - Image model accessible!'
    } catch (imgError: any) {
      imageModelStatus = `Image model error: ${imgError.message}`
    }
    
    return NextResponse.json({
      success: true,
      apiKey: process.env.GEMINI_API_KEY?.slice(0, 10) + '...',
      textModel: {
        model: 'gemini-2.5-flash',
        response: textResult
      },
      imageModel: {
        model: 'gemini-2.5-flash-image-preview',
        status: imageModelStatus
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKey: process.env.GEMINI_API_KEY?.slice(0, 10) + '...'
    }, { status: 500 })
  }
}
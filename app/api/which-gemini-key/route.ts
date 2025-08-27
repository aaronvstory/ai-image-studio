import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  // Check raw environment variables
  const googleKey = process.env.GOOGLE_API_KEY || 'NOT SET'
  const geminiKey = process.env.GEMINI_API_KEY || 'NOT SET'
  
  // Initialize SDK and see which key it actually uses
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  
  return NextResponse.json({
    environment: {
      GOOGLE_API_KEY: googleKey.slice(0, 20) + (googleKey.length > 20 ? '...' : ''),
      GEMINI_API_KEY: geminiKey.slice(0, 20) + (geminiKey.length > 20 ? '...' : ''),
    },
    forcedKey: {
      description: 'Key explicitly passed to SDK',
      value: process.env.GEMINI_API_KEY?.slice(0, 20) + '...',
      isPaidKey: process.env.GEMINI_API_KEY === 'AIzaSyCl_CYNlF5-PT6nv2dDnEh5sfs4JNeTc6I'
    },
    recommendation: googleKey !== 'NOT SET' 
      ? '⚠️ GOOGLE_API_KEY still present! It may override GEMINI_API_KEY in some contexts.'
      : '✅ Only GEMINI_API_KEY is set. Good!'
  })
}
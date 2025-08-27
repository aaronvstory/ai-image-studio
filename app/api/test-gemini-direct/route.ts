import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    console.log('Direct Gemini Test:', {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 15) + '...',
      prompt: prompt.substring(0, 50) + '...'
    });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // For testing, we'll use Gemini to analyze the prompt
    // (actual image generation would use Imagen API in production)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent([
      'You are an image generation assistant. The user wants to generate: ' + prompt + '. Describe what this image would look like in one sentence.'
    ]);
    
    const response = await result.response;
    const description = response.text();

    // Simulate image generation response
    return NextResponse.json({
      success: true,
      provider: 'google',
      model: 'gemini-test',
      prompt: prompt,
      description: description,
      images: [
        {
          url: 'https://via.placeholder.com/1024x1024/purple/white?text=Gemini+Generated',
          caption: description
        }
      ],
      message: 'Gemini API connection successful! (Using placeholder for image generation demo)'
    });

  } catch (error: any) {
    console.error('Gemini test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test Gemini'
    }, { status: 500 });
  }
}
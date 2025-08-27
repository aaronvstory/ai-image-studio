import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

// Initialize clients
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1',
  dangerouslyAllowBrowser: false
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TestRequest {
  provider: 'openai' | 'gemini';
  prompt?: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  aspectRatio?: string;
  numberOfImages?: number;
}

// Helper to ensure test results directory exists
async function ensureTestDir(provider: string): Promise<string> {
  const testDir = path.join(process.cwd(), 'test-results', provider);
  
  try {
    await fs.mkdir(testDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  return testDir;
}

// Save image from URL to local file
async function saveImageFromUrl(imageUrl: string, filePath: string): Promise<void> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);
}

export async function POST(req: NextRequest) {
  try {
    // Check if authentication is required (respect bypass setting)
    const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false';
    
    // This is a testing endpoint, only allow in development or when auth is disabled
    if (process.env.NODE_ENV === 'production' && authRequired) {
      return NextResponse.json({ 
        error: 'Test endpoint only available in development or no-auth mode' 
      }, { status: 403 });
    }

    const body = await req.json() as TestRequest;
    const { provider } = body;

    if (!provider || !['openai', 'gemini'].includes(provider)) {
      return NextResponse.json({ 
        error: 'Provider must be "openai" or "gemini"' 
      }, { status: 400 });
    }

    const prompt = body.prompt || 'A beautiful sunset over mountains, photorealistic';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testDir = await ensureTestDir(provider);

    let result: any = {};
    let savedFiles: string[] = [];

    if (provider === 'openai') {
      try {
        // Test OpenAI DALL-E generation
        const response = await openai.images.generate({
          model: body.model || 'dall-e-3',
          prompt,
          n: 1,
          size: (body.size as any) || '1024x1024',
          quality: (body.quality as any) || 'standard',
          style: (body.style as any) || 'vivid',
          response_format: 'url'
        });

        const imageUrl = response.data[0]?.url;
        if (imageUrl) {
          const fileName = `dalle-${timestamp}.png`;
          const filePath = path.join(testDir, fileName);
          
          await saveImageFromUrl(imageUrl, filePath);
          savedFiles.push(fileName);
          
          result = {
            success: true,
            provider: 'openai',
            model: body.model || 'dall-e-3',
            prompt,
            imageUrl,
            savedPath: filePath,
            fileName,
            timestamp
          };
        } else {
          throw new Error('No image URL returned from OpenAI');
        }

      } catch (error: any) {
        result = {
          success: false,
          provider: 'openai',
          error: error.message || 'OpenAI generation failed',
          timestamp
        };
      }

    } else if (provider === 'gemini') {
      try {
        // Test Gemini analysis (since it doesn't generate images directly yet)
        const textModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const promptAnalysis = await textModel.generateContent({
          contents: [{
            role: 'user',
            parts: [{
              text: `Analyze this image generation prompt and provide detailed feedback: "${prompt}"`
            }]
          }]
        });

        const analysisResult = await promptAnalysis.response;
        const analysisText = analysisResult.text();

        // Create placeholder image with analysis
        const dimensions = {
          '1:1': '1024x1024',
          '16:9': '1792x1008', 
          '9:16': '1008x1792',
          '4:3': '1365x1024',
          '3:4': '1024x1365'
        }[body.aspectRatio || '1:1'];

        const placeholderUrl = `https://via.placeholder.com/${dimensions}/4f46e5/ffffff?text=${encodeURIComponent('Gemini Analysis Complete')}`;
        
        const fileName = `gemini-analysis-${timestamp}.txt`;
        const filePath = path.join(testDir, fileName);
        
        // Save analysis to text file
        await fs.writeFile(filePath, `Prompt: ${prompt}\n\nAnalysis:\n${analysisText}\n\nTimestamp: ${timestamp}`);
        savedFiles.push(fileName);

        result = {
          success: true,
          provider: 'gemini',
          model: 'gemini-pro',
          prompt,
          analysis: analysisText,
          placeholderUrl,
          savedPath: filePath,
          fileName,
          timestamp,
          note: 'Gemini image generation not yet available - analysis provided instead'
        };

      } catch (error: any) {
        result = {
          success: false,
          provider: 'gemini',
          error: error.message || 'Gemini analysis failed',
          timestamp
        };
      }
    }

    // Create summary log
    const logFileName = `test-log-${timestamp}.json`;
    const logPath = path.join(testDir, logFileName);
    await fs.writeFile(logPath, JSON.stringify({
      ...result,
      requestBody: body,
      testDate: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      authRequired
    }, null, 2));

    return NextResponse.json({
      ...result,
      testDir,
      savedFiles,
      logFile: logFileName,
      instructions: {
        openResults: `Navigate to: ${testDir}`,
        viewLog: `Open: ${logPath}`,
        cleanup: 'Delete test-results folder when done testing'
      }
    });

  } catch (error: any) {
    console.error('Test generation error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Test generation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper GET endpoint to list test results
export async function GET() {
  try {
    const testResultsDir = path.join(process.cwd(), 'test-results');
    
    try {
      const providers = await fs.readdir(testResultsDir);
      const results: Record<string, string[]> = {};
      
      for (const provider of providers) {
        const providerDir = path.join(testResultsDir, provider);
        const stats = await fs.stat(providerDir);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(providerDir);
          results[provider] = files;
        }
      }
      
      return NextResponse.json({
        success: true,
        testResultsDir,
        results,
        instructions: {
          cleanup: 'DELETE the test-results folder when done testing',
          location: testResultsDir
        }
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: 'No test results found yet',
        testResultsDir,
        instructions: {
          usage: 'POST to this endpoint with {provider: "openai" or "gemini"} to run tests'
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
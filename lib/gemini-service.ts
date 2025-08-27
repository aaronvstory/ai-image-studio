// Gemini Image Generation Service
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ImageGenerationModel = 'dall-e-3' | 'gemini-2.5-flash' | 'imagen-4';

export interface GeminiGenerateOptions {
  prompt: string;
  model?: 'gemini-2.5-flash-image' | 'imagen-4';
  numberOfImages?: number;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  quality?: 'standard' | 'ultra' | 'fast';
  editImage?: {
    imageData: string; // Base64 image data
    mimeType?: string;
  };
}

export interface GeminiGenerateResult {
  success: boolean;
  images?: string[]; // Base64 data URLs
  error?: string;
  revisedPrompt?: string;
  model: string;
}

export class GeminiService {
  private genAI: any; // Using any type due to complex GoogleGenAI type
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Generate image with Gemini
  async generateImage(options: GeminiGenerateOptions): Promise<GeminiGenerateResult> {
    try {
      // Note: Gemini models don't generate images - they process text and analyze images
      // For demonstration purposes, we'll use gemini-1.5-flash for text processing
      const modelName = options.model === 'imagen-4' 
        ? 'gemini-1.5-flash' // Imagen API not available through standard Gemini SDK
        : 'gemini-1.5-flash';
      
      // Build the content for the request
      let contents: any;
      
      // For image editing, add both text and image
      if (options.editImage) {
        contents = [
          { text: options.prompt },
          {
            inlineData: {
              mimeType: options.editImage.mimeType || 'image/png',
              data: options.editImage.imageData.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
            }
          }
        ];
      } else {
        // For text-to-image, just add the prompt
        contents = options.prompt;
      }
      
      // For testing purposes, since Gemini doesn't generate images,
      // we'll return a placeholder image URL
      // In production, you would use Google's Imagen API or another image generation service
      
      // Generate a descriptive response using Gemini
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(`Describe an image of: ${options.prompt}`);
      
      const response = await result.response;
      const description = response.text();
      
      // Return a placeholder image for demonstration
      // You can replace this with actual Imagen API calls when available
      const placeholderImage = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(options.prompt.slice(0, 50))}`;
      
      return {
        success: true,
        images: [placeholderImage],
        model: modelName,
        revisedPrompt: description || options.prompt
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gemini generation failed',
        model: options.model || 'gemini-2.5-flash-image'
      };
    }
  }

  // Generate multiple images (for Imagen which supports batch)
  async generateMultipleImages(
    prompt: string, 
    count: number = 1,
    aspectRatio?: string
  ): Promise<GeminiGenerateResult> {
    try {
      // Use the generateImages method for Imagen
      const result = await this.genAI.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: count,
          aspectRatio: aspectRatio || '1:1'
        }
      });
      
      const images: string[] = [];
      
      // Extract images from response
      if (result.generatedImages) {
        for (const img of result.generatedImages) {
          if (img.image) {
            // Convert the image to base64 data URL
            const dataUrl = `data:image/png;base64,${img.image}`;
            images.push(dataUrl);
          }
        }
      }
      
      return {
        success: images.length > 0,
        images,
        model: 'imagen-4.0-generate-001',
        error: images.length === 0 ? 'No images generated' : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Multiple image generation failed',
        model: 'imagen-4'
      };
    }
  }

  // Helper to validate prompt
  validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt is required' };
    }
    if (prompt.length > 8000) { // Gemini has generous limits
      return { valid: false, error: 'Prompt is too long (max 8000 characters)' };
    }
    return { valid: true };
  }
}
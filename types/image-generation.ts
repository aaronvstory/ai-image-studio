// Image Generation Types

export type Provider = 'openai' | 'google'

export type OpenAIModel = 'dall-e-3' | 'dall-e-2'
export type GoogleModel = 'imagen-3' | 'imagen-3-fast'

export type Model = OpenAIModel | GoogleModel

export type GenerationMode = 'txt2img' | 'img2img'

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

export type OpenAISize = '1024x1024' | '1024x1792' | '1792x1024'
export type OpenAIQuality = 'standard' | 'hd'
export type OpenAIStyle = 'vivid' | 'natural'

export type GoogleQuality = 'standard' | 'ultra' | 'fast'

// Request types
export interface BaseGenerationRequest {
  prompt: string
  mode: GenerationMode
  image?: string // For img2img mode
}

export interface OpenAIGenerationRequest extends BaseGenerationRequest {
  provider: 'openai'
  model?: OpenAIModel
  size?: OpenAISize
  quality?: OpenAIQuality
  style?: OpenAIStyle
}

export interface GoogleGenerationRequest extends BaseGenerationRequest {
  provider: 'google'
  model?: GoogleModel
  aspectRatio?: AspectRatio
  numberOfImages?: 1 | 2 | 3 | 4
  quality?: GoogleQuality
}

export type GenerationRequest = OpenAIGenerationRequest | GoogleGenerationRequest

// Response types
export interface BaseGenerationResponse {
  success: boolean
  provider: Provider
  model: Model
  credits_remaining: number
}

export interface SuccessGenerationResponse extends BaseGenerationResponse {
  success: true
  image: string // Primary image URL
  images?: string[] // Multiple images for Google
  numberOfImages?: number
  aspectRatio?: AspectRatio
}

export interface ErrorGenerationResponse {
  success: false
  error: string
  credits_needed?: number
}

export type GenerationResponse = SuccessGenerationResponse | ErrorGenerationResponse

// UI State types
export interface GeneratorSettings {
  provider: Provider
  model: Model
  // OpenAI specific
  openai?: {
    size: OpenAISize
    quality: OpenAIQuality
    style: OpenAIStyle
  }
  // Google specific  
  google?: {
    aspectRatio: AspectRatio
    numberOfImages: number
    quality: GoogleQuality
  }
}

// Model configurations
export interface ModelConfig {
  label: string
  description: string
  provider: Provider
  features: string[]
  maxImages: number
  supportedAspectRatios?: AspectRatio[]
  supportedSizes?: OpenAISize[]
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'dall-e-3': {
    label: 'DALL-E 3',
    description: 'OpenAI\'s most advanced image model with exceptional creativity',
    provider: 'openai',
    features: ['High Quality', 'Creative', 'Text Understanding'],
    maxImages: 1,
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024']
  },
  'dall-e-2': {
    label: 'DALL-E 2',
    description: 'OpenAI\'s reliable model, great for variations',
    provider: 'openai', 
    features: ['Fast', 'Reliable', 'Image Variations'],
    maxImages: 1,
    supportedSizes: ['1024x1024']
  },
  'imagen-3': {
    label: 'Imagen 3',
    description: 'Google\'s latest photorealistic image generation model',
    provider: 'google',
    features: ['Photorealistic', 'Multiple Images', 'Flexible Ratios'],
    maxImages: 4,
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
  },
  'imagen-3-fast': {
    label: 'Imagen 3 Fast',
    description: 'Faster variant of Imagen 3 with reduced generation time',
    provider: 'google',
    features: ['Fast Generation', 'Multiple Images', 'Good Quality'],
    maxImages: 4,
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
  }
}

// Provider configurations
export const PROVIDER_CONFIGS = {
  openai: {
    label: 'OpenAI',
    description: 'Creative and artistic image generation',
    color: 'from-emerald-500 to-teal-500',
    models: ['dall-e-3', 'dall-e-2']
  },
  google: {
    label: 'Google',
    description: 'Photorealistic and versatile generation',
    color: 'from-blue-500 to-indigo-500', 
    models: ['imagen-3', 'imagen-3-fast']
  }
} as const
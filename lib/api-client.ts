// Client-side API helper for multi-provider image generation

export type ImageProvider = 'openai' | 'google'
export type ImageMode = 'txt2img' | 'img2img'
export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024'
export type ImageQuality = 'standard' | 'hd'
export type ImageStyle = 'vivid' | 'natural'

export interface GenerateParams {
  provider: ImageProvider
  mode: ImageMode
  prompt: string
  file?: File | null
  size?: ImageSize
  quality?: ImageQuality
  style?: ImageStyle
  variants?: number
}

export interface GenerateResponse {
  success: boolean
  image?: string
  images?: string[]
  credits_remaining: number
  provider: string
  model: string
  error?: string
  message?: string
}

export interface UserInfo {
  user: {
    id: string
    email: string
  } | null
  credits: number
  free_generations_used: number
  generations_this_month: number
  authenticated: boolean
}export interface CreditPack {
  id: number
  name: string
  credits: number
  price_cents: number
  description: string
  popular: boolean
}

// Helper to convert File to base64 data URL
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Generate image with selected provider
export async function generate(params: GenerateParams): Promise<GenerateResponse> {
  const { provider, mode, prompt, file, size, quality, style, variants } = params
  
  try {
    let body: any = { provider, mode, prompt }
    let url = ''
    
    if (provider === 'openai') {
      url = '/api/gen/openai'
      if (size) body.size = size
      if (quality) body.quality = quality
      if (style) body.style = style
      if (mode === 'img2img' && file) {
        body.image = await fileToDataUrl(file)
      }    } else if (provider === 'google') {
      url = '/api/nano-banana'
      body.variants = variants ?? 1
      if (mode === 'img2img' && file) {
        body.image = await fileToDataUrl(file)
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error ?? 'Generation failed')
    }
    
    return data as GenerateResponse
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? 'Failed to generate image',
      credits_remaining: 0,
      provider: provider,
      model: ''
    }
  }
}

// Get current user info and credits
export async function getUserInfo(): Promise<UserInfo> {  try {
    const response = await fetch('/api/me')
    const data = await response.json()
    return data
  } catch (error) {
    return {
      user: null,
      credits: 0,
      free_generations_used: 0,
      generations_this_month: 0,
      authenticated: false
    }
  }
}

// Get available credit packs
export async function getCreditPacks(): Promise<CreditPack[]> {
  try {
    const response = await fetch('/api/credit-packs')
    const data = await response.json()
    return data
  } catch (error) {
    return []
  }
}

// Confirm demo payment and add credits
export async function confirmPayment(credits: number, packId?: number): Promise<{
  success: boolean
  credits_added?: number
  new_balance?: number
  message?: string
  error?: string
}> {  try {
    const response = await fetch('/api/payments/demo/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits, pack_id: packId })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error ?? 'Payment failed')
    }
    
    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? 'Failed to process payment'
    }
  }
}
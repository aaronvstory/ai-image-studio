import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs' // Buffer + uploads work reliably in Node

export async function POST(req: Request) {
  try {
    const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false'
    
    // Get authenticated user (if auth required)
    let user = null
    if (authRequired) {
      const supabase = await createServerClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      user = authUser
    }

    const { prompt, imageBase64, imageMime = 'image/png', upload = true } = await req.json()

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    // Force explicit use of paid GEMINI_API_KEY (prevents GOOGLE_API_KEY override)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    const contents: any[] = [prompt]
    if (imageBase64) contents.push({ inlineData: { mimeType: imageMime, data: imageBase64 } })

    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents
    })

    // Pull out images + any text parts the model returned
    const parts = resp.candidates?.[0]?.content?.parts ?? []
    const imagesBase64: string[] = []
    const texts: string[] = []
    for (const p of parts) {
      if (p?.inlineData?.data) imagesBase64.push(p.inlineData.data)
      if (p?.text) texts.push(p.text)
    }

    // If you want URLs instead of base64, upload to Supabase
    let images: string[] = imagesBase64.map(b64 => `data:image/png;base64,${b64}`)
    
    if (upload && imagesBase64.length > 0) {
      const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      
      // Create the 'generated' bucket if it doesn't exist
      const { data: buckets } = await supa.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === 'generated')
      
      if (!bucketExists) {
        await supa.storage.createBucket('generated', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        })
      }
      
      const out: string[] = []
      for (const [i, b64] of imagesBase64.entries()) {
        const buf = Buffer.from(b64, 'base64')
        const path = `gemini/${Date.now()}-${i}.png`
        const { error } = await supa.storage.from('generated').upload(path, buf, { contentType: 'image/png' })
        if (error) throw error
        const { data } = supa.storage.from('generated').getPublicUrl(path)
        out.push(data.publicUrl)
      }
      images = out
    }

    return NextResponse.json({
      provider: 'gemini',
      model: 'gemini-2.5-flash-image-preview',
      images,
      texts,
      success: true,
      credits: authRequired ? 'tracked' : 999999,
      pricing: '~$0.039 per image (1290 output tokens @ $30/1M tokens)'
    })
    
  } catch (error: any) {
    console.error('Gemini Real Generation Error:', error)
    
    // Detailed error for debugging
    return NextResponse.json({
      error: error.message || 'Failed to generate with Gemini',
      details: error.toString(),
      model: 'gemini-2.5-flash-image-preview',
      note: 'Ensure your API key has access to the gemini-2.5-flash-image-preview model'
    }, { status: 500 })
  }
}
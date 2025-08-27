'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DuckTestPage() {
  const [openaiImage, setOpenaiImage] = useState<string>('')
  const [geminiData, setGeminiData] = useState<any>(null)
  const [loadingOpenai, setLoadingOpenai] = useState(false)
  const [loadingGemini, setLoadingGemini] = useState(false)
  const [openaiError, setOpenaiError] = useState('')
  const [geminiError, setGeminiError] = useState('')
  
  // Your specific prompt
  const DUCK_PROMPT = 'make a cute image of a realistic white call duck looking all wealthy with lots of cash and expensive items around it in a rich area like a wealthy rapper style and with a speech bubble saying "Pape!" realistic but cute'
  
  const generateWithOpenAI = async () => {
    setLoadingOpenai(true)
    setOpenaiError('')
    
    try {
      const response = await fetch('/api/gen/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: DUCK_PROMPT,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        })
      })

      const data = await response.json()
      
      if (data.imageUrl) {
        setOpenaiImage(data.imageUrl)
      } else if (data.error) {
        setOpenaiError(data.error)
      }
    } catch (err: any) {
      setOpenaiError(err.message)
    }
    
    setLoadingOpenai(false)
  }

  const generateWithGemini = async () => {
    setLoadingGemini(true)
    setGeminiError('')
    
    try {
      const response = await fetch('/api/gen/gemini-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: DUCK_PROMPT,
          numberOfImages: 1
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeminiData(data)
      } else if (data.error) {
        setGeminiError(data.error)
      }
    } catch (err: any) {
      setGeminiError(err.message)
    }
    
    setLoadingGemini(false)
  }

  const generateBoth = async () => {
    // Generate with both providers simultaneously
    await Promise.all([
      generateWithOpenAI(),
      generateWithGemini()
    ])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white p-8">
      {/* Auth Status Banner */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-50 font-bold">
        🦆 FREE MODE ACTIVE - NO AUTH REQUIRED - UNLIMITED GENERATION 🦆
      </div>
      
      <div className="max-w-7xl mx-auto mt-12">
        <h1 className="text-5xl font-bold mb-4 text-center">
          🦆 Wealthy Duck Generator 🦆
        </h1>
        
        {/* Prompt Display */}
        <div className="bg-black/50 backdrop-blur rounded-xl p-6 mb-8">
          <h2 className="text-xl mb-2 text-purple-300">Your Prompt:</h2>
          <p className="text-lg italic">{DUCK_PROMPT}</p>
        </div>

        {/* API Keys Status */}
        <div className="bg-black/50 backdrop-blur rounded-xl p-6 mb-8">
          <h2 className="text-xl mb-4 text-green-300">API Configuration:</h2>
          <div className="space-y-2 font-mono text-sm">
            <p>✅ OpenAI API Key: {process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'false' ? 'Configured' : 'Auth Required'}</p>
            <p>✅ Gemini API Key: AIzaSyABOQuNUUGYJmjYl...{' '}(Updated!)</p>
            <p>✅ Auth Required: {process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'false' ? 'NO' : 'YES'}</p>
          </div>
        </div>

        {/* Generation Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={generateWithOpenAI}
            disabled={loadingOpenai}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            {loadingOpenai ? '🔄 Generating...' : '🎨 Generate with OpenAI DALL-E 3'}
          </Button>
          
          <Button
            onClick={generateWithGemini}
            disabled={loadingGemini}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
          >
            {loadingGemini ? '🔄 Generating...' : '🤖 Test Gemini API'}
          </Button>
          
          <Button
            onClick={generateBoth}
            disabled={loadingOpenai || loadingGemini}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
          >
            {loadingOpenai || loadingGemini ? '🔄 Generating...' : '🚀 Generate with Both'}
          </Button>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger value="openai" className="text-lg">OpenAI DALL-E 3</TabsTrigger>
            <TabsTrigger value="gemini" className="text-lg">Google Gemini</TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai" className="mt-6">
            <div className="bg-black/50 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl mb-4 text-blue-300">OpenAI DALL-E 3 Result:</h2>
              
              {openaiError && (
                <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
                  Error: {openaiError}
                </div>
              )}
              
              {openaiImage && (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={openaiImage} 
                      alt="Wealthy Duck - OpenAI"
                      className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl"
                    />
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                      REAL AI IMAGE
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Provider: OpenAI</p>
                    <p>Model: DALL-E 3</p>
                    <p>Quality: HD</p>
                    <p>Style: Vivid</p>
                  </div>
                  <a 
                    href={openaiImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Open Full Size
                  </a>
                </div>
              )}
              
              {!openaiImage && !openaiError && !loadingOpenai && (
                <p className="text-gray-400">Click generate to create your wealthy duck!</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-6">
            <div className="bg-black/50 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl mb-4 text-purple-300">Google Gemini Result:</h2>
              
              {geminiError && (
                <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
                  Error: {geminiError}
                </div>
              )}
              
              {geminiData && (
                <div className="space-y-4">
                  <div className="bg-purple-900/30 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-2">Gemini Analysis:</h3>
                    <p className="text-gray-300">{geminiData.description}</p>
                  </div>
                  
                  {geminiData.images?.map((img: any, i: number) => (
                    <div key={i} className="space-y-2 relative">
                      <img 
                        src={typeof img === 'string' ? img : img.url} 
                        alt={`Gemini ${i+1}`}
                        className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl"
                      />
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                        REAL AI IMAGE
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Provider: Google</p>
                        <p>Model: {geminiData.model || 'gemini-2.5-flash-image-preview'}</p>
                        <p>Nickname: nano-banana</p>
                        {geminiData.pricing && <p>Pricing: {geminiData.pricing}</p>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-sm text-green-400 bg-green-900/30 p-3 rounded">
                    <p>✅ Gemini nano-banana is generating real AI images!</p>
                    <p>Model: gemini-2.5-flash-image-preview (native image generation)</p>
                  </div>
                </div>
              )}
              
              {!geminiData && !geminiError && !loadingGemini && (
                <p className="text-gray-400">Click generate to test Gemini API!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <div className="mt-8 bg-black/50 backdrop-blur rounded-xl p-6">
          <h2 className="text-xl mb-4 text-yellow-300">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>OpenAI DALL-E 3 will generate a REAL image of your wealthy duck</li>
            <li>Gemini will analyze the prompt and prepare for image generation</li>
            <li>Click "Generate with Both" to compare providers side-by-side</li>
            <li>No authentication required - unlimited generation!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
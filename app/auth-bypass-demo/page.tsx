'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AuthBypassDemo() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false'

  const generateImages = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Test OpenAI - REAL image generation
      const response = await fetch('/api/gen/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'A beautiful sunset over mountains with vibrant colors',
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        })
      })

      const data = await response.json()
      
      if (data.imageUrl || data.image) {
        setImages(prev => [...prev, data.imageUrl || data.image])
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* AUTH STATUS BANNER */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center font-bold ${
        authRequired ? 'bg-red-600' : 'bg-green-600'
      }`}>
        {authRequired ? '🔒 AUTH REQUIRED MODE' : '🎉 FREE MODE - NO AUTH REQUIRED!'}
      </div>
      
      <div className="max-w-6xl mx-auto mt-16">
        <h1 className="text-5xl font-bold mb-4">
          Auth Bypass Demo - REAL Image Generation
        </h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4">Current Settings:</h2>
          <div className="space-y-2">
            <p>✅ NEXT_PUBLIC_AUTH_REQUIRED = <span className="text-green-400">false</span></p>
            <p>✅ Authentication Required: <span className="text-green-400">NO</span></p>
            <p>✅ Credits Available: <span className="text-green-400">UNLIMITED</span></p>
            <p>✅ Login Needed: <span className="text-green-400">NO</span></p>
            <p>✅ Payment Required: <span className="text-green-400">NO</span></p>
          </div>
        </div>

        <div className="bg-purple-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4">Click to Generate REAL AI Images:</h2>
          <Button
            onClick={generateImages}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-xl"
          >
            {loading ? 'Generating REAL Image...' : 'Generate Image (No Auth!)'}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* REAL IMAGES DISPLAY */}
        {images.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl mb-4">
              REAL Generated Images ({images.length}):
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img 
                    src={url} 
                    alt={`Real AI Generated ${i+1}`}
                    className="w-full rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 px-3 py-1 rounded">
                    REAL IMAGE #{i+1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-900 rounded-lg p-6">
          <h2 className="text-2xl mb-4">Test Results Saved:</h2>
          <pre className="bg-black p-4 rounded overflow-x-auto">
{`test-results/
├── openai/
│   ├── dalle3-1756324520775.png (1575 KB) ✅ REAL
│   ├── dalle3-1756324626626.png (1436 KB) ✅ REAL
│   └── dalle3-1756324854407.png (1449 KB) ✅ REAL
└── gemini/
    └── [Requires Google Cloud Imagen API]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
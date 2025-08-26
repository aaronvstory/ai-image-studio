'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Sparkles, 
  Loader2, 
  Download, 
  Wand2,
  Heart,
  X,
  Zap,
  Lock,
  ImageIcon,
  CheckCircle,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSafeUser } from '@/hooks/use-safe-user'

const STYLE_PRESETS = [
  { id: 'ghibli', label: '🎨 Ghibli', emoji: '🎨', prompt: 'in Studio Ghibli anime style, hand-drawn, watercolor, whimsical' },
  { id: 'anime', label: '✨ Anime', emoji: '✨', prompt: 'in anime style, vibrant colors, Japanese animation' },
  { id: 'pixar', label: '🎬 Pixar', emoji: '🎬', prompt: 'in Pixar 3D animation style, colorful, friendly' },
  { id: 'oil', label: '🖼️ Oil Paint', emoji: '🖼️', prompt: 'as an oil painting, brushstrokes visible, classical art' },
  { id: 'watercolor', label: '💧 Watercolor', emoji: '💧', prompt: 'as a watercolor painting, soft edges, flowing colors' },
  { id: 'comic', label: '💥 Comic', emoji: '💥', prompt: 'in comic book style, bold lines, cel shading' },
]

export function ImageTransformer() {
  const router = useRouter()
  const { user, isSignedIn } = useSafeUser()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>('ghibli')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usageData, setUsageData] = useState({
    hasAccess: false,
    remainingFree: 0,
    isPaid: false
  })
  const [dragActive, setDragActive] = useState(false)

  // Check usage on mount
  useEffect(() => {
    if (isSignedIn) {
      checkUsage()
    }
  }, [isSignedIn])

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/transform-image')
      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      console.error('Error checking usage:', error)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleFile = (file: File) => {
    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size must be less than 4MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setGeneratedImage(null) // Clear previous result
      toast.success('Image uploaded! Select a style and click transform 🎨')
    }
    reader.readAsDataURL(file)
  }

  const handleTransform = async () => {
    // Check if user is signed in
    if (!isSignedIn) {
      toast.error('Please sign in to use image transformation')
      setTimeout(() => {
        router.push('/sign-in')
      }, 1500)
      return
    }

    if (!uploadedImage) {
      toast.error('Please upload an image first')
      return
    }

    // Check if user has access (either free trial or paid)
    if (!usageData.hasAccess) {
      toast.error('Please upgrade to continue using the transformer')
      setTimeout(() => {
        router.push('/checkout')
      }, 1500)
      return
    }

    setLoading(true)
    setGeneratedImage(null)

    try {
      const preset = STYLE_PRESETS.find(p => p.id === selectedStyle)
      
      const response = await fetch('/api/transform-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'upload',
          image: uploadedImage,
          prompt: preset?.prompt || '',
          style: selectedStyle
        }),
      })

      const data = await response.json()

      if (response.status === 402) {
        // Payment required - they've used their free generation
        toast.error('Free trial ended! Upgrade to continue 🚀')
        setTimeout(() => {
          router.push('/checkout')
        }, 1500)
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image')
      }

      setGeneratedImage(data.imageUrl)
      toast.success('Transformation complete! ✨')
      
      // Update usage data
      await checkUsage()

      // Show upgrade prompt if this was their free generation
      if (usageData.remainingFree === 1 && !usageData.isPaid) {
        setTimeout(() => {
          toast.info('That was your free transformation! Upgrade for unlimited access 🎨')
        }, 2000)
      }

    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `transformed-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded! 🎉')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Usage indicator - only show if signed in */}
      {isSignedIn && !usageData.isPaid && (
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-background/80 backdrop-blur">
              <Zap className="mr-1 h-3 w-3" />
              {usageData.remainingFree} Free {usageData.remainingFree === 1 ? 'Transform' : 'Transforms'} Left
            </Badge>
            {usageData.remainingFree === 0 && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => router.push('/checkout')}
                className="ml-2"
              >
                <Lock className="mr-1 h-3 w-3" />
                Unlock Unlimited
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Sign in prompt if not authenticated */}
      {!isSignedIn && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 dark:border-purple-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              <p className="font-medium">Sign in to get 1 free transformation!</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => router.push('/sign-in')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => router.push('/sign-up')}>
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main grid - adjusted for wider panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upload Section - Wider panel */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-purple-500/10 dark:to-purple-500/20 border-purple-200/20 dark:border-purple-500/20">
            <CardContent className="p-8">
              <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                <span className="text-2xl">📸</span> Upload Your Photo
              </h3>
              
              {!uploadedImage ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-16 text-center transition-all bg-gradient-to-br from-background/50 via-purple-50/5 to-pink-50/5",
                    dragActive 
                      ? "border-purple-500 bg-purple-500/10 scale-[1.01]" 
                      : "border-muted-foreground/20 hover:border-purple-400/40"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WEBP up to 4MB • Any aspect ratio
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative group">
                  {/* Responsive image container */}
                  <div className="relative rounded-xl overflow-hidden bg-muted/10">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '70vh' }}
                    />
                    
                    {/* Remove button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setUploadedImage(null)
                        setGeneratedImage(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Ready indicator */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-green-500/90 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready to transform
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎨</span> Choose Your Style
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {STYLE_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedStyle === preset.id ? "default" : "outline"}
                    className={cn(
                      "h-auto py-4 justify-start",
                      selectedStyle === preset.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedStyle(preset.id)}
                  >
                    <span className="text-xl mr-2">{preset.emoji}</span>
                    <span className="font-medium">{preset.label.split(' ')[1]}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transform Button */}
          <Button
            onClick={handleTransform}
            disabled={loading || !uploadedImage}
            size="lg"
            className="w-full py-6 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Transform Image
              </>
            )}
          </Button>
        </div>

        {/* Result Section - Wider panel */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-pink-500/10 dark:to-pink-500/20 border-pink-200/20 dark:border-pink-500/20">
            <CardContent className="p-8">
              <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                <span className="text-2xl">✨</span> Your Transformed Image
              </h3>
              
              {generatedImage ? (
                <div className="space-y-4">
                  {/* Responsive result container */}
                  <div className="relative rounded-xl overflow-hidden bg-muted/10">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '70vh' }}
                    />
                    
                    {/* Success badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Download button */}
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    size="lg"
                    className="w-full py-4"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <ImageIcon className="h-20 w-20 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No image yet</p>
                  <p className="text-sm">
                    {!isSignedIn ? 'Sign in to start transforming' : 'Upload a photo and click transform'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips card */}
          {!generatedImage && uploadedImage && isSignedIn && (
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Portrait photos work best with anime styles</li>
                  <li>• Landscapes look amazing with watercolor or oil paint</li>
                  <li>• Try different styles for unique results</li>
                  <li>• Higher quality source images = better results</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
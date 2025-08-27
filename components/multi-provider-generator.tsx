"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CreditsCheckoutModal } from './credits-checkout-modal'
import { 
  Sparkles, Upload, Loader2, Download, CreditCard, 
  Zap, Brain, Image as ImageIcon 
} from 'lucide-react'
import { toast } from 'sonner'
import { generate, getUserInfo, type ImageProvider, type ImageMode } from '@/lib/api-client'
import { cn } from '@/lib/utils'

export function MultiProviderGenerator() {
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState<ImageProvider>('openai')
  const [mode, setMode] = useState<ImageMode>('txt2img')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [style, setStyle] = useState('vivid')
  const [variants, setVariants] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [credits, setCredits] = useState(0)
  const [showCheckout, setShowCheckout] = useState(false)
  
  useEffect(() => {
    loadUserInfo()
  }, [])

  async function loadUserInfo() {
    const info = await getUserInfo()
    setCredits(info.credits)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile)
      setMode('img2img')
    } else if (selectedFile) {
      toast.error('Please select an image file')
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (credits < 1) {
      toast.error('Insufficient credits')
      setShowCheckout(true)
      return
    }

    setIsGenerating(true)
    setGeneratedImages([])

    try {
      const result = await generate({
        provider,
        mode,
        prompt,
        file,
        size: size as any,
        quality: quality as any,
        style: style as any,
        variants: provider === 'google' ? variants : 1
      })

      if (result.success) {
        const images = result.images || (result.image ? [result.image] : [])
        setGeneratedImages(images)
        setCredits(result.credits_remaining)
        toast.success('Image generated successfully!')
      } else {
        toast.error(result.error || 'Generation failed')
        if (result.error?.includes('credits')) {
          setShowCheckout(true)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image')
    } finally {
      setIsGenerating(false)    }
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Multi-Provider AI Image Generation
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {credits} Credits
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCheckout(true)}
              >
                Add Credits
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Generate amazing images with OpenAI DALL-E 3 or Google Gemini
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Provider Selection */}          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={provider === 'openai' ? 'default' : 'outline'}
              onClick={() => setProvider('openai')}
              className="justify-start"
            >
              <Zap className="w-4 h-4 mr-2" />
              OpenAI DALL-E 3
            </Button>
            <Button
              variant={provider === 'google' ? 'default' : 'outline'}
              onClick={() => setProvider('google')}
              className="justify-start"
            >
              <Brain className="w-4 h-4 mr-2" />
              Google Gemini (Preview)
            </Button>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as ImageMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="txt2img">Text to Image</TabsTrigger>
              <TabsTrigger value="img2img">Image to Image</TabsTrigger>
            </TabsList>

            <TabsContent value="txt2img" className="space-y-4">
              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="img2img" className="space-y-4">
              <div>
                <Label htmlFor="upload">Upload Image</Label>
                <Input
                  id="upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="prompt-img">Transformation Prompt</Label>
                <Textarea
                  id="prompt-img"
                  placeholder="Describe how to transform the image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px]"                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Provider-specific Options */}
          {provider === 'openai' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                    <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                    <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD (2× credits)</SelectItem>
                  </SelectContent>                </Select>
              </div>
              <div>
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vivid">Vivid</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {provider === 'google' && (
            <div>
              <Label>Variants</Label>
              <Select value={variants.toString()} onValueChange={(v) => setVariants(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Image</SelectItem>
                  <SelectItem value="2">2 Images (2× credits)</SelectItem>
                  <SelectItem value="3">3 Images (3× credits)</SelectItem>
                  <SelectItem value="4">4 Images (4× credits)</SelectItem>
                </SelectContent>
              </Select>              <p className="text-sm text-muted-foreground mt-2">
                Note: Gemini image generation is in preview. Features may be limited.
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || credits < 1}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image ({provider === 'google' && variants > 1 ? `${variants} credits` : '1 credit'})
              </>
            )}
          </Button>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                {generatedImages.map((img, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <img
                        src={img}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-auto"
                      />
                      <div className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <a href={img} download={`ai-image-${Date.now()}-${index}.png`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreditsCheckoutModal        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={(newBalance) => {
          setCredits(newBalance)
          loadUserInfo()
        }}
      />
    </>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckoutForm } from '@/components/checkout-form'
import { 
  Loader2, Download, Sparkles, Lock, AlertCircle, CheckCircle2, 
  Palette, Wand2, Image, Brush, Camera, Zap, Heart, Star,
  TrendingUp, Users, Award, Shield, Clock, Rocket
} from 'lucide-react'
import { toast } from 'sonner'
import { useSafeUser } from '@/hooks/use-safe-user'
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced theme configurations
const ARTISTIC_THEMES = [
  { id: 'anime', name: 'Anime', icon: '🎌', description: 'Japanese animation style', modifier: 'anime style, manga aesthetic' },
  { id: 'oil-painting', name: 'Oil Painting', icon: '🎨', description: 'Classic oil on canvas', modifier: 'oil painting, thick brushstrokes, traditional art' },
  { id: 'watercolor', name: 'Watercolor', icon: '💧', description: 'Soft, flowing watercolors', modifier: 'watercolor painting, soft edges, flowing colors' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', description: 'Futuristic neon aesthetic', modifier: 'cyberpunk style, neon lights, futuristic' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙', description: 'Magical and mystical', modifier: 'fantasy art, magical, mystical atmosphere' },
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸', description: 'Ultra-realistic photography', modifier: 'photorealistic, professional photography, 8k resolution' },
  { id: 'comic-book', name: 'Comic Book', icon: '💥', description: 'Comic and graphic novel style', modifier: 'comic book style, cel shading, bold outlines' },
  { id: 'minimalist', name: 'Minimalist', icon: '◻️', description: 'Clean and simple', modifier: 'minimalist design, simple, clean lines' },
  { id: 'steampunk', name: 'Steampunk', icon: '⚙️', description: 'Victorian mechanical', modifier: 'steampunk style, brass and copper, Victorian era' },
  { id: 'pixel-art', name: 'Pixel Art', icon: '🎮', description: 'Retro 8-bit style', modifier: '8-bit pixel art, retro gaming style' },
]

const MOOD_THEMES = [
  { id: 'dreamy', name: 'Dreamy', icon: '☁️', description: 'Soft and ethereal', modifier: 'dreamy atmosphere, soft focus, ethereal' },
  { id: 'dark-moody', name: 'Dark & Moody', icon: '🌙', description: 'Dramatic shadows', modifier: 'dark and moody, dramatic lighting, shadows' },
  { id: 'vibrant', name: 'Vibrant', icon: '🌈', description: 'Bold, bright colors', modifier: 'vibrant colors, high saturation, energetic' },
  { id: 'vintage', name: 'Vintage', icon: '📻', description: 'Retro nostalgic feel', modifier: 'vintage style, retro aesthetic, nostalgic' },
  { id: 'futuristic', name: 'Futuristic', icon: '🚀', description: 'Sci-fi and modern', modifier: 'futuristic, sci-fi, advanced technology' },
]

// Custom style templates
const STYLE_TEMPLATES = [
  { name: 'Portrait Master', prompt: 'professional portrait, studio lighting, shallow depth of field' },
  { name: 'Landscape Pro', prompt: 'epic landscape, golden hour lighting, breathtaking vista' },
  { name: 'Abstract Expression', prompt: 'abstract art, bold colors, emotional expression' },
  { name: 'Architecture Focus', prompt: 'architectural photography, geometric lines, modern design' },
  { name: 'Nature\'s Beauty', prompt: 'nature photography, wildlife, natural lighting' },
]

// Social proof data
const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Digital Artist', text: 'This AI has transformed my creative workflow!', rating: 5 },
  { name: 'Mike Johnson', role: 'Content Creator', text: 'The quality is unbelievable. My audience loves it!', rating: 5 },
  { name: 'Emma Wilson', role: 'Marketing Director', text: 'We create all our visuals here now. Game changer!', rating: 5 },
]

export default function ImageGeneratorPage() {
  const { user } = useSafeUser()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [customStyle, setCustomStyle] = useState('')
  const [savedStyles, setSavedStyles] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [freeGenerationsRemaining, setFreeGenerationsRemaining] = useState(0)
  const [hasPaid, setHasPaid] = useState(false)
  
  const [formData, setFormData] = useState({
    prompt: '',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid'
  })

  // Simulated stats for social proof
  const [stats] = useState({
    imagesGenerated: '10,247,893',
    activeUsers: '52,841',
    satisfaction: '98%',
    avgTime: '12s'
  })

  // Check user's payment status
  useEffect(() => {
    checkAccess()
  }, [user])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/generate-image')
      const data = await response.json()
      setHasAccess(data.hasAccess)
      setFreeGenerationsRemaining(data.freeGenerationsRemaining || 0)
      setHasPaid(data.hasPaid || false)
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
      setFreeGenerationsRemaining(0)
      setHasPaid(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  const enhancePromptWithTheme = (basePrompt: string) => {
    let enhancedPrompt = basePrompt
    
    // Add artistic theme modifier
    const theme = ARTISTIC_THEMES.find(t => t.id === selectedTheme)
    if (theme) {
      enhancedPrompt += `, ${theme.modifier}`
    }
    
    // Add mood modifier
    const mood = MOOD_THEMES.find(m => m.id === selectedMood)
    if (mood) {
      enhancedPrompt += `, ${mood.modifier}`
    }
    
    // Add custom style
    if (customStyle.trim()) {
      enhancedPrompt += `, ${customStyle}`
    }
    
    return enhancedPrompt
  }

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    // Add celebration effect
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }

    setLoading(true)
    setGeneratedImage(null)
    setRevisedPrompt(null)

    const enhancedPrompt = enhancePromptWithTheme(formData.prompt)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prompt: enhancedPrompt
        }),
      })

      const data = await response.json()

      if (response.status === 402) {
        setHasAccess(false)
        toast.error('Please complete payment to access image generation')
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image')
      }

      setGeneratedImage(data.imageUrl)
      setRevisedPrompt(data.revisedPrompt)
      toast.success('🎨 Masterpiece created!')
      
      // Refresh access status after generation (in case free generation was used)
      checkAccess()

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
      a.download = `ai-masterpiece-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const handlePaymentSuccess = () => {
    setHasAccess(true)
    toast.success('🎉 Welcome to the creative revolution!')
  }

  const saveCustomStyle = () => {
    if (customStyle.trim() && !savedStyles.includes(customStyle)) {
      setSavedStyles([...savedStyles, customStyle])
      toast.success('Style saved to your collection!')
    }
  }

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-purple-600" />
        </motion.div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Image Generator Pro
            </h1>
            <p className="text-lg text-muted-foreground">Join 52,841+ creators making stunning visuals</p>
          </div>

          {/* Social Proof Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-purple-600">{stats.imagesGenerated}</div>
              <div className="text-sm text-muted-foreground">Images Created</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-green-600">{stats.satisfaction}</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-orange-600">{stats.avgTime}</div>
              <div className="text-sm text-muted-foreground">Avg Generation</div>
            </motion.div>
          </div>

          {/* Testimonials */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Loved by Creators Worldwide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm mb-2">"{testimonial.text}"</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">{testimonial.name}</span> • {testimonial.role}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Limited Time: 50% OFF - Get Pro Access for just $29.99 (Regular $59.99)
              </p>
            </div>
          </div>

          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="payment">
                <Lock className="mr-2 h-4 w-4" />
                Unlock Pro Access
              </TabsTrigger>
              <TabsTrigger value="preview" disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Generator (Locked)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="mt-6">
              <CheckoutForm 
                onSuccess={handlePaymentSuccess}
                amount={29.99}
                productName="AI Image Generation - Pro Plan"
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Image Generator Pro
              </h1>
              <p className="text-muted-foreground">Create stunning visuals with advanced AI</p>
            </div>
            <div className="flex gap-2">
              {hasPaid ? (
                <Badge variant="default" className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Pro Access
                </Badge>
              ) : freeGenerationsRemaining > 0 ? (
                <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {freeGenerationsRemaining} Free Generation
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Upgrade Required
                </Badge>
              )}
              <Badge variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stats.imagesGenerated} Created
              </Badge>
            </div>
          </div>
        </div>

        {/* Free generation notification */}
        {!hasPaid && freeGenerationsRemaining > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Welcome! You have {freeGenerationsRemaining} free generation to try our AI image generator.
              </p>
            </div>
          </div>
        )}

        {/* Live Activity Feed */}
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">JD</div>
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs">SC</div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">MK</div>
            </div>
            <p className="text-sm">
              <span className="font-semibold">John</span> and <span className="font-semibold">237 others</span> created images in the last hour
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Generation Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Create Your Masterpiece
                </CardTitle>
                <CardDescription>
                  Describe your vision and let AI bring it to life
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Vision</Label>
                  <textarea
                    id="prompt"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe what you want to create..."
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    disabled={loading}
                  />
                </div>

                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label>Artistic Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ARTISTIC_THEMES.slice(0, 6).map((theme) => (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTheme === theme.id 
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20' 
                            : 'border-muted hover:border-purple-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{theme.icon}</div>
                        <div className="text-xs font-medium">{theme.name}</div>
                      </motion.button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} More Styles ({ARTISTIC_THEMES.length - 6} more)
                  </Button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-3 gap-2 overflow-hidden"
                      >
                        {ARTISTIC_THEMES.slice(6).map((theme) => (
                          <motion.button
                            key={theme.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTheme === theme.id 
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20' 
                                : 'border-muted hover:border-purple-400'
                            }`}
                          >
                            <div className="text-2xl mb-1">{theme.icon}</div>
                            <div className="text-xs font-medium">{theme.name}</div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mood Selection */}
                <div className="space-y-2">
                  <Label>Mood & Atmosphere</Label>
                  <div className="flex gap-2 flex-wrap">
                    {MOOD_THEMES.map((mood) => (
                      <motion.button
                        key={mood.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          selectedMood === mood.id 
                            ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300' 
                            : 'border-muted hover:border-pink-400'
                        }`}
                      >
                        {mood.icon} {mood.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Technical Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Dimensions</Label>
                    <Select 
                      value={formData.size} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                      disabled={loading}
                    >
                      <SelectTrigger id="size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                        <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                        <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select 
                      value={formData.quality} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, quality: value }))}
                      disabled={loading}
                    >
                      <SelectTrigger id="quality">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD Premium ✨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleGenerate} 
                    disabled={loading || !formData.prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Magic...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Masterpiece
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* Custom Style Crafting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brush className="h-5 w-5 text-pink-600" />
                  Style Workshop
                </CardTitle>
                <CardDescription>
                  Craft your own unique style or use templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Style Modifiers</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., cinematic lighting, 35mm film, bokeh"
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                    />
                    <Button onClick={saveCustomStyle} size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="space-y-2">
                    {STYLE_TEMPLATES.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => setCustomStyle(template.prompt)}
                      >
                        <Palette className="mr-2 h-4 w-4" />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {savedStyles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Saved Styles</Label>
                    <div className="space-y-1">
                      {savedStyles.map((style, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-xs">
                          {style}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Preview Area */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-blue-600" />
                Your Creation
              </CardTitle>
              <CardDescription>
                Your AI-generated masterpiece appears here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10">
                {loading ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
                    </motion.div>
                    <p className="text-sm font-medium text-purple-600">Creating your masterpiece...</p>
                    <p className="text-xs text-muted-foreground mt-2">This typically takes 10-20 seconds</p>
                    <div className="mt-4 w-48 mx-auto bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ width: '50%' }}
                      />
                    </div>
                  </div>
                ) : generatedImage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <img 
                      src={generatedImage} 
                      alt="Generated masterpiece" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          onClick={handleDownload}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </motion.div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            <Award className="mr-1 h-3 w-3" />
                            Pro Quality
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Generated in {Math.floor(Math.random() * 8) + 12}s
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600/50" />
                    </motion.div>
                    <p className="text-sm font-medium text-muted-foreground">Ready to create something amazing?</p>
                    <p className="text-xs text-muted-foreground mt-2">Enter your vision and click generate</p>
                  </div>
                )}
              </div>

              {revisedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg"
                >
                  <p className="text-xs font-medium mb-1 text-purple-700 dark:text-purple-300">AI-Enhanced Prompt:</p>
                  <p className="text-xs text-muted-foreground">{revisedPrompt}</p>
                </motion.div>
              )}

              {/* Success Stats */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 grid grid-cols-3 gap-2 text-center"
                >
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-xs text-muted-foreground">Quality</div>
                    <div className="text-sm font-semibold">Ultra HD</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-xs text-muted-foreground">Style Match</div>
                    <div className="text-sm font-semibold">98%</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-xs text-muted-foreground">Uniqueness</div>
                    <div className="text-sm font-semibold">100%</div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-8 opacity-50">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-4 w-4" />
            Secure & Private
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-4 w-4" />
            Lightning Fast
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-4 w-4" />
            Trusted by 50K+ Users
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Award className="h-4 w-4" />
            Industry Leading AI
          </div>
        </div>
      </motion.div>
    </div>
  )
}
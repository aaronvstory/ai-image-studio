"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSafeUser } from "@/hooks/use-safe-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Loader2,
  Wand2,
  History,
  Download,
  Share2,
  Upload,
  FileImage,
  RotateCcw,
  Trash2,
  Eye,
  Edit,
  Copy,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageHistoryManager, type ImageHistoryItem } from "@/lib/image-history";

// Model configurations
const IMAGE_MODELS = [
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'Best for creative and artistic images',
    badge: 'Popular'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast generation with good quality',
    badge: 'Fast'
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    provider: 'Google',
    description: 'Highest quality photorealistic images',
    badge: 'Premium'
  }
] as const;

type ModelId = typeof IMAGE_MODELS[number]['id'];

interface GenerationSettings {
  model: ModelId;
  size?: string;
  quality?: string;
  style?: string;
  aspectRatio?: string;
  numberOfImages?: number;
}

export function ImageGeneratorWithGemini() {
  const { user, isSignedIn } = useSafeUser();
  const [prompt, setPrompt] = useState("");
  const [transformPrompt, setTransformPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [showHistory, setShowHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    aspectRatio: '1:1',
    numberOfImages: 1
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const history = ImageHistoryManager.getHistory();
    setImageHistory(history);
  }, []);

  const handleModelChange = (modelId: ModelId) => {
    setSettings(prev => ({
      ...prev,
      model: modelId,
      // Reset model-specific settings
      numberOfImages: modelId === 'imagen-4' ? prev.numberOfImages : 1
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        setActiveTab("transform");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!isSignedIn) {
      toast.error("Please sign in to generate images");
      return;
    }

    setLoading(true);
    try {
      // Determine which API to use based on model
      const apiEndpoint = settings.model === 'dall-e-3' 
        ? '/api/generate-image' 
        : '/api/generate-image-gemini';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: settings.model === 'dall-e-3' ? undefined : settings.model,
          size: settings.size,
          quality: settings.quality,
          style: settings.style,
          aspectRatio: settings.aspectRatio,
          numberOfImages: settings.numberOfImages
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Handle response based on model
      const images = data.images || [data.imageUrl];
      setGeneratedImages(images);
      setSelectedImage(images[0]);

      // Save to history
      for (const imageUrl of images) {
        ImageHistoryManager.saveImage({
          prompt,
          imageUrl,
          model: settings.model,
          revisedPrompt: data.revisedPrompt,
          size: settings.size,
          quality: settings.quality,
          style: settings.style,
          aspectRatio: settings.aspectRatio
        });
      }

      // Refresh history
      setImageHistory(ImageHistoryManager.getHistory());
      
      toast.success(`Image${images.length > 1 ? 's' : ''} generated successfully!`);
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleTransform = async () => {
    if (!uploadedImage || !transformPrompt.trim()) {
      toast.error("Please upload an image and enter a transformation prompt");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-image-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: transformPrompt,
          model: 'gemini-2.5-flash',
          editImage: {
            imageData: uploadedImage,
            mimeType: 'image/png'
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Transformation failed');
      }

      const images = data.images || [];
      setGeneratedImages(images);
      setSelectedImage(images[0]);

      // Save to history with edit info
      for (const imageUrl of images) {
        ImageHistoryManager.saveImage({
          prompt: transformPrompt,
          imageUrl,
          model: 'gemini-2.5-flash',
          isEdited: true,
          editPrompt: transformPrompt
        });
      }

      setImageHistory(ImageHistoryManager.getHistory());
      toast.success("Image transformed successfully!");
    } catch (error: any) {
      console.error('Transform error:', error);
      toast.error(error.message || 'Failed to transform image');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (historyItem: ImageHistoryItem) => {
    setPrompt(historyItem.prompt);
    setSettings(prev => ({
      ...prev,
      model: historyItem.model,
      size: historyItem.size || prev.size,
      quality: historyItem.quality || prev.quality,
      style: historyItem.style || prev.style,
      aspectRatio: historyItem.aspectRatio || prev.aspectRatio
    }));
    setActiveTab("generate");
    setShowHistory(false);
  };

  const handleDownload = (imageUrl: string, index: number = 0) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const clearHistory = () => {
    ImageHistoryManager.clearHistory();
    setImageHistory([]);
    toast.success("History cleared");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* History Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="h-4 w-4 mr-2" />
          History ({imageHistory.length})
        </Button>
      </div>

      {/* Model Selection */}
      <Card className="border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select AI Model</CardTitle>
          <CardDescription>Choose the model that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {IMAGE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelChange(model.id as ModelId)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  "hover:border-purple-500/50 hover:bg-purple-500/5",
                  settings.model === model.id 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-zinc-800"
                )}
              >
                {model.badge && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    {model.badge}
                  </Badge>
                )}
                <div className="text-left">
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {model.provider}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {model.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Generation/Transform Tabs */}
      <Card className="border-purple-500/20">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="transform">
                <Wand2 className="h-4 w-4 mr-2" />
                Transform
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Enter your prompt</Label>
                  <Input
                    id="prompt"
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>

                {/* Model-specific settings */}
                {settings.model === 'dall-e-3' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Size</Label>
                      <Select value={settings.size} onValueChange={(v) => setSettings(s => ({...s, size: v}))}>
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
                      <Select value={settings.quality} onValueChange={(v) => setSettings(s => ({...s, quality: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="hd">HD (2x cost)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Style</Label>
                      <Select value={settings.style} onValueChange={(v) => setSettings(s => ({...s, style: v}))}>
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

                {settings.model.startsWith('gemini') && (
                  <div>
                    <Label>Aspect Ratio</Label>
                    <Select value={settings.aspectRatio} onValueChange={(v) => setSettings(s => ({...s, aspectRatio: v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="4:3">Fullscreen (4:3)</SelectItem>
                        <SelectItem value="3:4">Portrait Full (3:4)</SelectItem>
                        <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {settings.model === 'imagen-4' && (
                  <div>
                    <Label>Number of Images</Label>
                    <Select value={String(settings.numberOfImages)} onValueChange={(v) => setSettings(s => ({...s, numberOfImages: Number(v)}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Image</SelectItem>
                        <SelectItem value="2">2 Images</SelectItem>
                        <SelectItem value="3">3 Images</SelectItem>
                        <SelectItem value="4">4 Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Transform Tab */}
            <TabsContent value="transform" className="space-y-4 mt-4">
              <div className="space-y-4">
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-800 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Click to upload an image or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImage(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="transform-prompt">Transformation prompt</Label>
                      <Input
                        id="transform-prompt"
                        placeholder="Describe how to transform this image..."
                        value={transformPrompt}
                        onChange={(e) => setTransformPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTransform()}
                      />
                    </div>
                    <Button
                      onClick={handleTransform}
                      disabled={loading || !transformPrompt.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Transforming...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Transform Image
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Images Display */}
      {generatedImages.length > 0 && (
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {generatedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden",
                    selectedImage === image && "ring-2 ring-purple-500"
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`Generated ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image, index);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(selectedImage)} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Generation History</DialogTitle>
            <DialogDescription>
              View and regenerate your previously created images
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageHistory.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRegenerate(item)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(item.imageUrl)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          ImageHistoryManager.deleteItem(item.id);
                          setImageHistory(ImageHistoryManager.getHistory());
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {item.model}
                      </Badge>
                      {item.isEdited && (
                        <Badge variant="outline" className="text-xs">
                          Edited
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {imageHistory.length > 0 && (
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setShowHistory(false)}>
                Close
              </Button>
              <Button variant="destructive" onClick={clearHistory}>
                Clear All History
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
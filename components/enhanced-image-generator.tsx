"use client";

import React, { useState, useRef } from "react";
import { useSafeUser } from "@/hooks/use-safe-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Loader2,
  Wand2,
  Lock,
  Image as ImageIcon,
  Zap,
  Download,
  Heart,
  Share2,
  Upload,
  FileImage,
  ArrowRight,
  Camera,
  Palette,
  Stars,
} from "lucide-react";
import { toast } from "sonner";
// import { useUser, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    text: "🎨 Artistic Style",
    prompt: "Transform into artistic painting style with vibrant colors",
  },
  {
    text: "🌟 Enhance Quality",
    prompt: "Enhance image quality, sharpen details, improve lighting",
  },
  {
    text: "🎭 Anime Style",
    prompt: "Convert to anime/manga art style with cel shading",
  },
  {
    text: "🏙️ Cyberpunk",
    prompt: "Transform into cyberpunk aesthetic with neon lights",
  },
  {
    text: "🖼️ Oil Painting",
    prompt: "Convert to classical oil painting style",
  },
  {
    text: "✨ Fantasy Magic",
    prompt: "Add magical fantasy elements with ethereal glow",
  },
  {
    text: "🌸 Ghibli Style",
    prompt: "Transform into Studio Ghibli art style with soft watercolors",
  },
  {
    text: "🌊 Watercolor",
    prompt: "Convert to delicate watercolor painting with fluid strokes",
  },
  {
    text: "🎮 Pixel Art",
    prompt: "Transform into retro pixel art style with 8-bit aesthetic",
  },
  {
    text: "🌌 Space Art",
    prompt: "Add cosmic space elements with nebulas and stars",
  },
  {
    text: "🎪 Pop Art",
    prompt: "Convert to vibrant pop art style with bold colors",
  },
  {
    text: "🏛️ Renaissance",
    prompt: "Transform into Renaissance painting style with classical lighting",
  },
];

export function EnhancedImageGenerator() {
  const { user, isSignedIn } = useSafeUser();
  const [prompt, setPrompt] = useState(""); // For text-to-image
  const [transformPrompt, setTransformPrompt] = useState(""); // For image transformation
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    let finalPrompt = "";

    if (activeTab === "text") {
      finalPrompt = prompt;
    } else if (activeTab === "upload") {
      finalPrompt =
        transformPrompt ||
        (selectedPrompt !== null ? QUICK_PROMPTS[selectedPrompt].prompt : "");
    }

    if (activeTab === "upload" && !uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!finalPrompt && activeTab === "text") {
      toast.error("Please enter a prompt or select a quick idea");
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      toast.info("Sign up to get your free AI generation!");
      window.location.href = "/sign-up";
      return;
    }

    // Check if user has free generations left
    const metadata: any = user?.publicMetadata || {};
    const freeGenerationsUsed = (metadata.freeGenerationsUsed as number) || 0;
    const hasPaid = metadata.hasPaid || false;

    if (!hasPaid && freeGenerationsUsed >= 1) {
      toast.info(
        "Your free generation has been used. Upgrade for unlimited access!"
      );
      // Open checkout modal instead of redirecting
      window.dispatchEvent(
        new CustomEvent("openCheckoutModal", {
          detail: {
            trigger: "generation-limit",
            onSuccess: () => {
              // Refresh the page after successful payment
              window.location.reload();
            },
          },
        })
      );
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const endpoint =
        activeTab === "upload" ? "/api/transform-image" : "/api/generate-image";
      const body =
        activeTab === "upload"
          ? {
              image: uploadedImage,
              prompt: finalPrompt || "Enhance and transform this image",
            }
          : {
              prompt: finalPrompt,
              size: "1024x1024",
              quality: "hd",
              style: "vivid",
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 402) {
        toast.error("Please upgrade to continue generating images");
        // Open checkout modal instead of redirecting
        window.dispatchEvent(
          new CustomEvent("openCheckoutModal", {
            detail: {
              trigger: "generation-limit",
              onSuccess: () => {
                window.location.reload();
              },
            },
          })
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate image");
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Image generated successfully! ✨");

      if (!hasPaid && freeGenerationsUsed === 0) {
        setTimeout(() => {
          toast.info(
            "That was your free generation! Upgrade for unlimited access 🎨",
            {
              duration: 5000,
              action: {
                label: "Upgrade Now",
                onClick: () =>
                  window.dispatchEvent(
                    new CustomEvent("openCheckoutModal", {
                      detail: {
                        trigger: "upgrade-prompt",
                        onSuccess: () => window.location.reload(),
                      },
                    })
                  ),
              },
            }
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `gpt5-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded! 🎉");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div id="image-generator" className="w-full py-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20" />

      <div className="relative mx-auto max-w-[1600px] px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4 pb-2 leading-relaxed">
            Create Your Image
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Upload an image to transform it or generate from text description
          </p>
        </motion.div>

        {/* Main Generator Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-full mx-auto">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
              <CardContent className="p-8 space-y-6">
                {/* Tab Selection */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50 p-1 h-auto">
                    <TabsTrigger
                      value="upload"
                      className="flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[48px] py-2 px-3 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all overflow-hidden"
                    >
                      <Upload className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        Image Upload
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="text"
                      className="flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[48px] py-2 px-3 sm:px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all overflow-hidden"
                    >
                      <Wand2 className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        Text to Image
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    {/* Upload Area */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-purple-500" />
                        Upload Your Image
                      </h3>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-700 hover:border-purple-500 bg-zinc-800/50 rounded-xl p-12 text-center cursor-pointer transition-all duration-300 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        {uploadedImage ? (
                          <div className="space-y-2">
                            <img
                              src={uploadedImage}
                              alt="Uploaded"
                              className="w-full h-48 object-cover rounded-lg mx-auto"
                            />
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Image uploaded! Click to change
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                            <p className="text-sm font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG, WebP up to 10MB
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Transformation Style */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-500" />
                        Transformation Style
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {QUICK_PROMPTS.map((quickPrompt, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedPrompt === index ? "default" : "outline"
                            }
                            size="sm"
                            className={cn(
                              "text-xs sm:text-sm px-2 py-2 h-auto whitespace-normal",
                              selectedPrompt === index &&
                                "bg-gradient-to-r from-purple-600 to-pink-600"
                            )}
                            onClick={() => {
                              setSelectedPrompt(index);
                              setTransformPrompt(quickPrompt.prompt);
                            }}
                          >
                            {quickPrompt.text}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-purple-500" />
                        Custom Instructions (Optional)
                      </h3>
                      <Input
                        placeholder="Add specific transformation instructions..."
                        value={transformPrompt}
                        onChange={(e) => {
                          setTransformPrompt(e.target.value);
                          setSelectedPrompt(null);
                        }}
                        className="text-base"
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    {/* Text Prompt */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-purple-500" />
                        Describe Your Vision
                      </h3>
                      <Input
                        placeholder="A futuristic city with flying cars and neon lights..."
                        value={prompt}
                        onChange={(e) => {
                          setPrompt(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !loading) {
                            handleGenerate();
                          }
                        }}
                        className="text-base"
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={
                    loading || (activeTab === "upload" && !uploadedImage)
                  }
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] font-medium text-sm sm:text-lg py-4 sm:py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="whitespace-normal">
                        Generate Image{" "}
                        {!isSignedIn && (
                          <span className="inline sm:inline">(Free Trial)</span>
                        )}
                      </span>
                    </>
                  )}
                </Button>

                {!isSignedIn && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Lock className="inline h-3 w-3 mr-1" />
                    Quick sign up for your free GPT-5 generation
                  </p>
                )}

                {/* Features */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>HD Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Instant Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Commercial Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>No Watermarks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="overflow-hidden bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 h-full min-h-[700px]">
              <CardContent className="p-8 h-full flex flex-col">
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4 flex-1 flex flex-col"
                    >
                      <div className="relative rounded-xl overflow-hidden flex-1">
                        <img
                          src={generatedImage}
                          alt="Generated"
                          className="w-full h-full object-contain"
                        />

                        {/* Success badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => {
                            toast.success("Sharing coming soon!");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                        <Button
                          onClick={() => {
                            toast.success("Saved to favorites!");
                          }}
                          variant="outline"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full border-4 border-purple-200 dark:border-purple-800 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        </div>
                      </div>
                      <p className="mt-6 text-lg font-medium">
                        Creating your image...
                      </p>
                      <p className="text-sm mt-2">
                        This usually takes 10-15 seconds
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <Camera className="h-24 w-24 mb-4 opacity-20" />
                      <p className="text-lg font-medium mb-2">
                        Your creation will appear here
                      </p>
                      <p className="text-sm text-center">
                        Upload an image or enter a prompt to begin
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

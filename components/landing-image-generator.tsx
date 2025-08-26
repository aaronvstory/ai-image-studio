"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";
import { useSafeUser } from "@/hooks/use-safe-user";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    text: "🦊 Cute fox in enchanted forest",
    prompt:
      "A cute fox in an enchanted forest with glowing mushrooms, magical atmosphere, Studio Ghibli style",
  },
  {
    text: "🏔️ Epic mountain landscape",
    prompt:
      "Epic mountain landscape at sunset, dramatic clouds, golden hour lighting, photorealistic",
  },
  {
    text: "🤖 Friendly robot companion",
    prompt:
      "Friendly robot companion with big eyes, Pixar style, colorful and cheerful",
  },
  {
    text: "🌊 Underwater coral reef",
    prompt:
      "Vibrant underwater coral reef with tropical fish, rays of sunlight, crystal clear water",
  },
  {
    text: "🏰 Fantasy castle in clouds",
    prompt:
      "Majestic fantasy castle floating in clouds, ethereal lighting, magical atmosphere",
  },
  {
    text: "🌸 Cherry blossom garden",
    prompt:
      "Beautiful Japanese cherry blossom garden in full bloom, serene atmosphere, soft pink petals",
  },
];

export function LandingImageGenerator() {
  const { user, isSignedIn } = useSafeUser();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);

  const handleGenerate = async () => {
    const finalPrompt =
      prompt ||
      (selectedPrompt !== null ? QUICK_PROMPTS[selectedPrompt].prompt : "");

    if (!finalPrompt) {
      toast.error("Please enter a prompt or select a quick idea");
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      // Open sign-up modal with free generation trigger
      window.dispatchEvent(
        new CustomEvent("openAuthModal", {
          detail: {
            mode: "sign-up",
            trigger: "free-generation",
            onSuccess: () => {
              // After successful sign-up, retry generation
              handleGenerate();
            },
          },
        })
      );
      return;
    }

    // Check if user has free generations left
    const metadata: any = user?.publicMetadata || {};
    const freeGenerationsUsed = (metadata.freeGenerationsUsed as number) || 0;
    const hasPaid = metadata.hasPaid || false;

    if (!hasPaid && freeGenerationsUsed >= 1) {
      // Show paywall - open checkout modal
      toast.info(
        "Your free generation has been used. Upgrade for unlimited access!"
      );
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

    setLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          size: "1024x1024",
          quality: "standard",
          style: "vivid",
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required
        toast.error("Please upgrade to continue generating images");
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

      // Show upgrade prompt if this was their free generation
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
      a.download = `ai-generated-${Date.now()}.png`;
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
    <div id="image-generator" className="w-full py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
            <Zap className="mr-2 h-3 w-3" />
            Try It Now - No Sign Up Required
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Create Your First AI Masterpiece
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Just type what you imagine or pick a quick idea below. Get your
            first image free!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-purple-500/10 dark:to-purple-500/20 border-purple-200/20 dark:border-purple-500/20">
              <CardContent className="p-6 space-y-6">
                {/* Quick prompt suggestions */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Quick Ideas - Click to Try
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((quickPrompt, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedPrompt === index ? "default" : "outline"
                        }
                        size="sm"
                        className={cn(
                          "text-xs",
                          selectedPrompt === index &&
                            "bg-gradient-to-r from-purple-600 to-pink-600"
                        )}
                        onClick={() => {
                          setSelectedPrompt(index);
                          setPrompt(quickPrompt.prompt);
                        }}
                      >
                        {quickPrompt.text}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom prompt input */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-500" />
                    Or Describe Your Vision
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="A majestic dragon flying over a crystal city at sunset..."
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        setSelectedPrompt(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !loading) {
                          handleGenerate();
                        }
                      }}
                      className="text-base"
                      disabled={loading}
                    />

                    <Button
                      onClick={handleGenerate}
                      disabled={loading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Image {!isSignedIn && "(Free)"}
                        </>
                      )}
                    </Button>

                    {!isSignedIn && (
                      <p className="text-xs text-center text-muted-foreground">
                        <Lock className="inline h-3 w-3 mr-1" />
                        Quick sign up to get your free image - no credit card
                        needed
                      </p>
                    )}
                  </div>
                </div>

                {/* Features list */}
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

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-pink-500/10 dark:to-pink-500/20 border-pink-200/20 dark:border-pink-500/20 h-full">
              <CardContent className="p-6 h-full flex flex-col">
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
                          className="w-full h-full object-cover"
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
                        Creating your masterpiece...
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
                      <ImageIcon className="h-24 w-24 mb-4 opacity-20" />
                      <p className="text-lg font-medium mb-2">
                        Your AI image will appear here
                      </p>
                      <p className="text-sm text-center">
                        Enter a prompt and click generate to create amazing art
                      </p>

                      {/* Sample gallery */}
                      <div className="mt-8 text-xs">
                        <p className="mb-2 opacity-50">
                          What others are creating:
                        </p>
                        <div className="flex gap-2">
                          {["🎨", "🌅", "🚀", "🦄", "🏝️"].map((emoji, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded bg-muted flex items-center justify-center text-lg"
                            >
                              {emoji}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>10M+ Images Created</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>50K+ Happy Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              <span>100% Secure & Private</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

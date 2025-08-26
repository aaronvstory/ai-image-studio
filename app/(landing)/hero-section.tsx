"use client";

import React, { useState, useEffect } from "react";
import { HeroHeader } from "./header";
import {
  ChevronDown,
  Sparkles,
  Users,
  Star,
  TrendingUp,
  Award,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Rotating headlines for variety (two-line enforced)
// Each entry: [line1, line2] (no leading ellipses on second line per latest spec)
const HEADLINES: [string, string][] = [
  ["Transform Ideas", "into Visual Masterpieces"],
  ["Generate Professional", "Images with One Click"],
  ["Unleash Your", "Creative Superpowers"],
  ["Create Stunning", "AI Art in Seconds"],
];

// Social proof avatars
const CREATOR_AVATARS = [
  { initials: "SC", bg: "bg-purple-600" },
  { initials: "MJ", bg: "bg-pink-600" },
  { initials: "EW", bg: "bg-blue-600" },
  { initials: "JD", bg: "bg-green-600" },
  { initials: "AL", bg: "bg-orange-600" },
];

// Trust logos (simulated)
const TRUST_LOGOS = [
  { name: "TechCrunch", text: "TECHCRUNCH" },
  { name: "Product Hunt", text: "PRODUCT HUNT" },
  { name: "The Verge", text: "THE VERGE" },
  { name: "Wired", text: "WIRED" },
  { name: "Fast Company", text: "FAST COMPANY" },
];

export default function HeroSection() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run animations after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate headlines
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <>
      <HeroHeader />
      <main>
        <section className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20" />

          {/* Simplified animated particles - only render client-side */}
          {mounted && (
            <div className="absolute inset-0 opacity-30">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
                  initial={{
                    x: i * 400 + 100,
                    y: i * 200 + 100,
                  }}
                  animate={{
                    x: [i * 400 + 100, i * 400 + 200, i * 400 + 100],
                    y: [i * 200 + 100, i * 200 + 150, i * 200 + 100],
                  }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
              {/* Simplified Hero Content */}
              <div className="text-center">
                {/* Main Headline */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={headlineIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight pb-2 max-w-5xl px-4 text-center absolute"
                      >
                        <span className="block">
                          {HEADLINES[headlineIndex][0]}
                        </span>
                        <span className="block">
                          {HEADLINES[headlineIndex][1]}
                        </span>
                      </motion.h1>
                    </AnimatePresence>
                  </div>

                  <p className="text-muted-foreground mx-auto my-4 max-w-2xl text-lg sm:text-xl md:text-2xl font-light">
                    Professional AI image transformation and generation in
                    seconds
                  </p>
                </motion.div>

                {/* Simple CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-5 text-base rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    onClick={() => {
                      document
                        .getElementById("image-generator")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8"
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="cursor-pointer"
                    onClick={() => {
                      document
                        .getElementById("image-generator")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <ChevronDown className="mx-auto h-8 w-8 text-purple-500/50 hover:text-purple-500 transition-colors" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Modal */}
        <AnimatePresence>
          {isVideoPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setIsVideoPlaying(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Play className="h-20 w-20 text-white" />
                  <p className="text-white ml-4 text-xl">
                    Demo Video Coming Soon
                  </p>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => setIsVideoPlaying(false)}
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

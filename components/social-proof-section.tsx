'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Star, Users, TrendingUp, Award, Shield, Zap, Image } from 'lucide-react'

const CREATOR_AVATARS = [
  { initials: 'SC', bg: 'bg-purple-600' },
  { initials: 'MJ', bg: 'bg-pink-600' },
  { initials: 'EW', bg: 'bg-blue-600' },
  { initials: 'JD', bg: 'bg-green-600' },
  { initials: 'AL', bg: 'bg-orange-600' },
]

const TRUST_LOGOS = [
  { name: 'TechCrunch', text: 'TECHCRUNCH' },
  { name: 'Product Hunt', text: 'PRODUCT HUNT' },
  { name: 'The Verge', text: 'THE VERGE' },
  { name: 'Wired', text: 'WIRED' },
  { name: 'Fast Company', text: 'FAST COMPANY' },
]

export function SocialProofSection() {
  const [imageCount, setImageCount] = useState(10247893)
  const [userCount, setUserCount] = useState(52841)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate live counters
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setImageCount(prev => prev + Math.floor(Math.random() * 5) + 1)
      if (Math.random() > 0.9) {
        setUserCount(prev => prev + 1)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [mounted])

  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-purple-950/20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Trusted by Creators Worldwide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">
                {mounted ? imageCount.toLocaleString() : '10,247,893'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Images Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-600">
                {mounted ? userCount.toLocaleString() : '52,841'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600">
                4.9/5
              </div>
              <div className="text-sm text-muted-foreground mt-1">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600">
                12s
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Gen Time</div>
            </div>
          </div>
        </motion.div>

        {/* Creator Avatars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center gap-4 mb-12"
        >
          <div className="flex -space-x-3">
            {CREATOR_AVATARS.map((avatar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`w-12 h-12 rounded-full ${avatar.bg} flex items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-gray-900`}
              >
                {avatar.initials}
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-purple-600">52,841+ creators</span> making amazing art daily
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <Badge variant="secondary" className="px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Lightning Fast
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            100% Secure
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Award className="mr-2 h-4 w-4" />
            Pro Quality
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Image className="mr-2 h-4 w-4" />
            HD Resolution
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            Team Plans
          </Badge>
        </motion.div>

        {/* As Seen In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-xs text-muted-foreground text-center mb-6 uppercase tracking-wider">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {TRUST_LOGOS.map((logo, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, opacity: 1 }}
                className="text-xs font-bold tracking-wider text-muted-foreground"
              >
                {logo.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
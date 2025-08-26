'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles, Zap, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface AuthModalProps {
  mode: 'sign-in' | 'sign-up'
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  trigger?: 'free-generation' | 'premium-feature' | 'general'
}

export function AuthModal({ mode, isOpen, onClose, onSuccess, trigger = 'general' }: AuthModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render modal after mounting to prevent hydration issues
  if (!mounted) {
    return null
  }

  const getTitle = () => {
    if (trigger === 'free-generation') {
      return mode === 'sign-up' ? '🎨 Get Your Free AI Image!' : 'Welcome Back!'
    }
    if (trigger === 'premium-feature') {
      return 'Unlock Premium Features'
    }
    return mode === 'sign-up' ? 'Create Your Account' : 'Sign In'
  }

  const getDescription = () => {
    if (trigger === 'free-generation') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            Sign up in seconds and get your first AI-generated image absolutely free!
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-zinc-200">1 free generation instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-zinc-200">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-zinc-200">Access to DALL-E 3 technology</span>
            </div>
          </div>
        </div>
      )
    }
    
    if (trigger === 'premium-feature') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            Unlock unlimited generations and premium features
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-zinc-200">Unlimited AI generations</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-zinc-200">HD quality images</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-zinc-200">Priority processing</span>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <p className="text-sm text-zinc-300">
        {mode === 'sign-up' 
          ? 'Join thousands creating amazing AI art'
          : 'Welcome back to AI Image Studio'
        }
      </p>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {getTitle()}
          </DialogTitle>
          <DialogDescription asChild>
            <div>{getDescription()}</div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              // In demo mode, just simulate successful auth
              localStorage.setItem('demo-auth', 'true')
              localStorage.setItem('demo-user', JSON.stringify({
                id: 'demo-user-' + Date.now(),
                email: 'demo@example.com',
                hasPaid: false,
                freeGenerationsUsed: 0
              }))
              onClose()
              onSuccess?.()
              // Refresh the page to update auth state
              window.location.reload()
            }}
          >
            {mode === 'sign-up' ? 'Create Free Account' : 'Sign In'}
          </Button>
          
          <div className="text-center text-sm text-zinc-400">
            {mode === 'sign-up' ? (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAuthModal', {
                      detail: { mode: 'sign-in', trigger: 'general' }
                    }))
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAuthModal', {
                      detail: { mode: 'sign-up', trigger: 'general' }
                    }))
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
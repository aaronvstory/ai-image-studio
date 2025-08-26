'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, Sparkles, Zap, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSafeUser } from '@/hooks/use-safe-user'
import { ClerkSignInForm } from './clerk-signin-form'
import { ClerkSignUpForm } from './clerk-signup-form'

export interface ClerkAuthModalProps {
  mode: 'sign-in' | 'sign-up' | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  trigger?: 'free-generation' | 'premium-feature' | 'general'
}

export function ClerkAuthModal({ mode, isOpen, onClose, onSuccess, trigger = 'general' }: ClerkAuthModalProps) {
  const { isSignedIn } = useSafeUser()
  const [currentMode, setCurrentMode] = useState<'sign-in' | 'sign-up'>(mode || 'sign-up')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mode) {
      setCurrentMode(mode)
    }
  }, [mode])

  // Close modal if user is already signed in
  useEffect(() => {
    if (isSignedIn && isOpen) {
      onClose()
      onSuccess?.()
    }
  }, [isSignedIn, isOpen, onClose, onSuccess])

  // Only render modal after mounting to prevent hydration issues
  if (!mounted) {
    return null
  }

  const getTitle = () => {
    if (trigger === 'free-generation') {
      return currentMode === 'sign-up' ? '🎨 Get Your Free AI Image!' : 'Welcome Back!'
    }
    if (trigger === 'premium-feature') {
      return 'Unlock Premium Features'
    }
    return currentMode === 'sign-up' ? 'Create Your Account' : 'Sign In to Your Account'
  }

  const getDescription = () => {
    if (trigger === 'free-generation' && currentMode === 'sign-up') {
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
    
    if (currentMode === 'sign-in') {
      return (
        <p className="text-sm text-zinc-300">
          Welcome back! Sign in to continue creating amazing AI art.
        </p>
      )
    }
    
    return null
  }

  const handleAuthSuccess = () => {
    // Close modal and trigger success callback
    onClose()
    onSuccess?.()
    
    // Reload to update auth state across the app
    // In production, you might want to use a more sophisticated state management
    window.location.reload()
  }

  const handleModeSwitch = (newMode: 'sign-in' | 'sign-up') => {
    setCurrentMode(newMode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {getTitle()}
          </DialogTitle>
          {getDescription() && (
            <DialogDescription asChild>
              <div>{getDescription()}</div>
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {currentMode === 'sign-in' ? (
            <ClerkSignInForm
              onSuccess={handleAuthSuccess}
              onSignUpClick={() => handleModeSwitch('sign-up')}
            />
          ) : (
            <ClerkSignUpForm
              onSuccess={handleAuthSuccess}
              onSignInClick={() => handleModeSwitch('sign-in')}
              trigger={trigger}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
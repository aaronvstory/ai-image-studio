'use client'

import { useState, useEffect } from 'react'

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [authModalState, setAuthModalState] = useState<{
    mode: 'sign-in' | 'sign-up' | null
    isOpen: boolean
    trigger?: 'free-generation' | 'premium-feature' | 'general'
    onSuccess?: () => void
  }>({
    mode: null,
    isOpen: false,
  })

  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthModalState({
        mode: event.detail.mode,
        isOpen: true,
        trigger: event.detail.trigger || 'general',
        onSuccess: event.detail.onSuccess,
      })
    }

    window.addEventListener('openAuthModal' as any, handleOpenAuthModal)
    return () => {
      window.removeEventListener('openAuthModal' as any, handleOpenAuthModal)
    }
  }, [])

  // For now, we're using Supabase auth which handles its own modals
  // This provider is kept for backward compatibility but doesn't render anything
  return <>{children}</>
}
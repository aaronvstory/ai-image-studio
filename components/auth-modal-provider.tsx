'use client'

import { useState, useEffect } from 'react'
import { ClerkAuthModal } from './clerk-auth-modal'
import { useUser } from '@clerk/nextjs'

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

  return (
    <>
      {children}
      <ClerkAuthModal
        mode={authModalState.mode}
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={authModalState.onSuccess}
        trigger={authModalState.trigger}
      />
    </>
  )
}
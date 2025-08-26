'use client'

import { useState, useEffect } from 'react'
import { CheckoutModal } from './checkout-modal'

export function CheckoutModalProvider({ children }: { children: React.ReactNode }) {
  const [checkoutModalState, setCheckoutModalState] = useState<{
    isOpen: boolean
    trigger?: 'generation-limit' | 'upgrade-prompt' | 'manual'
    onSuccess?: (paymentData: { success: boolean; message?: string; paymentId?: string }) => void
  }>({
    isOpen: false,
  })

  useEffect(() => {
    const handleOpenCheckoutModal = (event: CustomEvent) => {
      setCheckoutModalState({
        isOpen: true,
        trigger: event.detail.trigger || 'manual',
        onSuccess: event.detail.onSuccess,
      })
    }

    const handleCloseCheckoutModal = () => {
      setCheckoutModalState(prev => ({ ...prev, isOpen: false }))
    }

    window.addEventListener('openCheckoutModal' as any, handleOpenCheckoutModal)
    window.addEventListener('closeCheckoutModal' as any, handleCloseCheckoutModal)
    
    return () => {
      window.removeEventListener('openCheckoutModal' as any, handleOpenCheckoutModal)
      window.removeEventListener('closeCheckoutModal' as any, handleCloseCheckoutModal)
    }
  }, [])

  return (
    <>
      {children}
      <CheckoutModal
        isOpen={checkoutModalState.isOpen}
        onClose={() => setCheckoutModalState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={checkoutModalState.onSuccess}
        trigger={checkoutModalState.trigger}
      />
    </>
  )
}
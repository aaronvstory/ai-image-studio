'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render Clerk after mounting to prevent hydration issues
  if (!mounted) {
    return <>{children}</>
  }

  // Check if we have valid Clerk keys
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // If no valid key or in demo mode, render without Clerk
  if (!publishableKey || publishableKey === 'pk_test_your-key' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return <>{children}</>
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          card: 'bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
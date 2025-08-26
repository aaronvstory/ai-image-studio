'use client'

import { useEffect, useState } from 'react'

export default function TestClerkPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [clerkInfo, setClerkInfo] = useState<any>(null)

  useEffect(() => {
    const checkClerk = async () => {
      try {
        // Check if Clerk is loaded
        setStatus('Checking Clerk...')
        
        // @ts-ignore
        if (typeof window.Clerk !== 'undefined') {
          setStatus('Clerk is loaded!')
          // @ts-ignore
          setClerkInfo(window.Clerk)
        } else {
          setStatus('Clerk is not loaded yet')
          
          // Try to load Clerk manually
          const script = document.createElement('script')
          script.src = 'https://meet-coyote-2.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
          script.async = true
          script.onload = () => {
            setStatus('Clerk script loaded, trying to initialize...')
            // @ts-ignore
            if (window.Clerk) {
              // @ts-ignore
              window.Clerk.load({
                publishableKey: 'pk_test_bWVldC1jb3lvdGUtMi5jbGVyay5hY2NvdW50cy5kZXYk'
              }).then(() => {
                setStatus('Clerk initialized!')
                // @ts-ignore
                setClerkInfo(window.Clerk)
              }).catch((error: any) => {
                setStatus(`Failed to initialize Clerk: ${error.message}`)
                console.error('Clerk init error:', error)
              })
            }
          }
          script.onerror = (error) => {
            setStatus('Failed to load Clerk script')
            console.error('Script load error:', error)
          }
          document.head.appendChild(script)
        }
      } catch (error: any) {
        setStatus(`Error: ${error.message}`)
        console.error('Clerk check error:', error)
      }
    }

    checkClerk()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-zinc-950 text-white">
      <h1 className="text-2xl font-bold mb-4">Clerk Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Status:</h2>
        <p className="text-yellow-400">{status}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Environment Variables:</h2>
        <code className="block p-2 bg-zinc-900 rounded">
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'not set'}
        </code>
      </div>

      {clerkInfo && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Clerk Info:</h2>
          <pre className="p-2 bg-zinc-900 rounded overflow-auto">
            {JSON.stringify({
              loaded: true,
              version: clerkInfo.version,
              isReady: clerkInfo.isReady,
            }, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-zinc-900 rounded">
        <h3 className="text-lg font-semibold mb-2">Testing Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Publishable Key: pk_test_bWVldC1jb3lvdGUtMi5jbGVyay5hY2NvdW50cy5kZXYk</li>
          <li>Frontend API: https://meet-coyote-2.clerk.accounts.dev</li>
          <li>Decoded domain: meet-coyote-2.clerk.accounts.dev$</li>
        </ul>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Check environment variables
      const envCheck = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 
          'NOT SET',
        demoMode: process.env.NEXT_PUBLIC_DEMO_MODE || 'NOT SET'
      }

      // Test API endpoint
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'Test123456!'
        })
      })

      const data = await response.json()
      
      setResult({
        environment: envCheck,
        apiTest: data,
        status: response.status,
        success: response.ok
      })
    } catch (error: any) {
      setResult({
        error: error.message,
        stack: error.stack
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Supabase Connection Test</h1>
        
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <Button 
            onClick={testConnection}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </Button>

          {result && (
            <pre className="bg-black p-4 rounded text-xs text-green-400 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          <div className="mt-6 text-sm text-zinc-400">
            <h3 className="text-white mb-2">Debug Info:</h3>
            <ul className="space-y-1">
              <li>• This page tests the Supabase connection</li>
              <li>• It shows environment variables (safely truncated)</li>
              <li>• It attempts to create a test account</li>
              <li>• Check the browser console for additional errors</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-yellow-950/50 border border-yellow-800 rounded">
            <h3 className="text-yellow-400 font-bold mb-2">If Authentication Fails:</h3>
            <ol className="text-yellow-200 text-sm space-y-2">
              <li>1. Go to <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
              <li>2. Select your project: <code>ytdhhklpsanghxouspkr</code></li>
              <li>3. Navigate to Settings → API</li>
              <li>4. Copy the <strong>anon public</strong> key (NOT service_role)</li>
              <li>5. Update in Vercel: Settings → Environment Variables</li>
              <li>6. Set <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> with the new key</li>
              <li>7. Redeploy the application</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  )
}
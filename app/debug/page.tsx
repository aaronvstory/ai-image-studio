"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [prompt, setPrompt] = useState("make a cute image of a realistic white call duck looking all wealthy with lots of cash and expensive items around it in a rich area like a wealthy rapper style and with a speech bubble saying 'Pape!' realistic but cute")
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testOpenAI = async () => {
    setIsLoading(true)
    setResult('Testing...')
    
    try {
      const response = await fetch('/api/gen/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          mode: 'txt2img',
          prompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        })
      })
      
      const data = await response.json()
      setResult(JSON.stringify({ status: response.status, data }, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUserInfo = async () => {
    setIsLoading(true)
    setResult('Getting user info...')
    
    try {
      const response = await fetch('/api/me')
      const data = await response.json()
      setResult(JSON.stringify({ status: response.status, data }, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Debug Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Prompt:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex gap-4">
            <Button onClick={testOpenAI} disabled={isLoading}>
              Test OpenAI API
            </Button>
            <Button onClick={testUserInfo} disabled={isLoading}>
              Test User Info
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Result:</label>
            <pre className="bg-zinc-900 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {result || 'No result yet...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  if (isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950 p-4">
        <Card className="w-full max-w-md bg-zinc-950/90 backdrop-blur-xl border border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Demo Mode</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign up is disabled in demo mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-300 text-center">
              In demo mode, you can test the image generation functionality without creating an account.
              All generated images are sample images for demonstration purposes.
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Image Generator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950">
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-zinc-950/90 backdrop-blur-xl border border-zinc-800',
          }
        }}
      />
    </div>
  )
}
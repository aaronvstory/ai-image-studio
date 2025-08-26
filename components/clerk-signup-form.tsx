'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface ClerkSignUpFormProps {
  onSuccess?: () => void
  onSignInClick?: () => void
  trigger?: 'free-generation' | 'premium-feature' | 'general'
}

export function ClerkSignUpForm({ onSuccess, onSignInClick, trigger = 'general' }: ClerkSignUpFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      // Create the sign up
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          signUpTrigger: trigger,
          freeGenerationsUsed: 0,
        }
      })

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ 
        strategy: 'email_code' 
      })

      // Set pending verification
      setPendingVerification(true)
      toast.info('Verification email sent! Please check your inbox.')
    } catch (err: any) {
      console.error('Sign-up error:', err)
      const errorMessage = err.errors?.[0]?.message || 'Failed to create account. Please try again.'
      setError(errorMessage)
      
      // Check for specific error types
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        setError('This email is already registered. Please sign in instead.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (completeSignUp.status === 'complete') {
        // Set the session as active
        await setActive({ session: completeSignUp.createdSessionId })
        
        // Initialize user metadata for free generation tracking
        const user = completeSignUp.createdSessionId
        
        toast.success('Account created successfully! Enjoy your free generation!')
        onSuccess?.()
      } else {
        console.log('Verification status:', completeSignUp.status)
        setError('Unable to complete verification. Please try again.')
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.errors?.[0]?.message || 'Invalid verification code. Please check and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: any) {
      console.error('OAuth sign-up error:', err)
      setError('Failed to connect with provider. Please try again.')
      setIsLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <form onSubmit={handleVerification} className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">Verify Your Email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-2xl font-mono tracking-widest"
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify & Create Account
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setPendingVerification(false)}
        >
          Back to Sign Up
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {trigger === 'free-generation' && (
        <Alert className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <AlertDescription className="text-sm">
            Sign up now and get <strong>1 free AI image generation</strong> instantly!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Free Account
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignUp('oauth_google')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignUp('oauth_github')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={onSignInClick}
        >
          Sign in
        </button>
      </div>
    </form>
  )
}
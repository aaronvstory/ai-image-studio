'use client'

import { CheckoutForm } from '@/components/checkout-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()

  interface PaymentData {
    success: boolean
    message?: string
    paymentId?: string
  }

  const handleSuccess = (paymentData: PaymentData) => {
    toast.success('Payment successful! Redirecting to image generator...')
    setTimeout(() => {
      router.push('/dashboard/image-generator')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container max-w-7xl mx-auto p-6">
        <div className="mb-8 text-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Unlock Unlimited Creativity
          </h1>
          <p className="text-lg text-muted-foreground">
            Get instant access to AI image generation and transformations
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <CheckoutForm 
            onSuccess={handleSuccess}
            amount={29.99}
            productName="AI Image Generation - Pro Plan"
          />
        </div>
      </div>
    </div>
  )
}
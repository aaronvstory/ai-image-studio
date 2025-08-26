'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, Lock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCardNumber, formatExpiryDate, luhnCheck, getCardType, validateCVV, DEMO_CARDS } from '@/lib/payment-utils'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CheckoutFormProps {
  onSuccess?: (paymentData: {
    success: boolean
    message?: string
    paymentId?: string
  }) => void
  amount?: number
  productName?: string
}

export function CheckoutForm({ onSuccess, amount = 29.99, productName = "AI Image Generation - Pro Plan" }: CheckoutFormProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    saveCard: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardType, setCardType] = useState('unknown')

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
      setCardType(getCardType(formattedValue))
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    // Card number validation with Luhn
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required'
    } else if (!luhnCheck(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number'
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    } else if (formData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Invalid expiry date'
    } else {
      const [month, year] = formData.expiryDate.split('/')
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month'
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired'
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required'
    } else if (!validateCVV(formData.cvv, cardType)) {
      newErrors.cvv = `CVV must be ${cardType === 'amex' ? '4' : '3'} digits`
    }

    // Cardholder name validation
    if (!formData.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required'
    }

    // Address validation
    if (!formData.billingAddress) newErrors.billingAddress = 'Billing address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsProcessing(true)

    try {
      // Send to backend API
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount,
          productName,
          timestamp: new Date().toISOString(),
          demo: true
        }),
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()

      toast.success('Payment processed successfully!')
      
      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push('/dashboard/image-generator')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const fillDemoData = () => {
    setFormData({
      email: 'demo@example.com',
      cardNumber: DEMO_CARDS.visa,
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'John Demo',
      billingAddress: '123 Demo Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      saveCard: true
    })
    setCardType('visa')
    toast.info('Demo data filled. This is for testing purposes only.')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Demo Mode:</strong> This is a test checkout. Use the demo data button or enter any valid Luhn-passing card number.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complete Your Purchase</CardTitle>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <CardDescription>
            Enter your payment details to activate {productName}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{productName}</p>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <p className="text-2xl font-bold">${amount}</p>
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <Label>Payment Information</Label>
                {cardType !== 'unknown' && (
                  <Badge variant="secondary" className="ml-auto">
                    {cardType.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  maxLength={19}
                  className={cn(errors.cardNumber && "border-red-500")}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    maxLength={5}
                    className={cn(errors.expiryDate && "border-red-500")}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500">{errors.expiryDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder={cardType === 'amex' ? '1234' : '123'}
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    className={cn(errors.cvv && "border-red-500")}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className={cn(errors.cardholderName && "border-red-500")}
                />
                {errors.cardholderName && (
                  <p className="text-sm text-red-500">{errors.cardholderName}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Billing Address */}
            <div className="space-y-4">
              <Label>Billing Address</Label>

              <div className="space-y-2">
                <Input
                  placeholder="Street Address"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  className={cn(errors.billingAddress && "border-red-500")}
                />
                {errors.billingAddress && (
                  <p className="text-sm text-red-500">{errors.billingAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={cn(errors.city && "border-red-500")}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={cn(errors.state && "border-red-500")}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={cn(errors.zipCode && "border-red-500")}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Save Card Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveCard"
                checked={formData.saveCard}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, saveCard: checked as boolean }))}
              />
              <Label htmlFor="saveCard" className="text-sm font-normal">
                Save this card for future purchases
              </Label>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={fillDemoData}
            className="w-full"
          >
            Fill Demo Data
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay ${amount}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure payment powered by industry-standard encryption</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
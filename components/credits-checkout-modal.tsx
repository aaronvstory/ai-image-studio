"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Sparkles, Check, AlertCircle } from 'lucide-react'
import { getCreditPacks, confirmPayment, type CreditPack } from '@/lib/api-client'
import { formatCardNumber, luhnCheck, DEMO_CARDS } from '@/lib/payment-utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CreditsCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (credits: number) => void
}

export function CreditsCheckoutModal({ isOpen, onClose, onSuccess }: CreditsCheckoutModalProps) {
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([])
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDemoHint, setShowDemoHint] = useState(false)

  useEffect(() => {    if (isOpen) {
      loadCreditPacks()
    }
  }, [isOpen])

  async function loadCreditPacks() {
    const packs = await getCreditPacks()
    setCreditPacks(packs)
    // Auto-select popular pack
    const popularPack = packs.find(p => p.popular) || packs[0]
    setSelectedPack(popularPack)
  }

  const handleCardChange = (value: string) => {
    const formatted = formatCardNumber(value)
    setCardNumber(formatted)
    
    // Show demo hint if user is struggling
    if (value.length > 8 && !luhnCheck(formatted.replace(/\s/g, ''))) {
      setShowDemoHint(true)
    } else {
      setShowDemoHint(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPack) {
      toast.error('Please select a credit pack')
      return
    }
        
    // Validate card with Luhn algorithm
    const cleanCard = cardNumber.replace(/\s/g, '')
    if (!luhnCheck(cleanCard)) {
      toast.error('Invalid card number. Try: 4242 4242 4242 4242')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Process demo payment and add credits
      const result = await confirmPayment(selectedPack.credits, selectedPack.id)
      
      if (result.success) {
        toast.success(result.message || `Added ${selectedPack.credits} credits!`)
        onSuccess?.(result.new_balance || selectedPack.credits)
        onClose()
        setCardNumber('')
      } else {
        toast.error(result.error || 'Payment failed')
      }
    } catch (error) {
      toast.error('Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Add Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit pack to continue generating amazing images
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Credit Pack Selection */}
          <div className="space-y-3">
            <Label>Select Credit Pack</Label>
            <RadioGroup value={selectedPack?.id.toString()} onValueChange={(v) => {
              const pack = creditPacks.find(p => p.id.toString() === v)
              setSelectedPack(pack || null)
            }}>
              {creditPacks.map(pack => (
                <Card key={pack.id} className={cn(
                  "relative cursor-pointer transition-all",
                  selectedPack?.id === pack.id && "ring-2 ring-purple-500"
                )}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={pack.id.toString()} />
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {pack.name}
                            {pack.popular && (
                              <Badge variant="default" className="bg-purple-500">                                Most Popular
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pack.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${(pack.price_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pack.credits} credits
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Card Input */}
          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <div className="relative">
              <Input
                id="card"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}                onChange={(e) => handleCardChange(e.target.value)}
                maxLength={19}
                required
                className="pl-10"
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {showDemoHint && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>Demo mode: Try 4242 4242 4242 4242</span>
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Secure Demo Payment - No real charges
            </span>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedPack || !cardNumber || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay $${selectedPack ? (selectedPack.price_cents / 100).toFixed(2) : '0.00'}`}
          </Button>        </form>
      </DialogContent>
    </Dialog>
  )
}
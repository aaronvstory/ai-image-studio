'use client'

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function DemoAuthBanner() {
  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Quick Start - No Setup Required
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Get started instantly with Google Sign-In or create a new account
              </p>
            </div>
            
            <div className="space-y-2 bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Use Google Sign-In below for instant access
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1 ml-5">
                <li>• No phone verification needed</li>
                <li>• No email confirmation required</li>
                <li>• Start using the app immediately</li>
              </ul>
            </div>
            
            <div className="pt-2 border-t border-green-300 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Alternative:</span> Create a new account with email and password
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Note: Email sign-up may require verification depending on your settings
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
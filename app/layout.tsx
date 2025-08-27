import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CheckoutModalProvider } from '@/components/checkout-modal-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { Analytics } from '@vercel/analytics/next'
import { EnvValidator } from '@/components/env-validator'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Image Studio - Transform Images with AI",
  description: "Create stunning AI-generated images and transform photos with DALL-E 3. Get 1 free transformation instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false';
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CheckoutModalProvider>
            <ErrorBoundary>
              <EnvValidator />
              {(!authRequired || demoMode) && (
                <div className="bg-green-600/20 border-b border-green-600/30 px-4 py-2">
                  <div className="max-w-7xl mx-auto text-center">
                    <span className="text-green-400 text-sm font-medium">
                      🎯 Free Mode - No Login Required • Unlimited Generations
                    </span>
                  </div>
                </div>
              )}
              {children}
              <Analytics />
              <Toaster />
            </ErrorBoundary>
          </CheckoutModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

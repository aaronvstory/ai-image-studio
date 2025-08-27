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

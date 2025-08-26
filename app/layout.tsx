import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider";
import { CheckoutModalProvider } from '@/components/checkout-modal-provider'
import { ErrorBoundary } from '@/components/error-boundary'

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
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  // If no valid Clerk key or in demo mode, render without ClerkProvider
  if (!clerkPubKey || isDemoMode) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CheckoutModalProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </CheckoutModalProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  
  // With valid Clerk keys, use ClerkProvider
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CheckoutModalProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </CheckoutModalProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
# 🔐 Clerk Authentication Setup Guide

## 🚀 Current Status: Running in Keyless Mode

The application is currently running with Clerk's **keyless mode**, which provides:
- ✅ Fully functional authentication for development
- ✅ Hosted sign-in/sign-up pages at `https://fine-gecko-34.accounts.dev/`
- ✅ No API keys required for testing
- ✅ Perfect for development and demos

## ⚠️ For Production: You Need Real Clerk Keys

While keyless mode works great for development, **production deployment requires valid API keys from Clerk**.

## Quick Setup (5 minutes)

### Step 1: Create a Free Clerk Account
1. Go to https://clerk.com
2. Click "Get started for free"
3. Sign up with your email

### Step 2: Create a New Application
1. After signing in, click "Create application"
2. Give it a name (e.g., "AI Image Studio")
3. Choose authentication methods:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ GitHub (optional)

### Step 3: Get Your API Keys
1. Go to "API Keys" in the left sidebar
2. Copy both keys:
   - **Publishable Key**: Starts with `pk_test_` or `pk_live_`
   - **Secret Key**: Starts with `sk_test_` or `sk_live_`

### Step 4: Update Your .env.local File
Replace the commented lines in `.env.local` with your actual keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE

# Turn off demo mode
NEXT_PUBLIC_DEMO_MODE=false
```

### Step 5: Restart the Development Server
```bash
# Kill the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ What You'll Get

Once configured with real Clerk keys:
- **Login/Sign Up buttons** in the top right header
- **Clerk hosted sign-in/sign-up pages** (not custom modals)
- **User profile management** with UserButton
- **Protected routes** for /dashboard
- **User metadata tracking** for free tier and payments
- **Session management** across the app

## 🎯 Current Implementation Status

The app is **fully configured** for Clerk authentication:
- ✅ ClerkProvider in app/layout.tsx
- ✅ Sign In/Sign Up pages at `/sign-in` and `/sign-up`
- ✅ Middleware protection for routes
- ✅ UserButton component in header
- ✅ SignedIn/SignedOut conditional rendering

## ❌ Why It's Not Working Now

The test keys in the repo are **invalid placeholders**. Clerk requires real keys from your account to function.

## 🚀 Alternative: Demo Mode

If you want to test the app without authentication:
1. Keep `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
2. The app will work without Clerk (no auth features)

## Need Help?

- Clerk Documentation: https://clerk.com/docs
- Clerk Dashboard: https://dashboard.clerk.com
- Support: https://clerk.com/support

---

**Note**: The invalid test keys have been removed. You must use your own Clerk keys for authentication to work.
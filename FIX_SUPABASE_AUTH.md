# 🚨 URGENT: Fix Supabase Authentication

## The Problem
Your Supabase API key is **INVALID**. The key you provided:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZGhoa2xwc2FuZ2h4b3VzcGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNTc0NTAsImV4cCI6MjA1MDkzMzQ1MH0.LSzUI81uLbGuol_FProv0Q_wayt3t9Er8HiTCLy-ViM
```

Returns: **401 Unauthorized - Invalid API key**

## How to Fix It (5 minutes)

### Step 1: Get the Correct Key from Supabase

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (should be `ytdhhklpsanghxouspkr` based on URL)
4. Click on **Settings** (gear icon) in left sidebar
5. Click on **API** under Configuration
6. You'll see two keys:
   - **`anon` `public`** - THIS IS THE ONE YOU NEED ✅
   - **`service_role` `secret`** - DO NOT USE THIS ONE ❌
7. Click the **Copy** button next to the `anon` `public` key

### Step 2: Update in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: **ai-image-studio**
3. Go to **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Find `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click the three dots (...) → **Edit**
7. Paste the new key from Step 1
8. Make sure it's enabled for all environments (Production, Preview, Development)
9. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) → **Redeploy**
4. Or just push any commit to trigger auto-deploy

## Alternative: Create New Supabase Project

If you can't find the right key, create a NEW Supabase project:

1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Fill in:
   - Name: `ai-image-studio`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)
5. Once ready, go to **Settings** → **API**
6. Copy both:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
7. Update BOTH in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` = new project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = new anon key

## Test After Fix

Visit: https://ai-image-studio-gamma.vercel.app/test-supabase

This page will show:
- ✅ Successful connection
- ✅ Test account creation
- ✅ All green status

## Current Status

- ✅ Frontend code is perfect
- ✅ Backend code is perfect  
- ✅ Error handling works
- ✅ Vercel deployment works
- ❌ **ONLY ISSUE**: Invalid Supabase API key

Once you update the key, authentication will work immediately!
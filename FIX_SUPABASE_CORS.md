# 🚨 CRITICAL FIX: Supabase Invalid API Key (401) in Browser

## The Problem
- API key works from Node.js ✅
- API key FAILS from browser ❌
- Error: "AuthApiError: Invalid API key" with 401 Unauthorized

## Root Cause: Supabase URL Configuration

Supabase is blocking requests from `https://ai-image-studio-gamma.vercel.app` because the **Site URL** setting doesn't match.

## IMMEDIATE FIX (2 minutes)

### Go to Supabase Dashboard:

1. **Navigate to**: https://supabase.com/dashboard/project/ytdhhklpsanghxouspkr/auth/url-configuration

2. **Update these EXACT settings**:

   **Site URL** (MUST be exact):
   ```
   https://ai-image-studio-gamma.vercel.app
   ```

   **Redirect URLs** (add ALL of these):
   ```
   https://ai-image-studio-gamma.vercel.app/**
   https://ai-image-studio-gamma.vercel.app/auth/callback
   https://ai-image-studio-gamma.vercel.app/dashboard
   http://localhost:3500/**
   http://localhost:3000/**
   ```

3. **Click "Save"** at the bottom

### Alternative: If Site URL is Already Set

Check if you have multiple Supabase projects and the keys got mixed up:

1. Go to: https://supabase.com/dashboard
2. Make sure you're in project `ytdhhklpsanghxouspkr`
3. Go to **Settings** → **API**
4. Copy the **anon public** key again
5. Make sure it matches what's in Vercel

### Verify in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches EXACTLY

## Why This Happens

Supabase enforces domain restrictions for security. When the browser makes a request from `ai-image-studio-gamma.vercel.app`, Supabase checks:
- Is this domain in the Site URL?
- Is the API key valid for this project?

If the Site URL doesn't match, it returns "Invalid API key" even though the key is correct.

## Test After Fix

1. Go to https://ai-image-studio-gamma.vercel.app/auth/signup
2. Enter email: test@gmail.com
3. Enter password: Test123!
4. Should work immediately

## Still Not Working?

Double-check in Supabase:
- **Authentication** → **Providers** → **Email** → Enabled ✅
- **Authentication** → **Policies** → Allow all operations (for testing)

The fix is in the Supabase dashboard URL configuration, NOT in the code!
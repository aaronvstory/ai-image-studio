# Supabase Configuration for ai-image-studio-gamma.vercel.app

## IMPORTANT: Configure Supabase Dashboard Settings

Your authentication is working backend-side but may be blocked by Supabase security settings. You need to configure these:

### 1. Site URL Configuration
Go to: https://supabase.com/dashboard/project/ytdhhklpsanghxouspkr/auth/url-configuration

Set:
- **Site URL**: `https://ai-image-studio-gamma.vercel.app`

### 2. Redirect URLs
Add these to **Redirect URLs** (one per line):
```
https://ai-image-studio-gamma.vercel.app/**
https://ai-image-studio-gamma.vercel.app/auth/callback
https://ai-image-studio-gamma.vercel.app/dashboard
http://localhost:3500/**
```

### 3. Email Auth Settings
Go to: https://supabase.com/dashboard/project/ytdhhklpsanghxouspkr/auth/providers

Under **Email** provider:
- ✅ Enable Email provider
- ✅ Enable "Confirm email" (can disable for testing)
- ✅ Enable "Secure email change"
- ✅ Enable "Secure password change"

### 4. Disable Email Confirmation (For Testing)
If you want instant login without email verification:

1. Go to **Auth** → **Providers** → **Email**
2. Toggle OFF "Confirm email"
3. Save changes

### 5. SMTP Configuration (Optional but Recommended)
Go to: https://supabase.com/dashboard/project/ytdhhklpsanghxouspkr/settings/smtp

If using default Supabase SMTP:
- Limited to 4 emails per hour
- May cause delays

For production, configure custom SMTP (SendGrid, Postmark, etc.)

### 6. Check Auth Logs
Go to: https://supabase.com/dashboard/project/ytdhhklpsanghxouspkr/auth/logs

Check for any failed authentication attempts to debug issues.

## Test After Configuration

1. Visit: https://ai-image-studio-gamma.vercel.app/test-supabase
2. Click "Test Supabase Connection"
3. Should see success message

Or test signup directly:
1. Visit: https://ai-image-studio-gamma.vercel.app/auth/signup
2. Use a real email (not @example.com)
3. Use password at least 6 characters
4. Should redirect to dashboard after signup

## Current Status
- ✅ Backend authentication WORKS (tested via API)
- ✅ Supabase key is VALID
- ✅ User creation succeeds with valid emails
- ⚠️ Need to configure Supabase dashboard settings above
- ⚠️ Cannot use @example.com emails (blocked by Supabase)

## Quick Debug Commands

Test from command line:
```bash
curl -X POST https://ai-image-studio-gamma.vercel.app/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"Test123!"}'
```

This should return success if everything is configured correctly.
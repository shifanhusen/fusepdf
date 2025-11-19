# 🔥 URGENT: Fix Google Sign-In on Vercel Deployment

## Problem
Google Sign-In works locally (`localhost:5173`) but fails on Vercel (`www.innovitecho.com/qr-menu/`).

## Root Cause
The production domain `www.innovitecho.com` is not in Firebase's authorized domains list.

## ✅ IMMEDIATE FIX - Add Authorized Domain

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/innovitech-tools/authentication/settings
2. Click on **"Authorized domains"** tab

### Step 2: Add Your Production Domain
Click **"Add domain"** and add:
```
www.innovitecho.com
```

Also add (if not already present):
```
innovitecho.com
```

### Step 3: Save Changes
Click **"Add"** to save the domain.

## 🚀 Test After Adding Domain
1. Visit: https://www.innovitecho.com/qr-menu/
2. Click "Sign in with Google"  
3. Should work immediately!

## Current Authorized Domains (Check These)
Firebase likely has these domains authorized:
- `localhost` (for local development)
- `innovitech-tools.firebaseapp.com` (Firebase hosting domain)
- Possibly other domains from your previous projects

## Additional Security (Optional)
If you want to be extra secure, you can also add:
- `innovitecho.com` (without www)
- `vercel.app` domain (if using Vercel preview deployments)

## Verification
After adding the domain, Google Sign-In should work immediately on:
- ✅ Local: http://localhost:5173/qr-menu/
- ✅ Production: https://www.innovitecho.com/qr-menu/

---

**Note**: This is a Firebase Console setting change - no code changes needed. The fix takes effect immediately after adding the domain.
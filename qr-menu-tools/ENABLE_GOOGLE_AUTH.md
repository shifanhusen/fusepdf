# Enable Google Authentication via Firebase Console

Since Firebase CLI requires interactive setup, please follow these quick steps to enable Google Authentication:

## Method 1: Firebase Console (Recommended - 2 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/project/innovitech-tools/authentication/providers

2. **Click on "Google"** in the Sign-in providers list

3. **Toggle "Enable"** at the top

4. **Add Support Email**: innovitech0@gmail.com

5. **Click "Save"**

That's it! Google authentication is now enabled.

## Method 2: Verify if Already Enabled

Your Firebase project might already have Google auth enabled from TurboType Rally. Check:

1. Go to: https://console.firebase.google.com/project/innovitech-tools/authentication/providers
2. Look for "Google" - if it shows "Enabled", you're good to go!

## Test Authentication

After enabling, test your QR Menu Studio:

1. Go to: http://localhost:5173/qr-menu/
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected to Dashboard!

## Troubleshooting

If you see "auth/unauthorized-domain":
- Go to Authentication → Settings → Authorized domains
- Make sure `localhost` is in the list
- For production, add your domain

---

**Note**: The Firebase configuration has already been updated in your code to use the `innovitech-tools` project with Google authentication enabled.

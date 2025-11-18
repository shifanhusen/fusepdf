# Enable Firestore for QR Menu Studio

Your Firebase configuration has been updated to use your existing **innovitech-tools** Firebase project.

## Quick Setup Steps:

### 1. Enable Firestore Database (if not already enabled)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **innovitech-tools**
3. Click **Firestore Database** in left sidebar
4. If not already created, click **"Create database"**
5. Choose **"Start in production mode"** (we'll add custom rules)
6. Select region: **asia-southeast1** (same as your Realtime DB)
7. Click **"Enable"**

### 2. Set Firestore Security Rules

1. In **Firestore Database**, go to the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // QR Menu Studio - menus collection
    match /menus/{menuId} {
      // Anyone can read menus (public view for customers)
      allow read: if true;
      
      // Only authenticated users can create menus
      allow create: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
      
      // Only menu owners can update/delete their menus
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
    
    // Keep existing rules for other collections (contacts, etc.)
    match /contacts/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

### 3. Verify Google Authentication is Enabled

1. Go to **Authentication** → **Sign-in method**
2. Make sure **Google** is enabled
3. If not:
   - Click on **Google**
   - Toggle **Enable**
   - Add your support email
   - Click **"Save"**

### 4. Add localhost to Authorized Domains (should already be there)

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Verify `localhost` is in the list
3. If deploying to production later, add your domain here

### 5. Test the Application

The dev server should automatically reload. Now try:

1. Open: http://localhost:5173/qr-menu/
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. You should be redirected to the Dashboard!

## Database Structure

Your Firestore database will have this structure:

```
innovitech-tools (Firebase Project)
├── Realtime Database
│   └── typing-rally data
│
└── Firestore Database
    ├── contacts (PDF Tools)
    └── menus (QR Menu Studio) ← NEW
        ├── menu-abc123
        │   ├── id: "menu-abc123"
        │   ├── userId: "user123"
        │   ├── restaurantName: "My Restaurant"
        │   ├── template: "elegant-minimal"
        │   ├── sections: [...]
        │   └── ...
        └── menu-def456
            └── ...
```

## Notes

- ✅ **Same Firebase project** as TurboType Rally
- ✅ **Firestore** for QR Menu Studio (not Realtime DB)
- ✅ **Google Authentication** shared across all apps
- ✅ **No conflicts** - Different databases for different apps

## Troubleshooting

### "Missing or insufficient permissions"
→ Make sure you've published the Firestore security rules

### "Firebase: No Firebase App"
→ Restart the dev server: `Ctrl+C` then `npm run dev`

### "auth/unauthorized-domain"
→ Add your domain to Authorized domains in Firebase Console

---

**You're all set!** 🎉 Try logging in now!

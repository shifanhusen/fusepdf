# QR Menu Studio - Firebase Setup Guide

## 🔥 Firebase Configuration

Before running the application, you need to set up Firebase and configure it.

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "qr-menu-studio")
4. Follow the setup wizard

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Google** sign-in method:
   - Click on "Google"
   - Toggle "Enable"
   - Add your support email
   - Click "Save"

### Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click "Enable"

### Step 4: Set Firestore Security Rules

Once your database is created, update the security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to menus
    match /menus/{menuId} {
      allow read: if true;
      
      // Allow authenticated users to create menus
      allow create: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
      
      // Allow users to update/delete only their own menus
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### Step 6: Update Your Application

Open `src/firebase/config.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 7: Add Authorized Domains (for production)

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)

## 🗄️ Firestore Database Structure

Your data will be stored in the following structure:

```
menus (collection)
  ├── {menuId} (document)
  │   ├── id: string
  │   ├── userId: string (Firebase Auth UID)
  │   ├── restaurantName: string
  │   ├── logoUrl: string (optional)
  │   ├── themeColor: string
  │   ├── currency: string
  │   ├── template: string (elegant-minimal | modern-grid | classic-list | photo-showcase | compact-cards)
  │   ├── sections: array
  │   │   └── {
  │   │       id: string,
  │   │       name: string,
  │   │       items: array
  │   │         └── {
  │   │             id: string,
  │   │             name: string,
  │   │             description: string,
  │   │             price: number,
  │   │             tags: array,
  │   │             imageUrl: string
  │   │           }
  │   │     }
  │   ├── createdAt: timestamp
  │   ├── updatedAt: timestamp
  │   ├── editKey: string
  │   ├── deleted: boolean (optional)
  │   └── deletedAt: timestamp (optional)
```

## 🚀 Running the Application

After configuring Firebase:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔐 Security Best Practices

1. **Never commit** your Firebase config with real credentials to public repos
2. Use **environment variables** for sensitive data in production
3. Review and update **Firestore security rules** before going live
4. Enable **App Check** for production apps
5. Monitor **Firebase usage** in the console

## 📱 Features

- **Google Authentication** - Secure user login
- **5 Beautiful Templates** - Choose from elegant, modern, classic, photo, or compact designs
- **Real-time Updates** - Changes sync instantly with Firestore
- **QR Code Generation** - Download QR codes as PNG or SVG
- **Mobile-First** - Optimized for all devices
- **Dark Mode Support** - Template-specific themes

## 🆘 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to authorized domains in Firebase Console

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Ensure the user is authenticated

### "Firebase config is not defined"
- Make sure you've updated `src/firebase/config.ts` with your credentials

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## 🤝 Support

For issues or questions, please check the Firebase Console logs and browser console for detailed error messages.

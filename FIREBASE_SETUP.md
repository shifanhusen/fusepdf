# 🔥 Firebase Setup Guide for TurboType Rally

## Option 1: Quick Setup via Firebase Console (Recommended - 5 minutes)

This is the easiest way to get started without installing CLI tools.

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Project Setup**
   - Project name: `innovitech-tools` (or any name you prefer)
   - Click "Continue"
   - Disable Google Analytics (optional, can enable later)
   - Click "Create project"
   - Wait for project creation (~30 seconds)
   - Click "Continue"

### Step 2: Enable Realtime Database

1. **Navigate to Database**
   - In left sidebar, click "Build" → "Realtime Database"
   - Click "Create Database"

2. **Choose Location**
   - Select your region (e.g., `us-central1` for US, `europe-west1` for Europe)
   - Click "Next"

3. **Security Rules**
   - Select "Start in **test mode**" (for development)
   - Click "Enable"
   - Your database is now created!

### Step 3: Get Your Firebase Config

1. **Add Web App**
   - Click the gear icon (⚙️) next to "Project Overview" → "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon `</>` to "Add app"
   
2. **Register App**
   - App nickname: `TurboType Rally` or `typing-rally`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - You'll see the Firebase configuration object
   - Copy the entire `firebaseConfig` object
   - Click "Continue to console"

### Step 4: Update Your Code

Open `typing-rally/app.js` and replace the config (lines 8-15):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 5: Set Database Rules (Development)

1. **Go to Database Rules**
   - In Firebase Console → Realtime Database → Rules tab
   
2. **Paste These Rules**
   ```json
   {
     "rules": {
       "rooms": {
         "$roomId": {
           ".read": true,
           ".write": true,
           ".indexOn": ["status", "createdAt"]
         }
       }
     }
   }
   ```

3. **Click "Publish"**

### Step 6: Test Locally

```bash
# Navigate to your project
cd C:\Users\shifa\source\FusePDF

# Install a simple HTTP server if you don't have one
# Using Python (if installed):
python -m http.server 8080

# OR using PHP (if installed):
php -S localhost:8080

# Then open in browser:
# http://localhost:8080/typing-rally/
```

### Step 7: Deploy to Vercel

```bash
# Commit your changes
git add typing-rally/app.js
git commit -m "config: add Firebase credentials"
git push origin main

# Vercel will auto-deploy!
# Access at: https://innovitecho.com/typing-rally/
```

---

## Option 2: Using Firebase CLI (Advanced)

If you have Node.js installed, you can use Firebase CLI for more control.

### Prerequisites Check

```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version
```

If not installed, download from: https://nodejs.org/ (LTS version recommended)

### Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Login to Firebase

```bash
# This will open browser for authentication
firebase login
```

### Initialize Firebase in Your Project

```bash
# Navigate to project root
cd C:\Users\shifa\source\FusePDF

# Initialize Firebase
firebase init

# Select:
# - Realtime Database (press Space to select, Enter to continue)
# - Use existing project → select your project
# - Database rules file: database.rules.json (default)
# - Don't overwrite if exists
```

### Create Database via CLI

```bash
# This creates the database in your Firebase project
firebase database:set /rooms/test '{"status":"waiting"}' --project your-project-id

# Remove test data
firebase database:remove /rooms/test --project your-project-id
```

### Deploy Database Rules

Create `database.rules.json` in project root:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status", "createdAt"]
      }
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only database
```

---

## Production Database Rules (After Testing)

Once you're ready for production, update to more secure rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists() || data.child('players').child(auth.uid).exists()",
        ".indexOn": ["status", "createdAt"],
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || data.parent().parent().child('hostId').val() === auth.uid",
            ".validate": "newData.hasChildren(['name', 'color', 'progress', 'wpm', 'finished'])"
          }
        },
        "status": {
          ".write": "data.parent().child('hostId').val() === auth.uid"
        }
      }
    }
  }
}
```

**Note:** Production rules require Firebase Authentication to be set up.

---

## Troubleshooting

### Error: "Firebase not defined"
→ Check that Firebase CDN scripts are loading in `index.html`
→ Check internet connection

### Error: "Permission denied"
→ Database rules are too restrictive
→ Use test mode rules during development

### Error: "Database URL is required"
→ Make sure `databaseURL` in config is correct
→ Format: `https://PROJECT-ID-default-rtdb.firebaseio.com`

### Players not syncing
→ Check browser console for errors
→ Verify Firebase config is correct
→ Check database rules allow reads/writes

### "npm not recognized"
→ Install Node.js from https://nodejs.org/
→ Restart terminal after installation
→ Add Node.js to PATH if needed

---

## Firebase Console Quick Links

After setup, bookmark these:

- **Console Home**: https://console.firebase.google.com/
- **Your Project**: https://console.firebase.google.com/project/YOUR-PROJECT-ID/overview
- **Database**: https://console.firebase.google.com/project/YOUR-PROJECT-ID/database
- **Database Rules**: https://console.firebase.google.com/project/YOUR-PROJECT-ID/database/rules

---

## Monitoring Your Game

### View Live Data

1. Go to Firebase Console → Realtime Database → Data tab
2. You'll see active rooms under `/rooms/`
3. Expand to see players, progress, etc.

### View Database Usage

1. Go to Realtime Database → Usage tab
2. Monitor:
   - Connections
   - Bandwidth
   - Storage

### Free Tier Limits

Firebase Free (Spark) Plan includes:
- ✅ 1 GB stored data
- ✅ 10 GB/month downloaded
- ✅ 100 simultaneous connections
- ✅ Perfect for your typing game!

---

## Security Checklist

- [ ] Firebase config added to `app.js`
- [ ] Realtime Database created
- [ ] Database rules published
- [ ] Test mode works locally
- [ ] Production rules planned
- [ ] Old rooms cleanup strategy (optional)
- [ ] Rate limiting considered (optional)

---

## Next Steps

1. ✅ Complete Step 1-4 above (5 minutes)
2. ✅ Test locally in browser
3. ✅ Commit and push to GitHub
4. ✅ Test on production (innovitecho.com/typing-rally/)
5. 🎮 Share room codes and race with friends!

---

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs/database
- Firebase CLI Docs: https://firebase.google.com/docs/cli
- Node.js Download: https://nodejs.org/

**You're almost there! Just follow Option 1 and you'll be racing in 5 minutes! 🏎️💨**

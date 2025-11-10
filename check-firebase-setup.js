// Quick Firebase Setup Checker
// Run this to verify your Firebase configuration

console.log('🔥 Firebase Setup Checker for TurboType Rally\n');

// Check 1: Node.js version
console.log('1️⃣ Checking Node.js...');
console.log('   Node version:', process.version);
console.log('   ✅ Node.js is installed!\n');

// Check 2: Try to load Firebase config
console.log('2️⃣ Checking Firebase config...');
try {
    const fs = require('fs');
    const path = require('path');
    
    const appJsPath = path.join(__dirname, 'typing-rally', 'app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Check if config has been updated
    if (appJsContent.includes('YOUR_API_KEY_HERE')) {
        console.log('   ⚠️  Firebase config NOT set up yet');
        console.log('   👉 Please follow FIREBASE_SETUP.md to get your config\n');
    } else if (appJsContent.includes('apiKey:')) {
        console.log('   ✅ Firebase config found in app.js!\n');
        
        // Extract project ID if possible
        const projectIdMatch = appJsContent.match(/projectId:\s*["']([^"']+)["']/);
        if (projectIdMatch) {
            console.log('   Project ID:', projectIdMatch[1]);
        }
        
        const databaseURLMatch = appJsContent.match(/databaseURL:\s*["']([^"']+)["']/);
        if (databaseURLMatch) {
            console.log('   Database URL:', databaseURLMatch[1]);
        }
        console.log('');
    }
} catch (error) {
    console.log('   ❌ Error reading app.js:', error.message, '\n');
}

// Check 3: Firebase CLI
console.log('3️⃣ Checking Firebase CLI...');
const { execSync } = require('child_process');
try {
    const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' });
    console.log('   ✅ Firebase CLI installed:', firebaseVersion.trim());
} catch (error) {
    console.log('   ⚠️  Firebase CLI not installed');
    console.log('   Install with: npm install -g firebase-tools\n');
}

// Check 4: Git status
console.log('4️⃣ Checking Git status...');
try {
    const gitStatus = execSync('git status --porcelain typing-rally/', { encoding: 'utf8' });
    if (gitStatus.trim()) {
        console.log('   ⚠️  Uncommitted changes in typing-rally/');
        console.log(gitStatus);
    } else {
        console.log('   ✅ No uncommitted changes\n');
    }
} catch (error) {
    console.log('   ⚠️  Git check failed\n');
}

// Summary
console.log('📋 Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Next steps:');
console.log('1. Follow FIREBASE_SETUP.md (Option 1) to get Firebase config');
console.log('2. Update typing-rally/app.js with your config');
console.log('3. Test locally: python -m http.server 8080');
console.log('4. Open: http://localhost:8080/typing-rally/');
console.log('5. Commit and push to deploy!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎮 Ready to race? Visit: https://innovitecho.com/typing-rally/');
console.log('📖 Full docs: See FIREBASE_SETUP.md and TURBOTYPE_SETUP.md\n');

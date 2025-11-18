# Vercel Deployment Guide for QR Menu Studio

## Fixed Issues for Vercel Deployment

### 1. **Vercel Configuration**
- Added `vercel.json` for proper SPA routing
- Configured build settings and static file serving
- Added fallback routing to handle client-side navigation

### 2. **Vite Configuration Updates**
- Removed `/qr-menu/` base path (not needed for Vercel)
- Changed output directory from `../public/qr-menu` to `dist`
- Updated for standard Vercel deployment structure

### 3. **React Router Configuration**
- Removed `basename="/qr-menu"` from BrowserRouter
- Fixed client-side routing for production deployment
- Ensures all routes work correctly on Vercel

## Deployment Steps

### 1. **Vercel Dashboard Setup**
1. Import your GitHub repository (`shifanhusen/fusepdf`)
2. Set root directory to `qr-menu-tools/`
3. Framework preset: Vite
4. Build command: `npm run build`
5. Output directory: `dist`

### 2. **Environment Variables (if needed)**
If you need to use environment variables for Firebase config:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id  
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. **Build Verification**
- ✅ Build completes successfully locally
- ✅ All assets are generated in `dist/` folder
- ✅ Routes properly configured for SPA
- ✅ Firebase integration maintained

## Files Modified for Vercel

- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Updated build settings
- `src/App.tsx` - Removed basename from router  
- `package.json` - Added vercel-build script
- `.env.example` - Environment variable template

## Expected Result

After deployment, your QR Menu Studio will be available at:
- Main app: `https://your-vercel-url.vercel.app/`
- Login: `https://your-vercel-url.vercel.app/`  
- Dashboard: `https://your-vercel-url.vercel.app/dashboard`
- Creator: `https://your-vercel-url.vercel.app/creator`
- Menu view: `https://your-vercel-url.vercel.app/m/[menuId]`

All routes will work correctly with the SPA configuration.
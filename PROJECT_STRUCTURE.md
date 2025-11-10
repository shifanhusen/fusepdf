# Innovitech Project Structure

This repository hosts the **InnoviTecho** website and multiple tool sub-projects.

## 📁 Project Structure

```
Innovitech/
├── index.html              # Main landing page at innovitecho.com/
├── css/
│   └── style.css          # Shared styles for landing page
├── js/
│   └── theme.js           # Shared theme toggle (dark/light mode)
├── assets/
│   ├── icons/             # Shared icons
│   └── images/            # Shared images (logo, etc.)
│
├── pdf-tools/             # FusePDF Tool (Complete PDF toolkit)
│   ├── index.html         # PDF tools main page
│   ├── about.html
│   ├── contact.html
│   ├── privacy-policy.html
│   ├── terms-of-service.html
│   ├── admin.html
│   ├── css/
│   │   └── style.css      # PDF tools specific styles
│   ├── js/
│   │   ├── app.js         # PDF processing logic
│   │   └── theme.js       # Theme toggle
│   ├── assets/            # PDF tools specific assets
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
│
├── json-converter/        # (Coming Soon) JSON/XML/YAML converter
├── image-compress/        # (Coming Soon) Image compression tool
├── qr-generator/          # (Coming Soon) QR code generator
├── url-shortener/         # (Coming Soon) URL shortening service
│
├── api/                   # Backend API routes (contact form, etc.)
├── vercel.json           # Vercel deployment configuration
└── package.json          # Project dependencies
```

## 🚀 URL Structure

- **Main Landing Page**: `https://innovitecho.com/`
- **PDF Tools**: `https://innovitecho.com/pdf-tools/`
- **Future Tools**: 
  - `https://innovitecho.com/json-converter/`
  - `https://innovitecho.com/image-compress/`
  - `https://innovitecho.com/qr-generator/`
  - `https://innovitecho.com/url-shortener/`

## 🛠️ Adding New Tools

To add a new tool sub-project:

1. **Create a new folder** in the root directory (e.g., `json-converter/`)
2. **Add tool files**:
   ```
   tool-name/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── app.js
   │   └── theme.js
   └── assets/
   ```
3. **Update main `index.html`** - Add a tool card in the tools grid section
4. **Update `vercel.json`** - Add rewrite rules if needed (usually automatic)
5. **Add navigation link** - Add "← InnoviTecho Home" link in tool pages:
   ```html
   <a href="/" class="nav-link" style="color: var(--primary-color);">← InnoviTecho Home</a>
   ```

## 🎨 Shared Resources

- **CSS**: Root `/css/style.css` for landing page, each tool has its own CSS
- **Theme**: Each tool can copy `/js/theme.js` for dark/light mode support
- **Assets**: Tools should have their own `/assets` folder for isolation

## 📝 Development Notes

- Each tool is **self-contained** - all dependencies inside its folder
- Tools can share the same **visual style** but maintain separate code
- All tools should work **offline** and **privacy-first** (browser-based processing)
- Use **relative paths** within each tool's folder
- Link back to main landing page with `href="/"`

## 🔧 Deployment

The project auto-deploys to Vercel on push to `main` branch:
- Main page serves from root
- Sub-tools accessible via their folder paths
- Vercel handles routing automatically for clean URLs

## 📦 Dependencies

- **PDF Tools**: pdf.js, pdf-lib
- **Future Tools**: Will have their own specific dependencies

---

**Repository**: `shifanhusen/fusepdf` (to be renamed to `innovitech`)
**Live Site**: https://innovitecho.com/

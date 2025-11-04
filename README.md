# 🔗 FusePDF - Free Online PDF Tools

**A completely free, privacy-first, browser-based PDF tool for splitting, merging, and compressing PDF files.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shifanhusen/fusepdf)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shifanhusen/fusepdf)

## ✨ Features

- **🔒 100% Private**: All processing happens locally in your browser - no file uploads
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🌙 Dark Mode**: Toggle between light and dark themes
- **⚡ Fast Processing**: Browser-based PDF manipulation using pdf-lib
- **📤 No Registration**: Use immediately without creating accounts
- **🆓 Completely Free**: No hidden costs, premium tiers, or limitations

### PDF Tools Available

- **Split PDF**: Extract specific pages or page ranges from PDF files
- **Merge PDFs**: Combine multiple PDF files into a single document
- **Compress PDF**: Reduce file size while maintaining quality
- **Drag & Drop**: Intuitive file handling with drag-and-drop support

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit [https://pdf-tool.vercel.app](https://pdf-tool.vercel.app) and start using the tools immediately.

### Option 2: Deploy Your Own Copy

#### Deploy to Vercel (Easiest)
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Deploy automatically
4. Your site will be live in minutes

#### Deploy to Netlify
1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. Deploy automatically
4. Configure custom domain if desired

#### Deploy to GitHub Pages
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Choose "Deploy from a branch" and select `main` branch
4. Your site will be available at `https://shifanhusen.github.io/fusepdf`

## 🛠️ Local Development

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Running Locally

1. **Clone the repository:**
```bash
git clone https://github.com/shifanhusen/fusepdf.git
cd fusepdf
```

2. **Serve the files:**
   
   **Option A: Using Python (if installed):**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js (if installed):**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: Using PHP (if installed):**
   ```bash
   php -S localhost:8000
   ```
   
   **Option D: Using VS Code Live Server:**
   - Install the "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. **Open in browser:**
   Navigate to `http://localhost:8000`

### File Structure
```
FusePDF/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styles with dark mode
├── js/
│   └── app.js          # Application logic
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── sw.js               # Service worker for offline support
├── vercel.json         # Vercel deployment config
├── _netlify.toml       # Netlify deployment config
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment
└── README.md           # This file
```

## 💰 Monetization Guide

### 1. Google AdSense Integration

#### Step 1: Apply for AdSense
1. Visit [Google AdSense](https://www.google.com/adsense/)
2. Apply with your deployed website URL
3. Wait for approval (can take 1-14 days)

#### Step 2: Add AdSense Code
Once approved, update the HTML file:

1. **Replace the AdSense placeholder in `index.html`:**
   ```html
   <!-- Replace YOUR_ADSENSE_ID with your actual publisher ID -->
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID" crossorigin="anonymous"></script>
   ```

2. **Add banner ads:**
   ```html
   <!-- Top Banner Ad -->
   <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-YOUR_ADSENSE_ID"
        data-ad-slot="BANNER_SLOT_ID"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```

3. **Optimal ad placements:**
   - Top banner (below header)
   - Bottom banner (before footer)
   - Sidebar ads (for wider screens)
   - In-content ads (between tool sections)

#### Step 3: Ad Optimization Tips
- Use responsive ad units
- Place ads above the fold
- Test different ad sizes (728x90, 300x250, 320x50 for mobile)
- Monitor performance in AdSense dashboard
- Enable auto ads for automatic optimization

### 2. Google Analytics Setup

#### Add GA4 Tracking
Replace the placeholder in `index.html`:

```html
<!-- Replace GA_MEASUREMENT_ID with your actual GA4 ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Track PDF Events
The app already includes event tracking for:
- PDF splits performed
- PDF merges completed
- PDF compressions done
- File downloads initiated

### 3. Additional Monetization Options

#### A. Donation/Support Links
Add "Buy Me a Coffee" or similar donation buttons:
```html
<a href="https://www.buymeacoffee.com/yourusername" class="donate-link">
    ☕ Support this project
</a>
```

#### B. Affiliate Marketing
- Link to PDF-related software or services
- Promote PDF editors or document management tools
- Partner with cloud storage providers

#### C. Premium Features (Optional)
Consider adding:
- Batch processing for multiple files
- Advanced compression algorithms
- PDF password protection/removal
- OCR text recognition
- Watermark addition/removal

### 4. SEO Optimization for Better Revenue

#### Content Marketing Strategy
Create blog posts to drive traffic:

**Suggested Blog Topics:**
1. "How to Split PDF Files Online for Free"
2. "Best Ways to Compress Large PDF Files"
3. "Merge Multiple PDFs Without Software"
4. "PDF Tools Comparison: Online vs Desktop"
5. "Privacy-Safe PDF Processing Tools"
6. "How to Reduce PDF File Size Without Losing Quality"

#### SEO Best Practices
- Target long-tail keywords like "free online PDF splitter"
- Create location-specific content ("PDF tools for students")
- Build backlinks from relevant websites
- Optimize for mobile search
- Improve page loading speed

#### Social Media Promotion
- Share on LinkedIn (target business users)
- Create YouTube tutorials
- Post on Reddit (r/productivity, r/webdev)
- Twitter threads about PDF tips

## 📈 Performance Optimization

### Speed Improvements
- All assets are optimized for fast loading
- Service worker enables offline functionality
- CSS and JS are minified in production
- Images are optimized and properly formatted

### SEO Features
- Comprehensive meta tags and Open Graph
- Structured data (JSON-LD) for rich snippets
- XML sitemap for search engines
- Robots.txt for crawler guidance
- Fast Core Web Vitals scores

### Security Features
- Content Security Policy headers
- XSS protection enabled
- No sensitive data transmission
- All processing happens client-side

## 🔧 Customization

### Branding
- Update the logo and colors in `css/style.css`
- Modify the CSS custom properties in `:root`
- Change the app name throughout `index.html`

### Adding Features
- Fork the repository
- Add new PDF tools in `js/app.js`
- Update the UI in `index.html`
- Style new components in `css/style.css`

### Custom Domain
For custom domains:
- **Vercel**: Add domain in project settings
- **Netlify**: Configure domain in site settings
- **GitHub Pages**: Add CNAME file with your domain

## 📊 Revenue Expectations

### Realistic Revenue Projections
Based on similar tools and traffic patterns:

**Month 1-3 (Building Traffic):**
- 100-500 daily visitors
- $5-25/month AdSense revenue
- Focus on SEO and content creation

**Month 4-6 (Growing Audience):**
- 500-2,000 daily visitors
- $25-100/month AdSense revenue
- Add affiliate partnerships

**Month 7-12 (Established Tool):**
- 1,000-5,000 daily visitors
- $100-500/month total revenue
- Consider premium features

**Year 2+ (Mature Product):**
- 5,000+ daily visitors
- $500-2,000/month potential
- Multiple revenue streams

### Factors Affecting Revenue
- **Traffic Quality**: Business users convert better
- **Geographic Location**: US/EU traffic earns more
- **Seasonal Patterns**: Higher usage during work periods
- **Competition**: PDF tool market is competitive
- **User Engagement**: Repeat users increase value

## 🆘 Support & Issues

### Common Issues

**Q: PDF processing fails**
A: Ensure you're using valid PDF files and your browser supports modern JavaScript features.

**Q: Files are too large**
A: Processing is limited by your device's memory. Try smaller files or split large PDFs first.

**Q: AdSense not showing ads**
A: Ensure your site is approved, ads.txt is configured, and you have sufficient traffic.

### Getting Help
- Check browser console for error messages
- Ensure you're using a modern browser
- Test with different PDF files
- Clear browser cache and cookies

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) - Excellent PDF manipulation library
- [Vercel](https://vercel.com/) - Free hosting platform
- [Netlify](https://netlify.com/) - Alternative hosting option
- The open-source community for inspiration and tools

---

**Made with ❤️ for the PDF community**

*Start earning from your own PDF tool today! Deploy this project and begin monetizing with Google AdSense.*
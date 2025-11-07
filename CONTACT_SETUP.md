# FusePDF Contact Form Setup

## Option 1: Formspree (Recommended)

### Setup Steps:
1. Go to [formspree.io](https://formspree.io) and sign up (free)
2. Create a new form
3. Copy your form endpoint URL (looks like: `https://formspree.io/f/xwkgvpqr`)
4. In `contact.html`, replace `YOUR_FORM_ID` with your actual form ID:
   ```html
   <form action="https://formspree.io/f/YOUR_ACTUAL_FORM_ID" method="POST">
   ```

### Benefits:
- ✅ Free tier: 50 submissions/month
- ✅ Submissions sent to your email
- ✅ Spam protection included
- ✅ Form analytics dashboard
- ✅ Export submissions as JSON/CSV

## Option 2: Netlify Forms

If hosting on Netlify:
1. Add `netlify` attribute to form tag:
   ```html
   <form name="contact" netlify>
   ```
2. Submissions appear in Netlify dashboard
3. Free tier: 100 submissions/month

## Option 3: EmailJS (Client-side only)

1. Sign up at [emailjs.com](https://emailjs.com)
2. Set up email service (Gmail, Outlook, etc.)
3. Replace form submission with EmailJS integration

## Current Backup System

The contact form automatically saves all submissions to browser's local storage as backup:

### To View Submissions (For Your Review):
1. Open browser console (F12)
2. Run: `viewStoredSubmissions()`
3. Or export as JSON: `exportSubmissions()`

### Local Storage Details:
- **Storage Key**: `fusepdf_submissions`
- **Max Entries**: 100 (auto-cleanup)
- **Data Includes**: Name, email, subject, message, timestamp, browser info

### Accessing Data:
```javascript
// View in console
viewStoredSubmissions()

// Export as downloadable JSON file
exportSubmissions()

// Manual access
JSON.parse(localStorage.getItem('fusepdf_submissions'))
```

## Form Status Messages

The form shows different status messages:
- **Info**: "Sending message..." (blue)
- **Success**: "Message sent successfully!" (green) 
- **Error**: "Failed to send message" (red)

## Troubleshooting

### If Formspree isn't set up:
- Form falls back to mailto: link
- Still saves to local storage
- User's email client opens

### To check submissions manually:
1. Open any page of your site
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Type: `viewStoredSubmissions()`
5. Press Enter to see all submissions

### To export submissions:
1. In console, type: `exportSubmissions()`
2. A JSON file will download with all submissions

## Security Notes

- Local storage data stays on user's browser
- Data cleared if user clears browser data
- Consider Formspree/Netlify for production use
- Local storage is mainly for backup/development

## Migration Path

1. **Start**: Use local storage (current setup)
2. **Production**: Set up Formspree (5 minute setup)
3. **Scale**: Upgrade to Formspree paid plan or custom backend

The current setup ensures no submissions are lost while you decide on the best solution for your needs.
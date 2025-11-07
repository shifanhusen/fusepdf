# FusePDF Vercel Deployment Guide

This guide explains how to deploy FusePDF entirely on Vercel Free, including serverless contact form storage using Vercel KV.

## 1. Prerequisites
- Vercel account (Free plan OK)
- GitHub repository connected to Vercel

## 2. Choose Storage: Vercel KV or Upstash Redis
You can use either storage provider transparently:

### Option A: Vercel KV
Dashboard: Storage -> KV -> Enable (environment vars injected automatically).

### Option B: Upstash Redis (what you enabled as "redis-green-notebook")
1. Create an Upstash Redis database (or use the one provisioned via Vercel integration).
2. Ensure these environment variables are set in Vercel Project Settings:
	- `UPSTASH_REDIS_REST_URL`
	- `UPSTASH_REDIS_REST_TOKEN`
3. The abstraction will automatically prefer Upstash if both variables exist.

## 3. Required Environment Variables
Add in Project Settings -> Environment Variables:
- `ADMIN_TOKEN` = A strong secret (used by admin panel)

If using Vercel KV, variables like `KV_REST_API_URL` / `KV_REST_API_TOKEN` are injected automatically.
If using Upstash, the two Redis REST vars must be present. No code changes required; the abstraction detects which to use.

## 4. API Routes
Deployed serverless functions:
- `POST /api/contact`  -> Stores submission
- `GET /api/submissions` -> List submissions (requires `X-Admin-Token`)
- `DELETE /api/submissions` -> Clear all (admin)
- `DELETE /api/submissions-old?days=30` -> Clear old (admin)

## 5. Frontend Integration
`contact.html` uses `fetch('/api/contact', ...)` and `admin.html` uses `fetch('/api/submissions', ...)`. No extra config needed for same-origin deployment.

## 6. Test Locally
```bash
npm install
vercel dev
```
Note: KV may not be fully functional locally unless using Vercel's preview setup. For local testing you can temporarily mock endpoints.

## 7. Deployment
Push to `main` (or your production branch) and Vercel builds automatically.

## 8. Security Notes
- Keep `ADMIN_TOKEN` secret (never hardcode token in repo)
- Optional: Add a basic login page that stores token in `sessionStorage` and hides admin UI until provided
- Do NOT expose submissions endpoint without token

## 9. Future Enhancements
- Pagination of submissions
- Email notifications (use Resend, Postmark, or SendGrid in another serverless function)
- Basic rate limiting (track IP hash counts in KV)

## 10. Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on admin page | Missing/incorrect token | Set `ADMIN_TOKEN` in Vercel and use it in admin field |
| 500 KV errors | KV not enabled | Enable KV storage in dashboard |
| Empty list | No submissions yet | Submit via contact form |
| CORS errors | Cross-origin fetch from different domain | Keep frontend + API in same Vercel project or configure custom domain |

## 11. Removing Legacy Code
You can delete `server.js`, `.env.example`, and `data/submissions.json` since persistence is now KV-based.

---
Deployment ready. Enjoy privacy-first PDF processing with serverless messaging storage using either KV or Upstash Redis.

# FusePDF Backend (Contact Form Storage)

This lightweight Node.js/Express server stores contact form submissions in a local JSON file (`data/submissions.json`). It enables the admin panel to fetch real submissions instead of relying on browser localStorage.

## Features
- POST /api/contact to store a submission (name, email, subject, message)
- GET /api/submissions (admin only) to list all submissions
- DELETE /api/submissions to clear all submissions (admin only)
- DELETE /api/submissions/old/:days to clear submissions older than N days (admin only)
- Simple token-based auth via `X-Admin-Token` header

## Setup

1. Copy `.env.example` to `.env` and set a strong `ADMIN_TOKEN`.
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```

## Environment Variables
- `ADMIN_TOKEN`: Required token for admin endpoints
- `PORT`: Server port (default 3001)
- `DATA_FILE`: Path to JSON file storing submissions

## Example Request (Store Submission)
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","subject":"feedback","message":"Great tool!"}'
```

## Example Request (Fetch Submissions)
```bash
curl http://localhost:3001/api/submissions -H "X-Admin-Token: YOUR_TOKEN"
```

## Security Notes
- Token-based auth is minimal; for production consider JWT, rate limiting, HTTPS.
- IP is captured from `req.ip`; do not rely on it for strong security.
- File writes are queued to prevent corruption under concurrent requests.

## Admin Panel Integration
The `admin.html` page has been updated to request data from `/api/submissions` with the admin token entered by the user.

## Next Steps / Improvements
- Add pagination for large submission sets
- Add basic login page instead of raw token input
- Encrypt the JSON file at rest if needed
- Add email notifications on new submissions

import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const submission = {
    id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
    name,
    email,
    subject,
    message,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'unknown'
  };

  try {
  await storage.lpush('contact:submissions', JSON.stringify(submission));
    return res.status(201).json({ success: true });
  } catch (e) {
    console.error('KV write error', e);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}

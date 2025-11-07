import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const daysParam = req.query?.days || req.query?.d || '30';
  const days = parseInt(Array.isArray(daysParam) ? daysParam[0] : daysParam, 10) || 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
  const raw = await storage.lrange('contact:submissions', 0, -1);
    const submissions = raw.map(r => JSON.parse(r));
    const filtered = submissions.filter(s => new Date(s.timestamp).getTime() >= cutoff);

  await storage.del('contact:submissions');
    if (filtered.length) {
  await storage.rpush('contact:submissions', ...filtered.map(f => JSON.stringify(f)));
    }

    return res.status(200).json({ success: true, removed: submissions.length - filtered.length, remaining: filtered.length });
  } catch (e) {
    console.error('KV prune error', e);
    return res.status(500).json({ error: 'Failed to clear old submissions' });
  }
}

import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
  const raw = await storage.lrange('contact:submissions', 0, -1);
      const submissions = raw.map((r) => JSON.parse(r));
      return res.status(200).json({ submissions });
    } catch (e) {
      console.error('KV read error', e);
      return res.status(500).json({ error: 'Failed to read submissions' });
    }
  }

  if (req.method === 'DELETE') {
    try {
  await storage.del('contact:submissions');
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('KV delete error', e);
      return res.status(500).json({ error: 'Failed to clear submissions' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

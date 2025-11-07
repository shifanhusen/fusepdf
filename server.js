import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'CHANGE_ME_SECRET';
const DATA_FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'submissions.json');

app.use(cors({
  origin: true,
  credentials: false
}));
app.use(express.json());

// Simple in-memory write queue to avoid race conditions
let writeQueue = Promise.resolve();

function readSubmissions() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read submissions:', err);
    return [];
  }
}

function writeSubmissions(submissions) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(submissions, null, 2);
    fs.writeFile(DATA_FILE, json, 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const submission = {
    id: uuidv4(),
    name,
    email,
    subject,
    message,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || req.socket.remoteAddress || null
  };

  // Queue write to avoid concurrent file access
  writeQueue = writeQueue.then(async () => {
    const submissions = readSubmissions();
    submissions.push(submission);
    await writeSubmissions(submissions);
  });

  try {
    await writeQueue; // ensure write finished
    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error('Error writing submission:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Get all submissions (admin only)
app.get('/api/submissions', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const submissions = readSubmissions();
  res.json({ submissions });
});

// Delete all submissions (admin only)
app.delete('/api/submissions', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await writeSubmissions([]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear submissions' });
  }
});

// Delete old submissions > days (admin)
app.delete('/api/submissions/old/:days', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const days = parseInt(req.params.days, 10) || 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  try {
    const submissions = readSubmissions();
    const filtered = submissions.filter(s => new Date(s.timestamp).getTime() >= cutoff);
    const removed = submissions.length - filtered.length;
    await writeSubmissions(filtered);
    res.json({ success: true, removed, remaining: filtered.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear old submissions' });
  }
});

app.listen(PORT, () => {
  console.log(`FusePDF backend running on port ${PORT}`);
});

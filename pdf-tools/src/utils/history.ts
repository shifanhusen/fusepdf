import type { HistoryEntry } from '../types/pdf';

const STORAGE_KEY = 'pdf-tools-history';
const LIMIT = 10;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, LIMIT)));
  } catch (error) {
    console.warn('Unable to persist history', error);
  }
}

export function appendHistory(entries: HistoryEntry[], entry: HistoryEntry) {
  const next = [entry, ...entries].slice(0, LIMIT);
  saveHistory(next);
  return next;
}

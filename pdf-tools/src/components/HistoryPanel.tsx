import { Clock3, Trash2 } from 'lucide-react';
import type { HistoryEntry } from '../types/pdf';
import { formatDistanceToNow } from '../utils/time';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

export function HistoryPanel({ entries, onClear }: HistoryPanelProps) {
  return (
    <section className="rounded-2xl border border-surface-border bg-surface p-4">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Clock3 className="h-4 w-4 text-brand-blue" />
          <span className="text-sm font-semibold">Recent activity</span>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-text-muted transition hover:text-danger"
            onClick={onClear}
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </header>

      {entries.length === 0 && (
        <p className="text-sm text-text-muted">Your last 10 operations will appear here.</p>
      )}

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-surface-border/70 bg-surface-muted/40 p-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="uppercase tracking-wide text-brand-blue">{entry.tool}</span>
              <span>{formatDistanceToNow(entry.timestamp)}</span>
            </div>
            <p className="mt-2 text-sm text-white">{entry.summary}</p>
            <p className="text-xs text-text-muted">{entry.files.join(', ')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

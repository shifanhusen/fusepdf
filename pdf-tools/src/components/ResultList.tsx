import { Download } from 'lucide-react';
import type { PdfExportResult } from '../types/pdf';

interface ResultListProps {
  title: string;
  results: PdfExportResult[];
  onDownload: (result: PdfExportResult) => void;
}

export function ResultList({ title, results, onDownload }: ResultListProps) {
  return (
    <section className="rounded-2xl border border-surface-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((result) => (
          <button
            key={result.filename}
            type="button"
            onClick={() => onDownload(result)}
            className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-muted/60 px-4 py-3 text-left text-sm text-white transition hover:border-brand-blue hover:text-brand-blue"
          >
            <div>
              <p className="font-medium">{result.label}</p>
              <p className="text-xs text-text-muted">{result.filename} • {(result.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Download className="h-4 w-4" />
          </button>
        ))}
      </div>
    </section>
  );
}

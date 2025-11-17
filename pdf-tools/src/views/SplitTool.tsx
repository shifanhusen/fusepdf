import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { HistoryEntry, LoadedPdf, PdfExportResult, SplitMode } from '../types/pdf';
import { FileUploadArea } from '../components/FileUploadArea';
import { ThumbnailGrid } from '../components/ThumbnailGrid';
import { ResultList } from '../components/ResultList';
import { createZipFromResults, loadPdfFile, splitPdfByFixedPages, splitPdfByRanges, splitPdfBySelectedPages } from '../utils/pdfUtils';
import { downloadBlob } from '../utils/download';
import { parseRangeInput } from '../utils/rangeUtils';
import type { ExternalSourceConfig } from '../types/pdf';

interface SplitToolProps {
  onHistory: (entry: HistoryEntry) => void;
  sourceConfig: ExternalSourceConfig;
}

export function SplitTool({ onHistory, sourceConfig }: SplitToolProps) {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<SplitMode>('ranges');
  const [rangeInput, setRangeInput] = useState('');
  const [pagesPerFile, setPagesPerFile] = useState(10);
  const [bundleSelected, setBundleSelected] = useState<'single' | 'separate'>('single');
  const [zipAll, setZipAll] = useState(false);
  const [results, setResults] = useState<PdfExportResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    setBusy(true);
    try {
      const loaded = await loadPdfFile(files[0]);
      setPdf(loaded);
      setSelectedPages(new Set());
      setResults([]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load PDF.');
    } finally {
      setBusy(false);
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) {
        next.delete(page);
      } else {
        next.add(page);
      }
      return next;
    });
  };

  const selectionLabel = useMemo(() => {
    if (!selectedPages.size) return 'No pages selected';
    const sorted = Array.from(selectedPages).sort((a, b) => a - b);
    return `${sorted.length} pages selected (${sorted.join(', ')})`;
  }, [selectedPages]);

  const handleSplit = async () => {
    if (!pdf) {
      setError('Upload a PDF first.');
      return;
    }

    try {
      setBusy(true);
      let generated: PdfExportResult[] = [];
      if (mode === 'ranges') {
        const ranges = parseRangeInput(rangeInput, pdf.pageCount);
        if (!ranges.length) {
          throw new Error('Enter at least one valid page range.');
        }
        generated = await splitPdfByRanges(pdf, ranges);
      } else if (mode === 'selection') {
        if (!selectedPages.size) {
          throw new Error('Select at least one page to continue.');
        }
        generated = await splitPdfBySelectedPages(pdf, Array.from(selectedPages), bundleSelected);
      } else {
        if (!pagesPerFile || pagesPerFile < 1) {
          throw new Error('Set pages per file to at least 1.');
        }
        generated = await splitPdfByFixedPages(pdf, pagesPerFile);
      }

      setResults(generated);
      onHistory({
        id: crypto.randomUUID(),
        tool: 'split',
        timestamp: Date.now(),
        summary: `Split "${pdf.name}" into ${generated.length} file${generated.length === 1 ? '' : 's'}`,
        files: [pdf.name],
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to split the PDF.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!results.length) return;
    if (!zipAll) {
      results.forEach((result) => downloadBlob(result.blob, result.filename));
      return;
    }
    const baseName = pdf?.name ? pdf.name.replace(/\.pdf$/i, '') : 'split-results';
    const zip = await createZipFromResults(results, `${baseName}-split.zip`);
    downloadBlob(zip.blob, zip.filename);
  };

  return (
    <div className="space-y-8">
      <FileUploadArea
        title="Drop a PDF to split"
        description="Preview every page, select exactly what you need, or split by ranges and equal chunks."
        onFilesSelected={(files) => {
          if (files[0]) {
            handleFilesSelected([files[0]]);
          }
        }}
        busy={busy}
        sourceConfig={sourceConfig}
      />

      {pdf && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-border bg-surface p-5">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">Split mode</p>
                <h3 className="text-xl font-semibold text-white">How would you like to split "{pdf.name}"?</h3>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <ModeChip label="Custom ranges" active={mode === 'ranges'} onClick={() => setMode('ranges')} />
                <ModeChip label="Selected pages" active={mode === 'selection'} onClick={() => setMode('selection')} />
                <ModeChip label="Fixed pages" active={mode === 'fixed'} onClick={() => setMode('fixed')} />
              </div>
            </header>

            {mode === 'ranges' && (
              <div className="mt-4">
                <label className="text-xs uppercase tracking-wide text-text-muted">Page ranges</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(event) => setRangeInput(event.target.value)}
                  placeholder="1-5,6-10,11-20"
                  className="mt-2 w-full rounded-xl border border-surface-border bg-surface-muted/70 px-3 py-3 text-white focus:border-brand-blue focus:outline-none"
                />
                <p className="mt-2 text-xs text-text-muted">Ranges must be within 1-{pdf.pageCount}. They can overlap if needed.</p>
              </div>
            )}

            {mode === 'selection' && (
              <div className="mt-4 space-y-3 rounded-xl border border-surface-border/70 bg-surface-muted/40 p-4 text-sm text-white">
                <p>{selectionLabel}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" className="rounded-full border border-surface-border px-3 py-1" onClick={() => setSelectedPages(new Set(Array.from({ length: pdf.pageCount }, (_, i) => i + 1)))}>
                    Select all
                  </button>
                  <button type="button" className="rounded-full border border-surface-border px-3 py-1" onClick={() => setSelectedPages(new Set())}>
                    Clear
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-surface-border px-3 py-1"
                    onClick={() => {
                      setSelectedPages((prev) => {
                        const next = new Set<number>();
                        for (let i = 1; i <= pdf.pageCount; i++) {
                          if (!prev.has(i)) next.add(i);
                        }
                        return next;
                      });
                    }}
                  >
                    Invert
                  </button>
                </div>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-2">
                    <input type="radio" className="accent-brand-blue" checked={bundleSelected === 'single'} onChange={() => setBundleSelected('single')} />
                    Export as one PDF
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" className="accent-brand-blue" checked={bundleSelected === 'separate'} onChange={() => setBundleSelected('separate')} />
                    One file per page
                  </label>
                </div>
              </div>
            )}

            {mode === 'fixed' && (
              <div className="mt-4">
                <label className="text-xs uppercase tracking-wide text-text-muted">Pages per file</label>
                <input
                  type="number"
                  min={1}
                  value={pagesPerFile}
                  onChange={(event) => setPagesPerFile(Number(event.target.value))}
                  className="mt-2 w-40 rounded-xl border border-surface-border bg-surface-muted/70 px-3 py-2 text-white focus:border-brand-blue focus:outline-none"
                />
                <p className="mt-2 text-xs text-text-muted">Automatically breaks the PDF into chunks of equal length.</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-surface-border bg-surface p-5">
            <header className="mb-4 flex items-center justify-between text-sm text-white">
              <span>Select pages</span>
              <span>{pdf.pageCount} pages total</span>
            </header>
            <ThumbnailGrid
              thumbnails={pdf.thumbnails}
              selectable
              selectedPages={selectedPages}
              onToggle={togglePage}
            />
          </section>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-surface-border bg-surface p-4 text-sm text-white">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-brand-green" checked={zipAll} onChange={() => setZipAll((prev) => !prev)} />
              Zip resulting files after split
            </label>
            <span className="text-xs text-text-muted">If disabled, each PDF downloads separately.</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand-blue/80"
              onClick={handleSplit}
              disabled={busy}
            >
              Split PDF
            </button>
            {results.length > 0 && (
              <button
                type="button"
                className="rounded-xl border border-surface-border px-4 py-3 text-sm text-text-muted transition hover:border-brand-green hover:text-brand-green"
                onClick={handleDownloadAll}
              >
                Download {zipAll ? 'ZIP archive' : 'all files'}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {results.length > 0 && (
            <ResultList
              title="Split outputs"
              results={results}
              onDownload={(result) => downloadBlob(result.blob, result.filename)}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface ModeChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ModeChip({ label, active, onClick }: ModeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-full px-4 py-2 font-semibold',
        active ? 'bg-brand-blue text-black shadow-glow' : 'border border-surface-border text-text-muted hover:text-white',
      )}
    >
      {label}
    </button>
  );
}

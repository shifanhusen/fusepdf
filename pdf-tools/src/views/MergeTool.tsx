import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import type { HistoryEntry, MergeFileState, PageRange } from '../types/pdf';
import { FileUploadArea } from '../components/FileUploadArea';
import { ThumbnailGrid } from '../components/ThumbnailGrid';
import { mergePdfDocuments, loadPdfFile } from '../utils/pdfUtils';
import { parseRangeInput, rangesPreview } from '../utils/rangeUtils';
import { downloadBlob } from '../utils/download';
import type { ExternalSourceConfig } from '../types/pdf';

interface MergeToolProps {
  onHistory: (entry: HistoryEntry) => void;
  sourceConfig: ExternalSourceConfig;
}

interface MergeResult {
  blob: Blob;
  totalPages: number;
  filename: string;
}

export function MergeTool({ onHistory, sourceConfig }: MergeToolProps) {
  const [files, setFiles] = useState<MergeFileState[]>([]);
  const [mode, setMode] = useState<'all' | 'ranges'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleFilesSelected = async (incoming: File[]) => {
    setError(null);
    setLoading(true);
    try {
      const loaded = await Promise.all(incoming.map((file) => loadPdfFile(file)));
      setFiles((prev) => [...prev, ...loaded.map((pdf) => ({ ...pdf, rangeInput: '', includeAll: true }))]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not read the PDF file.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFiles((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const rangesMap = useMemo(() => {
    const map: Record<string, PageRange[]> = {};
    files.forEach((file) => {
      map[file.id] = parseRangeInput(file.rangeInput, file.pageCount);
    });
    return map;
  }, [files]);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Add at least two PDF files to merge.');
      return;
    }

    if (mode === 'ranges') {
      const hasInvalid = files.some((file) => file.rangeInput && !rangesMap[file.id].length);
      if (hasInvalid) {
        setError('Fix invalid range inputs before merging.');
        return;
      }
    }

    try {
      setLoading(true);
      const mergeResult = await mergePdfDocuments(files, { mode, ranges: rangesMap });
      const filename = `merged-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      setResult({ blob: mergeResult.blob, totalPages: mergeResult.totalPages, filename });
      onHistory({
        id: crypto.randomUUID(),
        tool: 'merge',
        timestamp: Date.now(),
        summary: `Merged ${files.length} files (${mergeResult.totalPages} pages)` ,
        files: files.map((file) => file.name),
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to merge files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FileUploadArea
        title="Drop your PDFs here"
        description="Merge multiple documents, reorder them, and export a single polished PDF."
        multiple
        busy={isLoading}
        onFilesSelected={handleFilesSelected}
        sourceConfig={sourceConfig}
      />

      {files.length > 0 && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-text-muted">Merge mode</p>
                <h3 className="text-lg font-semibold text-white">Choose how pages are combined</h3>
              </div>
              <div className="flex gap-4 text-sm">
                <label className="inline-flex items-center gap-2 text-white">
                  <input
                    type="radio"
                    className="accent-brand-blue"
                    checked={mode === 'all'}
                    onChange={() => setMode('all')}
                  />
                  Merge whole documents
                </label>
                <label className="inline-flex items-center gap-2 text-white">
                  <input
                    type="radio"
                    className="accent-brand-blue"
                    checked={mode === 'ranges'}
                    onChange={() => setMode('ranges')}
                  />
                  Use custom ranges
                </label>
              </div>
            </div>
            {mode === 'ranges' && (
              <p className="mt-3 text-sm text-text-muted">Leave a range blank to include all pages. Use commas for multiple ranges, e.g., 1-3,5,7-9.</p>
            )}
          </section>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={files.map((file) => file.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {files.map((file) => (
                  <SortableFileCard
                    key={file.id}
                    file={file}
                    rangeInput={file.rangeInput}
                    mode={mode}
                    expanded={expanded.has(file.id)}
                    onToggleExpand={() => setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(file.id)) next.delete(file.id); else next.add(file.id);
                      return next;
                    })}
                    onRangeChange={(value) =>
                      setFiles((prev) => prev.map((item) => (item.id === file.id ? { ...item, rangeInput: value } : item)))
                    }
                    summary={rangesPreview(rangesMap[file.id])}
                    onRemove={() => handleRemove(file.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand-blue/80"
              onClick={handleMerge}
              disabled={isLoading}
            >
              Merge PDFs
            </button>
            <button
              type="button"
              className="rounded-xl border border-surface-border px-4 py-3 text-sm text-text-muted transition hover:border-danger hover:text-danger"
              onClick={() => {
                setFiles([]);
                setResult(null);
              }}
            >
              Clear all
            </button>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {result && (
            <div className="rounded-2xl border border-brand-blue/30 bg-surface p-5 text-white">
              <p className="text-sm text-text-muted">Result summary</p>
              <h4 className="text-xl font-semibold">{result.totalPages} pages ready</h4>
              <button
                type="button"
                className="mt-4 rounded-xl bg-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-green/40"
                onClick={() => downloadBlob(result.blob, result.filename)}
              >
                Download merged PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SortableFileCardProps {
  file: MergeFileState;
  mode: 'all' | 'ranges';
  rangeInput: string;
  summary: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onRangeChange: (value: string) => void;
  onRemove: () => void;
}

function SortableFileCard({
  file,
  mode,
  rangeInput,
  summary,
  expanded,
  onToggleExpand,
  onRangeChange,
  onRemove,
}: SortableFileCardProps) {
  const sortable = useSortable({ id: file.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      className={clsx(
        'rounded-2xl border border-surface-border bg-surface p-4 text-white shadow-card transition',
        sortable.isDragging && 'border-brand-blue shadow-glow',
      )}
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            {...sortable.listeners}
            className="rounded-xl border border-surface-border bg-surface-muted/70 p-2 text-text-muted transition hover:border-brand-blue"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-semibold">{file.name}</p>
            <p className="text-xs text-text-muted">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.pageCount} pages
            </p>
            {mode === 'ranges' && rangeInput && (
              <p className="text-xs text-brand-green">{summary}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-surface-border px-3 py-2 text-xs uppercase tracking-wide text-text-muted hover:border-brand-blue"
            onClick={onToggleExpand}
          >
            <span className="flex items-center gap-1">
              <ChevronDown className={clsx('h-3 w-3 transition', expanded && 'rotate-180')} />
              Preview
            </span>
          </button>
          <button
            type="button"
            className="rounded-xl border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </header>

      {mode === 'ranges' && (
        <div className="mt-4">
          <label className="text-xs uppercase tracking-wide text-text-muted">Page ranges</label>
          <input
            type="text"
            placeholder="All pages"
            value={rangeInput}
            onChange={(event) => onRangeChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-surface-border bg-surface-muted/70 px-3 py-2 text-sm text-white focus:border-brand-blue focus:outline-none"
          />
        </div>
      )}

      {expanded && (
        <div className="mt-4">
          <ThumbnailGrid thumbnails={file.thumbnails} compact />
        </div>
      )}
    </article>
  );
}

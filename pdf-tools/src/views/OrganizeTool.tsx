import { useState, type ReactNode } from 'react';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { ExternalSourceConfig, HistoryEntry, LoadedPdf, OrganizePageState } from '../types/pdf';
import { FileUploadArea } from '../components/FileUploadArea';
import { loadPdfFile, organizePdfPages } from '../utils/pdfUtils';
import { downloadBlob } from '../utils/download';

interface OrganizeToolProps {
  onHistory: (entry: HistoryEntry) => void;
  sourceConfig: ExternalSourceConfig;
}

export function OrganizeTool({ onHistory, sourceConfig }: OrganizeToolProps) {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [pages, setPages] = useState<OrganizePageState[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleFilesSelected = async (files: File[]) => {
    if (!files[0]) return;
    setBusy(true);
    setError(null);
    try {
      const loaded = await loadPdfFile(files[0]);
      setPdf(loaded);
      setPages(
        loaded.thumbnails.map((thumb) => ({
          id: `${thumb.page}`,
          pageNumber: thumb.page,
          rotation: 0,
          thumbnail: thumb.dataUrl,
        })),
      );
      setSelectedIds(new Set());
      setResultName(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load PDF.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => setSelectedIds(new Set(pages.map((page) => page.id)));
  const handleClearSelection = () => setSelectedIds(new Set());

  const handleRotate = (direction: 'left' | 'right') => {
    const delta = direction === 'left' ? -90 : 90;
    setPages((prev) =>
      prev.map((page) =>
        selectedIds.has(page.id)
          ? { ...page, rotation: page.rotation + delta }
          : page,
      ),
    );
  };

  const handleDelete = () => {
    if (!selectedIds.size) return;
    setPages((prev) => prev.filter((page) => !selectedIds.has(page.id)));
    setSelectedIds(new Set());
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleApply = async () => {
    if (!pdf) {
      setError('Upload a PDF first.');
      return;
    }
    if (!pages.length) {
      setError('Remove fewer pages so the file keeps at least one page.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const ordered = pages.map((page) => ({ pageNumber: page.pageNumber, rotation: page.rotation }));
      const output = await organizePdfPages(pdf, ordered);
      const filename = `organized-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      downloadBlob(output.blob, filename);
      setResultName(filename);
      onHistory({
        id: crypto.randomUUID(),
        tool: 'organize',
        timestamp: Date.now(),
        summary: `Reordered ${pages.length} pages (removed ${pdf.pageCount - pages.length})`,
        files: [pdf.name],
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to export the organized PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <FileUploadArea
        title="Drop a PDF to organize"
        description="Drag pages into a new order, delete mistakes, and rotate anything upside-down."
        onFilesSelected={handleFilesSelected}
        busy={busy}
        sourceConfig={sourceConfig}
      />

      {pdf && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-border bg-surface p-4 text-sm text-white">
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Select all" onClick={handleSelectAll} />
              <ActionButton label="Clear" onClick={handleClearSelection} />
              <ActionButton label="Delete selected" icon={<Trash2 className="h-4 w-4" />} onClick={handleDelete} />
              <ActionButton label="Rotate left" icon={<RotateCcw className="h-4 w-4" />} onClick={() => handleRotate('left')} />
              <ActionButton label="Rotate right" icon={<RotateCw className="h-4 w-4" />} onClick={() => handleRotate('right')} />
            </div>
            <p className="mt-3 text-xs text-text-muted">
              {selectedIds.size} selected • {pages.length} pages will remain from {pdf.pageCount} original pages
            </p>
          </section>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pages.map((page) => page.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pages.map((page, index) => (
                  <OrganizeCard
                    key={page.id}
                    page={page}
                    index={index}
                    selected={selectedIds.has(page.id)}
                    toggle={() => toggleSelection(page.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            className="w-full rounded-xl bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand-blue/80"
            onClick={handleApply}
            disabled={busy}
          >
            Apply changes & download
          </button>

          {error && <p className="text-sm text-danger">{error}</p>}
          {resultName && <p className="text-sm text-brand-green">Downloaded {resultName}</p>}
        </div>
      )}
    </div>
  );
}

interface OrganizeCardProps {
  page: OrganizePageState;
  selected: boolean;
  toggle: () => void;
  index: number;
}

function OrganizeCard({ page, selected, toggle, index }: OrganizeCardProps) {
  const sortable = useSortable({ id: page.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      className={clsx(
        'cursor-grab rounded-2xl border border-surface-border bg-surface-muted/60 p-3 text-white transition',
        sortable.isDragging && 'border-brand-blue shadow-glow',
        selected && 'border-brand-green/70 shadow-glow',
      )}
      onClick={(event) => {
        event.preventDefault();
        toggle();
      }}
    >
      <div className="relative">
        <img src={page.thumbnail} alt={`Page ${page.pageNumber}`} className="h-48 w-full rounded-xl object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 text-xs font-semibold">{index + 1}</span>
        {page.rotation !== 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 text-xs">{page.rotation % 360}°</span>
        )}
      </div>
      <p className="mt-2 text-xs text-text-muted">Original page {page.pageNumber}</p>
    </article>
  );
}

interface ActionButtonProps {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

function ActionButton({ label, icon, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-text-muted transition hover:border-brand-blue hover:text-white"
    >
      {icon}
      {label}
    </button>
  );
}

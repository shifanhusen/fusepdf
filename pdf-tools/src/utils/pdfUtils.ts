import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import type { PDFDocumentProxy } from '../lib/pdfjs';
import { getDocument } from '../lib/pdfjs';
import type {
  LoadedPdf,
  PageRange,
  PdfExportResult,
} from '../types/pdf';

const PAGE_RENDER_SCALE = 0.25;

const getId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `pdf-${Math.random().toString(36).slice(2, 11)}`;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const toArrayBuffer = (bytes: Uint8Array) => bytes.slice().buffer;

export async function loadPdfFile(file: File): Promise<LoadedPdf> {
  if (file.type && file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
  const thumbnails = await generateThumbnails(pdfDoc);

  return {
    id: getId(),
    name: file.name,
    size: file.size,
    pageCount: pdfDoc.numPages,
    arrayBuffer,
    file,
    thumbnails,
  };
}

async function generateThumbnails(pdfDoc: PDFDocumentProxy) {
  const thumbs = [];
  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
    const dataUrl = await renderPageThumbnail(pdfDoc, pageNumber);
    thumbs.push({ page: pageNumber, dataUrl });
  }
  return thumbs;
}

export async function renderPageThumbnail(pdfDoc: PDFDocumentProxy, pageNumber: number, scale = PAGE_RENDER_SCALE) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get 2D context for thumbnail rendering.');
  }
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  return canvas.toDataURL('image/png');
}

function rangesToIndices(ranges: PageRange[], totalPages: number) {
  const indices = new Set<number>();
  ranges.forEach((range) => {
    const start = clamp(range.start, 1, totalPages);
    const end = clamp(range.end, 1, totalPages);
    for (let page = Math.min(start, end); page <= Math.max(start, end); page++) {
      indices.add(page - 1);
    }
  });
  return Array.from(indices).sort((a, b) => a - b);
}

export async function mergePdfDocuments(
  files: LoadedPdf[],
  options: { mode: 'all' | 'ranges'; ranges?: Record<string, PageRange[]> }
) {
  if (!files.length) throw new Error('Add at least one PDF.');
  const merged = await PDFDocument.create();
  let mergedPages = 0;

  for (const file of files) {
    const srcDoc = await PDFDocument.load(file.arrayBuffer);
    let indices = srcDoc.getPageIndices();

    if (options.mode === 'ranges' && options.ranges?.[file.id]?.length) {
      const pageIndices = rangesToIndices(options.ranges[file.id], file.pageCount);
      if (!pageIndices.length) continue;
      indices = pageIndices;
    }

    const copiedPages = await merged.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => merged.addPage(page));
    mergedPages += copiedPages.length;
  }

  if (mergedPages === 0) {
    throw new Error('No pages were selected for merging.');
  }

  const pdfBytes = await merged.save({ useObjectStreams: true });
  return {
    blob: new Blob([toArrayBuffer(pdfBytes)], { type: 'application/pdf' }),
    totalPages: mergedPages,
  };
}

function createFileResult(label: string, filename: string, pdfBytes: Uint8Array): PdfExportResult {
  const blob = new Blob([toArrayBuffer(pdfBytes)], { type: 'application/pdf' });
  return {
    label,
    filename,
    blob,
    size: blob.size,
  };
}

export async function splitPdfByRanges(source: LoadedPdf, ranges: PageRange[]) {
  const srcDoc = await PDFDocument.load(source.arrayBuffer);
  const results: PdfExportResult[] = [];

  for (let idx = 0; idx < ranges.length; idx++) {
    const range = ranges[idx];
    const indices = rangesToIndices([range], source.pageCount);
    if (!indices.length) continue;

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => newDoc.addPage(page));
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    results.push(
      createFileResult(
        `Pages ${Math.min(range.start, range.end)}-${Math.max(range.start, range.end)}`,
        `${source.name.replace(/\.pdf$/i, '')}-part-${idx + 1}.pdf`,
        pdfBytes,
      ),
    );
  }

  if (!results.length) {
    throw new Error('No valid ranges were provided.');
  }

  return results;
}

export async function splitPdfBySelectedPages(
  source: LoadedPdf,
  pages: number[],
  bundle: 'single' | 'separate'
) {
  if (!pages.length) throw new Error('Select at least one page first.');
  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  const srcDoc = await PDFDocument.load(source.arrayBuffer);

  if (bundle === 'single') {
    const indices = sorted.map((page) => clamp(page, 1, source.pageCount) - 1);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach((page) => newDoc.addPage(page));
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    return [
      createFileResult(
        `Selected pages (${sorted.length})`,
        `${source.name.replace(/\.pdf$/i, '')}-selected.pdf`,
        pdfBytes,
      ),
    ];
  }

  const results: PdfExportResult[] = [];
  for (const page of sorted) {
    const safeIndex = clamp(page, 1, source.pageCount) - 1;
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [safeIndex]);
    newDoc.addPage(copiedPage);
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    results.push(
      createFileResult(
        `Page ${page}`,
        `${source.name.replace(/\.pdf$/i, '')}-page-${page}.pdf`,
        pdfBytes,
      ),
    );
  }
  return results;
}

export async function splitPdfByFixedPages(source: LoadedPdf, pagesPerFile: number) {
  if (pagesPerFile < 1) throw new Error('Pages per file must be at least 1.');
  const srcDoc = await PDFDocument.load(source.arrayBuffer);
  const results: PdfExportResult[] = [];
  let part = 1;

  for (let start = 1; start <= source.pageCount; start += pagesPerFile) {
    const end = Math.min(start + pagesPerFile - 1, source.pageCount);
    const range: PageRange = { start, end };
    const indices = rangesToIndices([range], source.pageCount);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach((page) => newDoc.addPage(page));
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    results.push(
      createFileResult(
        `Pages ${start}-${end}`,
        `${source.name.replace(/\.pdf$/i, '')}-part-${part}.pdf`,
        pdfBytes,
      ),
    );
    part += 1;
  }

  return results;
}

export async function createZipFromResults(results: PdfExportResult[], zipName: string) {
  const zip = new JSZip();
  results.forEach((result) => zip.file(result.filename, result.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, filename: zipName };
}

export async function organizePdfPages(
  source: LoadedPdf,
  orderedPages: { pageNumber: number; rotation: number }[]
) {
  const srcDoc = await PDFDocument.load(source.arrayBuffer);
  const newDoc = await PDFDocument.create();

  for (const pageState of orderedPages) {
    const safeIndex = clamp(pageState.pageNumber, 1, source.pageCount) - 1;
    const [copiedPage] = await newDoc.copyPages(srcDoc, [safeIndex]);
    if (pageState.rotation) {
      const normalized = ((pageState.rotation % 360) + 360) % 360;
      copiedPage.setRotation(degrees(normalized));
    }
    newDoc.addPage(copiedPage);
  }

  if (newDoc.getPageCount() === 0) {
    throw new Error('Remove fewer pages so at least one page remains.');
  }

  const pdfBytes = await newDoc.save({ useObjectStreams: true });
  return {
    blob: new Blob([toArrayBuffer(pdfBytes)], { type: 'application/pdf' }),
    totalPages: newDoc.getPageCount(),
  };
}

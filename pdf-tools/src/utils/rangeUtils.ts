import type { PageRange } from '../types/pdf';

const toInt = (value: string) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : null;
};

export function parseRangeInput(input: string, totalPages: number): PageRange[] {
  if (!input.trim()) return [];

  const parts = input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const ranges: PageRange[] = [];
  for (const part of parts) {
    if (part.includes('-')) {
      const [rawStart, rawEnd] = part.split('-');
      const start = toInt(rawStart);
      const end = toInt(rawEnd);
      if (start && end) {
        ranges.push({
          start: clamp(start, 1, totalPages),
          end: clamp(end, 1, totalPages),
        });
      }
    } else {
      const single = toInt(part);
      if (single) {
        const safe = clamp(single, 1, totalPages);
        ranges.push({ start: safe, end: safe });
      }
    }
  }

  const deduped = dedupeRanges(ranges);
  return deduped;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function dedupeRanges(ranges: PageRange[]) {
  const signature = new Set<string>();
  const result: PageRange[] = [];
  ranges.forEach((range) => {
    const start = Math.min(range.start, range.end);
    const end = Math.max(range.start, range.end);
    const key = `${start}-${end}`;
    if (!signature.has(key)) {
      signature.add(key);
      result.push({ start, end });
    }
  });
  return result;
}

export function rangesPreview(ranges: PageRange[]) {
  if (!ranges.length) return 'No ranges';
  return ranges
    .map((range) =>
      range.start === range.end ? `Page ${range.start}` : `Pages ${range.start}-${range.end}`,
    )
    .join(', ');
}

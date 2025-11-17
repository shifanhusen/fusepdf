export type ToolTab = 'merge' | 'split' | 'organize';

export interface ThumbnailPage {
  page: number;
  dataUrl: string;
}

export interface LoadedPdf {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  file: File;
  thumbnails: ThumbnailPage[];
}

export interface PageRange {
  start: number;
  end: number;
}

export type SplitMode = 'ranges' | 'selection' | 'fixed';

export interface HistoryEntry {
  id: string;
  tool: ToolTab;
  timestamp: number;
  summary: string;
  files: string[];
}

export interface MergeFileState extends LoadedPdf {
  rangeInput: string;
  includeAll: boolean;
}

export interface SplitSelectionState {
  selectedPages: Set<number>;
  mode: SplitMode;
  rangeInput: string;
  pagesPerFile: number;
  bundleSelected: 'single' | 'separate';
}

export interface OrganizePageState {
  id: string;
  pageNumber: number;
  thumbnail: string;
  rotation: number;
}

export interface ExternalSourceConfig {
  googleApiKey?: string;
  googleClientId?: string;
  dropboxAppKey?: string;
}

export interface PdfExportResult {
  filename: string;
  label: string;
  blob: Blob;
  size: number;
}

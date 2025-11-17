# FusePDF – Browser PDF Studio

Modern dark-themed PDF workspace built with React, TypeScript, Tailwind CSS, `pdf-lib`, and `pdfjs-dist`. Everything runs locally in the browser—no uploads, no accounts.

## Features

- **Merge PDF**: drag-and-drop ordering, per-file page ranges, inline previews, custom merge modes, Drive/Dropbox ingest.
- **Split PDF**: live thumbnails, quick select actions, split by ranges/selection/fixed size, optional ZIP export.
- **Organize PDF**: draggable grid for reordering, delete & rotation controls, instant export.
- **External sources**: load PDFs from URL, Google Drive Picker, or Dropbox Chooser.
- **History panel**: last 10 operations persisted in `localStorage` with timestamps.

## Getting Started

```bash
# Install dependencies
cd pdf-tools
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` for the development UI.

## Environment Variables

Create a `.env` (or `.env.local`) in `pdf-tools/` when you need cloud pickers:

```bash
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_DROPBOX_APP_KEY=your_dropbox_app_key
```

Leave values empty to hide the Drive/Dropbox upload buttons. URL uploads and local drag-and-drop always work.

## Project Structure

- `src/components`: shared UI (upload area, tabs, history panel, thumbnails, etc.).
- `src/views`: feature-specific flows for Merge, Split, Organize.
- `src/utils`: PDF helpers, history persistence, range parsing, downloads.
- `src/config/externalSources.ts`: reads picker keys from environment variables.

## PDF Processing Stack

- **Thumbnails**: `pdfjs-dist` renders each page to a canvas-based data URL.
- **Manipulation**: `pdf-lib` copies pages, applies rotations, and saves new documents entirely client side.
- **Zipping**: `jszip` bundles split results when requested.

## Notes

- Tested in evergreen browsers with WebAssembly and Canvas support.
- Heavy PDFs are processed fully client side—consider slicing ranges for huge documents.
- History is local to the browser; clearing site data removes it.

import { useRef, useState } from 'react';
import { UploadCloud, Link as LinkIcon, HardDrive, Cloud } from 'lucide-react';
import clsx from 'clsx';
import type { ExternalSourceConfig } from '../types/pdf';
import { useExternalSources } from '../hooks/useExternalSources';

interface FileUploadAreaProps {
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onFilesSelected: (files: File[]) => void;
  sourceConfig?: ExternalSourceConfig;
}

export function FileUploadArea({
  title,
  description,
  accept = '.pdf',
  multiple,
  disabled,
  busy,
  onFilesSelected,
  sourceConfig = {},
}: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const external = useExternalSources(sourceConfig, {
    multiple,
    onFiles: onFilesSelected,
  });

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (!fileArray.length) {
      setMessage('Only PDF files are supported.');
      return;
    }
    setMessage(null);
    if (!multiple && fileArray.length > 1) {
      onFilesSelected([fileArray[0]]);
      return;
    }
    onFilesSelected(fileArray);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (disabled || busy) return;
    if (event.dataTransfer.files?.length) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleUrlLoad = async () => {
    if (!url.trim()) {
      setMessage('Enter a direct PDF URL first.');
      return;
    }
    try {
      setMessage('Fetching PDF...');
      const response = await fetch(url.trim());
      if (!response.ok) {
        throw new Error('Could not fetch file from URL.');
      }
      const blob = await response.blob();
      if (blob.type && blob.type !== 'application/pdf') {
        throw new Error('The URL did not return a PDF file.');
      }
      const filename = url.split('/').pop() || 'remote.pdf';
      const file = new File([blob], filename, { type: 'application/pdf' });
      onFilesSelected([file]);
      setMessage(null);
      setUrl('');
    } catch (error: any) {
      setMessage(error?.message || 'Could not load file from URL.');
    }
  };

  const errorMessage = message || external.errors.at(-1) || null;

  return (
    <div className="space-y-4">
      <label
        htmlFor="file-input"
        className={clsx(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition hover:border-brand-blue hover:bg-surface-muted/60',
          isDragging ? 'border-brand-blue bg-surface-muted/60' : 'border-surface-border bg-surface',
          (disabled || busy) && 'cursor-not-allowed opacity-60',
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled || busy) return;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (disabled || busy) return;
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || busy}
          className="hidden"
          onChange={(event) => event.target.files && handleFiles(event.target.files)}
        />
        <div className="rounded-full bg-brand-blue/10 p-4 text-brand-blue">
          <UploadCloud className="h-10 w-10" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-text-muted">{description}</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-brand-blue/20 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/30"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Processing...' : 'Browse files'}
        </button>
      </label>

      <div className="grid gap-4 rounded-2xl border border-surface-border bg-surface p-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Open from URL</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="url"
                placeholder="https://example.com/file.pdf"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-muted/70 py-2 pl-9 pr-3 text-sm text-white focus:border-brand-blue focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="rounded-xl bg-brand-green/20 px-4 text-sm font-medium text-brand-green transition hover:bg-brand-green/30"
              onClick={handleUrlLoad}
              disabled={busy}
            >
              Load
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-brand-blue hover:text-white"
            onClick={external.openDrivePicker}
            disabled={!sourceConfig.googleApiKey || !sourceConfig.googleClientId}
          >
            <HardDrive className="h-4 w-4" />
            Google Drive
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-brand-green hover:text-white"
            onClick={external.openDropboxChooser}
            disabled={!sourceConfig.dropboxAppKey}
          >
            <Cloud className="h-4 w-4" />
            Dropbox
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-danger">{errorMessage}</p>
      )}
    </div>
  );
}

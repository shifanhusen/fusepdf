import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExternalSourceConfig } from '../types/pdf';

const loadScript = (src: string, attributes: Record<string, string> = {}) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });
};

interface ExternalSourceState {
  driveReady: boolean;
  dropboxReady: boolean;
  openDrivePicker: () => void;
  openDropboxChooser: () => void;
  errors: string[];
}

interface Options {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}

export function useExternalSources(config: ExternalSourceConfig, options: Options): ExternalSourceState {
  const [driveReady, setDriveReady] = useState(false);
  const [dropboxReady, setDropboxReady] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function initDrive() {
      if (!config.googleApiKey || !config.googleClientId) return;
      try {
        await loadScript('https://accounts.google.com/gsi/client');
        await loadScript('https://apis.google.com/js/api.js');
        if (cancelled) return;
        window.gapi.load('picker', () => {
          if (!cancelled) setDriveReady(true);
        });
      } catch (error) {
        if (!cancelled) setErrors((prev) => [...prev, 'Google Drive Picker failed to load']);
      }
    }
    initDrive();
    return () => {
      cancelled = true;
    };
  }, [config.googleApiKey, config.googleClientId]);

  useEffect(() => {
    if (!config.dropboxAppKey) return;
    const existing = document.getElementById('dropboxjs');
    if (existing) {
      setDropboxReady(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'dropboxjs';
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-app-key', config.dropboxAppKey);
    script.onload = () => setDropboxReady(true);
    script.onerror = () => setErrors((prev) => [...prev, 'Dropbox Chooser failed to load']);
    document.body.appendChild(script);
  }, [config.dropboxAppKey]);

  const fetchDropboxFiles = useCallback(async (links: Array<{ link: string; name: string }>) => {
    const files: File[] = [];
    for (const item of links) {
      const response = await fetch(item.link);
      const blob = await response.blob();
      const name = item.name.endsWith('.pdf') ? item.name : `${item.name}.pdf`;
      files.push(new File([blob], name, { type: blob.type || 'application/pdf' }));
    }
    return files;
  }, []);

  const openDropboxChooser = useCallback(() => {
    if (!config.dropboxAppKey) {
      setErrors((prev) => [...prev, 'Set DROPBOX app key to enable Dropbox uploads.']);
      return;
    }
    if (!dropboxReady || !window.Dropbox) {
      setErrors((prev) => [...prev, 'Dropbox SDK is not ready yet.']);
      return;
    }
    window.Dropbox.choose({
      linkType: 'direct',
      multiselect: options.multiple ?? false,
      extensions: ['.pdf'],
      success: async (files: Array<{ link: string; name: string }>) => {
        const result = await fetchDropboxFiles(files);
        options.onFiles(result);
      },
      cancel: () => undefined,
    });
  }, [config.dropboxAppKey, dropboxReady, fetchDropboxFiles, options]);

  const openDrivePicker = useCallback(() => {
    if (!config.googleApiKey || !config.googleClientId) {
      setErrors((prev) => [...prev, 'Set Google API credentials to enable Drive uploads.']);
      return;
    }
    if (!driveReady || !window.google) {
      setErrors((prev) => [...prev, 'Google Picker is still loading.']);
      return;
    }

    const accounts = window.google.accounts;
    if (!accounts?.oauth2) {
      setErrors((prev) => [...prev, 'Google OAuth client is not ready.']);
      return;
    }

    if (!window.google.picker) {
      setErrors((prev) => [...prev, 'Google Picker SDK is unavailable.']);
      return;
    }

    const google = window.google;
    const tokenClient = accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: async (tokenResponse: { access_token: string }) => {
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
        view.setMimeTypes('application/pdf');
        view.setSelectFolderEnabled(false);
        view.setMode(google.picker.DocsViewMode.LIST);
        const picker = new google.picker.PickerBuilder()
          .setDeveloperKey(config.googleApiKey)
          .setOAuthToken(tokenResponse.access_token)
          .addView(view)
          .setMaxItems(options.multiple ? 10 : 1)
          .setCallback(async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
              const docs = Array.isArray(data.docs) ? data.docs : [];
              const fetched: File[] = [];
              for (const doc of docs) {
                try {
                  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  });
                  const blob = await response.blob();
                  fetched.push(new File([blob], doc.name, { type: 'application/pdf' }));
                  if (!options.multiple) break;
                } catch (error) {
                  setErrors((prev) => [...prev, 'Failed to fetch a file from Drive.']);
                }
              }
              if (fetched.length) {
                options.onFiles(fetched);
              }
            }
          })
          .setSize(880, 600)
          .build();
        picker.setVisible(true);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }, [config.googleApiKey, config.googleClientId, driveReady, options]);

  return useMemo(() => ({
    driveReady,
    dropboxReady,
    openDrivePicker,
    openDropboxChooser,
    errors,
  }), [driveReady, dropboxReady, openDrivePicker, openDropboxChooser, errors]);
}

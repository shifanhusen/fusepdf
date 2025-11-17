import type { ExternalSourceConfig } from '../types/pdf';

export const externalSourceConfig: ExternalSourceConfig = {
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  dropboxAppKey: import.meta.env.VITE_DROPBOX_APP_KEY,
};

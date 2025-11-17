export {};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
        };
      };
      picker?: any;
    };
    gapi?: any;
    Dropbox?: any;
  }
}

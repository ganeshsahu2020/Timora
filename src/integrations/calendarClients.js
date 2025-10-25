// src/integrations/calendarClients.js

// ------- Demo (works now) -------
const DEMO_KEYS = {
  google: 'ai_ts_google_token',
  ms: 'ai_ts_ms_token',
};

export function isGoogleConnected() {
  return !!localStorage.getItem(DEMO_KEYS.google);
}
export function isMsConnected() {
  return !!localStorage.getItem(DEMO_KEYS.ms);
}
export function connectGoogleDemo() {
  localStorage.setItem(DEMO_KEYS.google, 'demo-google-token');
  return true;
}
export function disconnectGoogleDemo() {
  localStorage.removeItem(DEMO_KEYS.google);
}
export function connectMsDemo() {
  localStorage.setItem(DEMO_KEYS.ms, 'demo-ms-token');
  return true;
}
export function disconnectMsDemo() {
  localStorage.removeItem(DEMO_KEYS.ms);
}

// ------- Outlook (MS Graph) skeleton via MSAL --------
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'YOUR_AZURE_AD_APP_CLIENT_ID', // TODO
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/',
  },
};
const msalScopes = ['Calendars.Read'];

export const msalApp = new PublicClientApplication(msalConfig);

// REAL sign-in function (call only after you set a real clientId)
export async function msSignInReal() {
  const res = await msalApp.loginPopup({ scopes: msalScopes });
  return res?.account;
}

// ------- Google Identity Services skeleton --------
export async function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('gsi-client')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'gsi-client';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(s);
  });
}
// With GIS you’d exchange tokens for Calendar API access; omitted here for brevity.

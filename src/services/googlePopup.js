import { GOOGLE_CLIENT_ID } from '../config';

// "GET STARTED FOR FREE" opens Google's account picker directly. Google's own
// GoogleLogin button can't carry our label, so we run the OpenID Connect
// implicit flow in a popup (response_type=id_token) and hand the resulting ID
// token to POST /auth/google, exactly like GoogleLogin's `credential`. The
// backend contract is unchanged.
//
// Google answers at public/google-callback.html (same origin), which relays
// the URL fragment back here over a BroadcastChannel (with a postMessage
// fallback) and closes itself. We never rely on window.opener or popup.closed:
// Google's pages may set Cross-Origin-Opener-Policy, which severs both.
//
// Requires `${origin}/google-callback.html` to be an Authorized redirect URI
// on the Google OAuth client (Google Cloud console), for every origin used.

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const CALLBACK_PATH = '/google-callback.html';
export const CHANNEL_NAME = 'sh-google-sign-in';
export const MESSAGE_TYPE = 'sh:google-callback';

// The student backed out on Google's side (e.g. "Cancel"). Not an error to show.
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'GoogleSignInCancelled';
  }
}

// Anything else that stops us getting a usable ID token.
export class GoogleSignInFailed extends Error {
  constructor(reason) {
    super(`Google sign-in failed: ${reason}`);
    this.name = 'GoogleSignInFailed';
  }
}

const randomToken = () => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

// Reads the `nonce` claim without verifying the signature. The backend
// verifies the token; this only rejects a token minted for another request.
const nonceOf = (idToken) => {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '='))).nonce;
  } catch (error) {
    return undefined;
  }
};

export const buildAuthUrl = ({ state, nonce, origin = window.location.origin, clientId = GOOGLE_CLIENT_ID }) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}${CALLBACK_PATH}`,
    response_type: 'id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
    nonce,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

// Only one sign-in attempt is live at a time; a new click replaces the old one,
// so closing the popup and clicking again just works.
let pending = null;

// Opens the popup. Must be called synchronously from the click handler so the
// browser treats it as user-initiated. Resolves to the ID token; rejects with
// GoogleSignInCancelled or GoogleSignInFailed. If the student just closes the
// popup, it never settles (nothing to show), and the next click supersedes it.
export function openGoogleSignIn() {
  if (pending) pending.cleanup();

  const state = randomToken();
  const nonce = randomToken();
  const popup = window.open(
    buildAuthUrl({ state, nonce }),
    'sh-google-sign-in',
    'popup,width=500,height=640'
  );

  return new Promise((resolve, reject) => {
    let channel = null;

    const cleanup = () => {
      window.removeEventListener('message', onWindowMessage);
      if (channel) channel.close();
      if (pending && pending.cleanup === cleanup) pending = null;
    };
    pending = { cleanup };

    if (!popup) {
      cleanup();
      reject(new GoogleSignInFailed('popup blocked'));
      return;
    }

    const handle = (data) => {
      if (!data || data.type !== MESSAGE_TYPE || typeof data.fragment !== 'string') return;
      const params = new URLSearchParams(data.fragment.replace(/^#/, ''));
      // A reply for some other (older) attempt: ignore it.
      if (params.get('state') !== state) return;
      cleanup();

      const error = params.get('error');
      if (error === 'access_denied') return reject(new GoogleSignInCancelled());
      if (error) return reject(new GoogleSignInFailed(error));

      const idToken = params.get('id_token');
      if (!idToken) return reject(new GoogleSignInFailed('no id_token'));
      if (nonceOf(idToken) !== nonce) return reject(new GoogleSignInFailed('nonce mismatch'));
      resolve(idToken);
    };

    function onWindowMessage(event) {
      if (event.origin !== window.location.origin) return;
      handle(event.data);
    }

    window.addEventListener('message', onWindowMessage);
    if (typeof window.BroadcastChannel === 'function') {
      channel = new window.BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => handle(event.data);
    }
  });
}

import { API_URL } from '../config';

// Session API (backend PR: Google sign-in). The session lives in an HttpOnly
// cookie set by the backend; the browser never sees or stores a token.
// Every call sends credentials so the cookie also works when
// REACT_APP_API_URL points at a different origin in local dev.

// The backend is unreachable: network failure, a 5xx, or a response that
// isn't the JSON we expect (e.g. the host returned an HTML error page).
export class ServerUnreachableError extends Error {
  constructor(message = "Student Helper can't reach the server right now.") {
    super(message);
    this.name = 'ServerUnreachableError';
  }
}

// The backend answered but refused the sign-in (401 or another 4xx).
export class SignInRejectedError extends Error {
  constructor(message = 'Sign-in was rejected.') {
    super(message);
    this.name = 'SignInRejectedError';
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ServerUnreachableError();
  }
  if (response.status >= 500) throw new ServerUnreachableError();
  return response;
}

async function readUser(response) {
  try {
    const data = await response.json();
    return (data && data.user) || null;
  } catch (error) {
    throw new ServerUnreachableError();
  }
}

// Restores the session from the cookie. Resolves to the user, or null when
// signed out (401/4xx). Throws ServerUnreachableError when the backend is down.
export async function getSession() {
  const response = await request('/me');
  if (!response.ok) return null;
  return readUser(response);
}

// Exchanges a Google ID token (the `credential` from GoogleLogin) for a
// session cookie. Resolves to the user (with `is_new`).
export async function signInWithGoogle(credential) {
  const response = await request('/auth/google', { method: 'POST', body: { credential } });
  if (!response.ok) {
    let message;
    try {
      message = (await response.json()).error;
    } catch (error) {
      // No JSON body; keep the default message.
    }
    throw new SignInRejectedError(message);
  }
  const user = await readUser(response);
  if (!user) throw new ServerUnreachableError();
  return user;
}

// Ends the session. A 401 means the cookie was already gone, which is fine.
export async function signOut() {
  const response = await request('/auth/logout', { method: 'POST' });
  if (!response.ok && response.status !== 401) {
    throw new Error(`Sign-out failed (${response.status})`);
  }
}

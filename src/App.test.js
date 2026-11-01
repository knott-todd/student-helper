import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OneSignal from 'react-onesignal';
import { googleLogout } from '@react-oauth/google';
import App from './App';
import AppContext from './AppContext';

// Third-party side effects that don't belong in a unit test.
jest.mock('react-onesignal', () => ({
  __esModule: true,
  default: { init: jest.fn(), setExternalUserId: jest.fn(), removeExternalUserId: jest.fn() },
}));
jest.mock('@vercel/analytics', () => ({ inject: jest.fn() }));
// Dev-only page that pulls TensorFlow into the module graph.
jest.mock('./SentenceSimilarity', () => () => null);
// The real provider loads Google's script; the stub button hands back a
// credential the way GoogleLogin's onSuccess does.
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess({ credential: 'google-id-token' })}>
      Sign in with Google
    </button>
  ),
  googleLogout: jest.fn(),
}));

// jsdom has no canvas; App draws a decorative dot grid on load.
const noopContext = new Proxy({}, { get: () => () => {} });

const returningUser = { id: 7, fname: 'Ada', lname: 'Lovelace', email: 'ada@example.com', default_exam: 1, role: 'student', is_new: false };
const newUser = { ...returningUser, id: 8, default_exam: null, is_new: true };

const respond = (status, body) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError('no body')) : Promise.resolve(body)),
  });

// Routes fetch by "METHOD /path". Anything not listed answers 200 []
// (the legacy getters' "nothing here" shape).
// GET /user_exam has no user id in it any more, so the mock answers it for
// whoever /me or /auth/google last returned (the session user).
const mockBackend = (routes) => {
  let sessionUser = null;
  const remember = (response) =>
    Promise.resolve(response).then(async (res) => {
      try {
        const body = await res.json();
        if (body && body.user) sessionUser = body.user;
      } catch (error) {
        // No JSON body.
      }
      return res;
    });
  global.fetch = jest.fn((url, opts = {}) => {
    const key = `${opts.method || 'GET'} ${url}`;
    if (key in routes) {
      const route = routes[key];
      const response = typeof route === 'function' ? route(url, opts) : respond(...route);
      return /^(GET \/api\/me|POST \/api\/auth\/google)$/.test(key) ? remember(response) : response;
    }
    if (key === 'GET /api/user_exam') return respond(200, [{ default_exam: sessionUser ? sessionUser.default_exam : null }]);
    return respond(200, []);
  });
};

const calls = (key) =>
  global.fetch.mock.calls.filter(([url, opts = {}]) => `${opts.method || 'GET'} ${url}` === key);

const renderApp = (path = '/') => {
  window.history.pushState({}, '', path);
  return render(
    <AppContext>
      <App />
    </AppContext>
  );
};

const googleButton = () => screen.findByRole('button', { name: /sign in with google/i });

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(noopContext);
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('a signed-out visitor lands on the Google sign-in, with no flash while /me is pending', async () => {
  let answerMe;
  mockBackend({ 'GET /api/me': () => new Promise((resolve) => { answerMe = resolve; }) });
  renderApp('/');

  expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument();
  expect(calls('GET /api/me')[0][1]).toMatchObject({ credentials: 'include' });

  answerMe(await respond(401, { error: 'no session' }));
  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
  expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
});

test('signed-out visitors are redirected from user pages to /sign_in', async () => {
  mockBackend({ 'GET /api/me': [401, { error: 'no session' }] });
  renderApp('/tasks');

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
});

test('a valid session from /me is restored and routed to /test; legacy identity keys are cleared', async () => {
  localStorage.setItem('userID', '150');
  localStorage.setItem('user', JSON.stringify({ id: 150 }));
  mockBackend({ 'GET /api/me': [200, { user: returningUser }] });
  renderApp('/');

  await waitFor(() => expect(window.location.pathname).toBe('/test'));
  expect(localStorage.getItem('userID')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  // The backend takes the user from the session: no call carries a user id.
  await waitFor(() => expect(calls('GET /api/user_subjects')).not.toHaveLength(0));
  expect(calls('GET /api/user_subjects')[0][1]).toMatchObject({ credentials: 'include' });
  const sent = global.fetch.mock.calls.map(([url, opts = {}]) => `${url} ${opts.body || ''}`);
  expect(sent.some((s) => /\/(150|7)(\/|\s|$)|user_?id/i.test(s))).toBe(false);
});

test('a restored session keeps a deep link', async () => {
  mockBackend({ 'GET /api/me': [200, { user: returningUser }] });
  renderApp('/tasks');

  expect(await screen.findByText(/hey, ada/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/tasks');
});

test('Google sign-in for a new user posts the credential and stays on profile setup', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [200, { user: newUser }],
  });
  renderApp('/sign_in');

  fireEvent.click(await googleButton());

  expect(await screen.findByText(/select default exam/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
  const [[, opts]] = calls('POST /api/auth/google');
  expect(opts.credentials).toBe('include');
  expect(JSON.parse(opts.body)).toEqual({ credential: 'google-id-token' });
  expect(OneSignal.setExternalUserId).toHaveBeenCalledWith('8');
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
});

test('Google sign-in for a returning user with a default exam goes to /test', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [200, { user: returningUser }],
  });
  renderApp('/sign_in');

  fireEvent.click(await googleButton());

  await waitFor(() => expect(window.location.pathname).toBe('/test'));
});

test('a rejected Google sign-in shows an error and stays signed out', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [401, { error: 'invalid token' }],
  });
  renderApp('/sign_in');

  fireEvent.click(await googleButton());

  expect(await screen.findByRole('alert')).toHaveTextContent(/google sign-in didn't work/i);
  expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
});

test('sign-out ends the session and returns to the sign-in page', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'POST /api/auth/logout': [204],
  });
  renderApp('/sign_in');

  fireEvent.click(await screen.findByRole('button', { name: /sign out/i }));

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
  expect(calls('POST /api/auth/logout')[0][1]).toMatchObject({ credentials: 'include' });
  expect(googleLogout).toHaveBeenCalled();
  expect(OneSignal.removeExternalUserId).toHaveBeenCalled();
  expect(localStorage.getItem('sub')).toBeNull();
});

test('a failed sign-out says so and keeps the user signed in', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'POST /api/auth/logout': [503],
  });
  renderApp('/sign_in');

  fireEvent.click(await screen.findByRole('button', { name: /sign out/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/can't reach the server/i);
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
});

test.each([
  ['a 5xx', () => respond(503)],
  ['a network error', () => Promise.reject(new TypeError('Failed to fetch'))],
])('when /me fails with %s the app says the server is unreachable, and Try again recovers', async (_, failure) => {
  let meFails = true;
  mockBackend({
    'GET /api/me': () => (meFails ? failure() : respond(200, { user: returningUser })),
  });
  renderApp('/');

  expect(await screen.findByRole('alert')).toHaveTextContent(/student helper can't reach the server right now/i);
  expect(screen.queryByRole('button', { name: /sign in with google/i })).not.toBeInTheDocument();

  meFails = false;
  fireEvent.click(screen.getByRole('button', { name: /try again/i }));
  await waitFor(() => expect(window.location.pathname).toBe('/test'));
});

test('sign-in shows the unreachable message when the backend is down mid-sign-in', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [502],
  });
  renderApp('/sign_in');

  fireEvent.click(await googleButton());

  expect(await screen.findByRole('alert')).toHaveTextContent(/can't reach the server/i);
});

test('app load never calls OneSignal REST, save_interaction or the removed name endpoints', async () => {
  mockBackend({ 'GET /api/me': [401, { error: 'no session' }] });
  renderApp('/');
  await googleButton();
  await waitFor(() => expect(calls('GET /api/exams')).not.toHaveLength(0));

  const urls = global.fetch.mock.calls.map(([url]) => String(url));
  expect(urls.every((url) => url.startsWith('/api/'))).toBe(true);
  expect(urls.some((url) => /onesignal\.com|save_interaction|set_user$|get_userID/.test(url))).toBe(false);
});

test('a 401 from any API call (session expired) signs out and routes to /sign_in', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'GET /api/user_tasks': [401, { error: 'Not signed in' }],
  });
  renderApp('/tasks');

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
  expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
});

test('a 403 or 404 from an API call does not sign the user out', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'GET /api/user_tasks': [404, { error: 'Not found' }],
    'GET /api/user_subjects': [403, { error: 'Admins only' }],
  });
  renderApp('/tasks');

  expect(await screen.findByText(/hey, ada/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/tasks');
});

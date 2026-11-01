import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OneSignal from 'react-onesignal';
import { openGoogleSignIn, GoogleSignInCancelled } from './services/googlePopup';
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
// The real popup goes to Google; here it hands back an ID token the way
// google-callback.html relays it. (Playwright covers the popup itself.)
jest.mock('./services/googlePopup', () => {
  const actual = jest.requireActual('./services/googlePopup');
  return { ...actual, openGoogleSignIn: jest.fn(() => Promise.resolve('google-id-token')) };
});

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

const googleButton = () => screen.findByRole('button', { name: 'GET STARTED FOR FREE' });
const SIGN_IN_ERROR = "We couldn't sign you in right now. Please try again.";

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(noopContext);
  localStorage.clear();
  jest.clearAllMocks();
  // CRA resets mock implementations between tests.
  openGoogleSignIn.mockImplementation(() => Promise.resolve('google-id-token'));
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('a signed-out visitor sees the landing page, with no flash while /me is pending', async () => {
  let answerMe;
  mockBackend({ 'GET /api/me': () => new Promise((resolve) => { answerMe = resolve; }) });
  renderApp('/');

  expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'GET STARTED FOR FREE' })).not.toBeInTheDocument();
  expect(calls('GET /api/me')[0][1]).toMatchObject({ credentials: 'include' });

  answerMe(await respond(401, { error: 'no session' }));
  expect(await googleButton()).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Smarter, Faster CXC Exam Prep' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
  expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
});

test.each(['/tasks', '/sign_in', '/test/pastpaper/3'])('signed-out visitors opening %s see the landing page', async (path) => {
  mockBackend({ 'GET /api/me': [401, { error: 'no session' }] });
  renderApp(path);

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
});

test('a valid session from /me is restored and routed to Tasks; legacy identity keys are cleared', async () => {
  localStorage.setItem('userID', '150');
  localStorage.setItem('user', JSON.stringify({ id: 150 }));
  mockBackend({ 'GET /api/me': [200, { user: returningUser }] });
  renderApp('/');

  await waitFor(() => expect(window.location.pathname).toBe('/tasks'));
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

test('Google sign-in for a new user posts the credential and goes to profile setup', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [200, { user: newUser }],
  });
  renderApp('/');

  fireEvent.click(await googleButton());

  expect(await screen.findByText(/select default exam/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
  const [[, opts]] = calls('POST /api/auth/google');
  expect(opts.credentials).toBe('include');
  expect(JSON.parse(opts.body)).toEqual({ credential: 'google-id-token' });
  expect(OneSignal.setExternalUserId).toHaveBeenCalledWith('8');
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
});

test('Google sign-in for a returning user with a default exam goes to Tasks', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [200, { user: returningUser }],
  });
  renderApp('/');

  fireEvent.click(await googleButton());

  await waitFor(() => expect(window.location.pathname).toBe('/tasks'));
});

test('backing out of Google shows no error and the button works again', async () => {
  mockBackend({ 'GET /api/me': [401, { error: 'no session' }] });
  openGoogleSignIn.mockImplementationOnce(() => Promise.reject(new GoogleSignInCancelled()));
  renderApp('/');

  fireEvent.click(await googleButton());
  await waitFor(() => expect(openGoogleSignIn).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(calls('POST /api/auth/google')).toHaveLength(0);

  fireEvent.click(screen.getByRole('button', { name: 'GET STARTED FOR FREE' }));
  expect(openGoogleSignIn).toHaveBeenCalledTimes(2);
});

test('a rejected Google sign-in shows the sign-in error and stays signed out', async () => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': [401, { error: 'invalid token' }],
  });
  renderApp('/');

  fireEvent.click(await googleButton());

  expect(await screen.findByRole('alert')).toHaveTextContent(SIGN_IN_ERROR);
  expect(screen.getByRole('button', { name: 'GET STARTED FOR FREE' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
});

test('sign-out ends the session and returns to the landing page', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'POST /api/auth/logout': [204],
  });
  renderApp('/sign_in');

  fireEvent.click(await screen.findByRole('button', { name: /sign out/i }));

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
  expect(calls('POST /api/auth/logout')[0][1]).toMatchObject({ credentials: 'include' });
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
])('when /me fails with %s an inside page says the server is unreachable, and Try again recovers', async (_, failure) => {
  let meFails = true;
  mockBackend({
    'GET /api/me': () => (meFails ? failure() : respond(200, { user: returningUser })),
  });
  renderApp('/track');

  expect(await screen.findByRole('alert')).toHaveTextContent(/student helper can't reach the server right now/i);
  expect(screen.queryByRole('button', { name: 'GET STARTED FOR FREE' })).not.toBeInTheDocument();

  meFails = false;
  fireEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByText(/track/i, { selector: 'h1' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/track');
});

test('when /me is unreachable the landing page still shows, and sign-in shows the sign-in error', async () => {
  mockBackend({
    'GET /api/me': () => Promise.reject(new TypeError('Failed to fetch')),
    'POST /api/auth/google': () => Promise.reject(new TypeError('Failed to fetch')),
  });
  renderApp('/');

  fireEvent.click(await googleButton());
  expect(await screen.findByRole('alert')).toHaveTextContent(SIGN_IN_ERROR);
  expect(window.location.pathname).toBe('/');
});

test.each([
  ['a 502', () => respond(502)],
  ['a network error', () => Promise.reject(new TypeError('Failed to fetch'))],
])('sign-in shows the sign-in error when the backend fails mid-sign-in (%s)', async (_, failure) => {
  mockBackend({
    'GET /api/me': [401, { error: 'no session' }],
    'POST /api/auth/google': failure,
  });
  renderApp('/');

  fireEvent.click(await googleButton());

  expect(await screen.findByRole('alert')).toHaveTextContent(SIGN_IN_ERROR);
  expect(screen.getByRole('button', { name: 'GET STARTED FOR FREE' })).toBeEnabled();
});

test('app load never calls OneSignal REST, save_interaction or the removed name endpoints', async () => {
  mockBackend({ 'GET /api/me': [401, { error: 'no session' }] });
  renderApp('/');
  await googleButton();

  const urls = global.fetch.mock.calls.map(([url]) => String(url));
  expect(urls.every((url) => url.startsWith('/api/'))).toBe(true);
  expect(urls.some((url) => /onesignal\.com|save_interaction|set_user$|get_userID/.test(url))).toBe(false);
});

test('a 401 from any API call (session expired) signs out and shows the landing page', async () => {
  mockBackend({
    'GET /api/me': [200, { user: returningUser }],
    'GET /api/user_tasks': [401, { error: 'Not signed in' }],
  });
  renderApp('/tasks');

  expect(await googleButton()).toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
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

test.each([
  ['an admin', 'admin', true],
  ['a student', 'student', false],
])('the admin Insert link shows for %s only (role from /me, not a user id)', async (_, role, shown) => {
  mockBackend({ 'GET /api/me': [200, { user: { ...returningUser, id: 150, role } }] });
  renderApp('/tasks');

  expect(await screen.findByText(/hey, ada/i)).toBeInTheDocument();
  expect(Boolean(document.querySelector('a[href="/insert_objective"]'))).toBe(shown);
});

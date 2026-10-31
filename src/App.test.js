import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import AppContext from './AppContext';

// Third-party side effects that don't belong in a unit test.
jest.mock('react-onesignal', () => ({
  __esModule: true,
  default: { init: jest.fn(), setExternalUserId: jest.fn() },
}));
jest.mock('@vercel/analytics', () => ({ inject: jest.fn() }));
// Dev-only page that pulls TensorFlow into the module graph.
jest.mock('./SentenceSimilarity', () => () => null);

// jsdom has no canvas; App draws a decorative dot grid on load.
const noopContext = new Proxy({}, { get: () => () => {} });

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(noopContext);
  localStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('a signed-out visitor lands on the sign-in form', async () => {
  render(
    <AppContext>
      <App />
    </AppContext>
  );

  expect(await screen.findByRole('button', { name: /submit/i })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/sign_in');
});

test('app load never calls OneSignal REST or save_interaction from the browser', async () => {
  render(
    <AppContext>
      <App />
    </AppContext>
  );
  await screen.findByRole('button', { name: /submit/i });
  // Sign-in loads the exam list, proving requests go through the /api base.
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/api/exams', expect.anything())
  );

  const urls = global.fetch.mock.calls.map(([url]) => String(url));
  expect(urls.every((url) => url.startsWith('/api/'))).toBe(true);
  expect(urls.some((url) => /onesignal\.com|save_interaction/.test(url))).toBe(false);
});

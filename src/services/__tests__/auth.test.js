import {
  getSession,
  signInWithGoogle,
  signOut,
  ServerUnreachableError,
  SignInRejectedError,
} from '../auth';

const respond = (status, body) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError('no body')) : Promise.resolve(body)),
  });

afterEach(() => {
  delete global.fetch;
});

const user = { id: 7, fname: 'Ada', lname: 'L', email: 'ada@example.com', default_exam: 1, role: 'student', is_new: false };

test('getSession sends the cookie and returns the user', async () => {
  global.fetch = jest.fn(() => respond(200, { user }));
  await expect(getSession()).resolves.toEqual(user);
  expect(global.fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({ method: 'GET', credentials: 'include' }));
});

test('getSession returns null on 401', async () => {
  global.fetch = jest.fn(() => respond(401, { error: 'no session' }));
  await expect(getSession()).resolves.toBeNull();
});

test.each([
  ['network error', () => Promise.reject(new TypeError('Failed to fetch'))],
  ['502', () => respond(502)],
  ['200 with a non-JSON body', () => respond(200)],
])('getSession throws ServerUnreachableError on %s', async (_, impl) => {
  global.fetch = jest.fn(impl);
  await expect(getSession()).rejects.toBeInstanceOf(ServerUnreachableError);
});

test('signInWithGoogle posts only the credential', async () => {
  global.fetch = jest.fn(() => respond(200, { user: { ...user, is_new: true } }));
  await expect(signInWithGoogle('id-token')).resolves.toMatchObject({ id: 7, is_new: true });
  const [url, opts] = global.fetch.mock.calls[0];
  expect(url).toBe('/api/auth/google');
  expect(opts.method).toBe('POST');
  expect(opts.credentials).toBe('include');
  expect(JSON.parse(opts.body)).toEqual({ credential: 'id-token' });
});

test('signInWithGoogle rejects with the backend error on 401', async () => {
  global.fetch = jest.fn(() => respond(401, { error: 'invalid token' }));
  await expect(signInWithGoogle('bad')).rejects.toEqual(new SignInRejectedError('invalid token'));
});

test('signInWithGoogle throws ServerUnreachableError on 503', async () => {
  global.fetch = jest.fn(() => respond(503));
  await expect(signInWithGoogle('id-token')).rejects.toBeInstanceOf(ServerUnreachableError);
});

test('signOut posts to logout and accepts 204 or 401', async () => {
  global.fetch = jest.fn(() => respond(204));
  await expect(signOut()).resolves.toBeUndefined();
  expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST', credentials: 'include' }));

  global.fetch = jest.fn(() => respond(401));
  await expect(signOut()).resolves.toBeUndefined();
});

test('signOut throws ServerUnreachableError on a 5xx', async () => {
  global.fetch = jest.fn(() => respond(500));
  await expect(signOut()).rejects.toBeInstanceOf(ServerUnreachableError);
});

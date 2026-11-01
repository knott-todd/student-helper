import { openGoogleSignIn, buildAuthUrl, GoogleSignInCancelled, GoogleSignInFailed, MESSAGE_TYPE } from '../googlePopup';

const b64url = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fakeIdToken = (nonce) => `${b64url({ alg: 'none' })}.${b64url({ nonce, email: 'k@example.com' })}.sig`;

let opened;
beforeEach(() => {
  opened = [];
  jest.spyOn(window, 'open').mockImplementation((url) => {
    opened.push(new URL(url));
    return {};
  });
});
afterEach(() => jest.restoreAllMocks());

// What google-callback.html relays, delivered as a same-origin postMessage.
const reply = (fragment, origin = window.location.origin) =>
  window.dispatchEvent(new MessageEvent('message', { origin, data: { type: MESSAGE_TYPE, fragment } }));

const lastParams = () => opened[opened.length - 1].searchParams;

test('asks Google for an ID token with the account picker, state and nonce', () => {
  const url = new URL(buildAuthUrl({ state: 's', nonce: 'n', origin: 'https://app.test', clientId: 'cid' }));
  expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    client_id: 'cid',
    redirect_uri: 'https://app.test/google-callback.html',
    response_type: 'id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: 's',
    nonce: 'n',
  });
});

test('resolves to the ID token when state and nonce match', async () => {
  const result = openGoogleSignIn();
  const p = lastParams();
  reply(`#state=${p.get('state')}&id_token=${fakeIdToken(p.get('nonce'))}`);
  await expect(result).resolves.toBe(fakeIdToken(p.get('nonce')));
});

test('ignores replies from another origin or for another attempt', async () => {
  const result = openGoogleSignIn();
  const p = lastParams();
  reply(`#state=${p.get('state')}&id_token=${fakeIdToken(p.get('nonce'))}`, 'https://evil.test');
  reply(`#state=other&id_token=${fakeIdToken(p.get('nonce'))}`);
  reply(`#state=${p.get('state')}&error=access_denied`);
  await expect(result).rejects.toBeInstanceOf(GoogleSignInCancelled);
});

test('rejects a token minted for a different nonce', async () => {
  const result = openGoogleSignIn();
  reply(`#state=${lastParams().get('state')}&id_token=${fakeIdToken('not-ours')}`);
  await expect(result).rejects.toBeInstanceOf(GoogleSignInFailed);
});

test('rejects when Google reports an error other than cancel', async () => {
  const result = openGoogleSignIn();
  reply(`#state=${lastParams().get('state')}&error=server_error`);
  await expect(result).rejects.toBeInstanceOf(GoogleSignInFailed);
});

test('rejects when the popup is blocked', async () => {
  window.open.mockReturnValueOnce(null);
  await expect(openGoogleSignIn()).rejects.toBeInstanceOf(GoogleSignInFailed);
});

test('a new click supersedes an abandoned attempt (popup closed)', async () => {
  openGoogleSignIn(); // never answered: the student closed the popup
  const first = lastParams();
  const second = openGoogleSignIn();
  const p = lastParams();
  expect(p.get('state')).not.toBe(first.get('state'));
  reply(`#state=${p.get('state')}&id_token=${fakeIdToken(p.get('nonce'))}`);
  await expect(second).resolves.toBe(fakeIdToken(p.get('nonce')));
});

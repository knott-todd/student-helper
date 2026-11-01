// Shared mocks for the landing scenarios: the Student Helper backend (/api)
// and Google's account picker. Nothing leaves the machine.
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test');

const EVIDENCE_DIR = process.env.EVIDENCE_DIR || path.join(__dirname, 'evidence');

// Example visitors from the scenarios.
const USERS = {
  keisha: { id: 101, fname: 'Keisha', lname: 'Test', email: 'keisha@example.com', default_exam: null, role: 'student', is_new: true },
  dario: { id: 102, fname: 'Dario', lname: 'Test', email: 'dario@example.com', default_exam: 1, role: 'student', is_new: false },
};

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const fakeIdToken = ({ email, nonce }) => `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ email, nonce })}.test-signature`;
const emailOf = (credential) => {
  try {
    return JSON.parse(Buffer.from(credential.split('.')[1], 'base64url').toString()).email;
  } catch (error) {
    return undefined;
  }
};

// Stand-in for accounts.google.com's account picker: one button per visitor.
// Picking one redirects to the redirect_uri the app asked for, with an ID
// token carrying the app's nonce, exactly like Google's implicit flow.
const googlePickerHtml = (authUrl) => {
  const q = new URL(authUrl).searchParams;
  const picks = Object.values(USERS).map((u) => {
    const fragment = new URLSearchParams({ state: q.get('state'), id_token: fakeIdToken({ email: u.email, nonce: q.get('nonce') }) });
    return `<button id="pick-${u.fname.toLowerCase()}" onclick="location.href='${q.get('redirect_uri')}#${fragment}'">${u.email}</button>`;
  });
  return `<!doctype html><title>Google (stub)</title><body><h1>Choose an account</h1>${picks.join('')}</body>`;
};

// backend: { signedInAs: 'dario' | null, down: false, signInDown: false }
async function mockEverything(context, backend) {
  const state = { sessionUser: backend.signedInAs ? USERS[backend.signedInAs] : null, authCalls: [] };

  // Block every third-party request (fonts CDN, OneSignal, analytics): the
  // tests must not depend on the network.
  await context.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());

  await context.route(/^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: googlePickerHtml(route.request().url()) })
  );

  await context.route(/^http:\/\/localhost:\d+\/api\//, async (route) => {
    const req = route.request();
    const p = new URL(req.url()).pathname.replace(/^\/api/, '');
    const key = `${req.method()} ${p}`;
    if (backend.down) return route.abort('connectionrefused');
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (key === 'GET /me') return state.sessionUser ? json(200, { user: state.sessionUser }) : json(401, { error: 'Not signed in' });
    if (key === 'POST /auth/google') {
      const { credential } = req.postDataJSON();
      state.authCalls.push(credential);
      if (backend.signInDown) return route.abort('connectionrefused');
      const user = Object.values(USERS).find((u) => u.email === emailOf(credential));
      if (!user) return json(401, { error: 'invalid token' });
      state.sessionUser = user;
      return json(200, { user });
    }
    if (!state.sessionUser) return json(401, { error: 'Not signed in' });
    if (key === 'GET /user_exam') return json(200, [{ default_exam: state.sessionUser.default_exam }]);
    if (key === 'GET /exams') return json(200, [{ id: 1, short_name: 'CSEC' }, { id: 2, short_name: 'CAPE' }]);
    if (key === 'GET /user_subjects') return json(200, state.sessionUser.default_exam ? [{ id: 5, name: 'Pure Mathematics', fa_icon: 'infinity', exam: null }] : []);
    if (key === 'GET /user_tasks') return json(200, []);
    return json(200, []);
  });

  return state;
}

const test = base.test.extend({
  // Per-test backend setup; override with test.use({ backend: {...} }).
  backend: [{ signedInAs: null, down: false, signInDown: false }, { option: true }],
  mocks: async ({ context, backend }, use) => {
    // Same accent on every page load, so the landing and Tasks pages can be
    // compared (the app picks a random accent per load).
    await context.addInitScript(() => { Math.random = () => 0.5; });
    await use(await mockEverything(context, backend));
  },
});

const shot = async (page, name) => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `${name}.png`) });
};

module.exports = { test, expect: base.expect, USERS, shot, EVIDENCE_DIR };

// API v2 contract (docs/api-v2-map.md, shared with the backend): every
// SQLService function in the map calls exactly its New path with its method,
// sends the session cookie, and never sends a user id.
import * as SQLService from '../SQLService';

const fs = require('fs');
const path = require('path');

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const unticks = cell => cell.replace(/`/g, '').trim();

const rows = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'docs', 'api-v2-map.md'), 'utf8')
  .split('\n')
  .map(line => line.split('|').slice(1, -1).map(c => c.trim()))
  .filter(cells => cells.length === 7 && METHODS.includes(cells[0]))
  .map(([method, , newPath, access, body, fn]) => ({
    method, path: unticks(newPath), access, body: unticks(body), fn: unticks(fn),
  }));

// Rows the SQLService implements (auth.* lives in services/auth.js and has its own tests).
const serviceRows = rows.filter(r => r.fn !== '-' && !r.fn.startsWith('auth.'));

const bodyKeys = body => (body === '-' ? [] : body.replace(/^\{|\}$/g, '').split(',').map(k => k.trim().split(':')[0].trim()).filter(Boolean));

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) }));
});

afterEach(() => {
  delete global.fetch;
});

test('the map parses and every SQLService export is in it (nothing calls an unmapped path)', () => {
  expect(serviceRows.length).toBeGreaterThanOrEqual(40);
  const mapped = new Set(serviceRows.map(r => r.fn));
  const exported = Object.keys(SQLService).filter(k => typeof SQLService[k] === 'function');
  expect(exported.filter(k => !mapped.has(k))).toEqual([]);
  expect([...mapped].filter(k => !exported.includes(k))).toEqual([]);
});

test.each(serviceRows.map(r => [r.fn, r]))('%s calls its mapped path, with cookies and no user id', async (fn, row) => {
  const params = (row.path.match(/:[A-Za-z_]+/g) || []);
  const args = Array.from({ length: SQLService[fn].length }, (_, i) => i + 1);
  await SQLService[fn](...args);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, opts] = global.fetch.mock.calls[0];
  let expected = row.path;
  params.forEach((p, i) => { expected = expected.replace(p, String(args[i])); });
  expect(url).toBe(`/api${expected}`);
  expect(opts.method).toBe(row.method);
  expect(opts.credentials).toBe('include');
  expect(opts.headers).not.toHaveProperty('Authorization');

  if (opts.body !== undefined) {
    const sent = JSON.parse(opts.body);
    if (sent && typeof sent === 'object') {
      const allowed = bodyKeys(row.body);
      Object.keys(sent).forEach(k => expect(allowed).toContain(k));
    }
  }
  expect(`${url} ${opts.body || ''}`).not.toMatch(/user_?id/i);
});

test('a 401 from any call is reported once to the session handler; reads still resolve to []', async () => {
  const { onUnauthorized } = require('../session');
  const handler = jest.fn();
  const off = onUnauthorized(handler);
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Not signed in' }) }));

  await expect(SQLService.getUserTasks()).resolves.toEqual([]);
  expect(handler).toHaveBeenCalledTimes(1);
  await SQLService.updateTaskComplete(1, 1);
  expect(handler).toHaveBeenCalledTimes(2);
  off();
});

test('other errors are not treated as signed out', async () => {
  const { onUnauthorized } = require('../session');
  const handler = jest.fn();
  const off = onUnauthorized(handler);
  for (const status of [403, 404, 500]) {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error: 'x' }) }));
    await expect(SQLService.getTaskInfo(1)).resolves.toEqual([]);
  }
  expect(handler).not.toHaveBeenCalled();
  off();
});

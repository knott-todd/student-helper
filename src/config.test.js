const loadConfig = (env) => {
  const saved = process.env;
  process.env = { ...saved, ...env };
  let config;
  jest.isolateModules(() => {
    config = require('./config');
  });
  process.env = saved;
  return config;
};

test('defaults the API base to /api', () => {
  expect(loadConfig({ REACT_APP_API_URL: '' }).API_URL).toBe('/api');
});

test('uses REACT_APP_API_URL without a trailing slash', () => {
  expect(loadConfig({ REACT_APP_API_URL: 'http://localhost:3080/' }).API_URL).toBe('http://localhost:3080');
});

test('admin and quiz are hidden in production by default', () => {
  const config = loadConfig({ NODE_ENV: 'production', REACT_APP_ENABLE_ADMIN: '', REACT_APP_ENABLE_QUIZ: '' });
  expect(config.ENABLE_ADMIN).toBe(false);
  expect(config.ENABLE_QUIZ).toBe(false);
});

test('flags can re-enable admin and quiz in production', () => {
  const config = loadConfig({ NODE_ENV: 'production', REACT_APP_ENABLE_ADMIN: 'true', REACT_APP_ENABLE_QUIZ: 'true' });
  expect(config.ENABLE_ADMIN).toBe(true);
  expect(config.ENABLE_QUIZ).toBe(true);
});

test('Google client ID has a public default and can be overridden', () => {
  expect(loadConfig({ REACT_APP_GOOGLE_CLIENT_ID: '' }).GOOGLE_CLIENT_ID).toMatch(/\.apps\.googleusercontent\.com$/);
  expect(loadConfig({ REACT_APP_GOOGLE_CLIENT_ID: 'other.apps.googleusercontent.com' }).GOOGLE_CLIENT_ID).toBe('other.apps.googleusercontent.com');
});

test('privacy contact email defaults to hello@olusanyatodd.com and can be overridden', () => {
  expect(loadConfig({ REACT_APP_PRIVACY_CONTACT_EMAIL: '' }).PRIVACY_CONTACT_EMAIL).toBe('hello@olusanyatodd.com');
  expect(loadConfig({ REACT_APP_PRIVACY_CONTACT_EMAIL: 'x@example.com' }).PRIVACY_CONTACT_EMAIL).toBe('x@example.com');
});

test('push is off unless REACT_APP_ENABLE_PUSH=true', () => {
  expect(loadConfig({ REACT_APP_ENABLE_PUSH: '' }).ENABLE_PUSH).toBe(false);
  expect(loadConfig({ REACT_APP_ENABLE_PUSH: 'true' }).ENABLE_PUSH).toBe(true);
});

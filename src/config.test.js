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

import { addTask, updateTask, deleteTask } from '../SQLService';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ affectedRows: 1 }) })
  );
});

afterEach(() => {
  delete global.fetch;
});

const calls = () => global.fetch.mock.calls.map(([url, opts]) => ({ url, opts }));

test('addTask posts to the backend only, with no notification id', async () => {
  await addTask({ taskText: 'Revise', subject: 3, deadline: '2026-11-05' }, 42);

  expect(calls()).toHaveLength(1);
  const [{ url, opts }] = calls();
  expect(url).toBe('/api/add_task');
  expect(opts.method).toBe('POST');
  expect(JSON.parse(opts.body)).toEqual({
    taskText: 'Revise', subject: 3, deadline: '2026-11-05', userID: 42, notificationID: null,
  });
});

test('updateTask puts to the backend only', async () => {
  await updateTask(7, 'Revise ch.2', 3, '2026-11-06');

  expect(calls()).toHaveLength(1);
  expect(calls()[0].url).toBe('/api/update_task');
  expect(calls()[0].opts.method).toBe('PUT');
});

test('deleteTask deletes via the backend only', async () => {
  await deleteTask(7);

  expect(calls()).toHaveLength(1);
  expect(calls()[0].url).toBe('/api/delete_task/7');
  expect(calls()[0].opts.method).toBe('DELETE');
});

test('no request carries an Authorization header', async () => {
  await addTask({ taskText: 'x', subject: 1, deadline: '2026-11-05' }, 1);
  await updateTask(1, 'x', 1, '2026-11-05');
  await deleteTask(1);

  calls().forEach(({ opts }) => {
    expect(opts.headers).not.toHaveProperty('Authorization');
  });
});

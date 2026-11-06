// Acceptance scenarios 7, 9-13, 16, 17, 19 (CAPE Pure Maths launch).
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import AppContext from './AppContext';
import { modulesForUnit, sortModules, subjectUnit, hasUnits, sortById } from './curriculum';

jest.mock('react-onesignal', () => ({
  __esModule: true,
  default: { init: jest.fn(), setExternalUserId: jest.fn(), removeExternalUserId: jest.fn() },
}));
jest.mock('@vercel/analytics', () => ({ inject: jest.fn() }));
jest.mock('./SentenceSimilarity', () => () => null);

const noopContext = new Proxy({}, { get: () => () => {} });
const student = { id: 7, fname: 'Ada', lname: 'Lovelace', email: 'ada@example.com', default_exam: 1, role: 'student', is_new: false };
const exams = [{ id: 1, short_name: 'CAPE' }, { id: 2, short_name: 'CSEC' }];
const pureMaths = { id: 4, name: 'Pure Mathematics', fa_icon: 'infinity', exam: null };

const respond = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

const mod = (id, unit, number, name) => ({
  module: { id, unit_number: unit, number, name, image_url: null },
  avgFam: 0.42, lowestFamiliarity: 0.1, topic: { id: 99, name: 'Lowest topic' },
});
// Out of syllabus order on purpose, with familiarity scores that would have sorted them.
const modules = [
  mod(13, 2, 3, 'Integration'), mod(2, 1, 2, 'Trigonometry'), mod(1, 1, 1, 'Basic Algebra and Functions'),
  mod(3, 1, 3, 'Calculus I'), mod(11, 2, 1, 'Complex Numbers'),
];

let userSubjects;
const mockBackend = (routes = {}) => {
  global.fetch = jest.fn((url, opts = {}) => {
    const key = `${opts.method || 'GET'} ${url}`;
    if (key in routes) {
      const route = routes[key];
      return typeof route === 'function' ? route(url, opts) : respond(...route);
    }
    if (key === 'GET /api/me') return respond(200, { user: student });
    if (key === 'GET /api/user_exam') return respond(200, [{ default_exam: 1 }]);
    if (key === 'GET /api/exams') return respond(200, exams);
    if (key === 'GET /api/user_subjects') return respond(200, userSubjects);
    if (key === 'GET /api/exam_subjects/1') return respond(200, [{ id: 4, name: 'Pure Mathematics' }]);
    if (key === 'GET /api/familiarity/4/1') return respond(200, modules);
    return respond(200, []);
  });
};
const calls = (key) => global.fetch.mock.calls.filter(([url, opts = {}]) => `${opts.method || 'GET'} ${url}` === key);

const renderApp = (path) => {
  window.history.pushState({}, '', path);
  return render(<AppContext><App /></AppContext>);
};

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(noopContext);
  localStorage.clear();
  userSubjects = [{ ...pureMaths }];
});
afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

const moduleHeadings = async () => {
  await screen.findAllByRole('heading', { level: 2 });
  return screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
};
const noSelfRating = () => {
  expect(screen.queryByText(/next:/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/familiarity/i)).not.toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(/\d%/);
};

describe('Past Papers (16, 17)', () => {
  test('the bottom menu tab is labelled "Past Papers"', async () => {
    mockBackend();
    renderApp('/tasks');
    expect(await screen.findByText(/hey, ada/i)).toBeInTheDocument();
    const tab = document.querySelector('.navbar a[href="/test"]');
    expect(tab).toHaveTextContent('Past Papers');
    expect(tab).not.toHaveTextContent(/^Test$/);
  });

  test.each(['/test', '/test/pastpaper/3', '/test/markscheme/3', '/test/questions/3', '/track/topic_questions/5', '/track/objective_questions/5'])(
    '%s shows "Pure Maths papers coming soon" and asks for no papers',
    async (path) => {
      mockBackend();
      renderApp(path);
      expect(await screen.findByText('Pure Maths papers coming soon')).toBeInTheDocument();
      expect(window.location.pathname).toBe(path);
      const urls = global.fetch.mock.calls.map(([url]) => url);
      expect(urls.some((u) => /userpapers|pastpaper|markscheme|\/questions\/|topic_questions|objective_questions/.test(u))).toBe(false);
      expect(screen.queryByRole('combobox', { name: /familiarity/i })).not.toBeInTheDocument();
    },
  );
});

describe('Track (9, 10, 11, 12, 19)', () => {
  test('a new student (no unit saved) sees Unit 1 modules in syllabus order, with no self-rating', async () => {
    mockBackend();
    renderApp('/track');
    expect(await moduleHeadings()).toEqual(['M1: Basic Algebra and Functions', 'M2: Trigonometry', 'M3: Calculus I']);
    noSelfRating();
  });

  test('a student on Unit 2 sees only Unit 2 modules', async () => {
    userSubjects = [{ ...pureMaths, unit: 2 }];
    mockBackend();
    renderApp('/track');
    expect(await moduleHeadings()).toEqual(['M1: Complex Numbers', 'M3: Integration']);
  });

  test.each([['empty', [200, []]], ['failed', [500, { error: 'boom' }]]])('an %s module list shows a clear message', async (_, route) => {
    mockBackend({ 'GET /api/familiarity/4/1': route });
    renderApp('/track');
    expect(await screen.findByText('No modules to show for Unit 1 yet.')).toBeInTheDocument();
  });
});

describe('Module and Topic (11, 12, 13, 19)', () => {
  const topicsRows = [
    { topic: { id: 7, name: 'Functions' }, topicFam: 0.1, objective: { id: 1, info: 'lowest objective' } },
    { topic: { id: 5, name: 'Reasoning and Logic' }, topicFam: 0.9, objective: { id: 2, info: 'x' } },
    { topic: { id: 6, name: 'Algebraic Operations' }, topicFam: null, objective: {} },
  ];

  test('topics show in syllabus order and a topic name opens its objectives page', async () => {
    mockBackend({
      'GET /api/module_info/1': [200, { id: 1, name: 'Basic Algebra and Functions' }],
      'GET /api/topics_familiarity/1': [200, topicsRows],
      'GET /api/topic/5': [200, { id: 5, name: 'Reasoning and Logic' }],
      'GET /api/topic_objectives/5': [200, [
        { id: 31, info: 'establish the truth value of compound statements;', combined: -1 },
        { id: 30, info: 'identify simple and compound propositions;', combined: 1 },
      ]],
    });
    renderApp('/track/module/1');
    expect(await moduleHeadings()).toEqual(['Reasoning and Logic', 'Algebraic Operations', 'Functions']);
    noSelfRating();

    const link = screen.getByRole('link', { name: 'Reasoning and Logic' });
    expect(link).toHaveAttribute('href', '/track/topic/5');
    fireEvent.click(link);

    expect(await screen.findByText('identify simple and compound propositions;')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/track/topic/5');
    const objectives = [...document.querySelectorAll('.topic-objective')].map((p) => p.textContent.trim());
    expect(objectives).toEqual(['identify simple and compound propositions;', 'establish the truth value of compound statements;']);
  });

  test('empty topic and objective lists show a message, not a crash', async () => {
    mockBackend();
    renderApp('/track/module/1');
    expect(await screen.findByText('No topics to show for this module yet.')).toBeInTheDocument();
  });

  test('a topic with no objectives shows a message', async () => {
    mockBackend({ 'GET /api/topic_objectives/5': [500, { error: 'boom' }] });
    renderApp('/track/topic/5');
    expect(await screen.findByText('No objectives to show for this topic yet.')).toBeInTheDocument();
  });
});

describe('Profile (7, 9, 10)', () => {
  test('a ticked CAPE subject has a Unit choice; new students start on Unit 1; changing it saves unit', async () => {
    let saved = { ...pureMaths };
    userSubjects = [saved];
    mockBackend({
      'PUT /api/set_user_subject': (url, opts) => {
        const { subject } = JSON.parse(opts.body);
        saved = { ...pureMaths, unit: subject.unit };
        userSubjects = [saved];
        return respond(200, { affectedRows: 1 });
      },
    });
    renderApp('/sign_in');

    const unit = await screen.findByRole('combobox', { name: 'Pure Mathematics unit' });
    expect(unit).toHaveValue('1');
    fireEvent.change(unit, { target: { value: '2' } });

    await waitFor(() => expect(calls('PUT /api/set_user_subject')).toHaveLength(1));
    expect(JSON.parse(calls('PUT /api/set_user_subject')[0][1].body).subject).toMatchObject({ id: 4, isUserSub: true, unit: 2 });
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Pure Mathematics unit' })).toHaveValue('2'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('a failed unit save says so and puts the choice back', async () => {
    mockBackend({ 'PUT /api/set_user_subject': [500, { error: 'boom' }] });
    renderApp('/sign_in');

    const unit = await screen.findByRole('combobox', { name: 'Pure Mathematics unit' });
    fireEvent.change(unit, { target: { value: '2' } });

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save that change");
    expect(screen.getByRole('combobox', { name: 'Pure Mathematics unit' })).toHaveValue('1');
  });

  test('CAPE lists the subjects from the data; choosing CSEC with none says "CSEC subjects coming soon"', async () => {
    userSubjects = [];
    mockBackend({ 'PUT /api/set_user_exam': [200, { affectedRows: 1 }] });
    renderApp('/sign_in');

    expect(await screen.findByText('Pure Mathematics')).toBeInTheDocument();
    const examSelect = screen.getByRole('combobox', { name: 'Default exam' });
    await waitFor(() => expect([...examSelect.options].map((o) => o.textContent)).toEqual(['', 'CAPE', 'CSEC']));

    fireEvent.change(examSelect, { target: { value: '2' } });
    expect(await screen.findByText('CSEC subjects coming soon')).toBeInTheDocument();
    expect(screen.queryByText('Pure Mathematics', { selector: 'label' })).not.toBeInTheDocument();
  });
});

describe('curriculum helpers', () => {
  test('subjectUnit defaults to Unit 1', () => {
    expect(subjectUnit(undefined)).toBe(1);
    expect(subjectUnit({})).toBe(1);
    expect(subjectUnit({ unit: 3 })).toBe(1);
    expect(subjectUnit({ unit: '2' })).toBe(2);
  });
  test('hasUnits is CAPE only', () => {
    expect(hasUnits('CAPE')).toBe(true);
    expect(hasUnits('CSEC')).toBe(false);
    expect(hasUnits('')).toBe(false);
  });
  test('modulesForUnit filters by unit; sortModules and sortById give syllabus order', () => {
    expect(sortModules(modulesForUnit(modules, 2)).map((m) => m.module.id)).toEqual([11, 13]);
    expect(modulesForUnit(null, 1)).toEqual([]);
    expect(sortById([{ id: 3 }, { id: 1 }, { id: 2 }]).map((t) => t.id)).toEqual([1, 2, 3]);
  });
});

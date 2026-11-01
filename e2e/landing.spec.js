// One test per approved landing scenario (Team Board TB-35, revised 1-14).
// Chrome, 1366x768 unless the scenario says otherwise. Each saves a screenshot
// to e2e/evidence/ (EVIDENCE_DIR overrides).
const { test, expect, shot } = require('./fixtures');

const COPY = {
  headline: 'Smarter, Faster CXC Exam Prep',
  subline: "Too much to study and don't know where to start? The easiest time is now.",
  button: 'GET STARTED FOR FREE',
};
const SIGN_IN_ERROR = "We couldn't sign you in right now. Please try again.";

const headline = (page) => page.getByRole('heading', { name: COPY.headline });
const subline = (page) => page.getByText(COPY.subline, { exact: true });
const cta = (page) => page.getByRole('button', { name: COPY.button, exact: true });

// Clicks the button and returns the popup it opens.
const openGoogle = async (page) => {
  const [popup] = await Promise.all([page.context().waitForEvent('page'), cta(page).click()]);
  return popup;
};

const pickAccount = async (popup, who) => {
  // google-callback.html closes the popup itself; listen before clicking.
  const closed = popup.isClosed() ? Promise.resolve() : popup.waitForEvent('close');
  await popup.locator(`#pick-${who}`).click({ noWaitAfter: true });
  await closed;
};

test.describe('What a visitor sees', () => {
  test('1. First look: copy and button above the fold within 3 s', async ({ page, mocks }) => {
    const started = Date.now();
    await page.goto('/');
    await expect(headline(page)).toBeVisible({ timeout: 3000 });
    await expect(subline(page)).toBeVisible({ timeout: 3000 });
    await expect(cta(page)).toBeVisible({ timeout: 3000 });
    expect(Date.now() - started).toBeLessThan(3000);

    for (const el of [headline(page), subline(page), cta(page)]) {
      const box = await el.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(768);
    }
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await shot(page, '01-first-look');
  });

  test('2. Only his copy: headline, line, button, footer Privacy link', async ({ page, mocks }) => {
    await page.goto('/');
    await expect(cta(page)).toBeVisible();

    const lines = (await page.locator('body').innerText()).split('\n').map((l) => l.trim()).filter(Boolean);
    expect(lines).toEqual([COPY.headline, COPY.subline, COPY.button, 'Privacy']);
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy', exact: true })).toBeVisible();
    await expect(page.getByRole('link')).toHaveCount(1);
    await expect(page.getByRole('button')).toHaveCount(1);
    await shot(page, '02-only-his-copy');
  });

  test('3. No false promises: banned words and counts are absent', async ({ page, mocks }) => {
    await page.goto('/');
    await expect(cta(page)).toBeVisible();
    const text = `${await page.title()}\n${await page.locator('body').innerText()}`;

    for (const banned of [/past paper/i, /mark scheme/i, /quiz/i, /placement/i, /testimonial/i, /trusted by/i, /\b(students|users|visits)\b/i, /\d/]) {
      expect(text).not.toMatch(banned);
    }
    expect(text).toMatch(/free/i); // allowed
    await shot(page, '03-no-false-promises');
  });

  test.describe('4. Looks like the app', () => {
    test.use({ backend: { signedInAs: 'dario' } });

    test('same fonts and colours as Tasks; no illustration or image', async ({ browser, page, mocks }) => {
      const styleOf = (p, textSelector) =>
        p.evaluate((sel) => {
          const root = getComputedStyle(document.documentElement);
          const text = document.querySelector(sel);
          return {
            bodyBackground: getComputedStyle(document.body).backgroundColor,
            fontFamily: getComputedStyle(text).fontFamily,
            textColor: getComputedStyle(text).color,
            accent: root.getPropertyValue('--accent').trim(),
            accentL: root.getPropertyValue('--accent-l').trim(),
          };
        }, textSelector);

      // Tasks, signed in as Dario.
      await page.goto('/tasks');
      await expect(page.locator('h1.page-title')).toHaveText('Tasks');
      const tasks = await styleOf(page, 'h1.page-title');
      await shot(page, '04-looks-like-the-app-tasks');

      // Landing, signed out, in a separate browser context.
      const signedOut = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      await signedOut.addInitScript(() => { Math.random = () => 0.5; });
      await signedOut.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      await signedOut.route(/\/api\//, (r) => r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Not signed in"}' }));
      const landing = await signedOut.newPage();
      await landing.goto('/');
      await expect(headline(landing)).toBeVisible();
      const land = await styleOf(landing, 'h1');

      expect(land).toEqual(tasks);

      // No illustration, photo or new graphic: only the app's existing dotted
      // background canvas.
      await expect(landing.locator('img, svg, picture, video, iframe, object')).toHaveCount(0);
      expect(await landing.locator('canvas').evaluateAll((els) => els.map((e) => e.id))).toEqual(['dots']);
      const bgImages = await landing.evaluate(() =>
        [...document.querySelectorAll('.landing, .landing *')].map((e) => getComputedStyle(e).backgroundImage).filter((v) => v !== 'none')
      );
      expect(bgImages).toEqual([]);
      await shot(landing, '04-looks-like-the-app-landing');
      await signedOut.close();
    });
  });

  test('5. Tab and link preview read "Student Helper" and the headline only', async ({ page, request, mocks }) => {
    await page.goto('/');
    await expect(cta(page)).toBeVisible();
    await expect(page).toHaveTitle('Student Helper');

    // Link previews (WhatsApp) read the raw HTML without running JS.
    const html = await (await request.get('/')).text();
    const metas = [...html.matchAll(/<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"/g)].map(([, k, v]) => [k, v]);
    const meta = Object.fromEntries(metas);
    expect(html).toMatch(/<title>Student Helper<\/title>/);
    expect(meta['og:title']).toBe('Student Helper');
    expect(meta['og:description']).toBe(COPY.headline);
    expect(meta.description).toBe(COPY.headline);
    const wording = metas.filter(([k]) => /^(og:(?!type)|twitter:|description$)/.test(k)).map(([, v]) => v);
    expect(new Set(wording)).toEqual(new Set(['Student Helper', COPY.headline]));
    await shot(page, '05-tab-and-preview');
  });
});

test.describe('Signing up', () => {
  test('6. New student: Google picker opens straight away, then profile setup', async ({ page, mocks }) => {
    await page.goto('/');
    const popup = await openGoogle(page);

    // The first page the popup loads is Google's account picker.
    const auth = new URL(popup.url());
    expect(auth.origin + auth.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(auth.searchParams.get('prompt')).toBe('select_account');
    expect(new URL(page.url()).pathname).toBe('/');
    await popup.waitForLoadState();
    await shot(popup, '06-new-student-google-stub');

    await pickAccount(popup, 'keisha');
    await expect(page).toHaveURL(/\/sign_in$/);
    await expect(page.getByText('Select Default Exam')).toBeVisible();
    await expect(page.locator('select.header-dropdown option')).toHaveText(['', 'CSEC', 'CAPE']);
    expect(mocks.authCalls).toHaveLength(1);
    await shot(page, '06-new-student-profile-setup');
  });

  test('7. Returning student lands on Tasks with no profile step', async ({ page, mocks }) => {
    await page.goto('/');
    const popup = await openGoogle(page);
    const visited = [];
    page.on('framenavigated', (f) => f === page.mainFrame() && visited.push(new URL(f.url()).pathname));
    await pickAccount(popup, 'dario');

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.locator('h1.page-title')).toHaveText('Tasks');
    expect(visited).not.toContain('/sign_in');
    await shot(page, '07-returning-student-tasks');
  });

  test('8. Closing the Google window: back on landing, no error, button works again', async ({ page, mocks }) => {
    await page.goto('/');
    const first = await openGoogle(page);
    await first.close();

    await expect(cta(page)).toBeEnabled();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/');

    const second = await openGoogle(page);
    expect(new URL(second.url()).hostname).toBe('accounts.google.com');
    await second.close();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(mocks.authCalls).toHaveLength(0);
    await shot(page, '08-changes-her-mind');
  });

  test.describe('9. Sign-in cannot complete', () => {
    test.describe('server goes down mid sign-in', () => {
      test.use({ backend: { signInDown: true } });
      test('stays on landing with the error; button still works', async ({ page, mocks }) => {
        await page.goto('/');
        await pickAccount(await openGoogle(page), 'keisha');

        await expect(page.getByRole('alert')).toHaveText(SIGN_IN_ERROR);
        expect(new URL(page.url()).pathname).toBe('/');
        await expect(headline(page)).toBeVisible();
        expect(mocks.authCalls).toHaveLength(1);
        await shot(page, '09-sign-in-cannot-complete');

        const again = await openGoogle(page);
        expect(new URL(again.url()).hostname).toBe('accounts.google.com');
        await again.close();
      });
    });

    test.describe('server already down when the page opens', () => {
      test.use({ backend: { down: true } });
      test('landing still shows; picking an account shows the error', async ({ page, mocks }) => {
        await page.goto('/');
        await expect(headline(page)).toBeVisible();
        await pickAccount(await openGoogle(page), 'keisha');

        await expect(page.getByRole('alert')).toHaveText(SIGN_IN_ERROR);
        await expect(cta(page)).toBeEnabled();
        await shot(page, '09b-server-down-from-start');
      });
    });
  });

  test('10. Google only: no email/password fields or other providers', async ({ page, mocks }) => {
    await page.goto('/');
    await expect(cta(page)).toBeVisible();
    await expect(page.locator('input, textarea, select, form')).toHaveCount(0);
    const text = await page.locator('body').innerText();
    for (const other of [/apple/i, /facebook/i, /e-?mail/i, /password/i, /sign up with/i, /log ?in/i]) {
      expect(text).not.toMatch(other);
    }
    await expect(page.getByRole('button')).toHaveCount(1);
    await shot(page, '10-google-only');
  });
});

test.describe('Where the page lives', () => {
  test.describe('11. Signed-in students skip it', () => {
    test.use({ backend: { signedInAs: 'dario' } });
    test('main address goes to Tasks', async ({ page, mocks }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/tasks$/);
      await expect(page.locator('h1.page-title')).toHaveText('Tasks');
      await expect(headline(page)).toHaveCount(0);
      await shot(page, '11-signed-in-skips-landing');
    });
  });

  for (const link of ['/sign_in', '/tasks', '/tasks/task_form', '/track/module/3', '/test/pastpaper/12']) {
    test(`12. Old and inside links: ${link} shows the landing page`, async ({ page, mocks }) => {
      await page.goto(link);
      await expect(headline(page)).toBeVisible();
      await expect(cta(page)).toBeVisible();
      await expect(page).toHaveURL(/\/$/);
      if (link === '/tasks') await shot(page, '12-inside-link-shows-landing');
    });
  }

  test('13. Privacy link opens a short plain-words page', async ({ page, mocks }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    const text = await page.locator('body').innerText();

    expect(text).toMatch(/name and email address from your Google account/);
    expect(text).toMatch(/exam and subjects you choose/);
    expect(text).toMatch(/your tasks/);
    expect(text).toMatch(/your progress/);
    expect(text).toMatch(/don't sell/);
    expect(text).toMatch(/don't share it/);
    expect(text).toMatch(/deleted/);
    expect(text.split(/\s+/).length).toBeLessThan(120);
    await shot(page, '13-privacy');
  });
});

test.describe('Narrow-screen check', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('14. At 375 px: readable, no sideways scroll, button at least 44 px tall', async ({ page, mocks }) => {
    await page.goto('/');
    for (const el of [headline(page), subline(page), cta(page)]) {
      await expect(el).toBeInViewport({ ratio: 1 });
      const fontSize = await el.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    expect((await cta(page).boundingBox()).height).toBeGreaterThanOrEqual(44);
    await shot(page, '14-phone-375');
  });
});

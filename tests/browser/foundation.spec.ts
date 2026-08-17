import { expect, test, type Page } from '@playwright/test';

const fixture = {
  original: `The quick brown fox\njumps over the lazy dog.\nKeep this line.\nRemove this line.`,
  changed: `The quick bright fox\njumps over the lazy dog!\nKeep this line.\nAdd this line.`,
};

const themeStorageKey = 'private-text-compare-theme';
const initialResultMessage = 'Add text above and press Compare to see the differences.';
const staleResultMessage = 'Inputs changed — compare again to refresh the result.';

const viewports = [
  { slug: 'desktop-1440x900', width: 1440, height: 900 },
  { slug: 'desktop-1024x768', width: 1024, height: 768 },
  { slug: 'tablet-768x1024', width: 768, height: 1024 },
  { slug: 'mobile-390x844', width: 390, height: 844 },
  { slug: 'mobile-landscape-844x390', width: 844, height: 390 },
] as const;

const originalInput = (page: Page) => page.getByRole('textbox', { name: 'Original' });
const changedInput = (page: Page) => page.getByRole('textbox', { name: 'Changed' });

async function openTool(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);
  return { pageErrors, consoleErrors };
}

async function fillFixture(page: Page) {
  await originalInput(page).fill(fixture.original);
  await changedInput(page).fill(fixture.changed);
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function currentTheme(page: Page) {
  return page.locator('html').getAttribute('data-theme');
}

test('initial comparator state is usable and accessible', async ({ page }) => {
  const errors = await openTool(page);
  await expect(page).toHaveTitle('Private Text Compare — Compare Text Online Privately');
  await expect(page.getByRole('heading', { level: 1, name: 'Private Text Compare' })).toBeVisible();
  await expect(page.getByText('Compare text without sending it anywhere. See every line and word that changed.')).toBeVisible();
  await expect(page.getByText('Local only')).toBeVisible();
  await expect(originalInput(page)).toBeVisible();
  await expect(changedInput(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare' })).toBeVisible();
  await expect(page.getByLabel('Ignore case')).toBeVisible();
  await expect(page.getByLabel('Ignore surrounding whitespace')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Swap' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(initialResultMessage);
  await expectNoHorizontalOverflow(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('renders line rows, inline changes, compact statistics, and line numbers', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  await expect(page.locator('[data-row-kind="changed"]')).toHaveCount(3);
  await expect(page.locator('[data-row-kind="unchanged"]')).toHaveCount(1);
  await expect(page.locator('[data-inline-kind="removed"]').first()).toBeVisible();
  await expect(page.locator('[data-inline-kind="added"]').first()).toBeVisible();
  await expect(page.getByLabel('Original line 1')).toBeVisible();
  await expect(page.getByLabel('Changed line 1')).toBeVisible();
  await expect(page.getByLabel('Comparison statistics')).toContainText('1 unchanged');
  await expect(page.getByLabel('Comparison statistics')).toContainText('3 changed');
  await expect(page.getByText('Original: 4 lines · Changed: 4 lines')).toBeVisible();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('ignore case changes a case-only difference to unchanged', async ({ page }) => {
  await openTool(page);
  await originalInput(page).fill('Hello World');
  await changedInput(page).fill('hello world');
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-row-kind="changed"]')).toHaveCount(1);
  await page.getByLabel('Ignore case').check();
  await expect(page.getByRole('status')).toHaveText(staleResultMessage);
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-row-kind="unchanged"]')).toHaveCount(1);
});

test('ignore surrounding whitespace ignores only outer whitespace', async ({ page }) => {
  await openTool(page);
  await originalInput(page).fill('  hello  ');
  await changedInput(page).fill('hello');
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-row-kind="changed"]')).toHaveCount(1);
  await page.getByLabel('Ignore surrounding whitespace').check();
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-row-kind="unchanged"]')).toHaveCount(1);
});

test('editing after comparison marks the result stale', async ({ page }) => {
  await openTool(page);
  await fillFixture(page);
  await changedInput(page).fill(`${fixture.changed}\nAnother line.`);
  await expect(page.locator('[data-result-state="stale"]')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(staleResultMessage);
});

test('Swap exchanges inputs and clears the previous result', async ({ page }) => {
  await openTool(page);
  await fillFixture(page);
  await page.getByRole('button', { name: 'Swap' }).click();
  await expect(originalInput(page)).toHaveValue(fixture.changed);
  await expect(changedInput(page)).toHaveValue(fixture.original);
  await expect(page.locator('[data-result-state="empty"]')).toBeVisible();
  await expect(page.locator('[data-row-kind]')).toHaveCount(0);
});

test('Clear empties inputs and returns to the initial result state', async ({ page }) => {
  await openTool(page);
  await fillFixture(page);
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(originalInput(page)).toHaveValue('');
  await expect(changedInput(page)).toHaveValue('');
  await expect(page.locator('[data-result-state="empty"]')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(initialResultMessage);
});

test('first visit defaults to dark regardless of OS color preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  const errors = await openTool(page);
  expect(await currentTheme(page)).toBe('dark');
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBeNull();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('static document defaults to dark before hydrated interaction', async ({ page, request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('<html lang="en" data-theme="dark">');
  await openTool(page);
  expect(await currentTheme(page)).toBe('dark');
});

test('theme toggle switches dark to light and stores only approved theme state', async ({ page }) => {
  await openTool(page);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  expect(await currentTheme(page)).toBe('light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  const storageEntries = await page.evaluate(() => Object.entries(localStorage));
  expect(storageEntries).toEqual([[themeStorageKey, 'light']]);
});

test('theme toggle switches light back to dark and updates preference', async ({ page }) => {
  await openTool(page);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  expect(await currentTheme(page)).toBe('dark');
  expect(await page.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBe('dark');
});

test('selected light theme survives reload', async ({ page }) => {
  await openTool(page);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  expect(await currentTheme(page)).toBe('light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
});

test('malformed saved theme falls back to dark', async ({ page }) => {
  await openTool(page);
  await page.evaluate((key) => localStorage.setItem(key, 'system'), themeStorageKey);
  await page.reload({ waitUntil: 'networkidle' });
  expect(await currentTheme(page)).toBe('dark');
});

test('theme persists while compared text and result clear on reload', async ({ page }) => {
  await openTool(page);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await fillFixture(page);
  await expect(page.locator('[data-row-kind]')).toHaveCount(4);
  await page.reload({ waitUntil: 'networkidle' });
  expect(await currentTheme(page)).toBe('light');
  await expect(originalInput(page)).toHaveValue('');
  await expect(changedInput(page)).toHaveValue('');
  await expect(page.locator('[data-result-state="empty"]')).toBeVisible();
  await expect(page.locator('[data-row-kind]')).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBe('light');
});

for (const theme of ['dark', 'light'] as const) {
  for (const viewport of viewports) {
    test(`${theme} compared-result screenshot at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const errors = await openTool(page);

      if (theme === 'light') {
        await page.getByRole('button', { name: 'Switch to light theme' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      } else {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }

      await fillFixture(page);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `artifacts/screenshots/${theme}-${viewport.slug}.png`,
        fullPage: true,
      });
      expect(errors.pageErrors).toEqual([]);
      expect(errors.consoleErrors).toEqual([]);
    });
  }
}

import { expect, test, type Page } from '@playwright/test';

const fixture = {
  original: `The quick brown fox\njumps over the lazy dog.\nKeep this line.\nRemove this line.`,
  changed: `The quick bright fox\njumps over the lazy dog!\nKeep this line.\nAdd this line.`,
};

const initialResultMessage = 'Add text above and press Compare to see the differences.';
const staleResultMessage = 'Inputs changed — compare again to refresh the result.';

const screenshots = [
  { name: 'desktop-1440x900.png', width: 1440, height: 900 },
  { name: 'desktop-1024x768.png', width: 1024, height: 768 },
  { name: 'tablet-768x1024.png', width: 768, height: 1024 },
  { name: 'mobile-390x844.png', width: 390, height: 844 },
  { name: 'mobile-landscape-844x390.png', width: 844, height: 390 },
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

test('initial comparator state is usable and accessible', async ({ page }) => {
  const errors = await openTool(page);
  await expect(page).toHaveTitle('Private Text Compare — Compare Text Online Privately');
  await expect(page.getByRole('heading', { level: 1, name: 'Private Text Compare' })).toBeVisible();
  await expect(page.getByText('Compare two versions of text and instantly see exactly what changed.')).toBeVisible();
  await expect(originalInput(page)).toBeVisible();
  await expect(changedInput(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare' })).toBeVisible();
  await expect(page.getByLabel('Ignore case')).toBeVisible();
  await expect(page.getByLabel('Ignore surrounding whitespace')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Swap' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(initialResultMessage);
  const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('renders line rows, inline changes, statistics, and line numbers', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  await expect(page.locator('[data-row-kind="changed"]')).toHaveCount(3);
  await expect(page.locator('[data-row-kind="unchanged"]')).toHaveCount(1);
  await expect(page.locator('[data-inline-kind="removed"]').first()).toBeVisible();
  await expect(page.locator('[data-inline-kind="added"]').first()).toBeVisible();
  await expect(page.getByLabel('Original line 1')).toBeVisible();
  await expect(page.getByLabel('Changed line 1')).toBeVisible();
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

for (const viewport of screenshots) {
  test(`responsive compared-result screenshot at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const errors = await openTool(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.reload({ waitUntil: 'networkidle' });
    await fillFixture(page);
    const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    await page.screenshot({ path: `artifacts/screenshots/${viewport.name}`, fullPage: true });
    expect(errors.pageErrors).toEqual([]);
    expect(errors.consoleErrors).toEqual([]);
  });
}

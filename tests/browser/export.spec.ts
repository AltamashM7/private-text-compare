import { expect, test, type Download, type Page } from '@playwright/test';

const fixture = {
  original: `The quick brown fox\njumps over the lazy dog.\nKeep this line.\nRemove this line.`,
  changed: `The quick bright fox\njumps over the lazy dog!\nKeep this line.\nAdd this line.`,
};

const expectedDiff = `--- original.txt
+++ changed.txt
@@ -1,4 +1,4 @@
-The quick brown fox
+The quick bright fox
-jumps over the lazy dog.
+jumps over the lazy dog!
 Keep this line.
-Remove this line.
+Add this line.
`;

const expectedReport = `Private Text Compare report
===========================

Summary
Original lines: 4
Changed lines: 4
Unchanged lines: 1
Changed rows: 3
Added lines: 0
Removed lines: 0

Comparison options
Ignore case: off
Ignore surrounding whitespace: off

Differences
- Original 1: The quick brown fox
+ Changed 1: The quick bright fox
- Original 2: jumps over the lazy dog.
+ Changed 2: jumps over the lazy dog!
- Original 4: Remove this line.
+ Changed 4: Add this line.
`;

const originalInput = (page: Page) => page.getByRole('textbox', { name: 'Original' });
const changedInput = (page: Page) => page.getByRole('textbox', { name: 'Changed' });
const copyButton = (page: Page) => page.getByRole('button', { name: /^(Copy diff|Copied)$/ });
const diffButton = (page: Page) => page.getByRole('button', { name: 'Download .diff' });
const reportButton = (page: Page) => page.getByRole('button', { name: 'Download .txt' });

async function readDownloadText(download: Download): Promise<string> {
  const stream = await download.createReadStream();
  stream.setEncoding('utf8');
  let content = '';

  for await (const chunk of stream) {
    content += chunk;
  }

  return content;
}

async function openTool(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const applicationRequests: string[] = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
      applicationRequests.push(request.url());
    }
  });

  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);
  return { pageErrors, consoleErrors, applicationRequests };
}

async function fillFixture(page: Page) {
  await originalInput(page).fill(fixture.original);
  await changedInput(page).fill(fixture.changed);
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
}

async function expectOnlyApprovedStorage(page: Page) {
  const storage = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
  }));
  expect(storage.local.every(([key, value]) =>
    key === 'private-text-compare-theme' && (value === 'dark' || value === 'light'))).toBe(true);
  expect(storage.session).toEqual([]);
}

test('result export actions are absent before a comparison exists', async ({ page }) => {
  const errors = await openTool(page);
  await expect(page.getByLabel('Result export actions')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copy diff' })).toHaveCount(0);
  await expect(diffButton(page)).toHaveCount(0);
  await expect(reportButton(page)).toHaveCount(0);
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

test('Copy diff writes the exact unified diff after explicit activation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4321',
  });
  const errors = await openTool(page);
  await fillFixture(page);

  await copyButton(page).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Unified diff copied to clipboard.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expectedDiff);
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
  await expect(originalInput(page)).toHaveValue(fixture.original);
  await expect(changedInput(page)).toHaveValue(fixture.changed);
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

test('stale results keep export actions visible but disabled until Compare refreshes them', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  await expect(copyButton(page)).toBeEnabled();
  await expect(diffButton(page)).toBeEnabled();
  await expect(reportButton(page)).toBeEnabled();

  await changedInput(page).fill(`${fixture.changed}\nAnother line.`);
  await expect(page.locator('[data-result-state="stale"]')).toBeVisible();
  await expect(copyButton(page)).toBeDisabled();
  await expect(diffButton(page)).toBeDisabled();
  await expect(reportButton(page)).toBeDisabled();

  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
  await expect(copyButton(page)).toBeEnabled();
  await expect(diffButton(page)).toBeEnabled();
  await expect(reportButton(page)).toBeEnabled();
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

test('Download .diff uses the deterministic filename and exact serializer content', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  const downloadPromise = page.waitForEvent('download');
  await diffButton(page).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('private-text-compare.diff');
  expect(await readDownloadText(download)).toBe(expectedDiff);
  await expect(page.getByRole('status')).toHaveText('Unified diff downloaded.');
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

test('Download .txt uses the deterministic filename and exact report content', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  const downloadPromise = page.waitForEvent('download');
  await reportButton(page).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('private-text-compare-report.txt');
  expect(await readDownloadText(download)).toBe(expectedReport);
  await expect(page.getByRole('status')).toHaveText('Text report downloaded.');
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

test('Swap and Clear remove result export actions with the comparison result', async ({ page }) => {
  const errors = await openTool(page);
  await fillFixture(page);
  await expect(page.getByLabel('Result export actions')).toBeVisible();

  await page.getByRole('button', { name: 'Swap' }).click();
  await expect(page.locator('[data-result-state="empty"]')).toBeVisible();
  await expect(page.getByLabel('Result export actions')).toHaveCount(0);

  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.getByLabel('Result export actions')).toBeVisible();
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.locator('[data-result-state="empty"]')).toBeVisible();
  await expect(page.getByLabel('Result export actions')).toHaveCount(0);
  await expectOnlyApprovedStorage(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.applicationRequests).toEqual([]);
});

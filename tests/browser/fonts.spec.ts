import { expect, test } from '@playwright/test';

const fixture = {
  original: `The quick brown fox\njumps over the lazy dog.\nKeep this line.\nRemove this line.`,
  changed: `The quick bright fox\njumps over the lazy dog!\nKeep this line.\nAdd this line.`,
};

test('self-hosted Geist fonts resolve from the same origin and technical canvas is present', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const fontResponses: Array<{ url: string; status: number }> = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().includes('/fonts/geist/') && response.url().endsWith('.woff2')) {
      fontResponses.push({ url: response.url(), status: response.status() });
    }
  });

  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);

  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await page.getByRole('textbox', { name: 'Original' }).fill(fixture.original);
  await page.getByRole('textbox', { name: 'Changed' }).fill(fixture.changed);
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.locator('[data-result-state="current"]')).toBeVisible();

  const verification = await page.evaluate(() => {
    const editor = document.querySelector('.editor-textarea');
    const diffText = document.querySelector('.diff-text');
    const shell = document.querySelector('.site-shell');

    if (!(editor instanceof HTMLElement) || !(diffText instanceof HTMLElement) || !(shell instanceof HTMLElement)) {
      throw new Error('Expected typography/canvas targets are missing.');
    }

    const resourceUrls = performance.getEntriesByType('resource').map((entry) => entry.name);
    const fontUrls = [...new Set(
      resourceUrls.filter((url) => url.includes('/fonts/geist/') && url.endsWith('.woff2')),
    )];
    const rootStyle = getComputedStyle(document.documentElement);
    const canvasStyle = getComputedStyle(shell, '::before');

    return {
      geistReady: document.fonts.check('16px "Geist"'),
      geistMonoReady: document.fonts.check('16px "Geist Mono"'),
      bodyFamily: getComputedStyle(document.body).fontFamily,
      editorFamily: getComputedStyle(editor).fontFamily,
      diffFamily: getComputedStyle(diffText).fontFamily,
      origin: location.origin,
      fontUrls,
      allResources: resourceUrls,
      gridMinor: rootStyle.getPropertyValue('--grid-minor').trim(),
      gridMajor: rootStyle.getPropertyValue('--grid-major').trim(),
      gridNode: rootStyle.getPropertyValue('--grid-node').trim(),
      canvasBackground: canvasStyle.backgroundImage,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  expect(verification.geistReady).toBe(true);
  expect(verification.geistMonoReady).toBe(true);
  expect(verification.bodyFamily.startsWith('Geist')).toBe(true);
  expect(verification.editorFamily.startsWith('"Geist Mono"') || verification.editorFamily.startsWith('Geist Mono')).toBe(true);
  expect(verification.diffFamily.startsWith('"Geist Mono"') || verification.diffFamily.startsWith('Geist Mono')).toBe(true);

  expect(verification.gridMinor).not.toBe('');
  expect(verification.gridMajor).not.toBe('');
  expect(verification.gridNode).not.toBe('');
  expect(verification.canvasBackground).not.toBe('none');
  expect(verification.scrollWidth).toBeLessThanOrEqual(verification.clientWidth + 1);

  expect(verification.fontUrls).toHaveLength(2);
  for (const url of verification.fontUrls) {
    expect(new URL(url).origin).toBe(verification.origin);
  }

  const uniqueFontResponses = [...new Map(fontResponses.map((item) => [item.url, item])).values()];
  expect(uniqueFontResponses).toHaveLength(2);
  expect(uniqueFontResponses.every((item) => item.status === 200)).toBe(true);
  expect(uniqueFontResponses.every((item) => new URL(item.url).origin === verification.origin)).toBe(true);

  const forbiddenRuntimeHosts = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'vercel.com',
    'githubusercontent.com',
    'unpkg.com',
    'cdn.jsdelivr.net',
  ];
  expect(
    verification.allResources.some((url) => forbiddenRuntimeHosts.includes(new URL(url).hostname)),
  ).toBe(false);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

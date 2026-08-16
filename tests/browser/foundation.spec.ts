import { expect, test } from '@playwright/test';

const screenshots = [
  { name: 'desktop-1440x900.png', width: 1440, height: 900 },
  { name: 'desktop-1024x768.png', width: 1024, height: 768 },
  { name: 'tablet-768x1024.png', width: 768, height: 1024 },
  { name: 'mobile-390x844.png', width: 390, height: 844 },
  { name: 'mobile-landscape-844x390.png', width: 844, height: 390 },
] as const;

for (const viewport of screenshots) {
  test(`foundation smoke at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto('/', { waitUntil: 'networkidle' });

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle('Private Text Compare');
    await expect(page.getByRole('heading', { name: 'Private Text Compare' })).toBeVisible();
    await expect(page.getByText('Project foundation initialized.', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Product interface has not been implemented yet.', { exact: true }),
    ).toBeVisible();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await page.screenshot({
      path: `artifacts/screenshots/${viewport.name}`,
      fullPage: true,
    });

    expect(pageErrors, `Unexpected page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
  });
}

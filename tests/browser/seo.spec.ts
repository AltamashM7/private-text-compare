import { expect, test, type Page } from '@playwright/test';

const pageTitle = 'Private Text Compare — Compare Text Online Privately';
const pageDescription = 'Compare two versions of text with line-by-line and word-level highlights directly in your browser. No uploads, accounts, or tracking.';
const canonicalUrl = 'https://textcompare.amosfot.in/';
const sitemapUrl = 'https://textcompare.amosfot.in/sitemap.xml';
const obsoleteOrigin = 'https://compare.amosfot.in';

async function openPage(page: Page) {
  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test('homepage exposes deterministic canonical and social metadata', async ({ page }) => {
  await openPage(page);

  await expect(page).toHaveTitle(pageTitle);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pageDescription);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalUrl);

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', pageTitle);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', pageDescription);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonicalUrl);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Private Text Compare');

  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', pageTitle);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', pageDescription);

  await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

  const canonicalValues = await page.locator('link[rel="canonical"], meta[property="og:url"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute(node.tagName === 'LINK' ? 'href' : 'content') ?? ''),
  );
  expect(canonicalValues.every((value) => !value.includes('localhost') && !value.includes('pages.dev'))).toBe(true);
  expect(canonicalValues.every((value) => new URL(value).origin !== obsoleteOrigin)).toBe(true);
});

test('site identity, semantic launch content, and hydration boundary are present', async ({ page }) => {
  await openPage(page);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const structuredData = JSON.parse((await jsonLd.textContent()) ?? '{}');
  expect(structuredData).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Private Text Compare',
    url: canonicalUrl,
    description: pageDescription,
  });
  expect(new URL(structuredData.url).origin).not.toBe(obsoleteOrigin);
  expect(structuredData).not.toHaveProperty('aggregateRating');
  expect(structuredData).not.toHaveProperty('review');
  expect(structuredData).not.toHaveProperty('potentialAction');

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Private by design' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Useful for quick before-and-after checks' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Frequently asked questions' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'What does “Ignore surrounding whitespace” do?' })).toBeVisible();
  await expect(page.getByText('Whitespace inside the line remains meaningful.')).toBeVisible();
  await expect(page.getByText('Direct file import is not available', { exact: false })).toBeVisible();

  await expect(page.locator('.launch-content astro-island')).toHaveCount(0);
  await expect(page.locator('astro-island')).toHaveCount(2);
  await expectNoHorizontalOverflow(page);
});

test('favicon is linked and served as standalone SVG', async ({ page, request }) => {
  await openPage(page);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/svg+xml');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

  const response = await request.get('/favicon.svg');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  const svg = await response.text();
  expect(svg).toContain('<svg');
  expect(svg).toContain('viewBox="0 0 64 64"');
  expect(svg).not.toMatch(/(?:xlink:)?href\s*=/i);
  expect(svg).not.toMatch(/<image\b/i);
});

test('robots.txt allows crawling and points only to the production sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  const robots = (await response.text()).trim();
  expect(robots).toBe([
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${sitemapUrl}`,
  ].join('\n'));

  const sitemapDirective = robots.split('\n').find((line) => line.startsWith('Sitemap: '));
  expect(sitemapDirective).toBeDefined();
  expect(new URL(sitemapDirective!.slice('Sitemap: '.length)).origin).not.toBe(obsoleteOrigin);
});

test('sitemap contains exactly the canonical homepage without preview metadata', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  expect(locations).toEqual([canonicalUrl]);
  expect(locations.every((location) => new URL(location).origin !== obsoleteOrigin)).toBe(true);
  expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(xml).not.toContain('<lastmod>');
  expect(xml).not.toContain('localhost');
  expect(xml).not.toContain('pages.dev');
});

test('initial runtime requests remain same-origin with no third-party launch resources', async ({ page }) => {
  const requestUrls: string[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  await openPage(page);

  const origin = new URL(page.url()).origin;
  expect(requestUrls.length).toBeGreaterThan(0);
  expect(requestUrls.every((url) => new URL(url).origin === origin)).toBe(true);
});

const launchScreenshots = [
  { theme: 'dark', slug: 'desktop-1440x900', width: 1440, height: 900 },
  { theme: 'light', slug: 'desktop-1440x900', width: 1440, height: 900 },
  { theme: 'dark', slug: 'mobile-390x844', width: 390, height: 844 },
  { theme: 'light', slug: 'mobile-390x844', width: 390, height: 844 },
] as const;

for (const capture of launchScreenshots) {
  test(`${capture.theme} launch-content screenshot at ${capture.width}x${capture.height}`, async ({ page }) => {
    await page.setViewportSize({ width: capture.width, height: capture.height });
    await openPage(page);

    if (capture.theme === 'light') {
      await page.getByRole('button', { name: 'Switch to light theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    } else {
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }

    await page.locator('#how-it-works').evaluate((element) => {
      element.scrollIntoView({ block: 'start' });
    });
    await expect(page.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.screenshot({
      path: `artifacts/screenshots/launch-${capture.theme}-${capture.slug}.png`,
      fullPage: false,
    });
  });
}

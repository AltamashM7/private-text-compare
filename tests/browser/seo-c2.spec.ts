import { expect, test, type Page } from '@playwright/test';

const hubUrl='https://tools.amosfot.in/';
const routes=[
  {label:'homepage',path:'/'},
  {label:'compare-two-texts guide',path:'/guides/compare-two-texts/'},
  {label:'line-vs-word-diff guide',path:'/guides/line-vs-word-diff/'},
] as const;

async function noOverflow(page:Page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
}

for(const route of routes){
  test(route.label+' portfolio footer links to Amosfot Tools',async({page})=>{
    await page.setViewportSize({width:1440,height:900});
    const response=await page.goto(route.path,{waitUntil:'networkidle'});
    expect(response?.ok()).toBe(true);
    const nav=page.getByRole('navigation',{name:'More Amosfot browser tools'});
    const hub=nav.getByRole('link',{name:'Amosfot Tools',exact:true});
    await expect(hub).toBeVisible();
    await expect(hub).toHaveAttribute('href',hubUrl);
    await expect(nav.locator('a').first()).toHaveText('Amosfot Tools');
    await noOverflow(page);
  });
}

test('Amosfot Tools footer link remains reachable on mobile across all indexable routes',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of routes){
    const response=await page.goto(route.path,{waitUntil:'networkidle'});
    expect(response?.ok()).toBe(true);
    const nav=page.getByRole('navigation',{name:'More Amosfot browser tools'});
    const hub=nav.getByRole('link',{name:'Amosfot Tools',exact:true});
    await hub.scrollIntoViewIfNeeded();
    await expect(hub).toBeVisible();
    await expect(hub).toHaveAttribute('href',hubUrl);
    await noOverflow(page);
  }
});

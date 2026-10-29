// Usage: node scripts/browser-check.mjs <url> <width> <height> <outPrefix> [--drawer] [--full] [--reduce] [--slices]
import puppeteer from 'puppeteer-core';

const [url, w, h, out, ...flags] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
const problems = [];
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`[console.${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
// --reduce: emulate prefers-reduced-motion so scroll-reveal content is visible in full-page captures.
if (flags.includes('--reduce')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 600, hasTouch: +w < 600 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
// Wait for data-driven skeletons to resolve (the dev API can be slow), then settle.
await page.waitForFunction(() => !document.querySelector('.skeleton'), { timeout: 25000 }).catch(() => console.log('⚠ skeletons still visible after 25s (API slow or failing?)'));
await new Promise((r) => setTimeout(r, 800));

const metrics = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  offenders: [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed')
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → right=${Math.round(el.getBoundingClientRect().right)}`),
}));
console.log('viewport', metrics.innerWidth, 'scrollWidth', metrics.scrollWidth, metrics.scrollWidth > metrics.innerWidth ? '⚠ HORIZONTAL OVERFLOW' : 'ok');
if (metrics.scrollWidth > metrics.innerWidth) console.log('offenders:', metrics.offenders);

await page.screenshot({ path: `${out}.png`, fullPage: flags.includes('--full') });

// --slices: also write readable full-page slices (<out>-s1.png …), one viewport-height each.
if (flags.includes('--slices')) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const count = Math.min(Math.ceil(total / +h), 14);
  for (let i = 0; i < count; i += 1) {
    await page.screenshot({
      path: `${out}-s${i + 1}.png`,
      captureBeyondViewport: true,
      clip: { x: 0, y: i * +h, width: +w, height: Math.min(+h, total - i * +h) },
    });
  }
  console.log(`page height ${total}px → ${count} slices`);
}

if (flags.includes('--drawer')) {
  const burger = await page.$('.header__burger');
  console.log('burger visible:', burger ? await burger.isIntersectingViewport() : false);
  if (burger) {
    await burger.click();
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: `${out}-drawer.png` });
    console.log('drawer links:', await page.$$eval('.mobile-nav__link', (a) => a.length));
  }
}
console.log(problems.length ? problems.join('\n') : 'no console errors/warnings');
await browser.close();

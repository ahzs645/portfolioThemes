import { test, expect } from 'playwright/test';

function getScrollerInfo() {
  const canvas = document.querySelector('canvas');
  let node = canvas?.parentElement ?? null;

  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = `${style.overflowY} ${style.overflow}`;
    if (/(auto|scroll)/.test(overflowY)) {
      return {
        tag: node.tagName,
        className: node.className,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
        scrollTop: node.scrollTop,
      };
    }
    node = node.parentElement;
  }

  return null;
}

test('retro computer loads and internal scroll works', async ({ page }) => {
  const messages = [];
  page.on('console', (msg) => messages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => messages.push({ type: 'pageerror', text: err.message }));

  await page.goto('http://127.0.0.1:4173/retro-computer', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  const initial = await page.evaluate(() => {
    const scroller = getScrollerInfo();
    const canvas = document.querySelector('canvas');
    const about = document.getElementById('retro-about');

    return {
      scroller,
      canvasOpacity: canvas ? window.getComputedStyle(canvas).opacity : null,
      aboutTop: about ? about.getBoundingClientRect().top : null,
      readyText: document.body.innerText.includes('RETRO-SHELL 1.0 LTS'),
    };
  });

  expect(initial.scroller).not.toBeNull();
  expect(initial.readyText).toBeTruthy();

  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    let node = canvas?.parentElement ?? null;

    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const overflowY = `${style.overflowY} ${style.overflow}`;
      if (/(auto|scroll)/.test(overflowY)) {
        node.scrollTo({ top: node.clientHeight * 1.6, behavior: 'auto' });
        return;
      }
      node = node.parentElement;
    }
  });

  await page.waitForTimeout(1200);

  const after = await page.evaluate(() => {
    const scroller = getScrollerInfo();
    const canvas = document.querySelector('canvas');
    const about = document.getElementById('retro-about');

    return {
      scroller,
      canvasOpacity: canvas ? window.getComputedStyle(canvas).opacity : null,
      aboutTop: about ? about.getBoundingClientRect().top : null,
    };
  });

  await page.screenshot({ path: '/tmp/retro-computer-scrolled.png', fullPage: true });

  expect(after.scroller.scrollTop).toBeGreaterThan(initial.scroller.scrollTop);
  expect(Number(after.canvasOpacity)).toBeLessThan(1);
  expect(after.aboutTop).toBeLessThan(initial.aboutTop);

  if (messages.some((entry) => entry.type === 'pageerror' || entry.type === 'error')) {
    throw new Error(JSON.stringify(messages, null, 2));
  }
});

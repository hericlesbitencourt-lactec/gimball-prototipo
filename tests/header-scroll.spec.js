const { test, expect } = require('@playwright/test');
const active = page => page.locator('.layer[aria-hidden="false"]');

test.beforeEach(async ({ page }) => {
  page._errors = [];
  page.on('pageerror', error => page._errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') page._errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) page._errors.push(response.status() + ' ' + response.url()); });
  page.on('requestfailed', request => page._errors.push(request.url()));
});
test.afterEach(async ({ page }) => { expect(page._errors).toEqual([]); });

for (const config of [
  { role: 'admin', width: 390, height: 844 },
  { role: 'admin', width: 320, height: 568 },
  { role: 'engenheiro', width: 320, height: 568 },
]) {
  test(`Mais ${config.role} ${config.width}: cabeçalho permanece estável durante a rolagem`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.goto(config.role === 'admin' ? '/admin.html' : '/admin.html?perfil=engenheiro');
    await page.getByRole('button', { name: 'Mais', exact: true }).click();
    await expect(page.locator('.lyr-in, .lyr-fade')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    const screen = active(page).locator(':scope > div').first();
    const before = await screen.evaluate(node => ({ max: node.scrollHeight - node.clientHeight, toolbar: node.querySelector('.nav-toolbar').getBoundingClientRect().height }));
    expect(before.max).toBeGreaterThan(56);
    for (const target of [30, Math.min(96, before.max)]) {
      await screen.evaluate((node, value) => { node.scrollTop = value; }, target);
      // Sample throughout the old collapse animation; a single immediate check missed the jump.
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(80);
        const frame = await screen.evaluate(node => ({ top: node.scrollTop, max: node.scrollHeight - node.clientHeight, toolbar: node.querySelector('.nav-toolbar').getBoundingClientRect().height }));
        expect(Math.abs(frame.top - target)).toBeLessThan(1);
        expect(frame.max).toBe(before.max);
        expect(frame.toolbar).toBe(before.toolbar);
      }
    }
    const title = active(page).locator('.nav-compact-title');
    await expect(title).toHaveText('Mais');
    const titleBox = await title.boundingBox();
    const toolbarBox = await active(page).locator('.nav-toolbar').boundingBox();
    expect(Math.abs(titleBox.x + titleBox.width / 2 - toolbarBox.x - toolbarBox.width / 2)).toBeLessThan(1);
    await page.screenshot({ path: `test-results/mais-scroll-${config.role}-${config.width}.png` });
    await screen.evaluate(node => { node.scrollTop = 0; });
    await expect(title).toHaveText('');
    await expect(active(page).locator('.page-title')).toHaveText('Mais');
    expect(await screen.evaluate(node => node.scrollTop)).toBe(0);
  });
}

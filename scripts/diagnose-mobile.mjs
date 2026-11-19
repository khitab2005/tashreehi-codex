import { chromium, devices } from "@playwright/test";
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  for (const dpr of [1, 2.75]) {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      deviceScaleFactor: dpr,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4317/explorer");
    const details = await page.evaluate(() => {
      const b = document.querySelector(
        'button[aria-label="Switch to English"]',
      );
      const r = b.getBoundingClientRect();
      const point = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      return {
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollX,
        scrollY,
        button: { x: r.x, y: r.y, w: r.width, h: r.height },
        hit: point?.outerHTML.slice(0, 160),
        overflow: [...document.querySelectorAll("body *")]
          .map((e) => ({ name: e.className, rect: e.getBoundingClientRect() }))
          .filter((e) => e.rect.width > innerWidth + 5)
          .slice(0, 8)
          .map((e) => ({ name: String(e.name), width: e.rect.width })),
      };
    });
    console.log(JSON.stringify({ dpr, ...details }));
    await context.close();
  }
} finally {
  await browser.close();
}

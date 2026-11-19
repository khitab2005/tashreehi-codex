import { test, expect } from "@playwright/test";
test("canvas raycasting, drag orbit, pan and identification use real rendered meshes", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop-chromium",
    "GPU interaction is covered on desktop Chromium; mobile controls have separate coverage.",
  );
  test.setTimeout(180000);
  await page.goto("/explorer");
  await expect(page.getByTestId("viewer")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const canvas = page.locator("canvas");
  const box = (await canvas.boundingBox())!;
  await canvas.click({
    position: { x: box.width * 0.52, y: box.height * 0.6 },
  });
  await expect(page.getByTestId("viewer")).toHaveAttribute(
    "data-selected",
    /^VH_F_/,
  );
  async function pixels() {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    return canvas.evaluate((c) =>
      (c as HTMLCanvasElement).toDataURL("image/png"),
    );
  }
  const before = await pixels();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, {
    steps: 12,
  });
  await page.mouse.up();
  const after = await pixels();
  expect(after).not.toBe(before);
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.5, {
    steps: 8,
  });
  await page.mouse.up({ button: "right" });
  expect(await pixels()).not.toBe(after);
  if (process.env.CAPTURE_ASSETS === "1")
    await page.screenshot({
      path: "evidence/explorer-arabic.png",
      fullPage: true,
      scale: "css",
    });
  await page.goto("/quizzes");
  await page
    .getByRole("button", { name: "تعرّف على الجزء", exact: true })
    .click();
  await expect(page.getByTestId("viewer")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const target = page.locator("canvas");
  const targetBox = (await target.boundingBox())!;
  let found = false;
  for (const y of [0.48, 0.58, 0.68]) {
    for (const x of [0.4, 0.48, 0.56, 0.64]) {
      await target.click({
        position: { x: targetBox.width * x, y: targetBox.height * y },
      });
      const selected = await page
        .getByTestId("viewer")
        .getAttribute("data-selected");
      if (selected === "VH_F_right_ventricle") {
        found = true;
        break;
      }
    }
    if (found) break;
  }
  expect(found).toBe(true);
  await expect(page.locator(".identify-card [role=status]")).toContainText(
    "صحيح",
  );
});
test("all 12 real GLB assets render without an application error", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop-chromium",
    "One desktop pass verifies the asset catalog.",
  );
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const catalog = [
    ["cardiovascular", "heart"],
    ["skeletal", "knee"],
    ["muscular", "muscles"],
    ["nervous", "spinal"],
    ["respiratory", "lungs"],
    ["digestive", "liver"],
    ["digestive", "pancreas"],
    ["digestive", "gallbladder"],
    ["urinary", "kidney"],
    ["urinary", "bladder"],
    ["reproductive", "uterus"],
    ["reproductive", "ovary"],
  ];
  for (const [system, model] of catalog) {
    await page.goto(`/explorer?system=${system}`);
    await page.locator("#model-select").selectOption(model);
    await expect(page.getByTestId("viewer")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await expect(page.locator("canvas")).toBeVisible();
    if (process.env.CAPTURE_ASSETS === "1")
      await page
        .locator("canvas")
        .screenshot({ path: `evidence/asset-${model}.png` });
    await expect(page.getByTestId("viewer").getByRole("alert")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
test("production PWA caches visited pages and offline navigation works", async ({
  browser,
}, info) => {
  test.skip(
    info.project.name !== "desktop-chromium",
    "PWA cache is checked once with service workers enabled.",
  );
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:4317/");
    await page.evaluate(() =>
      navigator.serviceWorker.ready.then(() => undefined),
    );
    await page.reload();
    await page.goto("http://127.0.0.1:4317/lessons");
    await expect(page.locator(".structure-card")).toHaveCount(25);
    await page.goto("http://127.0.0.1:4317/favorites");
    await page.waitForFunction(
      async () => !!(await caches.match("http://127.0.0.1:4317/lessons")),
    );
    await context.setOffline(true);
    await page.goto("http://127.0.0.1:4317/lessons");
    await expect(page.locator(".structure-card")).toHaveCount(25);
    await page.locator(".brand").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "افهم الجسم",
    );
    await page.goto("http://127.0.0.1:4317/never-visited");
    await expect(
      page.getByText("This page has not been cached yet.", { exact: false }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
test("blocked localStorage remains usable and does not loop updates", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  await page.goto("/lessons");
  await page
    .locator(".structure-card")
    .first()
    .getByRole("button", { name: "إضافة إلى المفضلة" })
    .click();
  await expect(page.locator(".notice")).toContainText(
    "التخزين المحلي غير متاح",
  );
  await page.goto("/explorer");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("مستكشف");
});

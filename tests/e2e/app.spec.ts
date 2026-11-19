import { test, expect, type Page } from "@playwright/test";
async function english(page: Page) {
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
}
test("home, instant RTL/LTR, theme and mobile layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "افهم الجسم",
  );
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await english(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Understand the body",
  );
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.screenshot({
    path: `evidence/home-${info.project.name}.png`,
    fullPage: true,
    scale: "css",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("search in both languages, favorite persistence, card progress and privacy erase", async ({
  page,
}) => {
  await page.goto("/lessons");
  const search = page.getByRole("textbox", { name: "ابحث في الدروس" });
  await search.fill("بُطَيْن");
  await expect(page.locator(".structure-card")).toHaveCount(2);
  await search.fill("TIBIA");
  await expect(page.locator(".structure-card")).toHaveCount(1);
  await page.getByRole("button", { name: "إضافة إلى المفضلة" }).click();
  await page.goto("/favorites");
  await expect(page.locator(".structure-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".structure-card")).toHaveCount(1);
  await page.locator(".structure-card h3").click();
  await page.getByRole("button", { name: "علّمها كمكتملة" }).click();
  await expect(
    page.getByRole("button", { name: "تم إكمال البطاقة" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /بطاقة مراجعة/ }).click();
  await expect(page.locator(".flashcard")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "تم إكمال البطاقة" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("link", { name: "أكمل: الظنبوب" })).toBeVisible();
  await page.goto("/privacy");
  await page.getByRole("button", { name: "مسح التفضيلات والتقدّم" }).click();
  await expect(page.getByRole("status")).toContainText("تم مسح");
  await page.goto("/favorites");
  await expect(page.locator(".structure-card")).toHaveCount(0);
});
test("MCQ correction, explanations and persistent best result", async ({
  page,
}) => {
  await page.goto("/quizzes");
  await english(page);
  for (const [i, answer] of [0, 1, 2, 0, 1].entries())
    await page
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(answer)
      .check();
  await page.getByRole("button", { name: "Show score & explanations" }).click();
  await expect(page.getByRole("status")).toContainText("5 / 5");
  await expect(page.locator(".answer-explanation")).toHaveCount(5);
  await page.reload();
  await expect(page.locator(".quiz-toolbar")).toContainText(
    "Best score: 5 / 5",
  );
});
test("all system pages expose honest coverage and functioning lesson links", async ({
  page,
}) => {
  await page.goto("/systems");
  await english(page);
  await expect(page.locator(".system-card")).toHaveCount(8);
  for (const id of [
    "skeletal",
    "muscular",
    "nervous",
    "cardiovascular",
    "respiratory",
    "digestive",
    "urinary",
    "reproductive",
  ]) {
    await page.goto(`/systems/${id}`);
    await expect(page.locator(".coverage-banner")).toContainText("Partial");
    expect(await page.locator(".structure-card").count()).toBeGreaterThan(0);
    await expect(
      page.getByRole("link", { name: "Open explorer" }),
    ).toHaveAttribute("href", `/explorer?system=${id}`);
  }
  await page.goto("/credits");
  await expect(page.locator(".credit-list article")).toHaveCount(12);
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anatomy",
  );
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "privacy",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});
test("real GLB, selection, isolation, opacity, layers, camera, screenshot and model switching", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/explorer");
  await english(page);
  const viewer = page.getByTestId("viewer");
  // WebKit may lack a usable GPU on this Windows host; its fallback is tested separately.
  if (info.project.name === "iphone-webkit") {
    await expect(
      page.getByRole("heading", { name: "Anatomy explorer" }),
    ).toBeVisible();
    return;
  }
  await expect(viewer).toHaveAttribute("data-ready", "true");
  await expect(viewer.locator("canvas")).toBeVisible();
  await page
    .getByRole("button", { name: "Left ventricle", exact: false })
    .first()
    .click();
  await expect(viewer).toHaveAttribute("data-selected", "VH_F_left_ventricle");
  await page.getByRole("button", { name: "Isolate", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-isolated", "true");
  await page.getByRole("button", { name: "Hide", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-hidden", "1");
  await page.getByRole("button", { name: "Show all", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-hidden", "0");
  await page.getByRole("slider").fill("0.5");
  await expect(viewer).toHaveAttribute("data-opacity", "0.5");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-view", "back");
  await page.getByRole("button", { name: "Side", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.getByText("Layers & quality", { exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Low power mode (lower resolution)" })
    .check();
  await page.getByRole("checkbox", { name: "Valves", exact: true }).uncheck();
  await page.getByRole("button", { name: "Reset camera", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-view", "front");
  await expect(viewer).toHaveAttribute("data-opacity", "1");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Screenshot", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tashreehi-heart.png");
  await download.saveAs(`evidence/model-${info.project.name}.png`);
  await page.screenshot({
    path: `evidence/explorer-${info.project.name}.png`,
    fullPage: true,
    scale: "css",
  });
  await page
    .getByRole("button", { name: "Bones & joints", exact: true })
    .click();
  await expect(viewer).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Tibia", exact: false })
    .first()
    .click();
  await expect(viewer).toHaveAttribute("data-selected", "VH_F_tibia_L");
  expect(errors).toEqual([]);
});
test("WebGL failure preserves useful educational navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/explorer");
  await english(page);
  await expect(
    page.getByText("3D view unavailable", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Left ventricle", exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("link", { name: "Open learning card" }),
  ).toBeVisible();
});
test("model network failure is explicit and learning cards still work", async ({
  page,
}) => {
  await page.route("**/models/heart.glb", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/explorer");
  await english(page);
  await expect(page.getByTestId("viewer").getByRole("alert")).toContainText(
    "Model could not load",
  );
  await expect(page.locator(".structure-list button")).toHaveCount(5);
});

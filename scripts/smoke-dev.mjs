import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const host = "127.0.0.1";
const port = 4318;
await mkdir(".tools", { recursive: true });
await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(port, host, () => probe.close(resolve));
});
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--webpack",
    "--hostname",
    host,
    "--port",
    String(port),
  ],
  {
    cwd: process.cwd(),
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let log = "";
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (chunk) => {
    log += chunk.toString();
  });
let browser;
try {
  let response;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      response = await fetch(`http://${host}:${port}`, {
        signal: AbortSignal.timeout(60000),
      });
      if (response.ok) break;
    } catch {}
    if (child.exitCode !== null)
      throw Error(`Dev server exited: ${child.exitCode}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!response?.ok) throw Error("Dev server did not become ready.");
  if (
    !response.headers.get("content-security-policy")?.includes("'unsafe-eval'")
  )
    throw Error("Development CSP is missing the React debugging exception.");
  browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://${host}:${port}`, { timeout: 120000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "افهم الجسم",
  );
  await expect(page.getByTestId("viewer")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 120000 },
  );
  await page.screenshot({
    path: "evidence/home-arabic.png",
    scale: "css",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  if (errors.length) throw Error(errors.join("\n"));
  await writeFile(
    "evidence/dev-smoke.json",
    JSON.stringify(
      {
        status: "passed",
        mode: "next dev --webpack",
        host,
        port,
        http: response.status,
        modelLoaded: true,
        languageSwitch: true,
        pageErrors: 0,
        developmentCspEval: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Development HTTP, real 3D, Arabic/English switch and CSP passed.",
  );
} finally {
  if (browser) await browser.close();
  // The only target is the exact child process launched above by this script.
  if (child.pid && child.exitCode === null) {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    else child.kill("SIGTERM");
  }
  await writeFile(".tools/dev-smoke.log", log);
}

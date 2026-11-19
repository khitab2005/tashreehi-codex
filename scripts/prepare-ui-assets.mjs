import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
await mkdir("public/fonts", { recursive: true });
await mkdir("public/icons", { recursive: true });
const font =
  "https://fonts.gstatic.com/s/notosansarabic/v33/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4r4xA.woff2";
for (const [url, path] of [
  [font, "public/fonts/noto-arabic.woff2"],
  [
    "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansarabic/OFL.txt",
    "public/fonts/OFL.txt",
  ],
]) {
  const r = await fetch(url);
  if (!r.ok) throw Error(`${r.status}: ${url}`);
  await writeFile(path, Buffer.from(await r.arrayBuffer()));
}
const svg = await readFile("public/icon.svg");
for (const size of [192, 512])
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
await sharp(svg)
  .resize(180, 180)
  .png()
  .toFile("public/icons/apple-touch-icon.png");
// Maskable artwork stays inside the central safe zone.
const safe = await sharp(svg).resize(350, 350).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#0b2538" },
})
  .composite([{ input: safe, left: 81, top: 81 }])
  .png()
  .toFile("public/icons/maskable-512.png");
console.log("Font, OFL license and four install icons prepared.");

import sharp from "sharp";
const ids = [
  "heart",
  "knee",
  "muscles",
  "spinal",
  "lungs",
  "liver",
  "kidney",
  "bladder",
  "uterus",
  "ovary",
  "pancreas",
  "gallbladder",
];
const images = [];
for (const [i, id] of ids.entries()) {
  const input = await sharp(`evidence/asset-${id}.png`)
    .resize(300, 205, { fit: "contain", background: "#edf5f5" })
    .png()
    .toBuffer();
  images.push({
    input,
    left: (i % 4) * 300,
    top: Math.floor(i / 4) * 240 + 28,
  });
  images.push({
    input: Buffer.from(
      `<svg width="300" height="28"><text x="12" y="20" font-size="16" fill="#183447">${id}</text></svg>`,
    ),
    left: (i % 4) * 300,
    top: Math.floor(i / 4) * 240,
  });
}
images.push({
  input: Buffer.from(
    '<svg width="1200" height="40"><text x="12" y="25" font-size="16" fill="#183447">Rendered QA evidence | HRA / HuBMAP / NLM | CC BY 4.0 | humanatlas.io/3d-reference-library</text></svg>',
  ),
  left: 0,
  top: 720,
});
await sharp({
  create: { width: 1200, height: 760, channels: 4, background: "#f4f8fa" },
})
  .composite(images)
  .png()
  .toFile("evidence/asset-contact-sheet.png");
console.log("Contact sheet created from the 12 actual rendered models.");

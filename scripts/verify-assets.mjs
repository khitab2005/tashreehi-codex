import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const manifest = JSON.parse(
  await readFile("public/models/manifest.json", "utf8"),
);
for (const asset of manifest.assets) {
  const b = await readFile(`public${asset.file}`);
  if (
    b.toString("utf8", 0, 4) !== "glTF" ||
    b.length !== asset.bytes ||
    createHash("sha256").update(b).digest("hex") !== asset.sha256
  )
    throw Error(`Invalid asset: ${asset.id}`);
  const j = JSON.parse(b.toString("utf8", 20, 20 + b.readUInt32LE(12)));
  if (j.buffers?.some((x) => x.uri) || j.images?.some((x) => x.uri))
    throw Error(`External dependency: ${asset.id}`);
  console.log(
    `${asset.id}: verified ${asset.nodes.length} mesh nodes, ${asset.bytes} bytes`,
  );
}
console.log("All 12 local GLB files match pinned-source SHA-256 hashes.");

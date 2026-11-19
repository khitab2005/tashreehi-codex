import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base =
  "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/";
// Keep downloads reproducible until a maintainer explicitly updates the pin.
const revision = "f1a3a63f110e27ff0736047d52d04dba5d3087f9";
const names = {
  heart: "VH_F_Heart",
  knee: "VH_F_Knee_L",
  muscles: "VH_F_Muscles_Knee_L",
  spinal: "VH_F_Spinal_Cord",
  lungs: "VH_F_Lung",
  liver: "VH_F_Liver",
  kidney: "VH_F_Kidney_L",
  bladder: "VH_F_Urinary_Bladder",
  uterus: "VH_F_Uterus",
  ovary: "VH_F_Ovary_L",
  pancreas: "VH_F_Pancreas",
  gallbladder: "VH_F_Gallbladder",
};
await mkdir("public/models", { recursive: true });
const assets = [];
for (const [id, name] of Object.entries(names)) {
  const source = `${base}${revision}/VH_Female/v1.2/${name}.glb`;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`${id}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.toString("utf8", 0, 4) !== "glTF")
    throw new Error(`${id} is not GLB`);
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength));
  await writeFile(`public/models/${id}.glb`, bytes);
  const meshes = (json.nodes ?? [])
    .filter((n) => n.mesh !== undefined)
    .map((n) => ({ name: n.name, mesh: n.mesh }));
  assets.push({
    id,
    file: `/models/${id}.glb`,
    source,
    revision,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    license: "CC-BY-4.0",
    author:
      "Kristen Browne (OCICB/NIAID), Human Reference Atlas / HuBMAP collaborators; Visible Human, U.S. National Library of Medicine",
    nodes: meshes,
    asset: json.asset,
  });
  console.log(id, bytes.length, JSON.stringify(meshes));
}
const license = await fetch(`${base}${revision}/LICENSE`).then((r) => r.text());
await writeFile("public/models/HRA-LICENSE.txt", license);
await writeFile(
  "public/models/manifest.json",
  JSON.stringify(
    {
      revision,
      license: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://humanatlas.io/3d-reference-library",
      changes:
        "None: byte-identical GLB files. Runtime centering, uniform scale, tint, visibility, and opacity do not alter distributed assets.",
      assets,
    },
    null,
    2,
  ),
);
await readFile("public/models/manifest.json");

import { describe, it, expect, beforeEach } from "vitest";
import {
  structures,
  systems,
  questions,
  searchStructures,
  normalizeSearch,
  scoreAnswers,
  structureForNode,
} from "../../src/lib/content";
import manifest from "../../public/models/manifest.json";
import { usePreferences } from "../../src/lib/store";
describe("Source-backed, model-linked catalog", () => {
  it("has unique stable IDs and eight nonempty systems", () => {
    expect(new Set(structures.map((s) => s.id)).size).toBe(25);
    expect(systems).toHaveLength(8);
    for (const sys of systems)
      expect(
        structures.filter((s) => s.system === sys.id).length,
      ).toBeGreaterThan(0);
  });
  it("maps every curated structure to real mesh nodes in its asset", () => {
    for (const s of structures) {
      const asset = manifest.assets.find((a) => a.id === s.model)!;
      expect(asset).toBeDefined();
      for (const node of s.modelNodeIds)
        expect(
          asset.nodes.some((n) => n.name === node),
          `${s.id}: ${node}`,
        ).toBe(true);
      expect(s.source).toMatch(/^https:\/\/openstax.org\//);
    }
  });
  it("has valid relationships and no empty bilingual fields", () => {
    for (const s of structures) {
      for (const field of [s.name, s.description, s.function, s.note]) {
        expect(field.ar.trim()).not.toBe("");
        expect(field.en.trim()).not.toBe("");
      }
      for (const id of s.relatedStructures)
        expect(structures.some((x) => x.id === id)).toBe(true);
    }
  });
  it("keeps every asset under an explicit verified license", () => {
    for (const a of manifest.assets) {
      expect(a.license).toBe("CC-BY-4.0");
      expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(a.source).toContain(manifest.revision);
    }
  });
});
describe("Bilingual search and model identity", () => {
  it("normalizes Arabic diacritics, alef forms and case", () => {
    expect(normalizeSearch("  أَذِين  ")).toBe("اذين");
    expect(searchStructures("بُطَيْن")).toHaveLength(2);
    expect(searchStructures("VENTRICLE")).toHaveLength(2);
    expect(searchStructures("الكُلية").length).toBeGreaterThan(0);
  });
  it("filters systems and models and handles a nonmatch safely", () => {
    expect(searchStructures("", "skeletal")).toHaveLength(4);
    expect(searchStructures("", undefined, "ovary")[0].id).toBe("ovary");
    expect(searchStructures("<script>")).toEqual([]);
  });
  it("never invents a curated identity for an unknown node", () => {
    expect(structureForNode("VH_F_left_ventricle", "heart")?.id).toBe(
      "left-ventricle",
    );
    expect(structureForNode("unknown", "heart")).toBeUndefined();
    expect(structureForNode("VH_F_left_ventricle", "knee")).toBeUndefined();
  });
});
describe("Quiz and local learning state", () => {
  beforeEach(() => usePreferences.getState().clear());
  it("scores correct, incorrect and incomplete attempts", () => {
    expect(scoreAnswers(questions.map((q) => q.answer))).toBe(5);
    expect(scoreAnswers([])).toBe(0);
    expect(scoreAnswers([0])).toBe(1);
    expect(scoreAnswers([2, 2, 0, 1, 0])).toBe(0);
  });
  it("toggles favorites and keeps completion idempotent", () => {
    const s = usePreferences.getState();
    s.toggleFavorite("tibia");
    expect(usePreferences.getState().favorites).toEqual(["tibia"]);
    s.toggleFavorite("tibia");
    expect(usePreferences.getState().favorites).toEqual([]);
    s.complete("tibia");
    s.complete("tibia");
    expect(usePreferences.getState().completed).toEqual(["tibia"]);
  });
  it("records last lesson and highest score, then erases learning data", () => {
    const s = usePreferences.getState();
    s.visit("tibia");
    s.recordQuiz(4);
    s.recordQuiz(1);
    expect(usePreferences.getState().lastLesson).toBe("tibia");
    expect(usePreferences.getState().quizBest).toBe(4);
    s.clear();
    expect(usePreferences.getState().lastLesson).toBeNull();
    expect(usePreferences.getState().quizBest).toBe(0);
  });
});

"use client";
import {
  Component,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import {
  Box3,
  Vector3,
  Mesh,
  MeshStandardMaterial,
  type Group,
  type Material,
  type Object3D,
} from "three";
import {
  RotateCcw,
  Camera,
  EyeOff,
  Focus,
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  HeartPulse,
} from "lucide-react";
import { Button } from "./ui/button";
import { bi, modelNames, structureForNode, structures } from "@/lib/content";
import { usePreferences } from "@/lib/store";

type View = "front" | "back" | "side";
type Layer = "tissue" | "valves" | "support";
export function layerForNode(name: string): Layer {
  return /valve/.test(name)
    ? "valves"
    : /cartilage|meniscus|ligament|tendon/.test(name)
      ? "support"
      : "tissue";
}
function dispose(root: Object3D) {
  root.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m: Material) => m.dispose());
    }
  });
}
function useModel(url: string, onProgress: (p: number) => void) {
  const [result, setResult] = useState<{
    scene: Group | null;
    error: string | null;
  }>({ scene: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let owned: Group | null = null;
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const total = Number(response.headers.get("Content-Length"));
        const reader = response.body?.getReader();
        let buffer: ArrayBuffer;
        if (reader) {
          const chunks: Uint8Array[] = [];
          let received = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (active)
              onProgress(
                total ? Math.min(99, Math.round((received / total) * 100)) : 0,
              );
          }
          const all = new Uint8Array(received);
          let offset = 0;
          for (const c of chunks) {
            all.set(c, offset);
            offset += c.length;
          }
          buffer = all.buffer;
        } else buffer = await response.arrayBuffer();
        const gltf = await new GLTFLoader().parseAsync(
          buffer,
          url.slice(0, url.lastIndexOf("/") + 1),
        );
        owned = gltf.scene;
        if (!active) {
          dispose(owned);
          return;
        }
        owned.traverse((o) => {
          if (o instanceof Mesh) {
            o.castShadow = false;
            o.receiveShadow = false;
          }
        });
        onProgress(100);
        setResult({ scene: owned, error: null });
      } catch (error) {
        if (active)
          setResult({
            scene: null,
            error: error instanceof Error ? error.message : "Load error",
          });
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      if (owned) dispose(owned);
    };
  }, [url, onProgress]);
  return result;
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Model({
  scene,
  model,
  selected,
  hidden,
  isolated,
  opacity,
  layers,
  onSelect,
}: {
  scene: Group;
  model: string;
  selected: string | null;
  hidden: string[];
  isolated: boolean;
  opacity: number;
  layers: Layer[];
  onSelect: (name: string) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const { scale, center } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    return {
      scale: 3 / Math.max(size.x, size.y, size.z),
      center: box.getCenter(new Vector3()),
    };
  }, [scene]);
  const selectedTerm = selected ? structureForNode(selected, model) : undefined;
  useEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const matches =
        o.name === selected || !!selectedTerm?.modelNodeIds.includes(o.name);
      o.visible =
        !hidden.includes(o.name) &&
        (!isolated || matches) &&
        layers.includes(layerForNode(o.name));
      for (const mat of Array.isArray(o.material) ? o.material : [o.material]) {
        if (mat instanceof MeshStandardMaterial) {
          mat.transparent = opacity < 1;
          mat.opacity = opacity;
          mat.depthWrite = opacity >= 1;
          mat.roughness = 0.62;
          mat.metalness = 0.06;
          mat.emissive.set(matches ? "#16bdb3" : "#000000");
          mat.emissiveIntensity = matches ? 0.38 : 0;
          mat.needsUpdate = true;
        }
      }
    });
    invalidate();
  }, [
    scene,
    selected,
    selectedTerm,
    hidden,
    isolated,
    opacity,
    layers,
    invalidate,
  ]);
  function click(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onSelect(e.object.name);
  }
  return (
    <group
      scale={scale}
      position={[-center.x * scale, -center.y * scale, -center.z * scale]}
    >
      <primitive object={scene} onClick={click} dispose={null} />
    </group>
  );
}
function Scene({
  scene,
  model,
  selected,
  hidden,
  isolated,
  opacity,
  layers,
  onSelect,
  view,
  command,
  lowPower,
  onReady,
}: {
  scene: Group;
  model: string;
  selected: string | null;
  hidden: string[];
  isolated: boolean;
  opacity: number;
  layers: Layer[];
  onSelect: (name: string) => void;
  view: View;
  command: { id: number; action: string };
  lowPower: boolean;
  onReady: () => void;
}) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera, gl, invalidate } = useThree();
  const renderScene = useThree((s) => s.scene);
  useEffect(() => {
    camera.position.set(
      ...((view === "back"
        ? [0, 0, -5.6]
        : view === "side"
          ? [5.6, 0, 0]
          : [0, 0, 5.6]) as [number, number, number]),
    );
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    invalidate();
  }, [view, camera, invalidate]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (command.action === "reset") {
      camera.position.set(0, 0, 5.6);
      c.target.set(0, 0, 0);
    }
    if (command.action === "in")
      camera.position.sub(c.target).multiplyScalar(0.8).add(c.target);
    if (command.action === "out")
      camera.position.sub(c.target).multiplyScalar(1.25).add(c.target);
    if (command.action === "shot") {
      gl.render(renderScene, camera);
      const canvas = document.createElement("canvas");
      canvas.width = gl.domElement.width;
      canvas.height = gl.domElement.height + 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c2335";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gl.domElement, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px sans-serif";
        ctx.fillText(
          "Tashreehi | HRA / HuBMAP / NLM | CC BY 4.0",
          16,
          canvas.height - 32,
        );
        ctx.fillText(
          "Source: humanatlas.io/3d-reference-library | Runtime display adapted",
          16,
          canvas.height - 12,
        );
        const link = document.createElement("a");
        link.download = `tashreehi-${model}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    }
    c.update();
    invalidate();
  }, [command, camera, gl, invalidate, model, renderScene]);

  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <directionalLight
        position={[-4, 1, -3]}
        intensity={1.8}
        color="#b2eeed"
      />
      <Model
        {...{
          scene,
          model,
          selected,
          hidden,
          isolated,
          opacity,
          layers,
          onSelect,
        }}
      />
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping={
          !lowPower &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
        dampingFactor={0.12}
        minDistance={1.2}
        maxDistance={15}
        enablePan
        enableZoom
        touches={{ ONE: 0, TWO: 2 }}
      />
    </>
  );
}
export default function AnatomyViewer({
  model = "heart",
  selectedId,
  onStructure,
  compact = false,
  identify = false,
}: {
  model?: string;
  selectedId?: string | null;
  onStructure?: (id: string | null) => void;
  compact?: boolean;
  identify?: boolean;
}) {
  const { locale, lowPower, setLowPower } = usePreferences();
  const t = (a: string, b: string) => (locale === "ar" ? a : b);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [isolated, setIsolated] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [layers, setLayers] = useState<Layer[]>([
    "tissue",
    "valves",
    "support",
  ]);
  const [view, setView] = useState<View>("front");
  const [command, setCommand] = useState({ id: 0, action: "" });
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const onProgress = useCallback((p: number) => setProgress(p), []);
  const { scene, error } = useModel(`/models/${model}.glb`, onProgress);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    const available = !!context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    const id = requestAnimationFrame(() => setWebgl(available));
    return () => cancelAnimationFrame(id);
  }, [retry]);
  const target = structures.find(
    (s) => s.id === selectedId && s.model === model,
  );
  const effectiveSelected = target?.modelNodeIds[0] ?? selected;
  const term = effectiveSelected
    ? structureForNode(effectiveSelected, model)
    : undefined;
  const onReady = useCallback(() => setReady(true), []);
  function act(action: string) {
    setCommand((c) => ({ id: c.id + 1, action }));
  }
  function select(name: string) {
    setSelected(name);
    const term = structureForNode(name, model);
    onStructure?.(term?.id ?? null);
  }
  function reset() {
    onStructure?.(null);
    setSelected(null);
    setHidden([]);
    setIsolated(false);
    setOpacity(1);
    setLayers(["tissue", "valves", "support"]);
    setView("front");
    act("reset");
  }
  function hide() {
    if (!effectiveSelected) return;
    const selectedNodes = term?.modelNodeIds ?? [effectiveSelected];
    setHidden((h) =>
      selectedNodes.every((n) => h.includes(n))
        ? h.filter((n) => !selectedNodes.includes(n))
        : [...new Set([...h, ...selectedNodes])],
    );
    setIsolated(false);
  }
  const fallback = (
    <div className="viewer-fallback" role="status">
      <HeartPulse size={44} />
      <h3>{t("العرض ثلاثي الأبعاد غير متاح", "3D view unavailable")}</h3>
      <p>
        {t(
          "يمكنك متابعة البطاقات والدروس. جرّب متصفحاً يدعم WebGL أو أعد تحميل الصفحة.",
          "Continue with cards and lessons. Try a WebGL-capable browser or reload.",
        )}
      </p>
      <Button variant="outline" onClick={() => setRetry((r) => r + 1)}>
        {t("إعادة المحاولة", "Retry")}
      </Button>
    </div>
  );
  return (
    <section
      className={`viewer ${compact ? "viewer-compact" : ""}`}
      aria-label={t("عارض التشريح ثلاثي الأبعاد", "3D anatomy viewer")}
      data-testid="viewer"
      data-ready={ready}
      data-selected={effectiveSelected ?? ""}
      data-hidden={hidden.length}
      data-isolated={isolated}
      data-opacity={opacity}
      data-view={view}
    >
      <div className="viewer-top">
        <span className="viewer-badge">
          <span />
          {modelNames[model]?.[locale]} <small>3D</small>
        </span>
        <span className="viewer-source">HRA · CC BY 4.0</span>
      </div>
      <div className="canvas-area" key={retry}>
        {webgl === false ? (
          fallback
        ) : error ? (
          <div className="viewer-fallback" role="alert">
            <h3>{t("تعذر تحميل النموذج", "Model could not load")}</h3>
            <p>
              {t(
                "تحقق من الاتصال ثم أعد المحاولة. البطاقات متاحة أدناه.",
                "Check your connection and retry. Cards remain available below.",
              )}
            </p>
            <code>{error}</code>
            <Button onClick={() => window.location.reload()}>
              {t("إعادة التحميل", "Reload")}
            </Button>
          </div>
        ) : scene && webgl ? (
          <SceneBoundary key={`${model}-${retry}`} fallback={fallback}>
            <Canvas
              dpr={lowPower ? 1 : [1, 1.5]}
              frameloop="demand"
              camera={{ position: [0, 0, 5.6], fov: 42, near: 0.01, far: 100 }}
              gl={{
                antialias: !lowPower,
                alpha: true,
                preserveDrawingBuffer: true,
                powerPreference: lowPower ? "low-power" : "default",
              }}
              onCreated={({ gl }) => {
                gl.domElement.setAttribute(
                  "aria-label",
                  locale === "ar"
                    ? "نموذج تشريحي تفاعلي"
                    : "Interactive anatomy model",
                );
                gl.domElement.addEventListener(
                  "webglcontextlost",
                  () => setWebgl(false),
                  { once: true },
                );
              }}
            >
              <Scene
                {...{
                  scene,
                  model,
                  hidden,
                  isolated,
                  opacity,
                  layers,
                  view,
                  command,
                  lowPower,
                  onReady,
                }}
                selected={effectiveSelected}
                onSelect={select}
              />
            </Canvas>
          </SceneBoundary>
        ) : null}
        {!error && !scene && webgl !== false && (
          <div className="model-loading" role="status">
            <span className="loading-ring" />
            {t("جارٍ تحميل التشريح", "Loading anatomy")}{" "}
            {progress > 0 ? `${progress}%` : ""}
            <progress max={100} value={progress} />
          </div>
        )}
        <span className="axis-label axis-a">{t("أمامي", "ANTERIOR")}</span>
        <span className="axis-label axis-r">
          {t("يمين المريض", "PATIENT R")}
        </span>
        {!compact && (
          <div className="viewer-tools">
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("تكبير", "Zoom in")}
              onClick={() => act("in")}
            >
              <ZoomIn size={19} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("تصغير", "Zoom out")}
              onClick={() => act("out")}
            >
              <ZoomOut size={19} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("إعادة الكاميرا", "Reset camera")}
              onClick={reset}
            >
              <RotateCcw size={19} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={!ready}
              aria-label={t("لقطة شاشة", "Screenshot")}
              onClick={() => act("shot")}
            >
              <Camera size={19} />
            </Button>
          </div>
        )}
      </div>
      {!compact && (
        <div className="viewer-controls">
          <div
            className="view-tabs"
            role="group"
            aria-label={t("اتجاه الكاميرا", "Camera direction")}
          >
            {(["front", "back", "side"] as const).map((v, i) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {
                  [
                    bi("أمامي", "Front"),
                    bi("خلفي", "Back"),
                    bi("جانبي", "Side"),
                  ][i][locale]
                }
              </button>
            ))}
          </div>
          <div className="selected-line" aria-live="polite">
            {identify ? (
              t(
                "اضغط على الجزء المطلوب في النموذج",
                "Click the requested model structure",
              )
            ) : term ? (
              <>
                <strong>{term.name[locale]}</strong>
                <span>{term.name[locale === "ar" ? "en" : "ar"]}</span>
              </>
            ) : effectiveSelected ? (
              <>
                <strong>
                  {t("بنية مرجعية غير مترجمة", "Reference structure")}
                </strong>
                <span dir="ltr">
                  {effectiveSelected.replace("VH_F_", "").replaceAll("_", " ")}
                </span>
              </>
            ) : (
              t("اضغط على جزء لاستكشافه", "Select a structure to explore")
            )}
          </div>
          <div className="control-row">
            <Button
              size="sm"
              variant="outline"
              disabled={!effectiveSelected}
              aria-pressed={isolated}
              onClick={() => setIsolated(!isolated)}
            >
              <Focus size={16} />
              {t("عزل الجزء", "Isolate")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!effectiveSelected}
              onClick={hide}
            >
              <EyeOff size={16} />
              {effectiveSelected && hidden.includes(effectiveSelected)
                ? t("إظهار الجزء", "Show structure")
                : t("إخفاء", "Hide")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setHidden([]);
                setIsolated(false);
              }}
            >
              {t("إظهار الكل", "Show all")}
            </Button>
          </div>
          <label className="range-label">
            {t("عتامة الأنسجة", "Tissue opacity")}{" "}
            <output>{Math.round(opacity * 100)}%</output>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </label>
          <details className="layer-details">
            <summary>
              <Layers size={15} />
              {t("الطبقات وجودة العرض", "Layers & quality")}
            </summary>
            {(["tissue", "valves", "support"] as Layer[]).map((l, i) => (
              <label key={l}>
                <input
                  type="checkbox"
                  checked={layers.includes(l)}
                  onChange={() =>
                    setLayers((old) =>
                      old.includes(l)
                        ? old.filter((x) => x !== l)
                        : [...old, l],
                    )
                  }
                />
                {
                  [
                    bi("النسيج الأساسي", "Main tissue"),
                    bi("الصمامات", "Valves"),
                    bi(
                      "غضاريف وأوتار وأربطة",
                      "Cartilage, tendons & ligaments",
                    ),
                  ][i][locale]
                }
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={lowPower}
                onChange={(e) => setLowPower(e.target.checked)}
              />
              {t(
                "وضع جهاز ضعيف (دقة أقل)",
                "Low power mode (lower resolution)",
              )}
            </label>
          </details>
        </div>
      )}
      <div className="viewer-hint">
        <Move size={14} />
        {t(
          "اسحب للدوران · إصبعان للتقريب والتحريك",
          "Drag to orbit · two fingers to zoom & pan",
        )}
      </div>
    </section>
  );
}

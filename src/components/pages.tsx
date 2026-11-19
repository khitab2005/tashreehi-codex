"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Bone,
  Brain,
  HeartPulse,
  Wind,
  Leaf,
  Droplet,
  Sprout,
  Search,
  Heart,
  Check,
  BookOpen,
  Compass,
  GraduationCap,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Layers,
  MousePointer2,
  Scan,
  CheckCircle2,
} from "lucide-react";
import AnatomyViewer from "./viewer-loader";
import { Button } from "./ui/button";
import { usePreferences } from "@/lib/store";
import {
  systems,
  structures,
  modelNames,
  searchStructures,
  questions,
  scoreAnswers,
  type Structure,
  type BodySystem,
} from "@/lib/content";
import manifest from "../../public/models/manifest.json";
const systemIcons = {
  bone: Bone,
  activity: Activity,
  brain: Brain,
  heart: HeartPulse,
  wind: Wind,
  leaf: Leaf,
  droplet: Droplet,
  sprout: Sprout,
};
function useText() {
  const locale = usePreferences((s) => s.locale);
  return { locale, t: (ar: string, en: string) => (locale === "ar" ? ar : en) };
}
function SystemIcon({
  system,
  size = 25,
}: {
  system: BodySystem;
  size?: number;
}) {
  const Icon = systemIcons[system.icon as keyof typeof systemIcons];
  return <Icon size={size} strokeWidth={1.6} />;
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function PageHeading({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function SystemCard({ system }: { system: BodySystem }) {
  const { locale, t } = useText();
  return (
    <Link href={`/systems/${system.id}`} className="system-card">
      <div className="system-card-top">
        <span className="system-icon" style={{ color: system.color }}>
          <SystemIcon system={system} />
        </span>
        <span className="tag">{t("نموذج جزئي", "Partial 3D")}</span>
      </div>
      <h3>{system.name[locale]}</h3>
      <p>{system.name[locale === "ar" ? "en" : "ar"]}</p>
      <span className="system-card-bottom">
        {t("استكشف الجهاز", "Explore system")} <Compass size={15} />
      </span>
    </Link>
  );
}
function FavoriteButton({ id }: { id: string }) {
  const { t } = useText();
  const favorites = usePreferences((s) => s.favorites);
  const toggle = usePreferences((s) => s.toggleFavorite);
  const active = favorites.includes(id);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        active
          ? t("إزالة من المفضلة", "Remove favorite")
          : t("إضافة إلى المفضلة", "Add favorite")
      }
      aria-pressed={active}
      onClick={() => toggle(id)}
    >
      <Heart size={18} fill={active ? "currentColor" : "none"} />
    </Button>
  );
}
function StructureCard({ structure }: { structure: Structure }) {
  const { locale, t } = useText();
  const sys = systems.find((s) => s.id === structure.system)!;
  return (
    <article className="structure-card">
      <div className="structure-card-header">
        <span className="system-icon small" style={{ color: sys.color }}>
          <SystemIcon system={sys} size={21} />
        </span>
        <FavoriteButton id={structure.id} />
      </div>
      <Link href={`/lessons/${structure.id}`}>
        <h3>{structure.name[locale]}</h3>
        <span className="secondary-name">
          {structure.name[locale === "ar" ? "en" : "ar"]}
        </span>
      </Link>
      <p>{structure.description[locale]}</p>
      <Link className="text-link" href={`/explorer?structure=${structure.id}`}>
        {t("شاهد في النموذج", "View in model")} <Scan size={16} />
      </Link>
    </article>
  );
}

export function Home() {
  const { t } = useText();
  const { completed, lastLesson } = usePreferences();
  const last = structures.find((s) => s.id === lastLesson);
  return (
    <>
      <section className="hero page-container">
        <div className="hero-copy">
          <Eyebrow>
            {t("أطلسك التفاعلي لجسم الإنسان", "YOUR INTERACTIVE HUMAN ATLAS")}
          </Eyebrow>
          <h1>
            {t("افهم الجسم.", "Understand the body.")}
            <br />
            <span>{t("بُعداً جديداً.", "A new dimension.")}</span>
          </h1>
          <p className="hero-description">
            {t(
              "اقترب من تفاصيل التشريح، واستكشف ترابط أجهزة الجسم بنماذج ثلاثية الأبعاد. تعلّم بالعربية، بحرية، وبوتيرتك.",
              "Get closer to anatomy and explore how the body connects through real 3D models. Learn freely, in your language, at your pace.",
            )}
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/explorer">
                <Compass size={19} />
                {t("ابدأ الاستكشاف", "Start exploring")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/lessons">
                <BookOpen size={18} />
                {t("تصفّح الدروس", "Browse lessons")}
              </Link>
            </Button>
          </div>
          <div className="hero-assurance">
            <span>
              <CheckCircle2 size={16} />
              {t("مجاني دائماً", "Free to explore")}
            </span>
            <span>
              <CheckCircle2 size={16} />
              {t("دون حساب", "No account")}
            </span>
            <span>
              <CheckCircle2 size={16} />
              {t("نماذج مرخّصة", "Licensed models")}
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-model">
            <AnatomyViewer model="heart" compact />
          </div>
          <div className="hero-caption">
            <span className="caption-icon">
              <HeartPulse size={22} />
            </span>
            <div>
              <strong>{t("القلب البشري", "The human heart")}</strong>
              <small>
                {t(
                  "نموذج مرجعي حقيقي · اسحب لتستكشف",
                  "Real reference model · drag to explore",
                )}
              </small>
            </div>
            <span className="model-chip">3D</span>
          </div>
          <span className="hero-side-label">ANATOMY, WITH PERSPECTIVE.</span>
        </div>
      </section>
      <section className="stat-strip page-container">
        <div>
          <strong>08</strong>
          <span>{t("أجهزة للتعلّم", "Systems to explore")}</span>
        </div>
        <div>
          <strong>12</strong>
          <span>{t("نموذجاً مرجعياً جزئياً", "Partial reference models")}</span>
        </div>
        <div>
          <strong>25</strong>
          <span>
            {t("بطاقة مرتبطة بالنماذج", "Model-linked learning cards")}
          </span>
        </div>
        <div>
          <strong>AR / EN</strong>
          <span>{t("المعرفة بلغتك", "Knowledge in your language")}</span>
        </div>
      </section>
      <section className="page-container section-space">
        <div className="section-heading">
          <div>
            <Eyebrow>
              {t("كل جهاز يحكي قصة", "EVERY SYSTEM TELLS A STORY")}
            </Eyebrow>
            <h2>{t("ابدأ من فضولك", "Follow your curiosity")}</h2>
            <p>
              {t(
                "اختر جهازاً، وتعرّف على البنى المتاحة وحدود تغطيتها.",
                "Choose a system. Discover its structures and the scope of each model.",
              )}
            </p>
          </div>
          <Link href="/systems" className="text-link">
            {t("جميع أجهزة الجسم", "All body systems")} <Layers size={17} />
          </Link>
        </div>
        <div className="system-grid">
          {systems.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      </section>
      <section className="learning-band page-container">
        <div>
          <Eyebrow>
            {t("من المشاهدة إلى الفهم", "FROM LOOKING TO LEARNING")}
          </Eyebrow>
          <h2>
            {t("معرفة تثبت، خطوة بخطوة.", "Make knowledge stay, step by step.")}
          </h2>
          <p>
            {t(
              "استكشف الجزء، اقرأ وظيفته، ثم اختبر ما تعلّمته. تقدّمك يبقى على جهازك.",
              "Explore a structure, understand its function, then test yourself. Your progress stays on your device.",
            )}
          </p>
          <Button asChild variant="outline">
            <Link href={last ? `/lessons/${last.id}` : "/quizzes"}>
              <GraduationCap size={18} />
              {last
                ? t(`أكمل: ${last.name.ar}`, `Continue: ${last.name.en}`)
                : t("جرّب اختباراً قصيراً", "Try a short quiz")}
            </Link>
          </Button>
        </div>
        <div className="learning-steps">
          {[
            [
              MousePointer2,
              t("شاهد واختر", "Explore & select"),
              t("أجزاء حقيقية قابلة للتحديد", "Real, selectable structures"),
            ],
            [
              BookOpen,
              t("افهم واربط", "Understand & connect"),
              t(
                "شرح موجز ومصادر للمتابعة",
                "Concise notes and further reading",
              ),
            ],
            [
              GraduationCap,
              t("راجع وتقدّم", "Review & progress"),
              t(
                `${completed.length} من 25 بطاقة مكتملة`,
                `${completed.length} of 25 cards completed`,
              ),
            ],
          ].map(([Icon, title, desc], i) => {
            const I = Icon as typeof BookOpen;
            return (
              <div key={i}>
                <span>
                  <I size={22} />
                </span>
                <div>
                  <h3>{title as string}</h3>
                  <p>{desc as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="scope-note page-container">
        <ShieldCheck size={20} />
        <p>
          {t(
            "شفافية علمية: النماذج تمثل أجزاء مختارة من تشريح أنثوي مرجعي، ولا تشكّل أطلساً كاملاً للجسم. المحتوى مرتبط بمراجع، ولم يخضع بعد لمراجعة اختصاصي مستقل.",
            "Scientific transparency: models show selected female reference anatomy, not a complete body atlas. Content is source-linked and awaits independent specialist review.",
          )}
        </p>
        <Link href="/credits">{t("المصادر", "Sources")}</Link>
      </div>
    </>
  );
}

export function Explorer() {
  const params = useSearchParams();
  const initial = structures.find((s) => s.id === params.get("structure"));
  const requestedSystem = systems.find((s) => s.id === params.get("system"));
  const [systemId, setSystemId] = useState(
    initial?.system ?? requestedSystem?.id ?? "cardiovascular",
  );
  const [model, setModel] = useState(
    initial?.model ?? requestedSystem?.models[0] ?? "heart",
  );
  const [selected, setSelected] = useState<string | null>(initial?.id ?? null);
  const [query, setQuery] = useState("");
  const { locale, t } = useText();
  const system = systems.find((s) => s.id === systemId)!;
  const found = searchStructures(
    query,
    query ? undefined : systemId,
    query ? undefined : model,
  );
  const structure = structures.find((s) => s.id === selected);
  function choose(s: Structure) {
    setSystemId(s.system);
    setModel(s.model);
    setSelected(s.id);
  }
  return (
    <div className="explorer-page page-container">
      <div className="explorer-heading">
        <div>
          <Eyebrow>{t("شاهد. حرّك. افهم.", "LOOK. MOVE. UNDERSTAND.")}</Eyebrow>
          <h1>{t("مستكشف التشريح", "Anatomy explorer")}</h1>
        </div>
        <span className="tag tag-teal">
          {t("نماذج مرجعية حقيقية", "Real reference anatomy")}
        </span>
      </div>
      <div className="explorer-layout">
        <aside className="explorer-sidebar">
          <h2>{t("أجهزة الجسم", "Body systems")}</h2>
          <div className="system-list">
            {systems.map((s) => (
              <button
                key={s.id}
                aria-pressed={s.id === systemId}
                onClick={() => {
                  setSystemId(s.id);
                  setModel(s.models[0]);
                  setSelected(null);
                  setQuery("");
                }}
              >
                <SystemIcon system={s} size={20} />
                <span>{s.name[locale]}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-notice">
            <ShieldCheck size={19} />
            <h3>{t("نطاق النموذج", "Model coverage")}</h3>
            <p>{system.coverage[locale]}</p>
            <Link href="/credits">
              {t("المصدر والترخيص", "Source & license")}
            </Link>
          </div>
        </aside>
        <div className="explorer-stage">
          <div className="model-select-row">
            <label htmlFor="model-select">{t("النموذج", "Model")}</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setSelected(null);
              }}
            >
              {system.models.map((m) => (
                <option value={m} key={m}>
                  {modelNames[m][locale]}
                </option>
              ))}
            </select>
            <span>{t("تغطية جزئية", "Partial coverage")}</span>
          </div>
          <AnatomyViewer
            key={model}
            model={model}
            selectedId={selected}
            onStructure={setSelected}
          />
          <p className="keyboard-help">
            {t(
              "بديل لوحة المفاتيح: اختر البنى من القائمة، واستخدم أزرار التقريب واتجاه الكاميرا.",
              "Keyboard alternative: select structures from the list and use zoom and camera buttons.",
            )}
          </p>
        </div>
        <aside className="structure-panel">
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label={t(
                "ابحث بالعربية أو الإنكليزية",
                "Search Arabic or English",
              )}
              placeholder={t("ابحث عن جزء…", "Find a structure…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="panel-section-title">
            <h2>{t("البنى المشروحة", "Learning structures")}</h2>
            <span>{found.length}</span>
          </div>
          <div className="structure-list">
            {found.map((s) => (
              <button
                key={s.id}
                aria-pressed={selected === s.id}
                onClick={() => choose(s)}
              >
                <strong>{s.name[locale]}</strong>
                <span>{s.name[locale === "ar" ? "en" : "ar"]}</span>
              </button>
            ))}
            {!found.length && (
              <p className="empty-inline">
                {t(
                  "لم نعثر على نتائج. جرّب كلمة أخرى.",
                  "No matches. Try another term.",
                )}
              </p>
            )}
          </div>
          {structure ? (
            <div className="selected-card">
              <div className="panel-section-title">
                <span className="tag">
                  {t("الجزء المحدد", "Selected structure")}
                </span>
                <FavoriteButton id={structure.id} />
              </div>
              <h3>{structure.name[locale]}</h3>
              <p>{structure.description[locale]}</p>
              <h4>{t("الوظيفة", "Function")}</h4>
              <p>{structure.function[locale]}</p>
              <Link className="text-link" href={`/lessons/${structure.id}`}>
                {t("افتح البطاقة التعليمية", "Open learning card")}{" "}
                <BookOpen size={16} />
              </Link>
              <a
                className="source-link"
                href={structure.source}
                target="_blank"
                rel="noreferrer"
              >
                OpenStax <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div className="select-prompt">
              <MousePointer2 size={28} />
              <p>
                {t(
                  "اختر بنية من النموذج أو القائمة لعرض شرحها.",
                  "Select a model structure or list item to read about it.",
                )}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SystemsPage() {
  const { t } = useText();
  return (
    <div className="page-container content-page">
      <PageHeading
        eyebrow={t("الكل يبدأ من الترابط", "IT ALL STARTS WITH CONNECTION")}
        title={t("أجهزة الجسم", "Body systems")}
        description={t(
          "ثمانية مداخل لدراسة التشريح. كل صفحة توضّح الأجزاء المتاحة وما لم يتوفر بعد.",
          "Eight starting points for anatomy. Each page states what is available and what is missing.",
        )}
      />
      <div className="system-grid">
        {systems.map((s) => (
          <SystemCard key={s.id} system={s} />
        ))}
      </div>
    </div>
  );
}
export function SystemDetail({ id }: { id: string }) {
  const { locale, t } = useText();
  const system = systems.find((s) => s.id === id)!;
  const [query, setQuery] = useState("");
  const found = searchStructures(query, id);
  return (
    <div className="page-container content-page">
      <Link href="/systems" className="text-link">
        {t("أجهزة الجسم", "Body systems")}
      </Link>
      <PageHeading
        title={system.name[locale]}
        description={system.summary[locale]}
      />
      <div className="coverage-banner">
        <Layers size={25} />
        <div>
          <strong>
            {t("نموذج حقيقي · تغطية جزئية", "Real model · partial coverage")}
          </strong>
          <p>{system.coverage[locale]}</p>
        </div>
        <Button asChild>
          <Link href={`/explorer?system=${id}`}>
            {t("افتح المستكشف", "Open explorer")}
          </Link>
        </Button>
      </div>
      <div className="section-heading">
        <h2>{t("تعلّم البنى المتاحة", "Learn available structures")}</h2>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label={t("ابحث في الجهاز", "Search this system")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ابحث في هذا الجهاز…", "Search this system…")}
          />
        </label>
      </div>
      <div className="cards-grid">
        {found.map((s) => (
          <StructureCard key={s.id} structure={s} />
        ))}
      </div>
      {!found.length && <p role="status">{t("لا توجد نتائج", "No results")}</p>}
      <a
        href={structures.find((s) => s.system === id)?.source}
        className="source-link"
        target="_blank"
        rel="noreferrer"
      >
        {t("المرجع التعليمي: OpenStax", "Educational reference: OpenStax")}{" "}
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

function Lessons() {
  const { t, locale } = useText();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const completed = usePreferences((s) => s.completed);
  const found = searchStructures(query, filter || undefined);
  return (
    <div className="page-container content-page">
      <PageHeading
        eyebrow={t("معرفة تستحق أن تبقى", "KNOWLEDGE THAT STAYS")}
        title={t("مكتبة الدروس", "Learning library")}
        description={t(
          "25 بطاقة موجزة مرتبطة ببنى فعلية. اقرأ الوظيفة، واربط الأجزاء، وراجع في النموذج.",
          "25 concise cards linked to real model structures. Learn functions, connect parts and review in 3D.",
        )}
      />
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label={t("ابحث في الدروس", "Search lessons")}
            placeholder={t(
              "ابحث بالعربية أو الإنكليزية…",
              "Search Arabic or English…",
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label={t("تصفية الجهاز", "Filter system")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">{t("كل الأجهزة", "All systems")}</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name[locale]}
            </option>
          ))}
        </select>
        <span>
          {completed.length} / 25 {t("مكتملة", "completed")}
        </span>
      </div>
      <div className="cards-grid">
        {found.map((s) => (
          <StructureCard key={s.id} structure={s} />
        ))}
      </div>
      {!found.length && (
        <div className="empty" role="status">
          <Search size={35} />
          <h2>{t("لم نعثر على نتائج", "No results found")}</h2>
          <p>
            {t(
              "جرّب مصطلحاً آخر أو غيّر تصفية الجهاز.",
              "Try another term or change the system filter.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
export function Lesson({ id }: { id: string }) {
  const { locale, t } = useText();
  const structure = structures.find((s) => s.id === id)!;
  const { visit, complete, completed } = usePreferences();
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    // Hydrate before writing: child effects can run before the shell effect.
    // Otherwise a direct lesson reload would overwrite saved progress.
    if (usePreferences.persist.hasHydrated()) visit(id);
    else
      void Promise.resolve(usePreferences.persist.rehydrate()).then(() =>
        visit(id),
      );
  }, [id, visit]);
  return (
    <div className="page-container content-page">
      <Link href="/lessons" className="text-link">
        {t("مكتبة الدروس", "Learning library")}
      </Link>
      <div className="lesson-heading">
        <PageHeading
          title={structure.name[locale]}
          description={structure.name[locale === "ar" ? "en" : "ar"]}
        />
        <FavoriteButton id={id} />
      </div>
      <div className="lesson-layout">
        <article className="lesson-body">
          <span className="tag tag-teal">
            {t(
              "بطاقة تعليمية مرتبطة بنموذج حقيقي",
              "Learning card linked to a real model",
            )}
          </span>
          <h2>{t("تعرّف على الجزء", "Meet the structure")}</h2>
          <p>{structure.description[locale]}</p>
          <h2>{t("الوظيفة", "Function")}</h2>
          <p>{structure.function[locale]}</p>
          <h2>{t("علاقته بالبنى الأخرى", "Related structures")}</h2>
          <div className="related-links">
            {structure.relatedStructures.map((id) => {
              const s = structures.find((s) => s.id === id)!;
              return (
                <Link key={id} href={`/lessons/${id}`}>
                  {s.name[locale]}
                </Link>
              );
            })}
          </div>
          <div className="learning-note">
            <BookOpen size={22} />
            <p>{structure.note[locale]}</p>
          </div>
          <h2>{t("راجع من الذاكرة", "Recall from memory")}</h2>
          <button
            className="flashcard"
            aria-pressed={flipped}
            onClick={() => setFlipped(!flipped)}
          >
            <span>
              {flipped
                ? t("الإجابة", "Answer")
                : t("بطاقة مراجعة · اضغط لتقلبها", "Flashcard · tap to flip")}
            </span>
            <strong>
              {flipped
                ? structure.function[locale]
                : t(
                    `ما وظيفة ${structure.name.ar}؟`,
                    `What is the function of ${structure.name.en}?`,
                  )}
            </strong>
            <RotateCcw size={20} />
          </button>
          <div className="lesson-actions">
            <Button onClick={() => complete(id)}>
              <Check size={18} />
              {completed.includes(id)
                ? t("تم إكمال البطاقة", "Card completed")
                : t("علّمها كمكتملة", "Mark complete")}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/explorer?structure=${id}`}>
                <Scan size={18} />
                {t("استكشف في 3D", "Explore in 3D")}
              </Link>
            </Button>
          </div>
          <a
            className="source-link"
            href={structure.source}
            target="_blank"
            rel="noreferrer"
          >
            {t(
              "اقرأ المرجع: OpenStax Anatomy & Physiology",
              "Read source: OpenStax Anatomy & Physiology",
            )}{" "}
            <ExternalLink size={14} />
          </a>
        </article>
        <div>
          <AnatomyViewer
            key={structure.model}
            model={structure.model}
            selectedId={id}
            compact
          />
          <div className="coverage-small">
            {systems.find((s) => s.id === structure.system)!.coverage[locale]}
          </div>
        </div>
      </div>
    </div>
  );
}

function Quizzes() {
  const { locale, t } = useText();
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<"mcq" | "identify">("mcq");
  const [identified, setIdentified] = useState<string | null>(null);
  const { quizBest, recordQuiz } = usePreferences();
  const score = scoreAnswers(answers);
  const target = structures.find((s) => s.id === "right-ventricle")!;
  return (
    <div className="page-container content-page">
      <PageHeading
        eyebrow={t("اختبر، افهم، وحاول مجدداً", "TEST, UNDERSTAND, TRY AGAIN")}
        title={t("اختبر معرفتك", "Test your knowledge")}
        description={t(
          "خمسة أسئلة مع تصحيح وشرح، أو تعرّف على جزء داخل النموذج.",
          "Five questions with explanations, or identify a real structure in the model.",
        )}
      />
      <div className="quiz-toolbar">
        <div className="view-tabs">
          <button aria-pressed={mode === "mcq"} onClick={() => setMode("mcq")}>
            {t("اختيار من متعدد", "Multiple choice")}
          </button>
          <button
            aria-pressed={mode === "identify"}
            onClick={() => setMode("identify")}
          >
            {t("تعرّف على الجزء", "Identify structure")}
          </button>
        </div>
        <span>
          {t("أفضل نتيجة", "Best score")}: {quizBest} / {questions.length}
        </span>
      </div>
      {mode === "mcq" ? (
        <div className="quiz-content">
          {submitted && (
            <div className="quiz-result" role="status">
              <GraduationCap size={36} />
              <div>
                <h2>
                  {t("نتيجتك", "Your score")}: {score} / {questions.length}
                </h2>
                <p>
                  {t(
                    "راجع الشرح والمراجع أدناه ثم حاول مرة أخرى.",
                    "Review explanations and sources below, then try again.",
                  )}
                </p>
              </div>
            </div>
          )}
          {questions.map((q, i) => (
            <fieldset key={q.id} className="question-card" disabled={submitted}>
              <legend>
                <span>{i + 1}</span>
                {q.prompt[locale]}
              </legend>
              <div className="answer-options">
                {q.options.map((o, j) => (
                  <label
                    key={j}
                    className={
                      submitted
                        ? j === q.answer
                          ? "answer-correct"
                          : answers[i] === j
                            ? "answer-wrong"
                            : ""
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[i] === j}
                      onChange={() =>
                        setAnswers((a) => {
                          const next = [...a];
                          next[i] = j;
                          return next;
                        })
                      }
                    />
                    <span>{o[locale]}</span>
                    {submitted && j === q.answer && <Check size={17} />}
                  </label>
                ))}
              </div>
              {submitted && (
                <div className="answer-explanation">
                  <strong>
                    {answers[i] === q.answer
                      ? t("إجابة صحيحة", "Correct")
                      : t("راجع الإجابة", "Review this answer")}
                  </strong>
                  <p>{q.explanation[locale]}</p>
                  <a href={q.source} target="_blank" rel="noreferrer">
                    OpenStax <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </fieldset>
          ))}
          <Button
            disabled={
              !submitted && questions.some((_, i) => answers[i] === undefined)
            }
            onClick={() => {
              if (submitted) {
                setAnswers([]);
                setSubmitted(false);
              } else {
                setSubmitted(true);
                recordQuiz(score);
              }
            }}
          >
            {submitted
              ? t("حاول مرة أخرى", "Try again")
              : t("اعرض النتيجة والتصحيح", "Show score & explanations")}
          </Button>
        </div>
      ) : (
        <div className="identify-layout">
          <div className="identify-card">
            <span className="tag">
              {t("تحديد فعلي بالنقر", "Real model selection")}
            </span>
            <h2>
              {t("اعثر على", "Find the")} {target.name[locale]}
            </h2>
            <p>
              {t(
                "دوّر القلب ثم اضغط على الحجرة المطلوبة. يمكنك تكرار المحاولة.",
                "Rotate the heart and click the requested chamber. You can retry.",
              )}
            </p>
            {identified && (
              <div role="status" className="learning-note">
                {identified === target.id
                  ? t(
                      "صحيح! البطين الأيمن يضخ الدم إلى الرئتين.",
                      "Correct! The right ventricle pumps blood to the lungs.",
                    )
                  : t(
                      "هذا جزء آخر. حاول مجدداً.",
                      "That is another structure. Try again.",
                    )}
              </div>
            )}
            <Link href={`/lessons/${target.id}`} className="text-link">
              {t("راجع الدرس", "Review the lesson")}
            </Link>
          </div>
          <AnatomyViewer model="heart" identify onStructure={setIdentified} />
        </div>
      )}
    </div>
  );
}

function Favorites() {
  const { t } = useText();
  const favorites = usePreferences((s) => s.favorites);
  const found = structures.filter((s) => favorites.includes(s.id));
  return (
    <div className="page-container content-page">
      <PageHeading
        eyebrow={t("عد إلى ما يهمّك", "RETURN TO WHAT MATTERS")}
        title={t("مفضلتك", "Your favorites")}
        description={t(
          "بطاقاتك المحفوظة على هذا المتصفح، دون تسجيل دخول.",
          "Cards saved on this browser, with no account required.",
        )}
      />
      {found.length ? (
        <div className="cards-grid">
          {found.map((s) => (
            <StructureCard key={s.id} structure={s} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Heart size={44} />
          <h2>{t("مساحة لفضولك", "A place for your curiosity")}</h2>
          <p>
            {t(
              "اضغط على القلب بجانب أي بطاقة لتجدها هنا.",
              "Tap the heart on a learning card to save it here.",
            )}
          </p>
          <Button asChild>
            <Link href="/lessons">{t("تصفّح البطاقات", "Browse cards")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoPage({ page }: { page: string }) {
  const { locale, t } = useText();
  const clear = usePreferences((s) => s.clear);
  const [cleared, setCleared] = useState(false);
  return (
    <div className="page-container content-page prose-page">
      <PageHeading
        title={
          page === "about"
            ? t("التشريح، متاح للجميع.", "Anatomy, open to everyone.")
            : page === "privacy"
              ? t("خصوصيتك، ببساطة.", "Your privacy, simply.")
              : t("المصادر والاعتمادات", "Sources & acknowledgments")
        }
        description={
          page === "about"
            ? t(
                "تشريحي مشروع تعليمي مستقل ومفتوح المصدر، صُمم ليجعل التعلّم التفاعلي متاحاً بالعربية والإنكليزية.",
                "Tashreehi is an independent open source learning project for interactive anatomy in Arabic and English.",
              )
            : page === "privacy"
              ? t(
                  "لا حسابات، لا إعلانات، ولا أدوات تتبع تحليلية.",
                  "No accounts, advertising, or analytics trackers.",
                )
              : t(
                  "كل نموذج له مصدر وترخيص. لا نستخدم أصول التطبيقات التجارية.",
                  "Every model has a source and license. No proprietary anatomy app assets are used.",
                )
        }
      />
      {page === "about" ? (
        <>
          <h2>{t("ما الذي يمكنك تعلّمه؟", "What can you learn?")}</h2>
          <p>
            {t(
              "تضم هذه النسخة 12 ملف GLB حقيقياً و25 بطاقة قصيرة ضمن ثمانية أجهزة. يمكنك استكشاف البنى، إخفاء الأنسجة، مراجعة الوظائف، وحل اختبارات محلية.",
              "This release includes 12 real GLB files and 25 short learning cards across eight systems. Explore structures, hide tissue, review functions, and take local quizzes.",
            )}
          </p>
          <h2>{t("حدود واضحة", "Clear limits")}</h2>
          <p>
            {t(
              "كل الأجهزة جزئية. لا يوجد جسم كامل موحد، ولا مقاطع تشريحية أو محاكاة وظائف الأعضاء. النماذج تمثل عينات مرجعية أنثوية ولا تمثل جميع الاختلافات الطبيعية.",
              "All systems are partial. There is no unified complete body, sectioning, or physiological simulation. Models represent female reference anatomy and do not cover all normal variation.",
            )}
          </p>
          <p>
            {t(
              "المحتوى موجز ومربوط بمراجع OpenStax؛ الترجمة والتبسيط من إعداد المشروع ولم يخضعا لمراجعة اختصاصي مستقل. ليس بديلاً عن المقرر أو مرجعاً سريرياً.",
              "Content is concise and linked to OpenStax. Project translations and summaries await independent specialist review. This is neither a course replacement nor a clinical reference.",
            )}
          </p>
          <h2>{t("مفتوح المصدر", "Open source")}</h2>
          <p>
            {t(
              "الكود تحت MIT. ملفات HRA التشريحية تحت CC BY 4.0، مع الاحتفاظ بحقوق مؤلفيها.",
              "Code is MIT licensed. HRA anatomical assets are CC BY 4.0, retaining their creators’ credits.",
            )}
          </p>
          <Link className="text-link" href="/credits">
            {t("عرض الاعتمادات والتراخيص", "View credits & licenses")}
          </Link>
        </>
      ) : page === "privacy" ? (
        <>
          <h2>{t("ما الذي يُحفظ؟", "What is stored?")}</h2>
          <p>
            {t(
              "يحتفظ localStorage باللغة والمظهر والمفضلة والبطاقات المكتملة وآخر درس وأفضل نتيجة ووضع الأداء في هذا المتصفح فقط. لا تُرسل هذه القيم إلى خادم التطبيق. لا نستخدم ملفات تعريف ارتباط للتتبع.",
              "localStorage keeps language, theme, favorites, completed cards, last lesson, best score and performance preference only in this browser. These values are not sent to the app server. No tracking cookies are used.",
            )}
          </p>
          <h2>{t("الشبكة والعمل دون اتصال", "Network & offline use")}</h2>
          <p>
            {t(
              "النماذج والخطوط تُخدم محلياً من الموقع. يحفظ Service Worker الصفحات والملفات التي زرتها؛ قد تُحذف ذاكرة التخزين المؤقت إذا امتلأ الجهاز. الروابط المرجعية تفتح مواقع خارجية بسياساتها الخاصة. قد يحتفظ مزوّد الاستضافة بسجلات طلبات تقنية وفق سياسته.",
              "Models and fonts are served by this site. A service worker caches visited pages and files; the device may evict these caches. Reference links open external websites with their own policies. Hosting providers may retain technical request logs under their policies.",
            )}
          </p>
          <h2>{t("حذف بيانات التعلّم", "Erase learning data")}</h2>
          <p>
            {t(
              "يمكنك مسح تفضيلاتك وتقدمك هنا. لحذف ذاكرة الملفات أيضاً، امسح بيانات الموقع من إعدادات المتصفح.",
              "Clear preferences and progress here. To also remove cached files, clear site data in browser settings.",
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              clear();
              setCleared(true);
            }}
          >
            {t("مسح التفضيلات والتقدّم", "Clear preferences & progress")}
          </Button>
          {cleared && (
            <p role="status">
              {t("تم مسح بيانات التعلّم.", "Learning data cleared.")}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="coverage-banner">
            <ShieldCheck size={30} />
            <div>
              <strong>Human Reference Atlas / HuBMAP</strong>
              <p>
                {t(
                  "مكتبة الأعضاء المرجعية ثلاثية الأبعاد — مستمدة من Visible Human، المكتبة الوطنية الأمريكية للطب.",
                  "3D Reference Object Library — based on Visible Human, U.S. National Library of Medicine.",
                )}
              </p>
            </div>
          </div>
          <p>
            {t(
              "المؤلفون: فريق Human Reference Atlas / HuBMAP؛ الرسوم الطبية المرجعية من عمل Kristen Browne وشركاء المكتبة. يُحتفظ بحقل asset الأصلي وتفاصيل كل ملف في manifest.json.",
              "Creators: Human Reference Atlas / HuBMAP team; reference medical illustration by Kristen Browne and library collaborators. Original asset metadata and file details are retained in manifest.json.",
            )}
          </p>
          <p>
            <a
              href="https://humanatlas.io/3d-reference-library"
              target="_blank"
              rel="noreferrer"
            >
              {t("المكتبة الرسمية", "Official reference library")}
            </a>{" "}
            ·{" "}
            <a
              href="https://github.com/hubmapconsortium/ccf-3d-reference-object-library"
              target="_blank"
              rel="noreferrer"
            >
              {t("المصدر الأصلي", "Upstream source")}
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>{" "}
            ·{" "}
            <a href="/models/HRA-LICENSE.txt">
              {t("نص الترخيص", "License text")}
            </a>
          </p>
          <p>
            {t(
              "لم نعدل بايتات GLB. يطبق العارض توسيطاً ومقياساً موحداً وإضاءة وتحديداً وشفافية أثناء العرض. لا تعني إعادة الاستخدام تأييد الجهات الأصلية للمشروع.",
              "GLB bytes are unchanged. The viewer applies runtime centering, uniform scaling, lighting, highlighting and opacity. Reuse does not imply endorsement by the original institutions.",
            )}
          </p>
          <div className="credit-list">
            {manifest.assets.map((asset) => (
              <article key={asset.id}>
                <h3>{modelNames[asset.id][locale]}</h3>
                <span>
                  CC BY 4.0 · {(asset.bytes / 1024 / 1024).toFixed(2)} MB
                </span>
                <a href={asset.source} target="_blank" rel="noreferrer">
                  {t("تحميل المصدر المثبت بإصدار", "Pinned original source")}{" "}
                  <ExternalLink size={13} />
                </a>
                <a href={asset.file} download>
                  {t("تحميل ملف GLB المستخدم", "Download included GLB")}
                </a>
                <code>SHA-256: {asset.sha256}</code>
              </article>
            ))}
          </div>
          <h2>{t("المحتوى التعليمي", "Educational content")}</h2>
          <p>
            {t(
              "ملخصات عربية وإنكليزية أصلية مرتبطة بفصول OpenStax Anatomy & Physiology 2e. لا نعيد نشر صور الكتاب أو نصوصه. راجع المصدر من كل بطاقة؛ المحتوى ينتظر تدقيقاً بشرياً اختصاصياً.",
              "Original Arabic and English summaries linked to OpenStax Anatomy & Physiology 2e chapters. No textbook illustrations or passages are republished. Each card links to its source; independent specialist review remains pending.",
            )}
          </p>
          <h2>{t("البرمجيات والأيقونات", "Software & icons")}</h2>
          <p>
            Next.js, React, Three.js, React Three Fiber, Drei, Zustand, Tailwind
            CSS, shadcn/ui, Radix UI, Lucide, Vitest, Playwright.
          </p>
          <p>
            {t(
              "أيقونات Lucide تحت ISC. هوية تشريحي وأيقونة التطبيق من إنشاء المشروع؛ الكود MIT. خط Noto Sans Arabic تحت SIL Open Font License 1.1.",
              "Lucide icons: ISC. Tashreehi branding and app icon are original project work; code: MIT. Noto Sans Arabic: SIL Open Font License 1.1.",
            )}
          </p>
          <a href="/models/manifest.json">
            {t("سجل الأصول والبصمات الكامل", "Full asset manifest & hashes")}
          </a>
        </>
      )}
    </div>
  );
}
export function PageRouter({ page }: { page: string }) {
  switch (page) {
    case "explorer":
      return <Explorer />;
    case "systems":
      return <SystemsPage />;
    case "lessons":
      return <Lessons />;
    case "quizzes":
      return <Quizzes />;
    case "favorites":
      return <Favorites />;
    default:
      return <InfoPage page={page} />;
  }
}

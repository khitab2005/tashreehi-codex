export type Locale = "ar" | "en";
export type Bilingual = { ar: string; en: string };
export const bi = (ar: string, en: string): Bilingual => ({ ar, en });
export const textbook =
  "https://openstax.org/books/anatomy-and-physiology-2e/pages/";
export const sources = {
  skeletal: textbook + "8-4-bones-of-the-lower-limb",
  muscular:
    textbook + "11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs",
  nervous: textbook + "13-2-the-central-nervous-system",
  cardiovascular: textbook + "19-1-heart-anatomy",
  respiratory:
    textbook + "22-1-organs-and-structures-of-the-respiratory-system",
  digestive:
    textbook +
    "23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder",
  urinary: textbook + "25-3-gross-anatomy-of-the-kidney",
  reproductive:
    textbook + "27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system",
};
export type SystemId = keyof typeof sources;
export interface BodySystem {
  id: SystemId;
  name: Bilingual;
  summary: Bilingual;
  coverage: Bilingual;
  models: string[];
  color: string;
  icon: string;
}
export const systems: BodySystem[] = [
  {
    id: "skeletal",
    name: bi("العظام والمفاصل", "Bones & joints"),
    summary: bi(
      "دعم الجسم والحركة مع العضلات.",
      "Support and movement with muscles.",
    ),
    coverage: bi(
      "جزئي: الركبة اليسرى فقط؛ بعض العظام مقتطعة.",
      "Partial: left knee only; some bones are cropped.",
    ),
    models: ["knee"],
    color: "#c9b5a0",
    icon: "bone",
  },
  {
    id: "muscular",
    name: bi("الجهاز العضلي", "Muscular system"),
    summary: bi("توليد القوة والحركة.", "Force and movement."),
    coverage: bi(
      "جزئي: المستقيمة الفخذية ووتر الرباعية قرب الركبة.",
      "Partial: rectus femoris and quadriceps tendon near the knee.",
    ),
    models: ["muscles"],
    color: "#c86872",
    icon: "activity",
  },
  {
    id: "nervous",
    name: bi("الجهاز العصبي", "Nervous system"),
    summary: bi(
      "نقل الإشارات وتنسيق الاستجابات.",
      "Signals and coordinated responses.",
    ),
    coverage: bi(
      "جزئي: قطع النخاع الشوكي؛ الدماغ والأعصاب الطرفية غير مشمولة.",
      "Partial: spinal cord segments; no brain or peripheral nerves.",
    ),
    models: ["spinal"],
    color: "#d3b454",
    icon: "brain",
  },
  {
    id: "cardiovascular",
    name: bi("القلب والأوعية", "Cardiovascular system"),
    summary: bi(
      "دوران الدم بين القلب والرئتين والجسم.",
      "Blood circulation through heart, lungs and body.",
    ),
    coverage: bi(
      "جزئي: حجرات القلب وصماماته؛ شبكة الأوعية غير مشمولة.",
      "Partial: heart chambers and valves; no vascular network.",
    ),
    models: ["heart"],
    color: "#d66b7d",
    icon: "heart",
  },
  {
    id: "respiratory",
    name: bi("الجهاز التنفسي", "Respiratory system"),
    summary: bi(
      "توصيل الهواء وتبادل الغازات.",
      "Air conduction and gas exchange.",
    ),
    coverage: bi(
      "جزئي: الرئتان والمجاري المركزية؛ الحويصلات المجهرية غير مشمولة.",
      "Partial: lungs and central airways; no microscopic alveoli.",
    ),
    models: ["lungs"],
    color: "#9a8cd4",
    icon: "wind",
  },
  {
    id: "digestive",
    name: bi("الجهاز الهضمي", "Digestive system"),
    summary: bi(
      "معالجة الغذاء وامتصاص المغذيات.",
      "Food processing and nutrient absorption.",
    ),
    coverage: bi(
      "جزئي: الكبد والبنكرياس والمرارة فقط؛ لا توجد قناة هضمية كاملة.",
      "Partial: liver, pancreas and gallbladder only; no complete digestive tract.",
    ),
    models: ["liver", "pancreas", "gallbladder"],
    color: "#ba8060",
    icon: "leaf",
  },
  {
    id: "urinary",
    name: bi("الجهاز البولي", "Urinary system"),
    summary: bi("تكوين البول وتخزينه.", "Urine formation and storage."),
    coverage: bi(
      "جزئي: الكُلية اليسرى والمثانة؛ دون حالبين أو إحليل.",
      "Partial: left kidney and bladder; no ureters or urethra.",
    ),
    models: ["kidney", "bladder"],
    color: "#ae759c",
    icon: "droplet",
  },
  {
    id: "reproductive",
    name: bi("الجهاز التناسلي", "Reproductive system"),
    summary: bi(
      "إنتاج الأمشاج ودعم التكاثر.",
      "Gamete production and reproduction.",
    ),
    coverage: bi(
      "جزئي: الرحم والمبيض الأيسر؛ تشريح أنثوي مرجعي دون الجهاز الذكري.",
      "Partial: uterus and left ovary; female reference anatomy only.",
    ),
    models: ["uterus", "ovary"],
    color: "#bd859f",
    icon: "sprout",
  },
];
export const modelNames: Record<string, Bilingual> = {
  heart: bi("القلب", "Heart"),
  knee: bi("الركبة اليسرى", "Left knee"),
  muscles: bi("عضلات قرب الركبة", "Muscles near knee"),
  spinal: bi("النخاع الشوكي", "Spinal cord"),
  lungs: bi("الرئتان", "Lungs"),
  liver: bi("الكبد", "Liver"),
  pancreas: bi("البنكرياس", "Pancreas"),
  gallbladder: bi("المرارة", "Gallbladder"),
  kidney: bi("الكُلية اليسرى", "Left kidney"),
  bladder: bi("المثانة", "Bladder"),
  uterus: bi("الرحم", "Uterus"),
  ovary: bi("المبيض الأيسر", "Left ovary"),
};
export interface Structure {
  id: string;
  name: Bilingual;
  system: SystemId;
  model: string;
  description: Bilingual;
  function: Bilingual;
  relatedStructures: string[];
  modelNodeIds: string[];
  source: string;
  note: Bilingual;
}
function term(
  id: string,
  ar: string,
  en: string,
  system: SystemId,
  model: string,
  nodes: string[],
  desc: Bilingual,
  func: Bilingual,
  related: string[],
): Structure {
  return {
    id,
    name: bi(ar, en),
    system,
    model,
    modelNodeIds: nodes,
    description: desc,
    function: func,
    relatedStructures: related,
    source: sources[system],
    note: bi(
      "قارن الجزء بجيرانه. قد تحتاج إلى إخفاء السطح لرؤية الأجزاء الداخلية.",
      "Compare adjacent structures. Hide outer surfaces to inspect internal parts.",
    ),
  };
}
export const structures: Structure[] = [
  term(
    "left-ventricle",
    "البطين الأيسر",
    "Left ventricle",
    "cardiovascular",
    "heart",
    ["VH_F_left_ventricle"],
    bi("حجرة قلبية ذات جدار عضلي سميك.", "A thick-walled heart chamber."),
    bi(
      "يدفع الدم إلى الدوران الجهازي.",
      "Pumps blood into systemic circulation.",
    ),
    ["left-atrium", "right-ventricle"],
  ),
  term(
    "right-ventricle",
    "البطين الأيمن",
    "Right ventricle",
    "cardiovascular",
    "heart",
    ["VH_F_right_ventricle"],
    bi(
      "الحجرة المتجهة نحو الجذع الرئوي.",
      "The chamber leading to the pulmonary trunk.",
    ),
    bi("يضخ الدم إلى الرئتين.", "Pumps blood to the lungs."),
    ["right-atrium", "left-ventricle"],
  ),
  term(
    "left-atrium",
    "الأذين الأيسر",
    "Left atrium",
    "cardiovascular",
    "heart",
    ["VH_F_left_cardiac_atrium"],
    bi(
      "حجرة تستقبل الدم من الأوردة الرئوية.",
      "A chamber receiving pulmonary venous blood.",
    ),
    bi("يمرر الدم إلى البطين الأيسر.", "Passes blood to the left ventricle."),
    ["left-ventricle", "mitral"],
  ),
  term(
    "right-atrium",
    "الأذين الأيمن",
    "Right atrium",
    "cardiovascular",
    "heart",
    ["VH_F_right_cardiac_atrium"],
    bi(
      "حجرة تستقبل الدم الوريدي الجهازي.",
      "A chamber receiving systemic venous blood.",
    ),
    bi("يمرر الدم إلى البطين الأيمن.", "Passes blood to the right ventricle."),
    ["right-ventricle"],
  ),
  term(
    "mitral",
    "الصمام التاجي",
    "Mitral valve",
    "cardiovascular",
    "heart",
    ["VH_F_mitral_valve"],
    bi(
      "صمام بين الأذين والبطين الأيسرين.",
      "A valve between the left atrium and ventricle.",
    ),
    bi("يحد من رجوع الدم إلى الأذين.", "Limits backflow into the atrium."),
    ["left-atrium", "left-ventricle"],
  ),
  term(
    "femur",
    "عظم الفخذ",
    "Femur",
    "skeletal",
    "knee",
    ["VH_F_femur_L"],
    bi("عظم الفخذ؛ يظهر جزء منه هنا.", "The thigh bone; only part is shown."),
    bi(
      "ينقل الحمل ويساهم في مفصل الركبة.",
      "Bears load and participates in the knee.",
    ),
    ["tibia", "patella"],
  ),
  term(
    "tibia",
    "الظنبوب",
    "Tibia",
    "skeletal",
    "knee",
    ["VH_F_tibia_L"],
    bi("العظم الإنسي الأكبر في الساق.", "The larger medial bone of the leg."),
    bi("يحمل معظم وزن الساق.", "Bears most of the load through the leg."),
    ["femur", "fibula"],
  ),
  term(
    "fibula",
    "الشظية",
    "Fibula",
    "skeletal",
    "knee",
    ["VH_F_fibula_L"],
    bi("العظم الرفيع الوحشي في الساق.", "The slender lateral bone of the leg."),
    bi("يوفر ارتكازات للعضلات.", "Provides muscle attachments."),
    ["tibia"],
  ),
  term(
    "patella",
    "الرضفة",
    "Patella",
    "skeletal",
    "knee",
    ["VH_F_patella_L"],
    bi("عظم سمسماني أمام الركبة.", "A sesamoid bone anterior to the knee."),
    bi("يحسن ذراع عزم العضلة الرباعية.", "Improves the quadriceps lever arm."),
    ["femur", "rectus"],
  ),
  term(
    "rectus",
    "المستقيمة الفخذية",
    "Rectus femoris",
    "muscular",
    "muscles",
    ["VH_F_rectus_femoris_L"],
    bi("إحدى عضلات الفخذ الرباعية.", "One of the quadriceps muscles."),
    bi(
      "تبسط الركبة وتساعد في ثني الورك.",
      "Extends the knee and helps flex the hip.",
    ),
    ["patella"],
  ),
  term(
    "cervical-cord",
    "القطع الرقبية للنخاع",
    "Cervical spinal cord segments",
    "nervous",
    "spinal",
    Array.from(
      { length: 8 },
      (_, i) => `VH_F_C${i + 1}_segment_of_cervical_spinal_cord`,
    ),
    bi(
      "جزء من النخاع الشوكي، وليس الفقرات.",
      "Spinal cord tissue, not vertebrae.",
    ),
    bi(
      "ينقل الإشارات ويساهم في المنعكسات.",
      "Conducts signals and contributes to reflexes.",
    ),
    ["thoracic-cord"],
  ),
  term(
    "thoracic-cord",
    "القطع الصدرية للنخاع",
    "Thoracic spinal cord segments",
    "nervous",
    "spinal",
    [
      "VH_F_first_thoracic_spinal_cord_segment",
      "VH_F_second_thoracic_spinal_cord_segment",
    ],
    bi(
      "قطعتان صدريتان ممثلتان في البطاقة.",
      "Two thoracic segments mapped to this card.",
    ),
    bi(
      "تشارك في المسارات العصبية والمنعكسات.",
      "Participate in neural pathways and reflexes.",
    ),
    ["cervical-cord"],
  ),
  term(
    "trachea",
    "الرغامى",
    "Trachea",
    "respiratory",
    "lungs",
    ["VH_F_trachea"],
    bi(
      "مجرى هوائي يتفرع إلى القصبتين الرئيسيتين.",
      "An airway dividing into the main bronchi.",
    ),
    bi("توصل الهواء نحو الرئتين.", "Conducts air toward the lungs."),
    ["bronchus"],
  ),
  term(
    "bronchus",
    "القصبة الرئيسية اليسرى",
    "Left main bronchus",
    "respiratory",
    "lungs",
    ["VH_F_lungs_left_main_bronchus"],
    bi(
      "فرع هوائي يدخل الرئة اليسرى.",
      "An airway branch entering the left lung.",
    ),
    bi("يوصل الهواء إلى الفروع الأصغر.", "Conducts air into smaller branches."),
    ["trachea"],
  ),
  term(
    "epiglottis",
    "لسان المزمار",
    "Epiglottis",
    "respiratory",
    "lungs",
    ["VH_F_epiglotic_cartilage"],
    bi(
      "غضروف مرن عند مدخل الحنجرة.",
      "Elastic cartilage at the laryngeal entrance.",
    ),
    bi(
      "يساعد في حماية المجرى الهوائي أثناء البلع.",
      "Helps protect the airway during swallowing.",
    ),
    ["trachea"],
  ),
  term(
    "liver-capsule",
    "محفظة الكبد",
    "Liver capsule",
    "digestive",
    "liver",
    ["VH_F_capsule_of_the_liver"],
    bi("غلاف ضام يحيط بالكبد.", "A connective tissue covering of the liver."),
    bi("يساهم في دعم بنية العضو.", "Helps support the organ structure."),
    ["gallbladder"],
  ),
  term(
    "pancreas-head",
    "رأس البنكرياس",
    "Head of pancreas",
    "digestive",
    "pancreas",
    ["VH_F_head_of_pancreas"],
    bi(
      "طرف البنكرياس المجاور للاثني عشر.",
      "The pancreatic end next to the duodenum.",
    ),
    bi(
      "البنكرياس يفرز إنزيمات هضمية وبيكربونات.",
      "The pancreas secretes digestive enzymes and bicarbonate.",
    ),
    ["pancreas-tail"],
  ),
  term(
    "pancreas-tail",
    "ذيل البنكرياس",
    "Tail of pancreas",
    "digestive",
    "pancreas",
    ["VH_F_tail_of_pancreas"],
    bi("الطرف المتجه نحو الطحال.", "The end extending toward the spleen."),
    bi("جزء من الغدة البنكرياسية.", "Part of the pancreatic gland."),
    ["pancreas-head"],
  ),
  term(
    "gallbladder",
    "المرارة",
    "Gallbladder",
    "digestive",
    "gallbladder",
    ["VH_F_gallbladder"],
    bi("كيس يقع أسفل الكبد.", "A sac beneath the liver."),
    bi("تخزن الصفراء وتكثفها.", "Stores and concentrates bile."),
    ["liver-capsule"],
  ),
  term(
    "renal-cortex",
    "قشرة الكُلية",
    "Renal cortex",
    "urinary",
    "kidney",
    ["VH_F_outer_cortex_of_kidney_L"],
    bi("المنطقة الخارجية للنسيج الكلوي.", "The outer region of kidney tissue."),
    bi(
      "تحتوي جسيمات كلوية تبدأ فيها عملية الترشيح.",
      "Contains renal corpuscles where filtration starts.",
    ),
    ["renal-pyramids"],
  ),
  term(
    "renal-pyramids",
    "الأهرام الكلوية",
    "Renal pyramids",
    "urinary",
    "kidney",
    Array.from("abcdefghijk", (c) => `VH_F_renal_pyramid_L_${c}`),
    bi("بنى مخروطية في لب الكُلية.", "Conical structures in the renal medulla."),
    bi(
      "تنقل القنوات الجامعة البول نحو الكؤيسات.",
      "Collecting ducts convey urine toward the calyces.",
    ),
    ["renal-cortex"],
  ),
  term(
    "bladder",
    "قبة المثانة",
    "Bladder dome",
    "urinary",
    "bladder",
    ["VH_F_fundus_of_urinary_bladder_dome"],
    bi("الجزء العلوي من المثانة.", "The upper portion of the bladder."),
    bi("تتمدد المثانة لتخزين البول.", "The bladder expands to store urine."),
    ["renal-cortex"],
  ),
  term(
    "uterus",
    "جسم الرحم",
    "Body of uterus",
    "reproductive",
    "uterus",
    ["VH_F_body_of_uterus"],
    bi(
      "الجزء الرئيسي من الرحم العضلي.",
      "The main portion of the muscular uterus.",
    ),
    bi(
      "يدعم الرحم تطور الجنين بعد الانغراس.",
      "The uterus supports development after implantation.",
    ),
    ["cervix", "ovary"],
  ),
  term(
    "cervix",
    "عنق الرحم",
    "Cervix",
    "reproductive",
    "uterus",
    ["VH_F_cervix"],
    bi(
      "الجزء السفلي الضيق من الرحم.",
      "The narrow lower portion of the uterus.",
    ),
    bi("تصل قناته جوف الرحم بالمهبل.", "Its canal connects uterus and vagina."),
    ["uterus"],
  ),
  term(
    "ovary",
    "المبيض الأيسر",
    "Left ovary",
    "reproductive",
    "ovary",
    ["VH_F_left_ovary"],
    bi("غدة تناسلية أنثوية.", "A female gonad."),
    bi(
      "ينتج البويضات والهرمونات الجنسية.",
      "Produces oocytes and sex hormones.",
    ),
    ["uterus"],
  ),
];
structures.find((s) => s.id === "bladder")!.source =
  textbook + "25-2-gross-anatomy-of-urine-transport";
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .trim()
    .toLowerCase();
}
export function searchStructures(
  query: string,
  system?: string,
  model?: string,
) {
  const q = normalizeSearch(query);
  return structures.filter(
    (s) =>
      (!system || s.system === system) &&
      (!model || s.model === model) &&
      normalizeSearch(`${s.name.ar} ${s.name.en} ${s.id}`).includes(q),
  );
}
export function structureForNode(name: string, model: string) {
  return structures.find(
    (s) => s.model === model && s.modelNodeIds.includes(name),
  );
}
export interface Question {
  id: string;
  prompt: Bilingual;
  options: Bilingual[];
  answer: number;
  explanation: Bilingual;
  source: string;
}
export const questions: Question[] = [
  {
    id: "q1",
    prompt: bi(
      "أي حجرة تضخ الدم إلى الدوران الجهازي؟",
      "Which chamber pumps blood into systemic circulation?",
    ),
    options: [
      bi("البطين الأيسر", "Left ventricle"),
      bi("البطين الأيمن", "Right ventricle"),
      bi("الأذين الأيسر", "Left atrium"),
    ],
    answer: 0,
    explanation: bi(
      "البطين الأيسر يدفع الدم إلى الأبهر.",
      "The left ventricle ejects blood into the aorta.",
    ),
    source: sources.cardiovascular,
  },
  {
    id: "q2",
    prompt: bi(
      "أي عظم يقع في الجانب الإنسي من الساق؟",
      "Which bone lies on the medial side of the leg?",
    ),
    options: [
      bi("الشظية", "Fibula"),
      bi("الظنبوب", "Tibia"),
      bi("الرضفة", "Patella"),
    ],
    answer: 1,
    explanation: bi(
      "الظنبوب إنسي وأكبر من الشظية الوحشية.",
      "The tibia is medial and larger than the lateral fibula.",
    ),
    source: sources.skeletal,
  },
  {
    id: "q3",
    prompt: bi(
      "أين تُخزن الصفراء وتُكثّف؟",
      "Where is bile stored and concentrated?",
    ),
    options: [
      bi("البنكرياس", "Pancreas"),
      bi("المثانة", "Urinary bladder"),
      bi("المرارة", "Gallbladder"),
    ],
    answer: 2,
    explanation: bi(
      "الكبد ينتج الصفراء والمرارة تخزنها.",
      "The liver produces bile; the gallbladder stores it.",
    ),
    source: sources.digestive,
  },
  {
    id: "q4",
    prompt: bi(
      "أي جزء ينتمي إلى الجهاز العصبي المركزي؟",
      "Which belongs to the central nervous system?",
    ),
    options: [
      bi("النخاع الشوكي", "Spinal cord"),
      bi("الرغامى", "Trachea"),
      bi("وتر الرباعية", "Quadriceps tendon"),
    ],
    answer: 0,
    explanation: bi(
      "يشمل الجهاز العصبي المركزي الدماغ والنخاع الشوكي.",
      "The CNS consists of brain and spinal cord.",
    ),
    source: sources.nervous,
  },
  {
    id: "q5",
    prompt: bi(
      "ما وظيفة القصبة الرئيسية؟",
      "What is the function of a main bronchus?",
    ),
    options: [
      bi("ترشيح الدم", "Blood filtration"),
      bi("توصيل الهواء", "Air conduction"),
      bi("تخزين الصفراء", "Bile storage"),
    ],
    answer: 1,
    explanation: bi(
      "القصبات توصل الهواء؛ تبادل الغازات يحدث في المنطقة التنفسية.",
      "Bronchi conduct air; gas exchange occurs in the respiratory zone.",
    ),
    source: sources.respiratory,
  },
];
export function scoreAnswers(answers: number[]) {
  return questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0,
  );
}

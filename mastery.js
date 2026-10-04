
/* =====================================================================
   v2.5 — MÜFREDAT DÜZELTMELERİ VE DÖRT SEVİYELİ KANIT MODELİ
   Seviyeler: 1 Keşif → 2 Pratik → 3 Transfer → 4 Ustalık
     Keşif    : kavram bir kaynakta doğru kullanıldı
     Pratik   : iki farklı vaka/görevde doğru kullanıldı
     Transfer : kavramın geçtiği bir vakanın transfer adımı ipucusuz, ilk denemede çözüldü
     Ustalık  : kavram sonraki bir bölümde, adı geçmeden yeniden doğru kullanıldı
   ===================================================================== */
const LEVELS = ["Henüz yok", "Keşif", "Pratik", "Transfer", "Ustalık"];

/* ---- 1) Chapter 2'den ileri deney konularını çıkar ---- */
(() => {
  const s = CASE_BY_ID.case012.steps, i = s.findIndex(x => x.transfer);
  s[i] = { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir ekip yeni butonu pazartesi gelen kullanıcılara gösterip salı gelenlerle karşılaştırmak istiyor. Sorun ne?",
    goal: "Randomizasyon mantığını başka bir deneyde uygulamak.", hints: [{ t: "Pazartesi ve salı gelen kullanıcılar başka neyle farklılaşıyor olabilir?" }],
    takeaway: "Gruplar rastgele atanmazsa, aradaki fark butondan değil gruplar arasındaki başka farklardan gelebilir.",
    options: [{ label: "Sorun yok, iki gün de aynı sayıda kullanıcı geliyor", fb: "Sayı aynı olabilir ama kullanıcılar ve gün etkisi farklı." },
      { label: "Gruplar rastgele değil: gün etkisi butonun etkisiyle karışır; kullanıcıları her gün rastgele ikiye ayırmalılar", correct: true, fb: "Aynen. Randomizasyon, iki grubun buton dışında her bakımdan benzer olmasını sağlar." }] };
  QUEST_BY_ID.sq_peeking.chapter = 3; QUEST_BY_ID.sq_peeking.after = "case019";
  const exp = NODE_BY_ID.experiment;
  const moved = exp.concepts.filter(c => ["exp.peek", "exp.srm"].includes(c.id));
  exp.concepts = exp.concepts.filter(c => !moved.includes(c));
  moved.forEach(c => { c.src = c.id === "exp.peek" ? ["sq_peeking", "case019"] : ["case019"]; });
  const pit = { id: "exppit", name: "Deney Tuzakları", ch: 3, x: 560, y: 760, area: "stats", req: ["experiment"], concepts: [
    ...moved, C("exp.multi", "Çoklu karşılaştırma", ["case019"], "Yirmi metriğe bakarsan biri şans eseri 'anlamlı' çıkar. Birincil metriği önceden seç."),
    C("exp.novelty", "Yenilik etkisi", ["case019"], "Yeni bir şey ilk günlerde merak çeker; etkiyi ancak yeterince uzun bir deney ayırır.")] };
  SKILL_TREE.push(pit); NODE_BY_ID.exppit = pit;
  const exppitNotes = { "exp.peek": "Sonuca her gün bakıp ilk 'anlamlı' anda durmak yanlış pozitifi katlar. Süreyi önceden sabitle.", "exp.srm": "Gruplara düşen kullanıcı oranı planlanandan sapıyorsa (örn. 50/50 yerine 46/54) deney kurulumu bozuktur; sonucu yorumlama." };
  pit.concepts.forEach(c => { if (exppitNotes[c.id]) c.note = exppitNotes[c.id]; CONCEPT_BY_ID[c.id] = { ...c, node: "exppit" }; });
  const causal = NODE_BY_ID.causal; causal.req = ["exppit", "analytics"]; causal.y = 900; causal.x = 820;
  NODE_BY_ID.forecasting.y = 760; NODE_BY_ID.privacy.y = 620;
  ["mlform", "featureeng", "modeling", "evaluation"].forEach(id => { NODE_BY_ID[id].y += 140; });
  ["xai", "calibration", "genai", "mlops", "monitoring", "responsible", "leadership", "governance", "strategy"].forEach(id => { NODE_BY_ID[id].y += 140; });
})();

/* ---- 2) Python Chapter 3'te sistematikleşir: yeni kavramlar ---- */
(() => {
  const py = NODE_BY_ID.python;
  const add = [C("py.groupby", "groupby ve tekil sayım", ["sq_groupby_py"], "df.groupby('adım')['user_id'].nunique(): her adımda kaç farklı kullanıcı olduğunu sayar."),
    C("py.pivot", "pivot_table ile kohort tablosu", [], "pivot_table satırlara kohortu, sütunlara geçen ayı koyar; tutundurma tablosu tek satırda çıkar."),
    C("py.datetime", "Tarihlerle çalışmak (shift, rolling)", [], "shift ile geçen dönemi, rolling ile hareketli ortalamayı hesaplarsın; zaman sırası korunmalı."),
    C("py.privacy", "Kişisel sütunları çıkarmak ve maskelemek", [], "drop ile gereksiz kişisel sütunları çıkar, gerekenleri takma ad ya da karma ile maskele.")];
  py.concepts.push(...add); add.forEach(c => { CONCEPT_BY_ID[c.id] = { ...c, node: "python" }; });
})();

/* ---- 3) Yeniden kullanım bağlantıları: aynı kavram sonraki vakalarda tekrar sınanır ---- */
const REUSE = { "eda.grain": ["case008"], "eda.segment": ["case010", "case014"], "eda.drill": ["case014"], "q.dup": ["case008"], "q.recon": ["case008"],
  "lit.change": ["case007"], "lit.units": ["case013"], "st.sampling": ["case011"], "st.dist": ["case011"], "st.corr": ["case012"], "st.confound": ["case012"],
  "bus.summary": ["case014"], "bus.define": ["case009"], "bus.denominator": ["case009"], "bus.pilot": ["case012"], "viz.choice": ["case013"], "viz.context": ["case013"],
  "com.oneliner": ["case014"], "com.exec": ["case013"], "sql.group": ["case014"], "kpi.mask": ["case014"], "sql.logic": ["case007"] };
Object.entries(REUSE).forEach(([cid, src]) => { const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === cid)); const c = n.concepts.find(c => c.id === cid); src.forEach(s => { if (!c.src.includes(s)) c.src.push(s); }); CONCEPT_BY_ID[cid] = { ...c, node: n.id }; });

/* ---- 4) Kaynakların bölümü (ustalık için) ---- */
function sourceChapter(s) {
  if (CASE_BY_ID[s]) return CASE_BY_ID[s].chapter || 1;
  if (QUEST_BY_ID[s]) { const q = QUEST_BY_ID[s]; return q.chapter || (q.after && CASE_BY_ID[q.after] ? CASE_BY_ID[q.after].chapter || 1 : 1); }
  if (EVENT_BY_ID[s]) return EVENT_BY_ID[s].days[0] >= 15 ? 3 : EVENT_BY_ID[s].days[0] >= 7 ? 2 : 1;
  return 0;
}

/* ---- 5) Terfi gereksinimleri artık seviye de içerir: "düğüm@seviye" ---- */
PROMOTIONS[1].req = { literacy: 3, eda: 3, quality: 3, stats: 4, business: 2, comm: 2 };
PROMOTIONS[2].req = { sql: 4, "sql@2": 1, kpi: 3, experiment: 3, "stats@2": 2, python: 1 };
function parseReq(k) { const [node, l] = k.split("@"); return { node, lvl: +(l || 1) }; }

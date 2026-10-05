
/* =====================================================================
   MOTOR — kayıt, ilerleme, ödüller
   ===================================================================== */
function freshToday() { return { xp: 0, skills: {}, quests: 0, events: 0, decisions: 0, firstTry: 0, caseId: null }; }
function freshPlayer() {
  return { version: 40, xp: 0, profile: { name: "", avatar: "a1", animations: true }, career: ROLES[0].title, started: false,
    screen: "welcome", param: null, skills: Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0])),
    completed: [], sideDone: [], firstTry: [], progress: {}, day: 1, dayPhase: "work", feed: [], inbox: [], promoted: false,
    lastDebrief: null, unread: 0, checkpointAt: null, stats: { hints: 0, solves: 0, independent: 0 }, promoReadyNotified: false,
    today: freshToday(), trust: { maya: 0, alex: 0, zeynep: 0, deniz: 0 }, achievements: [], eventsSeen: [], pendingEvent: null, evSlots: {},
    coffee: {}, lateNights: 0, standups: { total: 0, perfect: 0 }, evening: {}, finalePending: false, finaleDone: false, chapterDone: false,
    slackRead: 0, windowViews: 0, dayLog: [], chapter: 1, transferOK: [], flags: {}, previews: [], lastPreview: null, treeSeen: 1, casesTab: "main" };
}
function normalizePlayer(s) {
  const p = freshPlayer();
  const out = { ...p, ...s, profile: { ...p.profile, ...(s.profile || {}) }, skills: { ...p.skills, ...(s.skills || {}) },
    stats: { ...p.stats, ...(s.stats || {}) }, progress: s.progress || {}, trust: { ...p.trust, ...(s.trust || {}) },
    today: { ...freshToday(), ...(s.today || {}) }, standups: { ...p.standups, ...(s.standups || {}) } };
  ["completed", "sideDone", "firstTry", "feed", "inbox", "achievements", "eventsSeen", "dayLog", "transferOK"].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  ["evSlots", "coffee", "evening", "flags"].forEach(k => { if (!out[k] || typeof out[k] !== "object") out[k] = {}; });
  if (!Array.isArray(out.previews)) out.previews = [];
  const oldKey = "sel" + "in"; if (out.trust[oldKey] !== undefined) { out.trust.zeynep = (out.trust.zeynep || 0) + out.trust[oldKey]; delete out.trust[oldKey]; }
  out.completed = out.completed.filter(id => CASE_BY_ID[id]);
  out.sideDone = out.sideDone.filter(id => QUEST_BY_ID[id]);
  out.inbox = out.inbox.filter(m => PEOPLE[m.from]);
  if (!AVATARS.some(a => a.id === out.profile.avatar)) out.profile.avatar = "a1";
  if (!["morning", "work", "after"].includes(out.dayPhase)) out.dayPhase = "work";
  if (s.version && s.version < 21) { out.day = Math.max(1, out.completed.length + 1); out.dayPhase = "work"; }
  if (!s.version || s.version < 40) {
    // v4 changes advanced decisions to Decision → Why → Consequence.
    // Keep completed work, but restart only unfinished Ch4+ cases so old step state cannot bypass reasoning.
    Object.keys(out.progress || {}).forEach(id => { const c = CASE_BY_ID[id]; if (c && (c.chapter || 1) >= 4 && !out.completed.includes(id)) delete out.progress[id]; });
    out.version = 40;
  }
  if (out.pendingEvent && !EVENT_BY_ID[out.pendingEvent]) out.pendingEvent = null;
  out.chapter = out.chapter || 1;
  out.career = ROLES[Math.min(ROLES.length - 1, out.chapter - 1 + (out.promoted ? 1 : 0))].title;
  Object.assign(PROMOTION, PROMOTIONS[out.chapter]);
  return out;
}
function loadPlayer() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return normalizePlayer(JSON.parse(raw));
    for (const k of LEGACY_KEYS) {
      const old = localStorage.getItem(k);
      if (!old) continue;
      const o = JSON.parse(old);
      const p = normalizePlayer({ xp: o.xp || 0, skills: o.skills, completed: o.completed, sideDone: o.sideDone, firstTry: o.firstTry,
        promoted: !!o.promoted, started: !!o.started, day: o.day || 1,
        profile: { name: (o.profile && o.profile.name) || "", animations: !(o.profile && o.profile.animations === false) } });
      p.day = Math.max(p.day, p.completed.length + 1);
      p.screen = p.started ? "office" : "welcome";
      if (p.started) p.inbox.push({ from: "maya", text: "Tekrar hoş geldin! İlerlemeni yeni Türkçe ofise taşıdım.", day: p.day });
      return p;
    }
  } catch (e) { /* bozuk kayıt: temiz başla */ }
  return freshPlayer();
}
let player = loadPlayer();
let saveFlashTimer;
function save(silent) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch (e) { return; }
  if (silent) return;
  const el = document.getElementById("saveState");
  if (el && player.started) { el.classList.add("show"); clearTimeout(saveFlashTimer); saveFlashTimer = setTimeout(() => el.classList.remove("show"), 1400); }
}
function hasSave() { try { const r = localStorage.getItem(SAVE_KEY); return !!r && !!JSON.parse(r).started; } catch (e) { return false; } }
function saveCheckpoint() {
  player.checkpointAt = new Date().toISOString();
  try { localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(player)); } catch (e) { /* yok say */ }
  save();
}
function loadCheckpoint() {
  try { const r = localStorage.getItem(CHECKPOINT_KEY); if (!r) return false; player = normalizePlayer(JSON.parse(r)); player.screen = "office"; save(); return true; } catch (e) { return false; }
}
const hasCheckpoint = () => { try { return !!localStorage.getItem(CHECKPOINT_KEY); } catch (e) { return false; } };
const animOn = () => player.profile.animations !== false && !matchMedia("(prbusers-reduced-motion: reduce)").matches;

const isDone = id => player.completed.includes(id);
function caseState(c) {
  if (isDone(c.id)) return "done";
  if (c.after && !isDone(c.after)) return "locked";
  if ((c.chapter || 1) > (player.chapter || 1)) return "locked";
  if (player.dayPhase === "after" || player.dayPhase === "morning") return "tomorrow";
  if (c.requires && !(player.progress[c.id] && player.progress[c.id].step > 0) && c.requires.some(q => !player.sideDone.includes(q))) return "prep";
  if (c.promotion && !meetsReq()) return "gated";
  return "available";
}
function activeCase() { return CASES.find(c => caseState(c) === "available"); }
function questState(q) {
  if (player.sideDone.includes(q.id)) return "done";
  if (q.after && !isDone(q.after)) return "locked";
  if (q.chapter && q.chapter > (player.chapter || 1)) return "locked";
  if (q.trust && (player.trust[q.trust[0]] || 0) < q.trust[1]) return "locked";
  return "available";
}
const openQuests = () => QUESTS.filter(q => questState(q) === "available");
/* ---- kanıt: tamamlanan işlerden hesaplanır ---- */
function earnedSources() {
  const s = new Set([...player.completed, ...player.sideDone, ...player.eventsSeen, ...(player.previews || [])]);
  if (player.standups.total > 0) s.add("morning");
  return s;
}
const conceptEarned = (c, src = earnedSources()) => c.src.some(x => src.has(x));
function conceptLevel(c, src = earnedSources()) {
  const got = c.src.filter(x => src.has(x)); if (!got.length) return 0;
  const real = got.filter(x => !PREVIEW_BY_ID[x]);
  if (real.length < 2) return 1;
  const chapters = new Set(real.map(sourceChapter).filter(Boolean));
  if (chapters.size >= 2) return 4;
  if (real.some(x => (player.transferOK || []).includes(x))) return 3;
  return 2;
}
function nodeStats(n, src = earnedSources()) {
  const total = n.concepts.length, lv = n.concepts.map(c => conceptLevel(c, src)), e = lv.filter(l => l >= 1).length;
  const chOk = n.ch <= chapterNow(), reqOk = n.req.every(r => NODE_BY_ID[r].root || n.root || nodeStats(NODE_BY_ID[r], src).e > 0);
  const atLeast = k => lv.filter(l => l >= k).length;
  let status = n.root ? "mastered" : !chOk ? "locked"
    : total && atLeast(2) === total && atLeast(3) >= total / 2 ? "mastered"
    : total && atLeast(2) >= total / 2 ? "proficient"
    : e > 0 ? "developing" : reqOk ? "available" : "locked";
  const pct = total ? Math.round(lv.reduce((a, b) => a + b, 0) / (4 * total) * 100) : 100;
  const level = { mastered: "Ustalaştı", proficient: "Yetkin", developing: "Gelişiyor", available: "Henüz yok", locked: "Kilitli" }[status];
  return { e, total, pct, status, level, chOk, lv };
}
function nodePctMap() { const src = earnedSources(); return Object.fromEntries(SKILL_TREE.map(n => [n.id, nodeStats(n, src).pct])); }
function reqHave(k, src = earnedSources()) { const { node, lvl } = parseReq(k); return NODE_BY_ID[node].concepts.filter(c => conceptLevel(c, src) >= lvl).length; }
function missingReq() { const src = earnedSources(); return Object.entries(PROMOTION.req).map(([k, v]) => [k, reqHave(k, src), v]).filter(([, h, v]) => h < v); }
function evidenceFrom(id) { return Object.values(CONCEPT_BY_ID).filter(c => c.src.includes(id)); }
function nodesHelpedBy(id) { const miss = new Set(missingReq().map(([k]) => parseReq(k).node)), src = earnedSources(); return [...new Set(evidenceFrom(id).filter(c => conceptLevel(c, src) < 2 && miss.has(c.node)).map(c => c.node))]; }
const meetsReq = () => missingReq().length === 0;
const level = () => Math.floor(player.xp / XP_PER_LEVEL) + 1;

function addInbox(from, text) { player.inbox.unshift({ from, text, day: player.day }); player.inbox = player.inbox.slice(0, 12); player.unread++; }
function addFeed(text) { player.feed.unshift({ text, day: player.day }); player.feed = player.feed.slice(0, 8); }
function applyRewards(rewards, xp) {
  const lv = level(), before = { ...player.skills };
  Object.entries(rewards || {}).forEach(([k, v]) => { const was = player.skills[k] || 0; player.skills[k] = Math.min(100, was + v); player.today.skills[k] = (player.today.skills[k] || 0) + (player.skills[k] - was); });
  player.xp += xp || 0; player.today.xp += xp || 0;
  if (level() > lv) setTimeout(() => showLevelUp(level()), 900);
  return Object.fromEntries(Object.keys(rewards || {}).map(k => [k, [before[k], player.skills[k]]]));
}
function snapshot() { return { cases: CASES.filter(c => ["available", "gated", "tomorrow"].includes(caseState(c))).map(c => c.id), quests: openQuests().map(q => q.id) }; }
function diffUnlocks(snap) {
  const out = [];
  CASES.filter(c => ["available", "gated", "tomorrow"].includes(caseState(c)) && !snap.cases.includes(c.id))
    .forEach(c => out.push({ kind: "case", title: `Vaka ${c.num}: ${c.title}`, where: caseState(c) === "tomorrow" ? "Yarın sabah masanda" : c.promotion && caseState(c) === "gated" ? "Becerilerin yeterli olunca açılır" : "Masan" }));
  openQuests().filter(q => !snap.quests.includes(q.id)).forEach(q => out.push({ kind: "quest", title: q.title, where: HOTSPOTS[q.hot].label }));
  return out;
}
function checkPromotionReady() {
  if (caseState(promoCase()) === "available" && !player.promoReadyNotified) {
    player.promoReadyNotified = true;
    addInbox("maya", "Becerilerin olması gereken yerde. Terfi vakan hazır olduğunda masanda.");
    setTimeout(() => toast("Terfi vakası açıldı", "level"), 700);
  }
}

/* =====================================================================
   ADIM ÇALIŞTIRICI + REHBERLİK
   Vakalar tam ekranda, yan görevler modalda aynı motorla çalışır.
   Rehberlik katmanları: hedef → yaklaşım → ipuçları (veri vurgulu)
   → birlikte çözüm → akılda kalsın.
   ===================================================================== */
const defOf = id => CASE_BY_ID[id] || QUEST_BY_ID[id] || MORNING_DEFS[id] || EVENT_BY_ID[id] || PREVIEW_BY_ID[id] || (id === "finale" ? FINALE : null);
function prog(id) {
  return (player.progress[id] ||= { step: 0, mistakes: 0, wrong: [], solved: false, fb: null, data: {}, hint: 0, think: false, solve: false, log: [] });
}
const rootOf = def => def.modal ? $("modalCard") : $("workspace");
const FINISH_LABEL = { case: "Vakayı bitir", quest: "Yan görevi tamamla", morning: "Ofise geç", event: "Tamam", finale: "Devam", preview: "Önizlemeyi bitir" };
const policyOf = def => GUIDANCE[def.chapter || 1];
const prepCase = () => CASES.find(c => caseState(c) === "prep");
const curStep = def => def.steps[prog(def.id).step];

function stepHTML(def) {
  const pr = prog(def.id), st = curStep(def);
  if (st.type === "dialog") return dialogHTML(def, pr, st);
  return `<div class="step-grid ${stageHTML(def) ? "" : "solo"} ${st.type === "tagger" ? "tagger-grid" : ""}">
    ${stageHTML(def) ? `<div class="stage" data-stage>${stageHTML(def)}</div>` : ""}
    <div class="q-panel" data-panel>${panelHTML(def)}</div></div>`;
}
function dialogHTML(def, pr, st) {
  const last = pr.step === def.steps.length - 1, lines = typeof st.lines === "function" ? st.lines() : st.lines;
  // Human office encounters use a click-paced conversation: one line at a time.
  // No timer can hide text or block progression. Normal case briefings remain instant.
  const cinematic = isHumanSpeaker(st.who) && (def.kind === "event" || def.kind === "quest" || /^ev40_/.test(def.id));
  const hero = cinematic ? encounterSceneHTML(st.who, def, false) : "";
  const key = `dialogLine_${pr.step}`;
  const lineIndex = cinematic ? Math.min(pr.data[key] || 0, Math.max(0, lines.length - 1)) : lines.length - 1;
  const person = isHumanSpeaker(st.who) ? personOf(st.who) : null;
  const visibleLines = cinematic ? [lines[lineIndex]] : lines;
  const hasMore = cinematic && lineIndex < lines.length - 1;
  const action = hasMore ? "encounter-next-line" : "next-step";
  const label = hasMore ? "Devam" : (last ? FINISH_LABEL[def.kind] : st.cta || "Devam");
  return `<div class="dialog-step ${cinematic ? "cinematic-encounter living-encounter paced-encounter" : ""}" data-dialog data-line="${lineIndex}">
    ${hero}${cinematic ? "" : speakerLine(st.who)}
    <div class="bubbles ${cinematic && isHumanSpeaker(st.who)?"conversation-bubbles":""}">
      ${cinematic && person ? `<div class="conversation-speaker"><span>${person.name}</span><small>${person.role||"Nexora Analytics"}</small></div>` : ""}
      ${visibleLines.map(l => `<div class="conversation-line ready"><p class="bubble shown">${l}</p></div>`).join("")}
      ${cinematic ? `<div class="conversation-progress" aria-label="Konuşma ilerlemesi">${lines.map((_,i)=>`<i class="${i<=lineIndex?'on':''}"></i>`).join('')}</div>` : ""}
    </div>
    <div class="step-actions"><button class="primary-button encounter-cta" data-action="${action}" data-def="${def.id}">${label}${hasMore?' <span aria-hidden="true">→</span>':''}</button></div></div>`;
}
function encounterNextLine(def) {
  const pr = prog(def.id), st = curStep(def);
  if (!st || st.type !== "dialog") return;
  const lines = typeof st.lines === "function" ? st.lines() : st.lines;
  const key = `dialogLine_${pr.step}`;
  const cur = pr.data[key] || 0;
  if (cur < lines.length - 1) {
    pr.data[key] = cur + 1;
    save(true);
    // Dialogue steps do not contain data-panel/data-stage. Re-render the
    // complete step so a single click immediately paints the next line.
    rerender(def, "all");
  } else nextStep(def);
}

function stageHTML(def) {
  const pr = prog(def.id), st = curStep(def);
  const encounterWho = st.who || def.who;
  const encounterDef = (def.kind === "event" || def.kind === "quest" || /^ev40_/.test(def.id));
  // v6.7: insan encounter'larında diyalogdan karar/reply adımına geçince sahne
  // kaybolmaz; konuşan iki kişinin sinematik görseli bütün encounter boyunca kalır.
  if (st.type === "choice") return st.visual ? st.visual(pr.data, def.id) : (encounterDef && isHumanSpeaker(encounterWho) ? encounterSceneHTML(encounterWho, def, false) : "");
  if (st.type === "pick" || st.type === "builder") return st.visual(pr.data, def.id);
  if (st.type === "reply") return encounterDef && isHumanSpeaker(encounterWho) ? encounterSceneHTML(encounterWho, def, false) : "";
  if (st.type === "toggles") return st.visual(pr.data);
  if (st.type === "tagger") {
    const d = pr.data, tags = d.tags || {}, active = d.active || st.tags[1][0];
    return `<div class="tag-palette" role="group" aria-label="Etiket seç">${st.tags.map(([k, l]) => `<button class="tag-pick t-${k} ${active === k ? "active" : ""}" data-action="pick-tag" data-def="${def.id}" data-tag="${k}" aria-pressed="${active === k}"><i></i>${l}</button>`).join("")}</div>
      <div class="table-wrap"><table class="data-table mono tagger"><thead><tr><th>#</th><th>Etiket</th>${st.cols.map(c => `<th data-hlc="${slug(c)}">${c}</th>`).join("")}</tr></thead><tbody>
      ${st.rows.map(([cells, want], i) => {
        const t = tags[i], bad = (d.wrongRows || []).includes(i), ok = pr.solved;
        const sugg = pr.solve && t !== want ? `<span class="tag-sugg t-${want}">öneri: ${st.tags.find(x => x[0] === want)[1]}</span>` : "";
        return `<tr class="${bad ? "row-bad" : ""} ${ok ? "row-ok" : ""}" data-action="tag-row" data-def="${def.id}" data-row="${i}" tabindex="0" role="button" aria-label="Satır ${i + 1}">
          <td class="rownum">${i + 1}</td>
          <td>${t ? `<span class="tag-chip t-${t}">${st.tags.find(x => x[0] === t)[1]}</span>` : '<span class="tag-chip empty">etiketsiz</span>'}${sugg}</td>
          ${cells.map((c, ci) => `<td data-hlc="${slug(st.cols[ci])}">${c === "" ? '<em class="null">null</em>' : c}</td>`).join("")}</tr>`;
      }).join("")}</tbody></table></div>`;
  }
  return "";
}
function guideHTML(def, pr, st) {
  const pol = policyOf(def), hints = pol.hints ? (st.hints || []) : [];
  const canSolve = pol.solve && !pr.solved && (pr.wrong.length >= 2 || pr.hint >= hints.length || (st.type !== "choice" && pr.mistakes >= 1));
  const promoHint = CASE_BY_ID[def.id] && CASE_BY_ID[def.id].promotion;
  const think = pol.think && st.think;
  return `<div class="guide">
    ${st.goal && pol.goal !== false ? `<div class="goal">${icon("target")}<div><span>${st.transfer ? "Yeni durum: kavramı transfer et" : "Öğrenme hedefi"}</span><p>${st.goal}</p></div></div>` : ""}
    ${pr.solved || !(think || hints.length || canSolve) ? "" : `<div class="guide-actions">
      ${think ? `<button class="guide-btn ${pr.think ? "on" : ""}" data-action="think" data-def="${def.id}" aria-expanded="${pr.think}">${icon("compass")}${pr.think ? "Yaklaşımı gizle" : "Nasıl düşünmeliyim?"}</button>` : ""}
      ${hints.length ? `<button class="guide-btn hint" data-action="hint" data-def="${def.id}" ${pr.hint >= hints.length ? "disabled" : ""}>${icon("bulb")}${promoHint ? "Hatırlatma" : "İpucu"} <b>${pr.hint}/${hints.length}${pol.cost ? `, −${pol.cost} XP` : ""}</b></button>` : ""}
      ${st.solve && canSolve && !pr.solve ? `<button class="guide-btn solve" data-action="solve" data-def="${def.id}">${icon("route")}Maya ile birlikte çöz</button>` : ""}
    </div>`}
    ${!hints.length && !think && !pr.solved && def.kind === "preview" ? `<p class="policy-note">${icon("compass")}Bu bölümde vaka sırasında yönlendirme yok. Değerlendirme vaka sonunda.</p>` : ""}
    ${pr.think && think && !pr.solved ? `<div class="guide-card think"><span>${icon("compass")}Yaklaşım</span><ul>${st.think.map(t => `<li>${t}</li>`).join("")}</ul></div>` : ""}
    ${hints.slice(0, pr.hint).map((h, i) => `<div class="guide-card hint-card ${i === pr.hint - 1 && !pr.solved ? "fresh" : ""}"><span>${icon("bulb")}${promoHint ? "Hatırlatma" : "İpucu"} ${i + 1}${h.hl ? '<em>verideki ilgili yer vurgulandı</em>' : ""}</span><p>${h.t}</p></div>`).join("")}
    ${pr.solve ? `<div class="guide-card solve-card"><span>${avatar("maya", 24)}Birlikte çözelim</span><ol>${st.solve.map((t, i) => `<li style="--i:${i}">${t}</li>`).join("")}</ol>
      ${pr.solved ? "" : `<p class="solve-cta">${st.type === "choice" ? "Şimdi doğru seçeneği kendin seç." : st.type === "tagger" ? "Önerilen etiketleri uygula ve tekrar kontrol et." : "Önerilen düzeltmeleri uygula."}</p>`}</div>` : ""}
  </div>`;
}
function exploreDone(st, d) { return (st.explore || []).every(e => typeof e === "string" ? d[e] : (d[e.key] || 0) >= e.min); }
function panelHTML(def) {
  const pr = prog(def.id), st = curStep(def);
  const head = `${st.who ? speakerLine(st.who) : ""}<h3 tabindex="-1">${st.prompt}</h3>${st.sub ? `<p class="sub">${st.sub}</p>` : ""}`;
  const done = pr.solved ? `${st.learningLens && (def.chapter || 1) >= 3 ? `<div class="takeaway learning-lens">${icon("bulb")}<div><span>Neden bu karar?</span><p>${st.learningLens}</p></div></div>` : ""}${st.takeaway ? `<div class="takeaway">${icon("check")}<div><span>Akılda kalsın</span><p>${st.takeaway}</p></div></div>` : ""}${nextButton(def, pr)}` : "";
  if (st.type === "choice") {
    const ci = st.options.findIndex(o => o.correct);
    if (pr.data.reasonPending && Array.isArray(st.reasonOptions)) {
      return `${head}<div class="reason-gate"><span class="eyebrow">Kararını savun</span><p>Kararın doğru yönde. Peki <b>neden</b>?</p>
        <div class="options reason-options">${st.reasonOptions.map((o,i)=>`<button class="option ${pr.data.reasonWrong?.includes(i)?"wrong":""}" data-action="reason-answer" data-def="${def.id}" data-opt="${i}" ${pr.data.reasonWrong?.includes(i)?"disabled":""}><span class="opt-key">${"ABC"[i]}</span><span class="opt-text">${o.label}</span></button>`).join("")}</div>
        ${feedbackHTML(pr)}</div>`;
    }
    if (st.explore && !exploreDone(st, pr.data)) return `${head}${guideHTML(def, pr, st)}
      <div class="explore-list"><span>${icon("compass")}Karar vermeden önce keşfet</span>${st.explore.map(e => { const k = typeof e === "string" ? e : e.key, ok = typeof e === "string" ? pr.data[k] : (pr.data[k] || 0) >= e.min;
        const lbl = { mean: "Ortalamayı hesapla", median: "Medyanı hesapla", byDevice: "Veriyi cihaza göre kır", n: `En az ${e.min} kez yeniden örnekle (${pr.data.n || 0}/${e.min})` }[k] || k;
        return `<p class="${ok ? "ok" : ""}">${ok ? icon("check") : "○"} ${lbl}</p>`; }).join("")}</div>`;
    return `${head}${guideHTML(def, pr, st)}
      <div class="options">${st.options.map((o, i) => {
        const cls = pr.wrong.includes(i) ? "wrong" : pr.solved && o.correct ? "correct" : pr.solve && i === ci ? "suggested" : "";
        return `<button class="option ${cls}" data-action="answer" data-def="${def.id}" data-opt="${i}" ${pr.solved || pr.wrong.includes(i) ? "disabled" : ""}><span class="opt-key">${"ABCD"[i]}</span><span class="opt-text">${o.label}</span>${cls === "suggested" ? '<em class="sugg-tag">Maya\'nın önerisi</em>' : ""}</button>`;
      }).join("")}</div>${feedbackHTML(pr)}${done}`;
  }
  if (st.type === "pick") {
    return `${head}${guideHTML(def, pr, st)}<p class="pick-help">${icon("target")}${pr.solved ? "Doğru noktayı buldun." : "Cevabını vermek için soldaki görselde ilgili yere tıkla."}</p>${feedbackHTML(pr)}${done}`;
  }
  if (st.type === "builder") {
    const d = pr.data;
    return `${head}${guideHTML(def, pr, st)}
      <div class="builder">${st.fields.map(f => {
        if (f.type === "range") { const v = d[f.key] ?? f.def; return `<label class="b-field"><span>${f.label}: <b>${String((+v).toFixed(1)).replace(".", ",")}</b></span><input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${v}" data-action="field" data-def="${def.id}" data-key="${f.key}" ${pr.solved ? "disabled" : ""}></label>`; }
        if (f.type === "check") { const v = d[f.key] || []; return `<div class="b-field"><span>${f.label}</span>${f.options.map(([k, l]) => `<label class="b-check"><input type="checkbox" data-action="field" data-def="${def.id}" data-key="${f.key}" value="${k}" ${v.includes(k) ? "checked" : ""} ${pr.solved ? "disabled" : ""}>${l}</label>`).join("")}</div>`; }
        return `<label class="b-field"><span>${f.label}</span><select data-action="field" data-def="${def.id}" data-key="${f.key}" ${pr.solved ? "disabled" : ""}><option value="">Seç…</option>${f.options.map(([k, l]) => `<option value="${k}" ${d[f.key] === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
      }).join("")}</div>
      ${feedbackHTML(pr)}${pr.solved ? done : `<button class="primary-button wide" data-action="builder-run" data-def="${def.id}" ${st.fields.some(f => f.type !== "range" && f.type !== "check" && !d[f.key]) ? "disabled" : ""}>${icon("route")}${st.run || "Çalıştır"}</button>`}`;
  }
  if (st.type === "reply") {
    return `${head}<div class="options">${st.options.map((o, i) => `<button class="option ${pr.picked === i ? "correct" : ""}" data-action="reply" data-def="${def.id}" data-opt="${i}" ${pr.solved ? "disabled" : ""}><span class="opt-key">${"ABC"[i]}</span><span class="opt-text">${o.label}</span></button>`).join("")}</div>
      ${pr.solved ? `<div class="reply-bubble">${avatar(st.who, 32)}<p>${st.options[pr.picked].reply}</p></div>${nextButton(def, pr)}` : `<p class="muted small">Burada doğru ya da yanlış cevap yok; nasıl bir iş arkadaşı olduğunu seçiyorsun.</p>`}`;
  }
  if (st.type === "tagger") {
    const tags = pr.data.tags || {}, n = Object.keys(tags).length;
    return `${head}${guideHTML(def, pr, st)}
      <div class="tag-progress"><div class="mini-bar"><i style="width:${n / st.rows.length * 100}%"></i></div><span>${n} / ${st.rows.length} satır etiketlendi</span></div>
      <div class="tag-counts">${st.tags.map(([k, l]) => `<span class="t-${k}"><i></i>${l}<b>${Object.values(tags).filter(v => v === k).length}</b></span>`).join("")}</div>
      ${feedbackHTML(pr)}${pr.solved ? done : `<button class="primary-button wide" data-action="tag-check" data-def="${def.id}" ${n < st.rows.length ? "disabled" : ""}>Etiketlerimi kontrol et</button>`}`;
  }
  if (st.type === "toggles") {
    const d = pr.data;
    return `${head}${guideHTML(def, pr, st)}
      <div class="toggles">${st.toggles.map(t => `<button class="toggle ${d[t.key] ? "on" : ""} ${pr.solve && t.good && !d[t.key] ? "suggested" : ""}" data-action="toggle" data-def="${def.id}" data-key="${t.key}" role="switch" aria-checked="${!!d[t.key]}">
        <span class="switch"><i></i></span><span><strong>${t.label}</strong>${d[t.key] ? `<small class="${t.good ? "good" : "bad"}">${t.note}</small>` : ""}</span></button>`).join("")}</div>
      ${feedbackHTML(pr)}${done}`;
  }
  return "";
}
function feedbackHTML(pr) {
  if (!pr.fb) return "";
  return `<div class="feedback ${pr.fb.ok ? "ok" : "bad"}" role="status" tabindex="-1"><strong>${pr.fb.ok ? pr.fb.title || "Doğru içgörü" : "Tam değil"}</strong><p>${pr.fb.text}</p>${pr.fb.extra ? `<p class="fb-extra">${icon("bulb")}${pr.fb.extra}</p>` : ""}</div>`;
}
function nextButton(def, pr) {
  const last = pr.step === def.steps.length - 1;
  return `<button class="primary-button wide next-button" data-action="next-step" data-def="${def.id}">${last ? FINISH_LABEL[def.kind] : "Devam et"}</button>`;
}

/* ---- yeniden çizim: mümkünse sadece paneli güncelle, animasyonlar tekrar oynamasın ---- */
function rerender(def, part = "all") {
  const root = rootOf(def);
  if (!root) return;
  if (def.modal && part === "all") { renderModalDef(def.id); return; }
  if (part === "all") {
    const body = root.querySelector("[data-step-body]"); if (body) body.innerHTML = stepHTML(def);
    if (def.kind === "case") renderCaseStepper(def);
    afterStepRender(def, true);
    return;
  }
  if (part === "panel" || part === "both") { const p = root.querySelector("[data-panel]"); if (p) p.innerHTML = panelHTML(def); }
  if (part === "stage" || part === "both") { const s = root.querySelector("[data-stage]"); if (s) { s.innerHTML = stageHTML(def); s.classList.add("no-intro"); } }
  applyHighlights(def);
}
function afterStepRender(def, fresh) {
  applyHighlights(def);
  const root = rootOf(def);
  if (fresh && root.querySelector("[data-dialog]")) playDialog(root.querySelector("[data-dialog]"));
}
function applyHighlights(def) {
  const root = rootOf(def), stage = root && root.querySelector("[data-stage]");
  if (!stage) return;
  const pr = prog(def.id), st = curStep(def);
  const keys = pr.solved ? [] : (st.hints || []).slice(0, pr.hint).flatMap(h => (h.hl || []).map(slug));
  const match = k => keys.some(key => k === key || k.startsWith(key + "-"));
  stage.classList.toggle("has-hl", keys.length > 0);
  stage.querySelectorAll("[data-pick]").forEach(el => {
    const k = el.dataset.pick;
    el.classList.toggle("pick-wrong", pr.wrong.includes(k));
    el.classList.toggle("pick-right", pr.solved && k === st.correct);
    el.classList.toggle("pick-sugg", !pr.solved && pr.solve && k === st.correct);
  });
  stage.querySelectorAll("[data-hl],[data-hlc]").forEach(el => {
    el.classList.toggle("hl", match(el.dataset.hl || "") || match(el.dataset.hlc || ""));
  });
}

/* ---- diyalog: yazıyor... busektiyle sırayla göster ---- */
let dialogToken = 0;
function playDialog(el) {
  // v6.4 stability: dialogue content is never hidden behind timers.
  // Motion is decorative only; readability and controls are immediate.
  dialogToken++;
  el.querySelectorAll(".bubble").forEach(b => b.classList.add("shown"));
  el.querySelectorAll(".conversation-line").forEach(line => line.classList.add("ready"));
  el.querySelector(".typing")?.remove();
  el.querySelector(".step-actions")?.classList.remove("waiting");
  if (el.classList.contains("cinematic-encounter") && animOn()) {
    el.querySelector("[data-living-scene]")?.classList.add("scene-entered");
  }
}
function skipDialog(el) {
  dialogToken++;
  el.querySelectorAll(".bubble").forEach(b => b.classList.add("shown"));
  el.querySelector(".typing")?.remove();
  el.querySelector(".step-actions")?.classList.remove("waiting");
}

/* ---- eylemler ---- */
function toggleThink(def) { const pr = prog(def.id); pr.think = !pr.think; save(true); rerender(def, "panel"); }
function revealHint(def) {
  const pr = prog(def.id), st = curStep(def);
  if (pr.hint >= (st.hints || []).length) return;
  pr.hint++; player.stats.hints++; const cost = policyOf(def).cost; if (cost && def.kind !== "preview") { player.xp = Math.max(0, player.xp - cost); renderTop(); } save(true); rerender(def, "panel");
  focusIn("[data-panel] .hint-card.fresh");
}
function revealSolve(def) { const pr = prog(def.id); pr.solve = true; player.stats.solves++; save(true); rerender(def, curStep(def).type === "choice" ? "panel" : "both"); focusIn("[data-panel] .solve-card"); }
function answer(def, i, btn) {
  const pr = prog(def.id), st = curStep(def), o = st.options[i];
  if (pr.solved || pr.wrong.includes(i)) return;
  if (o.correct) {
    if (Array.isArray(st.reasonOptions) && !pr.data.reasonDone) {
      pr.data.reasonPending = true; pr.data.reasonWrong = pr.data.reasonWrong || [];
      pr.fb = { ok: true, title: "Karar doğru", text: "Şimdi bu kararı hangi gerekçeyle savunduğunu göster." };
      if (btn) burst(btn, "Karar doğru!");
    } else {
      pr.solved = true; pr.fb = { ok: true, text: o.fb }; markSolved(def, pr);
      if (btn) burst(btn, pr.wrong.length || pr.hint || pr.solve ? "Doğru!" : "Kusursuz!");
    }
  } else {
    pr.wrong.push(i); pr.mistakes++;
    let extra = "";
    if (policyOf(def).hints && pr.hint < (st.hints || []).length) { pr.hint++; extra = "Seni yönlendirmek için yeni bir ipucu açıldı."; }
    else if (st.solve && !pr.solve && pr.wrong.length >= 2) extra = "İstersen Maya ile adım adım birlikte çözebilirsin.";
    pr.fb = { ok: false, text: o.fb + (o.consequence ? ` <strong>Sonuç:</strong> ${o.consequence}` : ""), extra };
    if (btn) { btn.classList.add("shake"); }
    if (st.egg && pr.wrong.length === st.egg.after) setTimeout(() => toast(st.egg.text, "egg"), 900);
  }
  save(true);
  setTimeout(() => { rerender(def, "panel"); focusIn("[data-panel] .feedback"); }, btn && !o.correct && animOn() ? 320 : 0);
}
function reasonAnswer(def, i, btn) {
  const pr=prog(def.id), st=curStep(def), o=st.reasonOptions && st.reasonOptions[i];
  if(!o || !pr.data.reasonPending) return;
  pr.data.reasonWrong = pr.data.reasonWrong || [];
  if(o.correct){
    pr.data.reasonPending=false; pr.data.reasonDone=true; pr.solved=true;
    pr.fb={ok:true,title:"Karar + gerekçe",text:st.learningLens || "Doğru kararı doğru gerekçeyle savundun."};
    markSolved(def,pr); if(btn) burst(btn, pr.data.reasonWrong.length ? "Gerekçe tamam!" : "Güçlü muhakeme!");
  } else {
    if(!pr.data.reasonWrong.includes(i)) pr.data.reasonWrong.push(i);
    pr.mistakes++; pr.fb={ok:false,text:"Bu gerekçe ilk bakışta makul; ancak kararın temel varsayımını veya iş etkisini açıklamıyor."};
    if(btn) btn.classList.add("shake");
  }
  save(true); setTimeout(()=>{rerender(def,"panel");focusIn("[data-panel] .feedback")}, o.correct?0:260);
}

function nextStep(def) {
  const pr = prog(def.id), st = curStep(def);
  if (st.type !== "dialog" && !pr.solved) return;
  if (st.type !== "dialog") {
    const indep = !pr.wrong.length && !pr.hint && !pr.solve && pr.mistakes === (pr._mStart || 0);
    pr.log.push({ indep, hints: pr.hint, wrong: pr.mistakes - (pr._mStart || 0), solve: pr.solve, transfer: !!st.transfer });
    if (indep) player.stats.independent++;
  }
  pr.step++; pr.solved = false; pr.wrong = []; pr.fb = null; pr.data = {}; pr.hint = 0; pr.think = false; pr.solve = false; pr._mStart = pr.mistakes;
  if (pr.step >= def.steps.length) { COMPLETE[def.kind](def); return; }
  save(true); rerender(def, "all");
  if (!def.modal) document.querySelector("[data-step-body]")?.scrollIntoView({ behavior: smooth(), block: "start" });
  else $("modalCard").scrollTop = 0;
  focusIn("[data-panel] h3, [data-dialog] .primary-button");
}
function tagRow(def, row) {
  const pr = prog(def.id); if (pr.solved) return;
  const d = pr.data; d.tags ||= {}; const active = d.active || curStep(def).tags[1][0];
  if (d.tags[row] === active) delete d.tags[row]; else d.tags[row] = active;
  d.wrongRows = (d.wrongRows || []).filter(r => r !== row);
  save(true); rerender(def, "both");
  rootOf(def).querySelector(`[data-row="${row}"]`)?.focus({ preventScroll: true });
}
function tagCheck(def) {
  const pr = prog(def.id), st = curStep(def), d = pr.data;
  const wrong = st.rows.map((r, i) => d.tags[i] === r[1] ? -1 : i).filter(i => i >= 0);
  d.checked = true; d.wrongRows = wrong;
  if (!wrong.length) {
    pr.solved = true; markSolved(def, pr);
    pr.fb = { ok: true, title: st.okTitle || "Örnek temizlendi", text: st.okText || "12 satırın hepsi doğru: 3 mükerrer, 2 eksik ID ve 2 test hesabı. 12 satırdan yalnızca 5'i temizdi. Şimdi bunun tüm tablo için ne anlama geldiğine bakalım." };
  } else {
    pr.mistakes++;
    const hints = [...new Set(wrong.map(i => st.rows[i][1]))].map(k => st.rowHints[k]);
    let extra = "";
    if (pr.hint < st.hints.length) { pr.hint++; extra = "Yeni bir ipucu açıldı; ilgili sütun tabloda vurgulandı."; }
    pr.fb = { ok: false, text: `${wrong.length} satıra tekrar bakmalısın (kırmızıyla işaretli). ${hints.join(" ")}`, extra };
  }
  save(true); rerender(def, "both"); focusIn("[data-panel] .feedback");
}
function toggleSwitch(def, key) {
  const pr = prog(def.id), st = curStep(def), d = pr.data;
  d[key] = !d[key];
  const t = st.toggles.find(x => x.key === key);
  if (!t.good && d[key]) { pr.mistakes++; if (pr.hint < st.hints.length) pr.hint++; }
  const goodOn = st.toggles.filter(x => x.good && d[x.key]).length, goodAll = st.toggles.filter(x => x.good).length;
  const badOn = st.toggles.some(x => !x.good && d[x.key]);
  const wasSolved = pr.solved; pr.solved = goodOn === goodAll && !badOn; if (pr.solved && !wasSolved) markSolved(def, pr);
  pr.fb = pr.solved ? { ok: true, title: "Grafik düzeldi", text: "Sıfır tabanlı eksen ve 12 haftalık bağlamla 'çöküş' küçük bir mevsimsel düşüşe dönüştü. Aynı veri, bambaşka bir hikâye." }
    : badOn ? { ok: false, text: "Alarm renkleri insanlara, rakamları okumadan önce nasıl hissedeceklerini söyler. Önce veri konuşsun.", extra: "Kırmızıyı kapat; renk bir yorum yükler." }
    : goodOn ? { ok: true, title: `${goodOn} / ${goodAll} düzeltme uygulandı`, text: "Devam et. Yoğun bir CEO'nun bu grafiği doğru okuması için başka ne yardımcı olur?" } : null;
  save(true); rerender(def, "both");
  rootOf(def).querySelector(`[data-key="${key}"]`)?.focus({ preventScroll: true });
}
function visToggle(def, key) { const pr = prog(def.id); pr.data[key] = !pr.data[key]; save(true); rerender(def, "stage"); }

function completeCase(def) {
  const snap = snapshot(), pr = prog(def.id), treeBefore = nodePctMap(), evBefore = earnedSources();
  const steps = pr.log.length, indep = pr.log.filter(l => l.indep).length;
  const perfect = steps > 0 && indep === steps, bonus = perfect ? Math.round(def.xp * 0.2) : 0;
  player.completed.push(def.id); if (perfect) { player.firstTry.push(def.id); unlockAch("independent"); }
  if (pr.log.some(l => l.transfer && l.indep)) player.transferOK.push(def.id);
  const gains = applyRewards(def.rewards, def.xp + bonus);
  player.dayPhase = "after"; player.today.caseId = def.id;
  if (def.promotion) { player.finalePending = true; }
  player.lastDebrief = { id: def.id, xp: def.xp, bonus, gains, unlocks: diffUnlocks(snap),
    steps, indep, hints: pr.log.reduce((a, l) => a + l.hints, 0), wrong: pr.log.reduce((a, l) => a + l.wrong, 0), solves: pr.log.filter(l => l.solve).length,
    treeBefore, newEvidence: evidenceFrom(def.id).filter(c => !conceptEarned(c, evBefore)).map(c => c.id) };
  delete player.progress[def.id];
  addInbox("maya", def.promotion ? "Toplantı odasına gelir misin? Seninle konuşmak istediğim bir şey var." : AFTER_CASE[def.id]);
  addFeed(`Vaka ${def.num} çözüldü: ${def.title}.`);
  checkPromotionReady();
  go("debrief");
}
function completeQuest(def) {
  const evBefore = earnedSources();
  if (prog(def.id).log.some(l => l.transfer && l.indep)) player.transferOK.push(def.id);
  player.sideDone.push(def.id);
  const gains = applyRewards(def.rewards, def.xp);
  const newEv = evidenceFrom(def.id).filter(c => !conceptEarned(c, evBefore));
  player.today.quests++; if (TRUST_PEOPLE.includes(def.who)) addTrust({ [def.who]: 1 });
  if (player.sideDone.length >= 5) unlockAch("helper"); if (player.sideDone.length === QUESTS.length) unlockAch("completionist");
  const pr = prog(def.id), indep = pr.log.every(l => l.indep);
  delete player.progress[def.id];
  addFeed(`Yan görev tamamlandı: ${def.title}.`);
  checkPromotionReady();
  save(); render();
  $("modalCard").innerHTML = `<button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button>
    <div class="quest-done">
      <div class="stamp">Yan görev tamamlandı</div>
      <h3>${def.title}</h3>
      ${indep ? `<p class="first-try">${icon("quest")}Kendi başına çözdün</p>` : ""}
      <div class="lesson"><span>${icon("bulb")}Öğrendiğin</span><p>${def.lesson}</p></div>
      ${newEv.length ? `<div class="ev-new"><span>Yetenek ağacına yeni kanıt</span>${newEv.map(c => `<button class="ev-chip" data-action="tree-goto" data-id="${c.node}">${icon("check")}${c.name} <i>${NODE_BY_ID[c.node].name}</i></button>`).join("")}</div>` : ""}
      <div class="gain-list">${gainRows(gains)}<div class="gain-xp">+<b data-count="${def.xp}">0</b> XP</div></div>
      <button class="primary-button" data-action="close-modal">Ofise dön</button>
    </div>`;
  countUp($("modalCard"));
  focusIn(".quest-done .primary-button");
}
function gainRows(gains) {
  return Object.entries(gains).map(([k, [a, b]], i) => `<div class="gain-row" style="--i:${i}"><span>${SKILLS[k].name}</span>
    <div class="gain-bar"><i class="before" style="width:${a}%;background:${SKILLS[k].color}"></i><i class="after" style="--from:${a}%;--to:${b}%;background:${SKILLS[k].color}"></i></div><b>+${b - a}</b></div>`).join("");
}

/* =====================================================================
   YENİ ADIM TÜRLERİ, GÜN SİSTEMİ, İLİŞKİLER
   ===================================================================== */
function markSolved(def, pr) {
  player.today.decisions++;
  if (!pr.wrong.length && !pr.hint && !pr.solve && pr.mistakes === (pr._mStart || 0)) player.today.firstTry++;
}
function pickAnswer(def, key, el) {
  const pr = prog(def.id), st = curStep(def);
  if (pr.solved || pr.wrong.includes(key)) return;
  if (key === st.correct) { pr.solved = true; pr.fb = { ok: true, text: st.picks[key] }; markSolved(def, pr); if (el) burst(el, pr.wrong.length || pr.hint ? "Buldun!" : "Kusursuz!"); }
  else {
    pr.wrong.push(key); pr.mistakes++;
    let extra = "";
    if (policyOf(def).hints && pr.hint < (st.hints || []).length) { pr.hint++; extra = "Yeni bir ipucu açıldı."; }
    else if (st.solve && !pr.solve && pr.wrong.length >= 2) extra = "İstersen Maya ile birlikte çözebilirsin.";
    pr.fb = { ok: false, text: st.picks[key] || st.picks.other, extra };
  }
  save(true); rerender(def, "panel"); applyHighlights(def); focusIn("[data-panel] .feedback");
}
function replyAnswer(def, i) {
  const pr = prog(def.id), st = curStep(def), o = st.options[i];
  if (pr.solved) return;
  pr.solved = true; pr.picked = i; addTrust(o.trust || {}); if (o.flag) Object.assign(player.flags, o.flag);
  save(true); rerender(def, "panel");
}
function addTrust(map) {
  Object.entries(map).forEach(([k, v]) => {
    const before = trustLevel(k); player.trust[k] = (player.trust[k] || 0) + v;
    if (trustLevel(k) > before) setTimeout(() => toast(`${PEOPLE[k].name.split(" ")[0]}: ${TRUST_LEVELS[k][trustLevel(k)]}`, "trust"), 500);
  });
  if (TRUST_PEOPLE.every(k => trustLevel(k) >= 1)) unlockAch("team_player");
}
function unlockAch(id) {
  if (player.achievements.includes(id)) return;
  player.achievements.push(id);
  setTimeout(() => toast(`Başarım açıldı: ${ACHIEVEMENTS[id].t}`, "ach"), 1200);
}
function completeMorning(def) {
  const pr = prog(def.id), log = pr.log.filter(Boolean);
  const perfect = log.length > 0 && log.every(l => l.indep);
  player.standups.total++; if (perfect) { player.standups.perfect++; addTrust({ maya: 1 }); }
  if (player.standups.total === 5 && player.standups.perfect === 5) unlockAch("communicator");
  applyRewards({ businessThinking: 2 }, 15);
  delete player.progress[def.id];
  player.dayPhase = "work";
  addFeed(`${weekday(player.day)} sabahı: ${def.title}.`);
  go("office");
}
function completeEvent(def) {
  const pr = prog(def.id), indep = pr.log.every(l => l.indep);
  player.eventsSeen.push(def.id); player.pendingEvent = null; player.today.events++;
  const gains = def.xp ? applyRewards(def.rewards, def.xp) : {};
  if (def.xp && TRUST_PEOPLE.includes(def.who)) addTrust({ [def.who]: indep ? 2 : 1 });
  delete player.progress[def.id];
  addFeed(`${def.title}: ${PEOPLE[def.who].name.split(" ")[0]} ile konuştun.`);
  save(); render();
  $("modalCard").innerHTML = `<button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button>
    <div class="quest-done">${avatar(def.who, 56)}<h3>${def.title}</h3>
    <p class="muted">${TRUST_PEOPLE.includes(def.who) ? `${PEOPLE[def.who].name.split(" ")[0]} ile ilişkin: <b>${TRUST_LEVELS[def.who][trustLevel(def.who)]}</b>` : "Ofiste küçük bir an daha."}</p>
    ${def.xp ? `<div class="gain-list">${gainRows(gains)}<div class="gain-xp">+<b data-count="${def.xp}">0</b> XP</div></div>` : `<p class="small muted">Her konuşma XP getirmez. Ama insanlar hatırlar.</p>`}
    <button class="primary-button" data-action="close-modal">Ofise dön</button></div>`;
  countUp($("modalCard"));
}
function completeFinale() {
  delete player.progress.finale;
  player.finaleDone = true; player.finalePending = false; player.promoted = true; player.career = PROMOTION.title;
  unlockAch({ 1: "promoted", 2: "promoted2", 3: "promoted3" }[player.chapter] || "promoted"); go("promotion");
}
const COMPLETE = { case: completeCase, quest: completeQuest, morning: completeMorning, event: completeEvent, finale: completeFinale };

/* ---- ofis olayı planlama: güne bağlı havuz, tohumlu rastgelelik ---- */
function seeded(n) { let h = 2166136261; const t = `${playerName()}|${n}`; for (const c of t) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
function scheduleEvent() {
  if (!player.started || player.pendingEvent || player.dayPhase === "morning" || player.chapterDone) return;
  const slot = `${player.day}-${player.dayPhase}`;
  if (player.evSlots[slot]) return;
  player.evSlots[slot] = true;
  if (player.day === 1 || player.day === CH_START[player.chapter]) return;
  if (player.dayPhase === "after" && seeded(slot) < 0.4) return;
  const pool = EVENTS.filter(e => !player.eventsSeen.includes(e.id) && player.day >= e.days[0] && player.day <= e.days[1]);
  if (!pool.length) return;
  const ev = pool[Math.floor(seeded(slot + "x") * pool.length)];
  player.pendingEvent = ev.id; save(true);
  setTimeout(() => toast(`${PEOPLE[ev.who].name.split(" ")[0]}: “${ev.notify}”`, "notify"), 700);
}
function openEvent(id) { renderModalDef(id, true); }

/* ---- gün sonu ---- */
function canEndDay() { return player.started && player.dayPhase === "after" && !player.finalePending && !player.chapterDone; }
function mayaEveningLine() {
  const t = player.today, r = t.decisions ? t.firstTry / t.decisions : 0;
  const pool = MAYA_EVENING[r >= 0.75 ? "high" : r >= 0.4 ? "mid" : "low"];
  return pool[(player.day + t.decisions) % pool.length];
}
function chooseEvening(i) {
  const opts = EVENINGS[player.day]; if (!opts || player.evening[player.day] !== undefined) return;
  const o = opts[i]; player.evening[player.day] = i;
  if (o.skills) applyRewards(o.skills, 0);
  if (o.trust) addTrust(o.trust);
  if (o.late) { player.lateNights++; if (player.lateNights >= 2) unlockAch("night_owl"); }
  save(); render();
}
function leaveOffice() {
  if (player.day === 1) unlockAch("first_day");
  const t = player.today;
  player.dayLog.push({ day: player.day, case: t.caseId, xp: t.xp, quests: t.quests, events: t.events, decisions: t.decisions, firstTry: t.firstTry });
  if (player.finaleDone) { player.chapterDone = true; player.screen = "leave"; save(true); render(); return; }
  player.screen = "leave"; save(true); render();
}
function nextMorning() {
  if (player.chapterDone) { go("chapter"); return; }
  player.day++; player.dayPhase = MORNING_DEFS[`morning${player.day}`] ? "morning" : "work";
  player.today = freshToday(); player.coffee = {};
  addInbox("maya", `${weekday(player.day)} sabahı. Bugünün vakası masanda.`);
  go(player.dayPhase === "morning" ? "morning" : "office");
}

/* ---- builder ve önizleme ---- */
function setField(def, key, el) {
  const pr = prog(def.id), st = curStep(def), f = st.fields.find(x => x.key === key);
  if (f.type === "check") { const v = new Set(pr.data[key] || []); el.checked ? v.add(el.value) : v.delete(el.value); pr.data[key] = [...v]; }
  else if (f.type === "range") pr.data[key] = +el.value;
  else pr.data[key] = el.value;
  pr.data.ran = false; pr.fb = null; save(true);
  rerender(def, f.type === "range" ? "stage" : "both");
  if (f.type === "range") { const lbl = el.closest(".b-field").querySelector("b"); if (lbl) lbl.textContent = String((+el.value).toFixed(1)).replace(".", ","); }
}
function builderRun(def, btn) {
  const pr = prog(def.id), st = curStep(def), r = st.check(pr.data);
  pr.data.ran = true;
  if (r.ok) { pr.solved = true; pr.fb = { ok: true, title: r.title, text: r.fb }; markSolved(def, pr); if (btn) burst(btn, "Tamam!"); }
  else {
    pr.mistakes++; let extra = "";
    if (policyOf(def).hints && pr.hint < (st.hints || []).length) { pr.hint++; extra = "Yeni bir ipucu açıldı."; }
    pr.fb = { ok: false, text: r.fb, extra };
  }
  save(true); rerender(def, "both"); focusIn("[data-panel] .feedback");
}
function completePreview(def) {
  const pr = prog(def.id), evBefore = earnedSources();
  if (!player.previews.includes(def.id)) player.previews.push(def.id);
  const steps = pr.log.length, indep = pr.log.filter(l => l.indep).length;
  player.lastPreview = { id: def.id, steps, indep, wrong: pr.log.reduce((a, l) => a + l.wrong, 0), newEvidence: evidenceFrom(def.id).filter(c => !conceptEarned(c, evBefore)).map(c => c.id) };
  delete player.progress[def.id];
  go("pvdone");
}
COMPLETE.preview = completePreview;

/* ---- bölüm geçişi ---- */
const promoCase = () => CASE_BY_ID[CH_PROMO_CASE[player.chapter || 1]] || CASES.filter(c => c.promotion).slice(-1)[0];
function startChapter(n) {
  Object.assign(player, { chapter: n, promoted: false, chapterDone: false, finaleDone: false, finalePending: false, promoReadyNotified: false,
    day: CH_START[n], dayPhase: "morning", today: freshToday(), coffee: {}, career: ROLES[n - 1].title });
  Object.assign(PROMOTION, PROMOTIONS[n]);
  addInbox("maya", `${CAREER_MAP[n - 1].time}: ${ROLES[n - 1].title} olarak yeni bir dönem başlıyor.`);
  addFeed(`${n}. bölüm başladı: ${ROLES[n - 1].title}.`);
  go("morning");
}

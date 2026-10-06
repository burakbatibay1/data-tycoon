
/* =====================================================================
   YETENEK AĞACI, NOT DEFTERİ, KARİYER HARİTASI, ÖNİZLEMELER
   (aynı adlı eski fonksiyonları bilerek geçersiz kılar)
   ===================================================================== */
const STATUS_TR = { mastered: "Ustalaştı", proficient: "Yetkin", developing: "Gelişiyor", available: "Açık", locked: "Kilitli" };
const STATUS_ICON = { mastered: "✓", proficient: "◕", developing: "◐", available: "○", locked: "🔒" };
function reqBar(k, have, need) {
  const { node, lvl } = parseReq(k), n = NODE_BY_ID[node];
  return `<button class="req-row" data-action="tree-goto" data-id="${node}"><span>${n.name}${lvl > 1 ? ` <i class="lvl-tag">${LEVELS[lvl]}</i>` : ""}</span><div class="req-bar"><i style="width:${Math.min(100, have / need * 100)}%;background:${AREA[n.area]}"></i></div><b class="${have >= need ? "met" : ""}">${have} / ${need}</b></button>`;
}
function nodeChip(id) { const n = NODE_BY_ID[id], st = nodeStats(n); return `<button class="node-chip st-${st.status}" data-action="tree-goto" data-id="${id}" style="--c:${AREA[n.area]}">${STATUS_ICON[st.status]} ${n.name}</button>`; }

/* ---------- yetenek ağacı ---------- */
const treeView = { x: 0, y: 0, k: 1, sel: null, init: false };
function viewTree() {
  const ch = chapterNow(), src = earnedSources();
  const visible = n => n.ch <= ch + 1;
  const edges = SKILL_TREE.flatMap(n => n.req.map(r => [NODE_BY_ID[r], n])).map(([a, b]) => {
    const sa = nodeStats(a, src).status, sb = nodeStats(b, src).status, lit = sa !== "locked" && sb !== "locked";
    const hidden = !visible(b);
    if (hidden) return "";
    return `<path class="edge ${lit ? "lit" : ""} ${hidden ? "far" : ""}" d="M${a.x},${a.y + 30} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y - 30}"/>`;
  }).join("");
  const nodes = SKILL_TREE.map(n => {
    const st = nodeStats(n, src), far = !visible(n), r = n.root ? 34 : 28, circ = 2 * Math.PI * (r + 6);
    if (far) return "";
    const fresh = n.ch === ch && ch > (player.treeSeen || 1) ? "fresh" : "";
    return `<g class="tnode st-${st.status} ${treeView.sel === n.id ? "sel" : ""} ${fresh}" data-action="tree-node" data-id="${n.id}" transform="translate(${n.x},${n.y})" tabindex="0" role="button" aria-label="${n.name}, ${STATUS_TR[st.status]}, %${st.pct}" style="--c:${AREA[n.area]}">
      <circle class="halo" r="${r + 12}"/><circle class="ring-bg" r="${r + 6}"/>
      <circle class="ring" r="${r + 6}" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - st.pct / 100)}" transform="rotate(-90)"/>
      <circle class="core" r="${r}"/><text class="ticon" y="6" text-anchor="middle">${n.root ? "★" : STATUS_ICON[st.status]}</text>
      <text class="tlabel" y="${r + 26}" text-anchor="middle">${n.name}</text>${st.status !== "locked" && !n.root ? `<text class="tpct" y="${r + 42}" text-anchor="middle">%${st.pct}</text>` : ""}</g>`;
  }).join("") + [...new Set(SKILL_TREE.filter(n => !visible(n)).map(n => n.ch))].map(fc => {
    const ns = SKILL_TREE.filter(n => n.ch === fc), x = ns.reduce((a, n) => a + n.x, 0) / ns.length, y = Math.min(...ns.map(n => n.y)) + 40;
    return `<g class="tnode far-branch" transform="translate(${x},${y})"><rect x="-120" y="-26" width="240" height="52" rx="26"/><text y="-2" text-anchor="middle">🔒 ${CAREER_MAP[fc - 1].role}</text><text class="fb-sub" y="16" text-anchor="middle">${fc}. bölüm, ${ns.length} yetenek dalı</text></g>`;
  }).join("");
  const ms = SKILL_TREE.filter(n => !n.root && n.ch <= ch).map(n => nodeStats(n, src));
  return `<div class="tree-screen">
    <div class="tree-head"><div><span class="eyebrow">Ne biliyorum, neyi geliştiriyorum?</span><h2>Yetenek ağacı</h2></div>
      <div class="tree-legend"><span>✓ Ustalaştı</span><span>◕ Yetkin</span><span>◐ Gelişiyor</span><span>○ Açık</span><span>🔒 Kilitli</span><span class="muted">${ms.filter(s => s.status === "mastered").length} / ${ms.length} dal tamam</span></div></div>
    <div class="tree-wrap" id="treeWrap">
      <svg class="tree-svg" id="treeSvg"><g id="treeG" transform="translate(${treeView.x},${treeView.y}) scale(${treeView.k})">${edges}${nodes}</g></svg>
      <div class="tree-tools"><button data-action="tree-zoom" data-z="1.2" aria-label="Yakınlaştır">+</button><button data-action="tree-zoom" data-z="0.83" aria-label="Uzaklaştır">−</button><button data-action="tree-fit" aria-label="Sığdır">⤢</button></div>
      ${ch > (player.treeSeen || 1) ? `<div class="unlock-banner"><span>Yeni yetenek yolu açıldı</span><b>${SKILL_TREE.filter(n => n.ch === ch).map(n => n.name).join(", ")}</b></div>` : ""}
      <aside class="tree-panel ${treeView.sel ? "open" : ""}" id="treePanel">${treeView.sel ? treePanelHTML(treeView.sel) : ""}</aside>
    </div>
    <p class="muted small">Sürükleyerek gez, tekerlekle yakınlaş. Soluk düğümler ileriki bölümlerde açılacak.</p></div>`;
}
function srcLabel(s) {
  if (CASE_BY_ID[s]) return `Vaka ${CASE_BY_ID[s].num}: ${CASE_BY_ID[s].title}`;
  if (QUEST_BY_ID[s]) return `Yan görev: ${QUEST_BY_ID[s].title}`;
  if (EVENT_BY_ID[s]) return `Ofis anı: ${EVENT_BY_ID[s].title}`;
  if (PREVIEW_BY_ID[s]) return `Önizleme: ${PREVIEW_BY_ID[s].title}`;
  if (s === "morning") return "Sabah özetleri";
  return s;
}
function practiceFor(nodeId) {
  const src = earnedSources(), miss = NODE_BY_ID[nodeId].concepts.filter(c => !conceptEarned(c, src));
  for (const c of miss) for (const s of c.src) {
    if (QUEST_BY_ID[s] && questState(QUEST_BY_ID[s]) === "available") return { label: `Yan görev: ${QUEST_BY_ID[s].title}`, attrs: `data-action="open-quest" data-id="${s}"` };
    if (CASE_BY_ID[s] && caseState(CASE_BY_ID[s]) === "available") return { label: `Vaka ${CASE_BY_ID[s].num}`, attrs: `data-action="open-case" data-id="${s}"` };
    if (PREVIEW_BY_ID[s]) return { label: `Önizleme: ${PREVIEW_BY_ID[s].title}`, attrs: `data-action="play-preview" data-id="${s}"` };
  }
  return null;
}
function treePanelHTML(id) {
  const n = NODE_BY_ID[id], src = earnedSources(), st = nodeStats(n, src), pr = practiceFor(id);
  return `<button class="modal-close" data-action="tree-close" aria-label="Kapat">×</button>
    <span class="eyebrow" style="color:${AREA[n.area]}">${n.ch > chapterNow() ? `${n.ch}. bölümde açılır` : `${n.ch}. bölüm`}</span>
    <h3>${n.name}</h3><div class="tp-status st-${st.status}">${STATUS_ICON[st.status]} ${STATUS_TR[st.status]}${n.root ? "" : `, %${st.pct}`}</div>
    ${n.root ? "" : `<p class="lvl-help">Her kavram dört seviyede gelişir: <b>Keşif</b> (ilk doğru kullanım), <b>Pratik</b> (ikinci bir vakada), <b>Transfer</b> (transfer adımı ipucusuz) ve <b>Ustalık</b> (sonraki bir bölümde yeniden).</p>`}
    ${n.root ? "<p class='muted'>Her şeyin başladığı yer.</p>" : `<div class="mini-bar big"><i style="width:${st.pct}%;background:${AREA[n.area]}"></i></div>`}
    ${n.concepts.length ? `<h4>Kavramlar</h4><ul class="tp-concepts">${n.concepts.map(c => { const lv = conceptLevel(c, src), ok = lv > 0; return `<li class="${ok ? "ok" : ""}"><button data-action="${ok ? "note-open" : ""}" data-id="${c.id}" ${ok ? "" : "disabled"}>${ok ? icon("check") : `<i>${st.status === "locked" ? "🔒" : "○"}</i>`}<span>${c.name}</span><em class="pips" title="${LEVELS[lv]}">${[1, 2, 3, 4].map(k => `<b class="${k <= lv ? "on" : ""}"></b>`).join("")}</em></button>${c.src.length ? `<small>${c.src.map(s => `${earnedSources().has(s) ? "✓" : "○"} ${srcLabel(s)}`).join("<br>")}</small>` : `<small>İleriki vakalarda</small>`}</li>`; }).join("")}</ul>` : ""}
    ${n.req.length && !n.root ? `<h4>Önkoşullar</h4><div class="tp-req">${n.req.map(r => nodeChip(r)).join("")}</div>` : ""}
    <div class="tp-actions">${n.concepts.some(c => conceptEarned(c, src)) ? `<button class="ghost-button small" data-action="nb-node" data-id="${id}">Kavramları incele</button>` : ""}${pr ? `<button class="primary-button small" ${pr.attrs}>Pratik yap: ${pr.label}</button>` : ""}</div>`;
}
function setupTree() {
  const wrap = $("treeWrap"), g = $("treeG"); if (!wrap) return;
  if (!treeView.init) { treeFit(); treeView.init = true; }
  const apply = () => g.setAttribute("transform", `translate(${treeView.x},${treeView.y}) scale(${treeView.k})`);
  let drag = null;
  wrap.addEventListener("pointerdown", e => { if (e.target.closest(".tnode,.tree-panel,.tree-tools")) return; drag = { x: e.clientX, y: e.clientY, ox: treeView.x, oy: treeView.y }; wrap.setPointerCapture(e.pointerId); wrap.classList.add("drag"); });
  wrap.addEventListener("pointermove", e => { if (!drag) return; treeView.x = drag.ox + e.clientX - drag.x; treeView.y = drag.oy + e.clientY - drag.y; apply(); });
  wrap.addEventListener("pointerup", () => { drag = null; wrap.classList.remove("drag"); });
  wrap.addEventListener("wheel", e => { e.preventDefault(); treeZoom(e.deltaY < 0 ? 1.12 : 0.89, e.offsetX, e.offsetY); }, { passive: false });
  if (player.treeSeen < chapterNow()) setTimeout(() => { player.treeSeen = chapterNow(); save(true); }, 3000);
}
function treeZoom(f, cx, cy) {
  const wrap = $("treeWrap"); if (!wrap) return;
  cx = cx ?? wrap.clientWidth / 2; cy = cy ?? wrap.clientHeight / 2;
  const k = Math.min(2.2, Math.max(0.35, treeView.k * f)), r = k / treeView.k;
  treeView.x = cx - (cx - treeView.x) * r; treeView.y = cy - (cy - treeView.y) * r; treeView.k = k;
  $("treeG").setAttribute("transform", `translate(${treeView.x},${treeView.y}) scale(${treeView.k})`);
}
function treeFit(focus) {
  const wrap = $("treeWrap"); if (!wrap) return;
  const ch = chapterNow(), ns = SKILL_TREE.filter(n => n.ch <= ch + (focus ? 7 : 1));
  const minX = Math.min(...ns.map(n => n.x)) - 90, maxX = Math.max(...ns.map(n => n.x)) + 90, minY = Math.min(...ns.map(n => n.y)) - 50, maxY = Math.max(...ns.map(n => n.y)) + 80;
  const k = Math.min(1.3, wrap.clientWidth / (maxX - minX), wrap.clientHeight / (maxY - minY));
  treeView.k = k; treeView.x = (wrap.clientWidth - (maxX - minX) * k) / 2 - minX * k; treeView.y = 20 - minY * k;
  const g = $("treeG"); if (g) g.setAttribute("transform", `translate(${treeView.x},${treeView.y}) scale(${treeView.k})`);
}
function treeSelect(id) {
  treeView.sel = id;
  const p = $("treePanel"); if (!p) return;
  p.innerHTML = id ? treePanelHTML(id) : ""; p.classList.toggle("open", !!id);
  document.querySelectorAll(".tnode").forEach(el => el.classList.toggle("sel", el.dataset.id === id));
}

/* ---------- not defteri ---------- */
let nbFocus = null;
function viewNotebook() {
  const src = earnedSources(), ch = chapterNow();
  const groups = SKILL_TREE.filter(n => !n.root && n.ch <= ch + 1);
  const total = groups.reduce((a, n) => a + n.concepts.length, 0), got = Object.values(CONCEPT_BY_ID).filter(c => conceptEarned(c, src)).length;
  return `<div class="page-heading"><div><span class="eyebrow">Ne öğrendim?</span><h2>Veri not defterim</h2><p>Keşfettiğin her kavram buraya otuz saniyede okunacak bir notla eklenir.</p></div><span class="pill">${got} kavram</span></div>
    <div class="notebook">${groups.map(n => {
      const st = nodeStats(n, src);
      return `<section class="nb-group ${nbFocus === n.id ? "focus" : ""}" id="nb-${n.id}" style="--c:${AREA[n.area]}"><div class="nb-head"><h3>${n.name}</h3><button class="link-button" data-action="tree-goto" data-id="${n.id}">Ağaçta göster</button></div>
        ${n.ch > ch ? `<p class="muted small">🔒 ${n.ch}. bölümde açılır.</p>` : `<div class="nb-list">${n.concepts.map(c => conceptEarned(c, src)
          ? `<button class="nb-item" data-action="note-open" data-id="${c.id}">${icon("check")}<span>${c.name}</span></button>`
          : `<div class="nb-item locked">○<span>${st.status === "locked" ? "???" : c.name}</span></div>`).join("")}</div>`}</section>`;
    }).join("")}</div>`;
}
function openNote(id) {
  const c = CONCEPT_BY_ID[id], n = NODE_BY_ID[c.node], src = earnedSources();
  const extra = id === "eda.checklist" ? `<ol class="checklist"><li>Bir satır neyi temsil ediyor?</li><li>Her sütun ne anlama geliyor, tipi ne?</li><li>Eksik bir şey var mı?</li><li>Mükerrer kayıt var mı?</li><li>Değişkenler nasıl dağılıyor?</li><li>Olağandışı gözlemler var mı?</li><li>Hangi ilişkiler incelemeye değer?</li></ol>` : "";
  openStory(null, c.name, `<span class="eyebrow" style="color:${AREA[n.area]}">${n.name}</span><p class="note-text">${c.note}</p>${extra}
    <div class="note-src"><span>Nerede kullandın?</span>${c.src.filter(s => src.has(s)).map(s => `<p>${icon("check")}${srcLabel(s)}</p>`).join("")}</div>`,
    [{ label: "Ağaçta göster", attrs: `data-action="tree-goto" data-id="${n.id}"`, primary: true }, { label: "Kapat", attrs: 'data-action="close-modal"' }]);
}

/* ---------- kariyer ---------- */
function viewCareer() {
  const ch = chapterNow(), miss = missingReq();
  const stats = [["Çözülen vaka", player.completed.length], ["Yan görev", player.sideDone.length], ["Ofis anı", player.eventsSeen.length], ["Önizleme", player.previews.length]];
  return `<div class="page-heading"><div><span class="eyebrow">Şirkette neredeyim, sırada ne var?</span><h2>Kariyer</h2></div><span class="pill">${ch}. bölüm / 8</span></div>
    <div class="career-top">
      <section class="card id-card">${avatar("you", 72)}<div><h3>${playerName()}</h3><span>${player.career}</span><p class="muted small">Virelio Analytics, ${player.day} iş günü</p></div>
        <ul class="cstats">${stats.map(([k, v]) => `<li><b>${v}</b><span>${k}</span></li>`).join("")}</ul></section>
      <section class="card promo-req"><span class="eyebrow">${player.promoted ? "Sıradaki terfi" : `${PROMOTION.title} terfisi`}</span>
        ${player.promoted ? `<p>${player.chapterDone && PROMOTIONS[player.chapter + 1] ? `${player.chapter + 1}. bölüme başlayınca ${ROLES[player.chapter + 1].title} terfisinin gereksinimleri burada görünecek.` : "Bir sonraki terfi yolu hazırlanıyor."}</p>` : `
        <div class="req-list">${Object.entries(PROMOTION.req).map(([k, v]) => reqBar(k, reqHave(k), v)).join("")}</div>
        <ul class="req-extra"><li class="${MAIN_DONE() ? "ok" : ""}">${MAIN_DONE() ? "✓" : "○"} Bölümün ana vakaları çözüldü</li><li class="${isDone(promoCase().id) ? "ok" : ""}">${isDone(promoCase().id) ? "✓" : "○"} Terfi vakası: ${promoCase().title}</li></ul>
        <p class="muted small">${miss.length ? "Bir gereksinime tıkla; yetenek ağacında ne eksik olduğunu gör." : "Tüm kanıt gereksinimleri tamam."}</p>`}</section>
    </div>
    <h3 class="section-title">Kariyer haritası: 8 bölüm, ${CAREER_MAP.reduce((a, c) => a + c.cases.length, 0)} ana vaka</h3>
    <div class="chapters">${CAREER_MAP.map(c => { const cur = c.ch === ch, past = c.ch < ch, pv = c.preview && PREVIEW_BY_ID[c.preview];
      return `<article class="chapter-card ${cur ? "current" : past ? "past" : ""}" style="--i:${c.ch}">
        <div class="cc-l"><span class="ch-num">${c.ch}</span><span class="ch-time">${c.time}</span></div>
        <div class="cc-m"><span class="eyebrow">${cur ? "Şu an buradasın" : past ? "Tamamlandı" : "İleride"}</span><h3>${c.role}</h3><p>${c.axis}</p>
          <p class="ch-meta"><span>Maya: ${c.maya}</span><span>Rehberlik: ${GUIDANCE[c.ch].label}</span></p>
          <details><summary>${c.cases.length} ana vaka</summary><ol class="case-titles">${c.cases.map(t => `<li>${t}</li>`).join("")}</ol></details></div>
        <div class="cc-r">${c.ch <= (player.chapter || 1) ? `<span class="playable">${icon("check")}Oynanabilir bölüm</span>` : PROMOTIONS[c.ch] ? `<span class="playable">${icon("lock")}Tam bölüm hazır · önceki bölümü tamamla</span>` : pv ? `<button class="${player.previews.includes(pv.id) ? "ghost-button" : "primary-button"} small" data-action="play-preview" data-id="${pv.id}">${player.previews.includes(pv.id) ? "Tekrar oyna" : "Önizlemeyi oyna"}</button><small>Vaka ${pv.num}: ${pv.title}</small>` : ""}</div></article>`; }).join("")}</div>`;
}
const MAIN_DONE = () => CASES.filter(c => (c.chapter || 1) === (player.chapter || 1) && !c.promotion).every(c => isDone(c.id));

/* ---------- önizleme ekranları ---------- */
function viewPreview() {
  const def = PREVIEW_BY_ID[player.param], c = CAREER_MAP[def.chapter - 1];
  return `<div class="case-screen preview-screen">
    <div class="case-head">
      <button class="back-link" data-nav="career">← Kariyer haritası</button>
      <div class="pv-banner"><span>Kariyer önizlemesi, ${def.chapter}. bölüm: ${c.role}</span><b>${c.time}</b><em>Rehberlik: ${GUIDANCE[def.chapter].label}</em></div>
      <div class="case-title"><span class="eyebrow">Vaka ${def.num}</span><h2>${def.title}</h2></div>
      <div class="skills-in">${icon("target")}<span>Bu vakadaki yetenekler</span>${def.nodes.map(nodeChip).join("")}</div>
      <ol class="stepper" id="caseStepper"></ol>
    </div>
    <div class="case-body" data-step-body>${stepHTML(def)}</div></div>`;
}
function reviewHTML(r, evIds) {
  return `<section class="card review"><span class="eyebrow">Vaka değerlendirmesi</span>
    <dl><dt>Ne oldu?</dt><dd>${r.happened}</dd><dt>Ne keşfettin?</dt><dd>${r.discovered}</dd><dt>Profesyonel alışkanlık</dt><dd>${r.habit}</dd><dt>Dikkat</dt><dd>${r.watch}</dd></dl>
    ${evIds && evIds.length ? `<div class="ev-new"><span>Kazanılan kanıtlar</span>${evIds.map(id => { const c = CONCEPT_BY_ID[id]; return `<button class="ev-chip" data-action="tree-goto" data-id="${c.node}">${icon("check")}${c.name} <i>${NODE_BY_ID[c.node].name}</i></button>`; }).join("")}</div>` : ""}</section>`;
}
function viewPvDone() {
  const lp = player.lastPreview; if (!lp) return viewCareer();
  const def = PREVIEW_BY_ID[lp.id], c = CAREER_MAP[def.chapter - 1], next = CAREER_MAP[def.chapter];
  return `<div class="debrief">
    <div class="debrief-hero"><div class="stamp big">Önizleme tamamlandı</div><span class="eyebrow">${def.chapter}. bölüm, ${c.role}</span><h2>${def.title}</h2>
      <p class="muted">${lp.indep} / ${lp.steps} adımı ilk denemede çözdün. Bu bölümde rehberlik: ${GUIDANCE[def.chapter].label.toLowerCase()}.</p></div>
    ${reviewHTML(def.review, lp.newEvidence)}
    ${player.flags.prod_model && def.id === "pv5" ? `<div class="flag-note">${icon("route")}<p>Bu kararın kaydedildi. 6. bölümün önizlemesinde karşına çıkacak.</p></div>` : ""}
    <div class="modal-actions center"><button class="primary-button big" data-nav="career">Kariyer haritasına dön</button>${next && next.preview ? `<button class="ghost-button" data-action="play-preview" data-id="${next.preview}">Sonraki bölümü oyna</button>` : ""}</div></div>`;
}

/* ---------- vaka sonu: öğrenme değerlendirmesi + ağaç güncellemesi ---------- */
function viewDebrief() {
  const db = player.lastDebrief, def = CASE_BY_ID[db.id], after = nodePctMap();
  const changed = (def.nodes || []).map(id => [id, (db.treeBefore || {})[id] || 0, after[id]]);
  return `<div class="debrief">
    <div class="debrief-hero"><div class="stamp big">Vaka çözüldü</div><span class="eyebrow">Vaka ${def.num}</span><h2>${def.title}</h2>
      ${db.bonus ? `<p class="first-try">${icon("quest")}Tüm adımları kendi başına çözdün: +${db.bonus} bonus XP</p>` : `<p class="muted">Rehberliği kullanmak öğrenmenin parçası. Bir sonraki vakada daha azına ihtiyacın olacak.</p>`}</div>
    <div class="debrief-grid">
      ${def.review ? reviewHTML(def.review, db.newEvidence) : ""}
      <div class="debrief-side">
        <section class="card tree-update"><span class="eyebrow">Yetenek ağacı güncellendi</span>
          ${changed.map(([id, a, b]) => `<button class="tu-row" data-action="tree-goto" data-id="${id}"><span>${NODE_BY_ID[id].name}</span><div class="gain-bar"><i class="before" style="width:${a}%;background:${AREA[NODE_BY_ID[id].area]}"></i><i class="after" style="--from:${a}%;--to:${b}%;background:${AREA[NODE_BY_ID[id].area]}"></i></div><b>%${a} → %${b}</b></button>`).join("")}
          <button class="ghost-button small" data-action="tree-goto" data-id="${(def.nodes || ["found"])[0]}">Ağaçta göster</button></section>
        <section class="card learn-stats"><span class="eyebrow">Nasıl çözdün?</span>
          <div class="ring" style="--p:${db.steps ? Math.round(db.indep / db.steps * 100) : 0}"><b>%${db.steps ? Math.round(db.indep / db.steps * 100) : 0}</b><span>bağımsız</span></div>
          <ul><li><b>${db.indep} / ${db.steps}</b> adım yardımsız</li><li><b>${db.hints}</b> ipucu</li><li><b>${db.wrong}</b> yanlış deneme</li><li><b>+${db.xp + db.bonus}</b> XP</li></ul></section>
      </div>
    </div>
    <div class="mentor-note">${avatar("maya", 52)}<div><span>Maya Chen, Analitik Müdürü</span><p>${def.mentor}</p></div></div>
    ${db.unlocks.length ? `<section class="unlocks"><h3>Ofiste yeni neler var?</h3>${db.unlocks.map((u, i) => `<div class="unlock ${u.kind}" style="--i:${i}"><i>${u.kind === "quest" ? "!" : "›"}</i><div><strong>${u.title}</strong><span>${u.where}</span></div></div>`).join("")}</section>` : ""}
    <button class="primary-button big" data-action="to-office">${def.promotion ? "Maya'nın mesajını aç" : "Ofise dön"}</button>
  </div>`;
}

/* ---------- sağ panel ---------- */
function viewRightPanel() {
  const miss = missingReq(), inboxQuest = questState(QUEST_BY_ID.sq_inbox) === "available", src = earnedSources();
  const nodes = SKILL_TREE.filter(n => !n.root && n.ch <= chapterNow());
  return `<section class="rp-block"><div class="rp-head"><span>Mesajlar</span>${player.unread ? `<b class="unread">${player.unread}</b>` : ""}</div>
      ${inboxQuest ? `<button class="mini-msg urgent" data-action="open-quest" data-id="sq_inbox">${avatar("zeynep", 34)}<div><strong>Zeynep <em>acil</em></strong><p>Toplantı için müşteri performansını gönderebilir misin?</p></div></button>` : ""}
      ${player.inbox.slice(0, 2).map(m => `<div class="mini-msg">${avatar(m.from, 34)}<div><strong>${PEOPLE[m.from].name.split(" ")[0]}</strong><p>${m.text}</p></div></div>`).join("")}
      <button class="ghost-button small wide-btn" data-action="open-slack">Slack'i aç</button></section>
    <section class="rp-block"><div class="rp-head"><span>Yetenek ağacı</span><button class="link-button" data-nav="tree">Aç</button></div>
      ${nodes.map(n => { const st = nodeStats(n, src); return `<button class="rp-node" data-action="tree-goto" data-id="${n.id}"><span>${STATUS_ICON[st.status]} ${n.name}</span><div class="mini-bar"><i style="width:${st.pct}%;background:${AREA[n.area]}"></i></div></button>`; }).join("")}</section>
    <section class="rp-block"><div class="rp-head"><span>İlişkiler</span></div>${relationsHTML()}</section>
    <section class="rp-block next-role"><div class="rp-head"><span>${player.promoted ? "Şu anki rol" : "Sıradaki rol"}</span></div><strong>${PROMOTION.title}</strong>
      <div class="mini-bar big"><i style="width:${player.promoted ? 100 : (RQN() - miss.length) / RQN() * 100}%"></i></div>
      <p class="muted small">${player.promoted ? "Kazanıldı." : `${RQN() - miss.length} / ${RQN()} kanıt gereksinimi tamam`}</p>
      ${player.promoted ? "" : `<button class="link-button" data-nav="career">Ayrıntılar</button>`}</section>`;
}
function devPlan() {
  const miss = missingReq(), src = earnedSources();
  const items = (miss.length ? [...new Set(miss.map(([k]) => parseReq(k).node))] : SKILL_TREE.filter(n => !n.root && n.ch <= chapterNow() && nodeStats(n, src).status !== "mastered").map(n => n.id)).slice(0, 3);
  openStory("maya", "Gelişim planın", `<p>“${miss.length ? `${NODE_BY_ID[parseReq(miss[0][0]).node].name} tarafında hâlâ yeterli kanıtın yok.` : "Terfi için gereken kanıtların tamam. Şimdi derinleşme zamanı."} İşte sıradaki adımların:”</p>
    <div class="plan">${items.map(id => { const n = NODE_BY_ID[id], st = nodeStats(n, src), pr = practiceFor(id); return `<div class="plan-row"><div><b>${n.name}</b><span>${st.level}, %${st.pct}</span></div>${pr ? `<button class="ghost-button small" ${pr.attrs}>${pr.label}</button>` : `<span class="muted small">Sonraki vakalarda</span>`}</div>`; }).join("")}</div>`,
    [{ label: "Yetenek ağacını aç", attrs: 'data-nav="tree"', primary: true }, { label: "Kapat", attrs: 'data-action="close-modal"' }]);
}

const RQN = () => Object.keys(PROMOTION.req).length;

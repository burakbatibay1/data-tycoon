
/* =====================================================================
   ARAYÜZ YARDIMCILARI
   ===================================================================== */
const $ = id => document.getElementById(id);
const smooth = () => (animOn() ? "smooth" : "auto");
function focusIn(sel) {
  setTimeout(() => {
    const el = document.querySelector(sel); if (!el) return;
    if (!el.hasAttribute("tabindex") && !/BUTTON|A|INPUT/.test(el.tagName)) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > innerHeight) el.scrollIntoView({ behavior: smooth(), block: "nearest" });
  }, 60);
}
function toast(text, kind = "") {
  const t = document.createElement("div"); t.className = `toast ${kind}`; t.textContent = text;
  $("toasts").appendChild(t); setTimeout(() => t.classList.add("out"), 2800); setTimeout(() => t.remove(), 3300);
}
function burst(el, label) {
  if (!animOn()) return;
  const r = el.getBoundingClientRect(), b = document.createElement("div");
  b.className = "burst"; b.style.left = `${r.left + r.width - 40}px`; b.style.top = `${r.top + 4}px`; b.textContent = label;
  document.body.appendChild(b);
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("i"); s.className = "spark";
    s.style.left = `${r.left + r.width / 2}px`; s.style.top = `${r.top + r.height / 2}px`;
    s.style.setProperty("--dx", `${Math.cos(i / 10 * 6.28) * (60 + i * 4)}px`); s.style.setProperty("--dy", `${Math.sin(i / 10 * 6.28) * 36}px`);
    s.style.background = Object.values(SKILLS)[i % 6].color; document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
  setTimeout(() => b.remove(), 1300);
}
function showLevelUp(lv) {
  const o = document.createElement("div"); o.className = "levelup";
  o.innerHTML = `<div class="lu-card"><span>Seviye atladın</span><strong>${lv}</strong><p>${player.xp} XP topladın. Böyle devam.</p></div>`;
  document.body.appendChild(o); setTimeout(() => o.classList.add("out"), 2300); setTimeout(() => o.remove(), 2800);
}
function countUp(root) {
  root.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0);
    if (!animOn()) { el.textContent = fmtNum(to); return; }
    const t0 = performance.now(), dur = 900;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmtNum(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function openModal(html, cls = "") {
  $("modalCard").className = "modal-card " + cls; $("modalCard").innerHTML = html;
  $("modal").classList.add("visible"); $("modal").setAttribute("aria-hidden", "false");
  focusIn("#modalCard .primary-button, #modalCard button");
}
function closeModal() {
  if (!$("modal").classList.contains("visible")) return;
  dialogToken++;
  $("modal").classList.remove("visible"); $("modal").setAttribute("aria-hidden", "true");
  if (["office", "quests"].includes(player.screen)) render();
}
function openStory(who, title, text, actions = []) {
  openModal(`<button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button>
    ${who ? speakerLine(who) : `<span class="eyebrow">Ofis anı</span>`}
    <h3>${title}</h3><div class="story-text">${text}</div>
    <div class="modal-actions">${actions.map(a => `<button class="${a.primary ? "primary-button" : "ghost-button"}" ${a.attrs}>${a.label}</button>`).join("")}
    ${actions.length ? "" : `<button class="primary-button" data-action="close-modal">Devam</button>`}</div>`, "story");
}
function openQuest(id) { renderModalDef(id, true); }
function renderModalDef(id, opening) {
  const def = defOf(id), pr = prog(id);
  const head = def.kind === "quest"
    ? `<div class="quest-head"><span class="eyebrow amber">Yan görev, ${HOTSPOTS[def.hot].label}</span><h3>${def.title}</h3>
      <div class="quest-meta">${Object.entries(def.rewards).map(([k, v]) => `<span style="--c:${SKILLS[k].color}">${SKILLS[k].name} +${v}</span>`).join("")}<span>+${def.xp} XP</span></div>`
    : `<div class="quest-head"><span class="eyebrow violet">${def.via === "slack" ? "Slack, #analytics-team" : "Ofis anı"}</span><h3>${def.title}</h3>
      <div class="quest-meta">${def.xp ? `<span>+${def.xp} XP</span>` : `<span>XP yok, sadece sohbet</span>`}</div>`;
  const html = `<button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button>${head}
    ${def.steps.length > 1 ? `<div class="quest-dots">${def.steps.map((s, i) => `<i class="${i < pr.step ? "done" : i === pr.step ? "now" : ""}"></i>`).join("")}</div>` : ""}</div>
    <div class="quest-body" data-step-body>${stepHTML(def)}</div>`;
  if (opening) openModal(html, "quest " + (def.kind === "event" ? "event" : "")); else $("modalCard").innerHTML = html;
  afterStepRender(def, true);
}
function openSlack() {
  player.slackRead = SLACK.filter(t => t.day <= player.day).length; player.unread = 0; save(true); renderTop();
  const threads = SLACK.filter(t => t.day <= player.day).slice().reverse();
  const dms = QUESTS.filter(q => q.hot === "phone" && questState(q) === "available");
  const ev = player.pendingEvent && EVENT_BY_ID[player.pendingEvent];
  openModal(`<button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button>
    <div class="slack"><div class="slack-head"><span class="slack-logo">#</span><div><h3>Nexora Slack</h3><span class="muted small">${weekday(player.day)}, ${player.day}. gün</span></div></div>
    ${dms.length || ev ? `<div class="slack-sec"><span>Sana gelenler</span>
      ${ev ? `<button class="slack-dm urgent" data-action="open-event" data-id="${ev.id}">${avatar(ev.who, 32)}<div><b>${PEOPLE[ev.who].name}</b><p>${ev.notify}</p></div><em>Yanıtla</em></button>` : ""}
      ${dms.map(q => `<button class="slack-dm" data-action="open-quest" data-id="${q.id}">${avatar(q.who, 32)}<div><b>${PEOPLE[q.who].name}</b><p>${q.title}</p></div><em>Aç</em></button>`).join("")}</div>` : ""}
    ${threads.map(t => `<div class="slack-sec"><span>${t.ch} <i>${t.day === player.day ? "bugün" : `${t.day}. gün`}</i></span>
      ${t.msgs.map(([w, m]) => `<div class="slack-msg">${avatar(w, 30)}<div><b>${PEOPLE[w].name.split(" ")[0]}</b><p>${m}</p></div></div>`).join("")}
      ${t.event && player.pendingEvent === t.event ? `<button class="ghost-button small" data-action="open-event" data-id="${t.event}">Konuşmaya katıl</button>` : ""}</div>`).join("")}
    </div>`, "slack-modal");
}

/* =====================================================================
   EKRANLAR
   ===================================================================== */
const NAV_OF = { tree: "tree", notebook: "notebook", preview: "career", pvdone: "career", office: "office", inbox: "office", quests: "cases", settings: "settings", cases: "cases", case: "cases", debrief: "cases", skills: "skills", career: "career", portfolio: "portfolio", promotion: "career", dayend: "office", chapter: "career" };
const CINEMA = ["morning", "leave", "finale"];
const PRE_START = ["welcome", "profile", "firstday"];
function go(screen, param = null) {
  player.screen = screen; player.param = param; save(); render();
  window.scrollTo({ top: 0, behavior: "auto" });
  $("workspace").focus({ preventScroll: true });
}
let showTitle = true;
function render() {
  let s = player.screen;
  if (showTitle && player.started) {
    document.body.dataset.screen = "welcome"; document.body.classList.add("prestart"); document.body.classList.toggle("reduced", !animOn());
    renderTop(); $("workspace").innerHTML = `<div class="screen" data-screen="welcome">${viewWelcome()}</div>`; $("rightPanel").innerHTML = "";
    document.querySelectorAll(".nav-item[data-nav]").forEach(b => { b.classList.remove("active"); b.disabled = true; });
    return;
  }
  if (!player.started && !PRE_START.includes(s)) s = "welcome";
  if (player.started && PRE_START.includes(s)) s = "office";
  if (s === "case" && (!player.param || !CASE_BY_ID[player.param] || caseState(CASE_BY_ID[player.param]) !== "available")) s = "office";
  if (s === "preview" && !PREVIEW_BY_ID[player.param]) s = "career";
  if (s === "skills") s = "tree";
  if (s === "debrief" && !player.lastDebrief) s = "office";
  if (s === "promotion" && !player.promoted) s = "office";
  if (player.started && player.dayPhase === "morning" && !["morning", "settings"].includes(s)) s = "morning";
  if (s === "morning" && player.dayPhase !== "morning") s = "office";
  if (s === "finale" && !player.finalePending) s = "office";
  if (s === "dayend" && !canEndDay()) s = "office";
  if (s === "leave" && !(player.chapterDone || player.dayPhase === "after")) s = "office";
  if (s === "office") { checkPromotionReady(); scheduleEvent(); }
  player.screen = s;
  document.body.classList.toggle("cinema", CINEMA.includes(s));
  document.body.dataset.screen = s;
  document.body.classList.toggle("reduced", !animOn());
  document.body.classList.toggle("prestart", !player.started);
  renderTop();
  const views = { welcome: viewWelcome, profile: viewProfile, firstday: viewFirstDay, inbox: viewInbox, office: viewOffice, quests: viewQuests,
    cases: viewCases, case: viewCase, debrief: viewDebrief, skills: viewSkills, career: viewCareer, portfolio: viewPortfolio, promotion: viewPromotion, settings: viewSettings,
    morning: viewMorning, dayend: viewDayEnd, leave: viewLeave, finale: viewFinale, chapter: viewChapter,
    tree: viewTree, notebook: viewNotebook, preview: viewPreview, pvdone: viewPvDone };
  $("workspace").innerHTML = `<div class="screen" data-screen="${s}">${(views[s] || viewOffice)()}</div>`;
  if (s === "case") { renderCaseStepper(CASE_BY_ID[player.param]); afterStepRender(CASE_BY_ID[player.param], true); }
  if (s === "morning") { afterStepRender(MORNING_DEFS[`morning${player.day}`], true); runMorningScene(); }
  if (s === "finale") { afterStepRender(FINALE, true); runMorningScene(); }
  if (s === "preview") { renderCaseStepper(PREVIEW_BY_ID[player.param]); afterStepRender(PREVIEW_BY_ID[player.param], true); }
  if (s === "tree") setupTree();
  if (s === "notebook" && nbFocus) setTimeout(() => { document.getElementById("nb-" + nbFocus)?.scrollIntoView({ block: "center", behavior: smooth() }); }, 80);
  if (s === "leave") runLeave();
  $("rightPanel").innerHTML = player.started ? viewRightPanel() : "";
  document.querySelectorAll(".nav-item[data-nav]").forEach(b => { b.classList.toggle("active", NAV_OF[s] === b.dataset.nav); b.disabled = !player.started; });
  countUp($("workspace"));
}
function renderTop() {
  const lv = level(), into = player.xp % XP_PER_LEVEL;
  $("careerTitle").textContent = player.career; $("levelValue").textContent = lv;
  $("dayValue").textContent = player.started ? `${player.day}. gün, ${weekday(player.day)} ${phase()}` : "—";
  const slackNew = Math.max(0, SLACK.filter(t => t.day <= player.day).length - (player.slackRead || 0)) + (player.pendingEvent ? 1 : 0) + QUESTS.filter(q => q.hot === "phone" && questState(q) === "available").length;
  $("phoneBadge").hidden = !(player.started && slackNew); $("phoneBadge").textContent = slackNew;
  $("xpFill").style.width = `${into / XP_PER_LEVEL * 100}%`; $("xpText").textContent = `${into} / ${XP_PER_LEVEL} XP`;
  const avail = CASES.filter(c => caseState(c) === "available").length, oq = openQuests().length;
  $("casesBadge").hidden = !(player.started && avail); $("casesBadge").textContent = avail;
  $("casesBadge").hidden = !(player.started && (avail || oq)); $("casesBadge").textContent = avail + oq;
  $("topAvatar").innerHTML = player.started ? avatar("you", 34) : "";
  $("topName").textContent = player.started ? playerName() : "";
}

function viewWelcome() {
  const can = hasSave();
  let saved = null; try { saved = can ? JSON.parse(localStorage.getItem(SAVE_KEY)) : null; } catch (e) { saved = null; }
  return `<div class="launch">
    <div class="launch-bg" aria-hidden="true"><img src="${OFFICE_IMAGE}" alt=""></div>
    <div class="launch-copy">
      <span class="eyebrow">Nexora Analytics, İstanbul</span>
      <h2>Stajyer olarak başla.<br>Gerçek bir veri kariyeri kur.</h2>
      <p>İş problemlerini araştır, analitik becerilerini geliştir, ofisteki yan görevlerle ekibine yardım et ve ilk terfini kazan. Takıldığın her yerde Maya seni adım adım yönlendirecek.</p>
      <div class="launch-actions">
        ${can ? `<button class="primary-button big" data-action="continue">Kariyere devam et</button>` : ""}
        <button class="${can ? "ghost-button big" : "primary-button big"}" data-action="new-career">Yeni kariyer başlat</button>
      </div>
      ${can && saved ? `<p class="save-line">${icon("save")}${saved.profile && saved.profile.name ? saved.profile.name + ", " : ""}${saved.day}. gün, ${saved.completed.length} vaka çözüldü, ${saved.xp} XP</p>` : ""}
      <ul class="launch-facts"><li><b>6</b>vaka, satış gizeminden yönetim kurulu brifingine</li><li><b>12</b>yan görev ofisin dört bir yanında</li><li><b>4</b>katmanlı rehberlik: hedef, yaklaşım, ipucu, birlikte çözüm</li></ul>
    </div></div>`;
}
function viewProfile() {
  const p = player.profile;
  return `<div class="onboard">
    <div class="onboard-card">
      <span class="eyebrow">İşe giriş, 1. adım</span>
      <h2>Nexora profilini oluştur</h2>
      <p class="muted">Adın mesajlarda, kariyer profilinde ve hikâye anlarında görünecek.</p>
      <label class="field-label" for="profileName">Adın</label>
      <input id="profileName" class="text-input" maxlength="24" placeholder="Örneğin Burak" value="${p.name || ""}" autocomplete="given-name">
      <span class="field-label">Avatarını seç</span>
      <div class="avatar-picker" role="radiogroup" aria-label="Avatar">${AVATARS.map(a => `<button class="avatar-choice ${p.avatar === a.id ? "selected" : ""}" data-action="pick-avatar" data-avatar="${a.id}" role="radio" aria-checked="${p.avatar === a.id}">${avatar("you", 56, { ...PEOPLE.you, ...a })}</button>`).join("")}</div>
      <label class="check-row"><input type="checkbox" id="profileAnim" ${p.animations !== false ? "checked" : ""}><span><b>Animasyonlar</b><small>Sinematik geçişler, diyalog busektleri ve kutlamalar</small></span></label>
      <div class="onboard-actions"><button class="ghost-button" data-action="back-welcome">Geri</button><button class="primary-button" data-action="finish-profile">İlk güne başla</button></div>
    </div>
    <div class="onboard-badge" aria-hidden="true"><div class="badge-card"><div class="badge-top">NEXORA<small>ANALYTICS</small></div>${avatar("you", 84)}<strong id="badgeName">${p.name || "Adın"}</strong><span>Veri Stajyeri</span><i class="badge-chip"></i></div></div>
  </div>`;
}
function viewFirstDay() {
  return `<div class="cine" id="cine">
    <div class="cine-sky" aria-hidden="true"></div>
    <div class="cine-lobby" aria-hidden="true">
      <div class="lobby-sign">NEXORA <small>ANALYTICS</small></div>
      <div class="elevator">
        <div class="el-display"><span class="el-arrow">▲</span><b id="floorDisplay">G</b></div>
        <div class="el-frame">
          <div class="el-inside" style="background-image:url('${OFFICE_IMAGE}')"></div>
          <div class="el-door left"></div><div class="el-door right"></div>
        </div>
      </div>
      <div class="reader"><span class="reader-light"></span><span class="reader-slot"></span></div>
      <div class="cine-badge">${avatar("you", 40)}<div><b>${playerName()}</b><small>Veri Stajyeri, 1. gün</small></div></div>
      <div class="lobby-floor"></div>
    </div>
    <div class="cine-caption">
      <span class="eyebrow" id="cineTime">08:47, Pazartesi</span>
      <h2 id="cineTitle">İlk günün lobide başlıyor.</h2>
      <p id="cineText">Güvenlik geçici kartını bastı. Maya seni 8. katta bekliyor.</p>
      <div class="cine-actions"><button class="primary-button" data-action="ride">Kartını okut ve asansöre bin</button><button class="link-button" data-action="skip-cine">Sahneyi atla</button></div>
    </div></div>`;
}
function viewInbox() {
  return `<div class="inbox-screen">
    <span class="eyebrow">İlk gün, 09:04</span><h2>Bir mesajın var, ${playerName()}.</h2>
    <article class="letter">
      ${speakerLine("maya")}
      <p class="bubble shown">Günaydın! Nexora'ya hoş geldin, ekipte olduğun için çok mutluyuz.</p>
      <p class="bubble shown" style="--i:1">Bakmamız gereken küçük bir konu var. Geçen ay satışlar düştü ve yönetim düşüşün nereden geldiğini anlamak istiyor.</p>
      <p class="bubble shown" style="--i:2">Merak etme, ilk incelemende sana adım adım eşlik edeceğim. Her soruda <b>Nasıl düşünmeliyim?</b>, <b>İpucu</b> ve gerekirse <b>Birlikte çöz</b> seçeneklerin olacak. Boş bir anında ofiste de dolaş; buradaki insanların bir veri insanına hep soruları olur.</p>
      <button class="primary-button" data-action="open-case" data-id="case001">Vaka 001'i aç</button>
    </article></div>`;
}
function viewOffice() {
  const c = activeCase(), promo = promoCase(), qs = openQuests();
  const tomorrow = CASES.find(x => caseState(x) === "tomorrow");
  let assign;
  if (player.finalePending) {
    assign = `<div class="assign-top"><span class="eyebrow">Maya'dan mesaj</span><span class="case-num">Toplantı odası</span></div><h3>“Toplantı odasına gelir misin?”</h3>
      <p>Terfi vakanı bitirdin. Maya seninle yüz yüze konuşmak istiyor.</p><button class="primary-button" data-action="go-finale">Toplantı odasına git</button>`;
  } else if (player.chapterDone) {
    const nx = nextChapterInfo();
    assign = `<span class="eyebrow">${player.chapter}. bölüm tamamlandı</span><h3>${ROLES[chapterNow() - 1].title}</h3><p>Ofiste dolaşmaya, yan görevleri bitirmeye devam edebilirsin. ${nx.text}</p><div class="btn-row">${nx.btn}<button class="ghost-button" data-nav="chapter">Bölüm özetini gör</button></div>`;
  } else if (!c && prepCase()) {
    const pc = prepCase(), pq = QUEST_BY_ID[pc.requires.find(q => !player.sideDone.includes(q))];
    assign = `<div class="assign-top"><span class="eyebrow">Önce hazırlık</span><span class="case-num">Vaka ${pc.num}</span></div><h3>${pc.title}</h3>
      <p>Vakaya başlamadan önce ${PEOPLE[pq.who].name.split(" ")[0]} seninle kısa bir hazırlık yapmak istiyor: <b>${pq.title}</b>. Gerçek işte de analiz, doğru soruyla başlar.</p>
      <button class="primary-button" data-action="open-quest" data-id="${pq.id}">Hazırlık görevini başlat</button>`;
  } else if (!c && player.dayPhase === "after") {
    assign = `<div class="assign-top"><span class="eyebrow">Bugünün vakası tamam</span>${tomorrow ? `<span class="case-num">Yarın: Vaka ${tomorrow.num}</span>` : ""}</div>
      <h3>İyi iş çıkardın.</h3><p>Ofiste dolaş, yan görevlere bak, insanlarla konuş. Hazır olduğunda günü bitir; yarın sabah ${tomorrow ? `<b>${tomorrow.title}</b> seni bekliyor` : "yeni bir gün başlıyor"}.</p>
      <button class="primary-button" data-action="end-day">${icon("save")}Günü bitir</button>`;
  } else if (c) {
    const pr = player.progress[c.id];
    assign = `<div class="assign-top"><span class="eyebrow">${c.promotion ? "Terfi vakası" : "Sıradaki görev"}</span><span class="case-num">Vaka ${c.num}</span></div>
      <h3>${c.title}</h3><p>${c.short}</p>
      <div class="learn-line">${icon("target")}<span>Öğreneceğin: <b>${c.concept.name}</b></span></div>
      <div class="case-tags">${c.tags.map(t => `<span>${t}</span>`).join("")}<span class="xp-tag">+${c.xp} XP</span></div>
      <button class="primary-button" data-action="open-case" data-id="${c.id}">${pr && pr.step > 0 ? `Devam et, adım ${pr.step + 1} / ${c.steps.length}` : "Vakayı başlat"}</button>`;
  } else if (caseState(promo) === "gated") {
    assign = `<div class="assign-top"><span class="eyebrow">Terfi vakası</span><span class="case-num locked">Kilitli</span></div><h3>${promo.title}</h3>
      <p>Maya terfi vakasını vermeden önce bu becerileri görmek istiyor. Ofisteki yan görevler oraya en hızlı yol.</p>
      <div class="req-list">${missingReq().map(([k, h, n]) => reqBar(k, h, n)).join("")}</div>
      <button class="ghost-button" data-nav="quests">Yan görevleri gör</button>`;
  } else {
    const nx = nextChapterInfo();
    assign = `<span class="eyebrow">${player.chapter}. bölüm</span><h3>Bu bölümün vakaları çözüldü</h3><p>${nx.text}</p><div class="btn-row">${nx.btn}<button class="ghost-button" data-nav="portfolio">Portföyünü gör</button></div>`;
  }
  const todo = [
    ...(c ? [{ done: false, t: `Vaka ${c.num}: ${c.title}`, xp: c.xp, act: `data-action="open-case" data-id="${c.id}"` }] : []),
    ...(!c && prepCase() ? [{ done: false, quest: true, t: `Hazırlık: ${QUEST_BY_ID[prepCase().requires.find(q => !player.sideDone.includes(q))].title}`, xp: 30, act: `data-action="open-quest" data-id="${prepCase().requires.find(q => !player.sideDone.includes(q))}"` }] : []),
    ...(canEndDay() ? [{ done: false, t: "Günü bitir ve ofisten çık", xp: 0, act: 'data-action="end-day"' }] : []),
    ...qs.slice(0, 4).map(q => ({ done: false, quest: true, t: q.title, xp: q.xp, act: `data-action="open-quest" data-id="${q.id}"`, where: HOTSPOTS[q.hot].label })),
    ...CASES.filter(x => isDone(x.id)).slice(-2).map(x => ({ done: true, t: `Vaka ${x.num}: ${x.title}`, xp: x.xp }))
  ];
  return `<div class="office-head">
      <div><span class="eyebrow">Nexora HQ, 8. kat, İstanbul</span><h2>${player.day}. gün, ${phase()}</h2></div>
      <div class="live-chips"><span class="live"><i></i>Canlı</span><span>${player.completed.length} / ${CASES.length} vaka</span><span class="${qs.length ? "amber" : ""}">${qs.length} açık yan görev</span>
      ${canEndDay() ? `<button class="end-day-btn" data-action="end-day">${icon("save")}Günü bitir</button>` : ""}</div>
    </div>
    ${player.pendingEvent ? (() => { const ev = EVENT_BY_ID[player.pendingEvent]; return `<div class="notify-card">${avatar(ev.who, 40)}<div><span>${ev.via === "slack" ? "Slack bildirimi" : `${PEOPLE[ev.who].name.split(" ")[0]} sana mesaj gönderdi`}</span><p>“${ev.notify}”</p></div><button class="primary-button small" data-action="open-event" data-id="${ev.id}">${ev.via === "slack" ? "Slack'e bak" : "Yanına git"}</button></div>`; })() : ""}
    <section class="stage-card">${officeStage()}
      <div class="stage-legend"><span><i class="lg lg-case">›</i>Görev</span><span><i class="lg lg-quest">!</i>Yan görev</span><span><i class="lg lg-talk">…</i>Konuşmak istiyor</span><span class="muted">Ofisteki kişilere ve nesnelere tıkla</span></div></section>
    <div class="office-grid">
      <section class="card assignment">${assign}</section>
      <section class="card today"><h3>Bugünün işleri</h3>
        <ul class="todo">${todo.map(t => `<li class="${t.done ? "done" : ""} ${t.quest ? "quest" : ""}"><button ${t.act || "disabled"}><span class="todo-box">${t.done ? icon("check") : t.quest ? "!" : ""}</span><span class="todo-text">${t.t}${t.where ? `<small>${t.where}</small>` : ""}</span>${t.xp ? `<b>+${t.xp} XP</b>` : ""}</button></li>`).join("")}</ul>
        ${QUESTS.some(q => questState(q) === "locked") ? `<p class="muted small">${QUESTS.filter(q => questState(q) === "locked").length} yan görev daha vakaları çözdükçe açılacak.</p>` : ""}
      </section>
    </div>
    <section class="card feed"><h3>Ofis günlüğü</h3>${player.feed.length ? `<ul>${player.feed.map(f => `<li><span>${f.day}. gün</span>${f.text}</li>`).join("")}</ul>` : `<p class="muted">Nexora'daki ilk sabahın başladı. Konuşmak istersen Maya hemen yakında.</p>`}</section>`;
}
function reqBar(k, have, need) {
  return `<div class="req-row"><span>${SKILLS[k].name}</span><div class="req-bar"><i style="width:${Math.min(100, have / need * 100)}%;background:${SKILLS[k].color}"></i></div><b class="${have >= need ? "met" : ""}">${have} / ${need}</b></div>`;
}
function viewQuests() {
  const miss = missingReq();
  const groups = [["available", "Şimdi yapılabilir"], ["done", "Tamamlananlar"], ["locked", "İleride açılacaklar"]];
  const card = q => {
    const st = questState(q), helps = st === "available" ? nodesHelpedBy(q.id) : [];
    return `<article class="quest-card ${st}">
      <div class="qc-top"><span class="qc-where">${icon(HOTSPOTS[q.hot].icon)}${HOTSPOTS[q.hot].label}</span><span class="xp-tag">+${q.xp} XP</span></div>
      <h3>${q.title}</h3><p>${st === "locked" ? `Vaka ${CASE_BY_ID[q.after].num} çözülünce açılır.` : q.lesson}</p>
      <div class="case-tags">${q.prep ? `<span class="needed">Hazırlık görevi</span>` : ""}${evidenceFrom(q.id).map(c => `<span>${c.name}</span>`).join("")}</div>
      ${helps.length ? `<div class="helps">Terfi kanıtı: ${helps.map(k => NODE_BY_ID[k].name).join(", ")}</div>` : ""}
      ${st === "locked" && q.trust && (!q.after || isDone(q.after)) ? `<p class="muted small">${PEOPLE[q.trust[0]].name.split(" ")[0]} sana biraz daha güvenince açılır.</p>` : ""}
      <div class="qc-foot">${st === "available" ? `<button class="primary-button small" data-action="open-quest" data-id="${q.id}">Yan görevi başlat</button>` : st === "done" ? `<span class="done-chip">${icon("check")}Tamamlandı</span>` : `<span class="muted small">Kilitli</span>`}</div></article>`;
  };
  return `${casesTabs("quests")}<div class="page-heading"><div><span class="eyebrow">Ofis işleri</span><h2>Yan görevler</h2><p>Dolgu değil: terfi için gereken becerileri tam da bunlar geliştirir. Ofiste bir noktayı bulamazsan buradan da başlatabilirsin.</p></div></div>
    ${miss.length ? `<section class="card gap-card"><div><span class="eyebrow">Terfi açığı</span><h3>${PROMOTION.title} için eksik kanıtlar</h3></div><div class="req-list">${miss.map(([k, h, n]) => reqBar(k, h, n)).join("")}</div></section>` : `<div class="success-banner">${icon("check")}Tüm beceri gereksinimleri karşılandı.</div>`}
    ${groups.map(([st, title]) => { const list = QUESTS.filter(q => questState(q) === st); return list.length ? `<div class="section-head"><h3>${title}</h3><span>${list.length}</span></div><div class="quest-grid">${list.map(card).join("")}</div>` : ""; }).join("")}`;
}
function viewCases() {
  return `<div class="page-heading"><div><span class="eyebrow">Vaka arşivi</span><h2>Görevlerin</h2><p>Her vaka bir sonraki rolün için kanıt biriktirir.</p></div><span class="pill">${player.completed.length} / ${CASES.length} çözüldü</span></div>
    ${casesTabs("cases")}
    <div class="case-path">${CASES.filter(c => (c.chapter || 1) <= Math.max(player.chapter || 1, chapterNow())).map((c, i) => {
      const st = caseState(c), pr = player.progress[c.id];
      const chip = { done: "Çözüldü", available: pr && pr.step > 0 ? "Devam ediyor" : "Açık", locked: "Kilitli", gated: "Kanıt gerekli", tomorrow: "Yarın", prep: "Hazırlık gerekli" }[st];
      const btn = st === "available" ? `<button class="primary-button small" data-action="open-case" data-id="${c.id}">${pr && pr.step > 0 ? "Devam et" : "Vakayı başlat"}</button>`
        : st === "done" ? `<button class="ghost-button small" data-action="revisit" data-id="${c.id}">Öğrendiklerini hatırla</button>`
        : st === "gated" ? `<button class="ghost-button small" data-nav="career">Gereksinimleri gör</button>`
        : st === "tomorrow" ? `<span class="muted small">${i + 1}. gün sabahı açılır</span>`
        : st === "prep" ? `<button class="ghost-button small" data-action="open-quest" data-id="${c.requires.find(q => !player.sideDone.includes(q))}">Önce hazırlık görevi</button>`
        : `<span class="muted small">Vaka ${CASE_BY_ID[c.after].num} çözülünce açılır</span>`;
      return `<article class="case-card ${st} ${c.promotion ? "promo" : ""}" style="--i:${i}">
        <div class="cc-rail"><span class="cc-dot">${st === "done" ? icon("check") : c.num.slice(-1)}</span></div>
        <div class="cc-body"><div class="cc-top"><span class="case-num">Vaka ${c.num}</span><span class="state ${st}">${chip}</span></div>
        <h3>${c.title}</h3><p>${c.short}</p>
        <div class="learn-line">${icon("target")}<span>Kavram: <b>${c.concept.name}</b> <i>(${c.concept.en})</i></span></div>
        <div class="cc-foot"><div class="difficulty" aria-label="Zorluk ${c.difficulty} / 3">${[1, 2, 3].map(k => `<i class="${k <= c.difficulty ? "on" : ""}"></i>`).join("")}</div><span class="xp-tag">+${c.xp} XP${player.firstTry.includes(c.id) ? ", bağımsız çözüm" : ""}</span>${btn}</div></div></article>`;
    }).join("")}
    <article class="case-card future"><div class="cc-rail"><span class="cc-dot">2</span></div><div class="cc-body"><div class="cc-top"><span class="case-num">Sıradaki bölüm</span><span class="state locked">Yakında</span></div><h3>${player.chapter >= 2 ? "Veri Analisti ve sonrası" : "Junior Veri Analisti: 8 yeni vaka"}</h3><p>${player.chapter >= 2 ? "Nedensellik, kohort analizi ve KVKK 3. bölümde. Kariyer haritasından önizlemeleri oynayabilirsin." : "SQL, KPI tanımı, belirsizlik ve ilk A/B testin. Terfiden sonra açılır."}</p></div></article>
    </div>`;
}
function viewCase() {
  const def = CASE_BY_ID[player.param];
  return `<div class="case-screen">
    <div class="case-head">
      <button class="back-link" data-nav="cases">← Tüm vakalar</button>
      <div class="case-title"><span class="eyebrow">Vaka ${def.num}${def.promotion ? ", terfi" : ""}</span><h2>${def.title}</h2></div>
      <div class="concept-chip">${icon("target")}<span>Bu vakanın kavramı: <b>${def.concept.name}</b></span></div>
      ${def.nodes ? `<div class="skills-in">${icon("target")}<span>Bu vakadaki yetenekler</span>${def.nodes.map(nodeChip).join("")}</div>` : ""}
      <ol class="stepper" id="caseStepper"></ol>
    </div>
    <div class="case-body" data-step-body>${stepHTML(def)}</div></div>`;
}
function renderCaseStepper(def) {
  const el = $("caseStepper"); if (!el || !def) return;
  const pr = prog(def.id);
  el.innerHTML = def.steps.map((s, i) => `<li class="${i < pr.step ? "done" : i === pr.step ? "now" : ""}"><i>${i < pr.step ? "✓" : i + 1}</i><span>${s.label || (s.type === "dialog" ? "Brifing" : "Adım")}</span></li>`).join("");
}
function viewDebrief() {
  const db = player.lastDebrief, def = CASE_BY_ID[db.id];
  const pct = db.steps ? Math.round(db.indep / db.steps * 100) : 0;
  return `<div class="debrief">
    <div class="debrief-hero"><div class="stamp big">Vaka çözüldü</div><span class="eyebrow">Vaka ${def.num}</span><h2>${def.title}</h2>
      ${db.bonus ? `<p class="first-try">${icon("quest")}Tüm adımları kendi başına çözdün: +${db.bonus} bonus XP</p>` : `<p class="muted">Rehberliği kullanmak öğrenmenin parçası. Bir sonraki vakada daha azına ihtiyacın olacak.</p>`}</div>
    <div class="debrief-grid">
      <section class="card concept"><span class="eyebrow">Öğrendiğin kavram</span><h3>${def.concept.name} <i>(${def.concept.en})</i></h3><p>${def.concept.text}</p>
        <ul class="points">${def.concept.points.map((p, i) => `<li style="--i:${i}">${icon("check")}${p}</li>`).join("")}</ul></section>
      <div class="debrief-side">
        <section class="card gains"><span class="eyebrow">Ödüller</span><div class="gain-list">${gainRows(db.gains)}<div class="gain-xp">+<b data-count="${db.xp + db.bonus}">0</b> XP</div></div></section>
        <section class="card learn-stats"><span class="eyebrow">Nasıl çözdün?</span>
          <div class="ring" style="--p:${pct}"><b>%${pct}</b><span>bağımsız</span></div>
          <ul><li><b>${db.indep} / ${db.steps}</b> adım yardımsız</li><li><b>${db.hints}</b> ipucu kullanıldı</li><li><b>${db.wrong}</b> yanlış deneme</li><li><b>${db.solves}</b> birlikte çözüm</li></ul></section>
      </div>
    </div>
    <div class="mentor-note">${avatar("maya", 52)}<div><span>Maya Chen, Analitik Müdürü</span><p>${def.mentor}</p></div></div>
    ${db.unlocks.length ? `<section class="unlocks"><h3>Ofiste yeni neler var?</h3>${db.unlocks.map((u, i) => `<div class="unlock ${u.kind}" style="--i:${i}"><i>${u.kind === "quest" ? "!" : "›"}</i><div><strong>${u.title}</strong><span>${u.where}</span></div></div>`).join("")}</section>` : ""}
    <button class="primary-button big" data-action="to-office">${def.promotion ? "Maya'nın mesajını aç" : "Ofise dön"}</button>
  </div>`;
}
function viewSkills() {
  return `<div class="page-heading"><div><span class="eyebrow">Yetkinlik haritası</span><h2>Yetenekler</h2><p>XP ne kadar çalıştığını, beceriler neyi yapabildiğini gösterir.</p></div><span class="pill">${meetsReq() ? "Terfiye hazır" : `${5 - missingReq().length} / 5 gereksinim karşılandı`}</span></div>
    <div class="skill-grid">${Object.entries(SKILLS).map(([k, s], i) => {
      const v = player.skills[k], need = PROMOTION.req[k];
      const src = [...CASES.filter(c => c.rewards[k]).map(c => ({ t: `Vaka ${c.num}: ${c.title}`, v: c.rewards[k], done: isDone(c.id), lock: caseState(c) === "locked" })),
        ...QUESTS.filter(q => q.rewards[k]).map(q => ({ t: `Yan görev: ${q.title}`, v: q.rewards[k], done: player.sideDone.includes(q.id), lock: questState(q) === "locked" }))];
      return `<section class="card skill-card" style="--c:${s.color};--i:${i}">
        <div class="skill-top"><h3>${s.name}</h3><strong data-count="${v}">0</strong></div>
        <div class="skill-bar-lg"><i style="width:${v}%"></i>${need && !player.promoted ? `<b class="need" style="left:${need}%" title="Terfi gereksinimi ${need}"></b>` : ""}</div>
        <p class="muted small">${need && !player.promoted ? `${PROMOTION.title} için ${need} gerekli` : "Bir sonraki rol için zorunlu değil"}</p>
        <ul class="sources">${src.map(x => `<li class="${x.done ? "done" : x.lock ? "lock" : ""}"><span>${x.done ? "✓" : x.lock ? "·" : "○"}</span>${x.t}<b>+${x.v}</b></li>`).join("")}</ul></section>`;
    }).join("")}</div>`;
}
function viewCareer() {
  const cur = player.promoted ? 1 : 0;
  return `<div class="page-heading"><div><span class="eyebrow">Kariyer yolu</span><h2>Stajyerden Veri Direktörüne</h2><p>Terfiler XP ile değil, gösterilmiş beceriyle kazanılır.</p></div><span class="pill">Rol ${cur + 1} / ${ROLES.length}</span></div>
    <ol class="roadmap">${ROLES.map((r, i) => `<li class="${i < cur ? "past" : i === cur ? "current" : i === cur + 1 ? "next" : "locked"}" style="--i:${i}">
      <span class="rm-dot">${i < cur ? "✓" : i + 1}</span>
      <div><span class="rm-state">${i < cur ? "Tamamlandı" : i === cur ? "Şu anki rolün" : i === cur + 1 ? "Sıradaki rol" : "İleride"}</span><h3>${r.title}</h3><p>${r.text}</p>
      ${i === 1 && !player.promoted ? `<div class="req-list">${Object.entries(PROMOTION.req).map(([k, n]) => reqBar(k, player.skills[k], n)).join("")}</div><p class="muted small">Ayrıca: Vaka 001–005'i çöz ve terfi vakasını geç.</p>` : ""}</div></li>`).join("")}</ol>`;
}
function viewPortfolio() {
  const projects = CASES.filter(c => isDone(c.id)), side = QUESTS.filter(q => player.sideDone.includes(q.id));
  return `<div class="page-heading"><div><span class="eyebrow">Profesyonel profil</span><h2>Portföy</h2><p>Gerçekten tamamladığın işlerden oluşur.</p></div><span class="pill">${projects.length} proje</span></div>
    <section class="portfolio-hero"><div class="ph-left">${avatar("you", 64)}<div><h3>${playerName()}</h3><p>${player.career}, Nexora Analytics, ${Math.max(0, player.day - 1)} iş günü</p></div></div>
      <div class="ph-stats"><div><strong data-count="${player.xp}">0</strong><span>Kariyer XP</span></div><div><strong>${projects.length}</strong><span>Vaka</span></div><div><strong>${side.length}</strong><span>Yan görev</span></div><div><strong>${player.stats.independent}</strong><span>Yardımsız adım</span></div></div></section>
    <div class="portfolio-grid">${projects.map(c => `<article class="card project"><span class="eyebrow">Vaka ${c.num}</span><h3>${c.portfolio.title}</h3><p>${c.portfolio.text}</p><div class="case-tags">${c.tags.map(t => `<span>${t}</span>`).join("")}</div></article>`).join("") ||
      `<article class="card project empty"><h3>İlk projen burada görünecek.</h3><p>Eklemek için Vaka 001'i çöz.</p><button class="primary-button small" data-action="open-case" data-id="case001">Vaka 001'i aç</button></article>`}</div>
    <div class="debrief-grid pf-extra"><section class="card"><h3>İlişkiler</h3>${relationsHTML()}</section><section class="card"><h3>Başarımlar <small class="muted">${player.achievements.length} / ${Object.keys(ACHIEVEMENTS).length}</small></h3>${achievementsHTML()}</section></div>
    ${side.length ? `<section class="card side-work"><h3>Yan işler</h3><ul>${side.map(q => `<li><strong>${q.title}</strong><span>${q.lesson}</span></li>`).join("")}</ul></section>` : ""}`;
}
function viewPromotion() {
  return `<div class="promotion">
    <div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 9) * 0.12}s;--c:${Object.values(SKILLS)[i % 6].color};--r:${(i * 47) % 360}deg"></i>`).join("")}</div>
    <span class="eyebrow">Kariyer güncellemesi</span>
    <div class="career-update"><span class="cu-old">${ROLES[player.chapter - 1].title}</span><span class="cu-arrow">↓</span><span class="cu-new">${PROMOTION.title}</span></div>
    <p>${player.day} iş günü, ${player.sideDone.length} yan görev ve ${fmtNum(player.xp)} XP. Maya adını ${player.chapter === 2 ? "kurul sunumu listesine" : "analist ekibinin kapısına"} çoktan yazdı.</p>
    <div class="new-badge"><div class="badge-card gold"><div class="badge-top">NEXORA<small>ANALYTICS</small></div>${avatar("you", 84)}<strong>${playerName()}</strong><span>${PROMOTION.title}</span><i class="badge-chip"></i></div></div>
    <div class="modal-actions center"><button class="primary-button big" data-action="end-day">Günü bitir</button><button class="ghost-button" data-nav="portfolio">Portföyü gör</button></div>
  </div>`;
}
function viewSettings() {
  const p = player.profile;
  const when = player.checkpointAt ? new Date(player.checkpointAt).toLocaleString("tr-TR") : "Henüz yok";
  return `<div class="page-heading"><div><span class="eyebrow">Oyuncu</span><h2>Ayarlar ve kayıt</h2><p>İlerlemen her adımda otomatik kaydedilir. İstersen ayrıca bir kontrol noktası oluşturabilirsin.</p></div></div>
    <div class="settings-grid">
      <section class="card"><h3>Profil</h3>
        <label class="field-label" for="setName">Görünen ad</label><input id="setName" class="text-input" maxlength="24" value="${p.name || ""}">
        <span class="field-label">Avatar</span>
        <div class="avatar-picker small">${AVATARS.map(a => `<button class="avatar-choice ${p.avatar === a.id ? "selected" : ""}" data-action="pick-avatar" data-avatar="${a.id}" aria-label="Avatar ${a.id}">${avatar("you", 44, { ...PEOPLE.you, ...a })}</button>`).join("")}</div>
        <button class="ghost-button" data-action="save-profile">Profili kaydet</button></section>
      <section class="card"><h3>Kayıt</h3>
        <div class="kv"><span>Otomatik kayıt</span><b>Açık</b></div>
        <div class="kv"><span>Mevcut ilerleme</span><b>${player.completed.length} vaka, ${player.xp} XP</b></div>
        <div class="kv"><span>Son kontrol noktası</span><b>${when}</b></div>
        <div class="btn-row"><button class="primary-button" data-action="checkpoint-save">${icon("save")}Kontrol noktası oluştur</button><button class="ghost-button" data-action="checkpoint-load" ${hasCheckpoint() ? "" : "disabled"}>Kontrol noktasına dön</button></div></section>
      <section class="card"><h3>Deneyim</h3>
        <label class="check-row"><input type="checkbox" id="setAnim" ${p.animations !== false ? "checked" : ""} data-action="toggle-anim"><span><b>Animasyonlar</b><small>Geçişler, diyalog busektleri ve kutlamalar. Sistemde 'hareketi azalt' açıksa her zaman kapalıdır.</small></span></label></section>
      <section class="card danger"><h3>Kariyeri sıfırla</h3><p class="muted">Bu tarayıcıdaki tüm ilerlemeyi ve kontrol noktasını siler.</p><button class="danger-button" data-action="reset-ask">Kariyeri sıfırla</button></section>
    </div>`;
}
function viewRightPanel() {
  const miss = missingReq(), inboxQuest = questState(QUEST_BY_ID.sq_inbox) === "available";
  return `<section class="rp-block"><div class="rp-head"><span>Mesajlar</span>${player.unread ? `<b class="unread">${player.unread}</b>` : ""}</div>
      ${inboxQuest ? `<button class="mini-msg urgent" data-action="open-quest" data-id="sq_inbox">${avatar("zeynep", 34)}<div><strong>Zeynep <em>acil</em></strong><p>Toplantı için müşteri performansını gönderebilir misin?</p></div></button>` : ""}
      ${player.inbox.slice(0, 3).map(m => `<div class="mini-msg">${avatar(m.from, 34)}<div><strong>${PEOPLE[m.from].name.split(" ")[0]}</strong><p>${m.text}</p></div></div>`).join("")}
      ${!player.inbox.length && !inboxQuest ? `<p class="muted small">Henüz mesaj yok.</p>` : ""}
      <button class="ghost-button small wide-btn" data-action="open-slack">Slack'i aç</button></section>
    <section class="rp-block"><div class="rp-head"><span>Yetenek gelişimi</span></div>
      ${Object.entries(SKILLS).map(([k, s]) => `<div class="rp-skill"><div><span>${s.name}</span><b>${player.skills[k]}</b></div><div class="mini-bar"><i style="width:${player.skills[k]}%;background:${s.color}"></i>${PROMOTION.req[k] && !player.promoted ? `<b style="left:${PROMOTION.req[k]}%"></b>` : ""}</div></div>`).join("")}
      ${player.promoted ? "" : `<p class="muted small">Çizgiler terfi gereksinimini gösterir.</p>`}</section>
    <section class="rp-block"><div class="rp-head"><span>İlişkiler</span></div>${relationsHTML()}</section>
    <section class="rp-block next-role"><div class="rp-head"><span>${player.promoted ? "Şu anki rol" : "Sıradaki rol"}</span></div><strong>${PROMOTION.title}</strong>
      <div class="mini-bar big"><i style="width:${player.promoted ? 100 : (5 - miss.length) / 5 * 100}%"></i></div>
      <p class="muted small">${player.promoted ? "Kazanıldı. Tebrikler." : `${5 - miss.length} / 5 beceri gereksinimi karşılandı`}</p></section>`;
}

/* =====================================================================
   GÜN SİSTEMİ EKRANLARI
   ===================================================================== */
function sceneHTML(kind, m) {
  if (kind === "rain") return `<div class="scene-art rain" style="--img:url('${OFFICE_IMAGE}')"><div class="rain-layer"></div><div class="rain-layer far"></div><div class="steam-cup"><i></i><i></i><i></i></div></div>`;
  if (kind === "laptop") return `<div class="scene-art desk-bg" style="--img:url('${OFFICE_IMAGE}')"><div class="laptop"><div class="lid"><div class="screen-in"><div class="boot">NEXORA</div>
      <div class="notifs">${(m.notifications || []).map(([w, t], i) => `<div class="notif" style="--i:${i}">${avatar(w, 22)}<div><b>${PEOPLE[w].name.split(" ")[0]}</b><span>${t}</span></div></div>`).join("")}</div></div></div><div class="base"></div></div>
      <div class="unread-pill">${(m.notifications || []).length} okunmamış mesaj</div></div>`;
  if (kind === "standup") return `<div class="scene-art meeting" style="--img:url('${OFFICE_IMAGE}')"><div class="call-grid">${["maya", "alex", "zeynep", "deniz", "you"].map((w, i) => `<div class="call-tile" style="--i:${i}">${avatar(w, 64)}<span>${w === "you" ? playerName() : PEOPLE[w].name.split(" ")[0]}</span></div>`).join("")}</div><div class="call-bar"><i></i>09:15 Analytics Daily</div></div>`;
  if (kind === "urgent") return `<div class="scene-art urgent" style="--img:url('${OFFICE_IMAGE}')"><div class="phone"><div class="phone-notch"></div><div class="phone-msg">${avatar("zeynep", 30)}<div><b>Zeynep Acar</b><span>ACİL!! CEO soruyor, hemen bakabilir misin?</span></div></div></div></div>`;
  if (kind === "timeskip") { const cm = CAREER_MAP[(player.chapter || 2) - 1], mo = { 2: ["Eylül", "Aralık"], 3: ["Aralık", "Kasım"] }[player.chapter] || ["", ""]; return `<div class="scene-art timeskip" style="--img:url('${OFFICE_IMAGE}')"><div class="ts-clock"><span>${mo[0]}</span><i>→</i><span>${mo[1]}</span></div><div class="ts-big">${cm.time}</div><div class="ts-badge">${avatar("you", 44)}<div><b>${playerName()}</b><small>${cm.role}</small></div></div></div>`; }
  if (kind === "promo") return `<div class="scene-art promo" style="--img:url('${OFFICE_IMAGE}')"><div class="approach">${avatar("maya", 110)}</div></div>`;
  if (kind === "meeting") return `<div class="scene-art meetroom" style="--img:url('${OFFICE_IMAGE}')"><div class="table-top"></div><div class="seat left">${avatar("maya", 84)}</div><div class="seat right">${avatar("you", 84)}</div></div>`;
  return "";
}
function viewMorning() {
  const def = MORNING_DEFS[`morning${player.day}`], m = def;
  return `<div class="morning">
    <div class="scene-wrap">${sceneHTML(m.scene, m)}
      <div class="scene-caption"><span class="eyebrow">${m.time}, ${weekday(player.day)}, ${player.day}. gün</span><h2>${m.title}</h2><p>${m.text}</p></div>
      <button class="skip-btn" data-action="skip-morning">Sahneyi atla ›</button></div>
    <div class="morning-body" data-step-body>${stepHTML(def)}</div></div>`;
}
function runMorningScene() {
  const w = document.querySelector(".scene-art"); if (!w) return;
  if (!animOn()) { w.classList.add("play", "done"); return; }
  requestAnimationFrame(() => w.classList.add("play"));
}
function viewFinale() {
  return `<div class="morning finale">
    <div class="scene-wrap">${sceneHTML("meeting")}
      <div class="scene-caption"><span class="eyebrow">17:40, toplantı odası</span><h2>Maya seni bekliyor</h2><p>Kapıyı kapatıyorsun. Masada iki kahve ve kapalı bir dosya var.</p></div></div>
    <div class="morning-body" data-step-body>${stepHTML(FINALE)}</div></div>`;
}
function viewDayEnd() {
  const t = player.today, c = t.caseId && CASE_BY_ID[t.caseId], ev = EVENINGS[player.day], chosen = player.evening[player.day];
  const skills = Object.entries(t.skills).filter(([, v]) => v > 0);
  const qsAvail = QUESTS.filter(q => questState(q) !== "locked").length;
  return `<div class="dayend">
    <div class="de-clock">18:12, Nexora Analytics</div>
    <div class="stamp big">${player.day}. gün tamamlandı</div>
    <div class="de-grid">
      <section class="card de-report"><span class="eyebrow">Bugün</span>
        ${c ? `<div class="de-case"><span>Çözülen vaka</span><strong>${c.title}</strong></div>` : ""}
        <div class="de-xp">+<b data-count="${t.xp}">0</b> XP</div>
        <ul class="de-skills">${skills.map(([k, v]) => `<li><span>${SKILLS[k].name}</span><b style="color:${SKILLS[k].color}">+${v}</b></li>`).join("") || "<li><span>Beceri artışı yok</span><b></b></li>"}</ul>
        <ul class="de-stats"><li><b>${t.quests}</b><span>yan görev (${player.sideDone.length} / ${qsAvail} açık)</span></li><li><b>${t.decisions}</b><span>karar</span></li><li><b>${t.firstTry}</b><span>ilk denemede doğru</span></li><li><b>${t.events}</b><span>ofis anı</span></li></ul>
      </section>
      <section class="card de-maya">${avatar("maya", 52)}<p>“${mayaEveningLine()}”</p><span>Maya Chen</span></section>
    </div>
    ${ev ? `<section class="card evening"><span class="eyebrow">18:20</span><h3>Maya: “Ben çıkıyorum. Yarın devam ederiz.”</h3>
      ${chosen === undefined ? `<p class="muted small">Ne yaparsın? Fazladan kalmak her zaman daha iyi değildir.</p><div class="ev-opts">${ev.map((o, i) => `<button class="option" data-action="evening" data-opt="${i}"><span class="opt-key">${"ABC"[i]}</span><span class="opt-text">${o.label}</span></button>`).join("")}</div>`
        : `<div class="ev-result"><b>${ev[chosen].label}</b><p>${ev[chosen].result}</p></div>`}</section>` : ""}
    <button class="primary-button big" data-action="leave" ${ev && chosen === undefined ? "disabled" : ""}>${icon("save")}Kaydet ve ofisten çık</button>
  </div>`;
}
function viewLeave() {
  return `<div class="leave" id="leave" style="--img:url('${OFFICE_IMAGE}')">
    <div class="leave-office"></div><div class="leave-laptop"><div class="lid"></div><div class="base"></div></div>
    <div class="leave-doors"><i></i><i></i></div>
    <div class="leave-text"><span>${player.chapterDone ? "1. bölüm" : `${weekday(player.day)}, 18:14`}</span><h2>${player.chapterDone ? "İlk haftan tamamlandı" : "Ofisin ışıkları sönüyor"}</h2><p>İlerlemen kaydedildi.</p></div>
    <button class="skip-btn" data-action="next-morning">Devam ›</button></div>`;
}
let leaveTimer;
function runLeave() {
  clearTimeout(leaveTimer);
  const el = $("leave"); if (!el) return;
  if (!animOn()) { el.classList.add("play", "end"); leaveTimer = setTimeout(nextMorning, 900); return; }
  requestAnimationFrame(() => el.classList.add("play"));
  setTimeout(() => el.classList.add("end"), 2300);
  leaveTimer = setTimeout(() => { if (player.screen === "leave") nextMorning(); }, 4200);
}
function relationsHTML() {
  return TRUST_PEOPLE.map(k => `<div class="rel">${avatar(k, 30)}<div><b>${PEOPLE[k].name.split(" ")[0]}</b><span>${TRUST_LEVELS[k][trustLevel(k)]}</span></div><i class="rel-dots">${[0, 1, 2, 3].map(l => `<em class="${l <= trustLevel(k) ? "on" : ""}"></em>`).join("")}</i></div>`).join("");
}
function achievementsHTML() {
  return `<div class="ach-grid">${Object.entries(ACHIEVEMENTS).map(([k, a]) => `<div class="ach ${player.achievements.includes(k) ? "on" : ""}">${icon("quest")}<div><b>${player.achievements.includes(k) ? a.t : "???"}</b><span>${player.achievements.includes(k) ? a.d : "Henüz açılmadı"}</span></div></div>`).join("")}</div>`;
}
function viewChapter() {
  const ch = player.chapter, log = player.dayLog.filter(d => d.day >= CH_START[ch] && (!CH_START[ch + 1] || d.day < CH_START[ch + 1]));
  return `<div class="chapter">
    <span class="eyebrow">${ch}. bölüm tamamlandı</span><h2>${{ 1: "Nexora'daki ilk haftan", 2: "Junior Veri Analisti olarak iki haftan", 3: "Veri Analisti olarak iki buçuk haftan" }[ch] || "Bu bölüm"}</h2>
    <p class="muted">${ch < ROLES.length ? `${ROLES[ch - 1].title} olarak başladın, ${ROLES[ch].title} olarak devam ediyorsun.` : `${ROLES[ch - 1].title} olarak DATA TYCOON kariyer yolculuğunu tamamladın.`}</p>
    ${PROMOTIONS[ch + 1] ? `<div class="next-chapter"><div><span class="eyebrow">Sıradaki: ${ch + 1}. bölüm, ${CAREER_MAP[ch].time}</span><h3>${ROLES[ch].title}</h3><p>${CAREER_MAP[ch].axis}</p></div><button class="primary-button big" data-action="start-chapter" data-ch="${ch + 1}">${ch + 1}. bölüme başla</button></div>`
      : ch === 8 ? `<div class="next-chapter"><div><span class="eyebrow">KARİYER TAMAMLANDI</span><h3>Veri Direktörü</h3><p>59 ana vaka boyunca veriyi okumaktan şirketin Data & AI stratejisini yönetmeye ulaştın.</p></div><button class="ghost-button" data-nav="career">Kariyer haritası</button></div>`
      : `<div class="next-chapter"><div><span class="eyebrow">Sıradaki bölüm</span><h3>Hazırlanıyor</h3><p>Kariyer haritasından planı inceleyebilirsin.</p></div><button class="ghost-button" data-nav="career">Kariyer haritası</button></div>`}
    <div class="week" style="grid-template-columns:repeat(${Math.max(1, log.length)},minmax(0,1fr))">${log.map(d => `<div class="wk-day"><span>${weekday(d.day)}</span><b>${d.case ? CASE_BY_ID[d.case].title : "—"}</b><small>+${d.xp} XP, ${d.quests} yan görev</small></div>`).join("")}</div>
    <div class="debrief-grid"><section class="card"><span class="eyebrow">İlişkiler</span>${relationsHTML()}</section>
      <section class="card"><span class="eyebrow">Başarımlar, ${player.achievements.length} / ${Object.keys(ACHIEVEMENTS).length}</span>${achievementsHTML()}</section></div>
    <div class="modal-actions center"><button class="primary-button big" data-action="to-office">Ofiste dolaşmaya devam et</button><button class="ghost-button" data-nav="portfolio">Portföy</button></div>
  </div>`;
}

function casesTabs(active) {
  return `<div class="tabs-row" role="tablist"><button role="tab" aria-selected="${active === "cases"}" class="${active === "cases" ? "on" : ""}" data-nav="cases">Ana vakalar</button><button role="tab" aria-selected="${active === "quests"}" class="${active === "quests" ? "on" : ""}" data-nav="quests">Yan görevler <b>${openQuests().length}</b></button></div>`;
}

function nextChapterInfo() {
  const n = (player.chapter || 1) + 1, cm = CAREER_MAP[n - 1];
  if (!cm) return { text: "Kariyerinin sonuna ulaştın.", btn: "" };
  if (PROMOTIONS[n] && player.chapterDone) return { text: `${n}. bölüm hazır: ${cm.time} ${cm.role} olarak devam ediyorsun.`, btn: `<button class="primary-button" data-action="start-chapter" data-ch="${n}">${n}. bölüme başla</button>` };
  if (PROMOTIONS[n]) return { text: `Terfiden sonra ${n}. bölüm açılır: ${cm.role}.`, btn: "" };
  return { text: `${n}. bölüm (${cm.role}: ${cm.axis}) hazırlanıyor. Kariyer haritasından önizlemesini oynayabilirsin.`, btn: `<button class="ghost-button" data-nav="career">Kariyer haritası</button>` };
}

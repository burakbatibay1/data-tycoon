
/* =====================================================================
   OLAYLAR
   ===================================================================== */
function mayaTalk() {
  const promo = promoCase(), c = activeCase();
  if (player.promoted) { const nx = nextChapterInfo(); return openStory("maya", "Maya'nın bir dakikası var", `“Bu dönemi kapattık, gurur duyuyorum. ${PROMOTIONS[player.chapter + 1] ? "Bir sonraki dönem hazır; bölüm sonu ekranından başlayabiliriz." : "Bir sonraki dönemin planlaması sürüyor; o zamana kadar ofis senin."}”`, nx.btn ? [{ label: PROMOTIONS[player.chapter + 1] && player.chapterDone ? `${player.chapter + 1}. bölüme başla` : "Kariyer haritası", attrs: PROMOTIONS[player.chapter + 1] && player.chapterDone ? `data-action="start-chapter" data-ch="${player.chapter + 1}"` : 'data-nav="career"', primary: true }, { label: "Kapat", attrs: 'data-action="close-modal"' }] : []); }
  if (caseState(promo) === "gated") {
    const miss = missingReq(), sugg = openQuests().filter(q => nodesHelpedBy(q.id).length);
    return openStory("maya", "Terfi vakasından önce", `<p>“Bütün vakaları çözdün. Terfi vakasını vermeden önce bu alanlarda biraz daha kanıt görmek istiyorum:”</p>
      <div class="req-list">${miss.map(([k, h, n]) => reqBar(k, h, n)).join("")}</div>
      ${sugg.length ? `<p>“Ofisteki insanlara yardım et. Bunlar seni oraya götürür:”</p><div class="sugg">${sugg.map(q => `<button class="rp-quest" data-action="open-quest" data-id="${q.id}"><i>!</i><span>${q.title}<small>${HOTSPOTS[q.hot].label}</small></span></button>`).join("")}</div>` : ""}`,
      [{ label: "Yan görevleri aç", attrs: 'data-nav="quests"', primary: true }, { label: "Sonra", attrs: 'data-action="close-modal"' }]);
  }
  if (c) return openStory("maya", "Maya'nın bir dakikası var", `“Sıradaki görevin <b>Vaka ${c.num}: ${c.title}</b>. ${c.short} Bu vakada <b>${c.concept.name}</b> üzerine çalışacaksın. Ne kadar hızlı tıkladığın değil, nasıl düşündüğün önemli; takılırsan ipuçlarını kullan.”`,
    [{ label: "Vakayı aç", attrs: `data-action="open-case" data-id="${c.id}"`, primary: true }, { label: "Sonra", attrs: 'data-action="close-modal"' }]);
  return openStory("maya", "Maya'nın bir dakikası var", "“Böyle devam.”");
}
function onHot(key) {
  if (key === "maya" && player.finalePending) return go("finale");
  const ev = player.pendingEvent && EVENT_BY_ID[player.pendingEvent];
  if (ev && ev.who === key) return openEvent(ev.id);
  if (key === "coffee") {
    player.coffee[player.day] = (player.coffee[player.day] || 0) + 1;
    if (player.coffee[player.day] === 10) unlockAch("caffeine");
    if (player.coffee[player.day] >= 5 && !QUESTS.some(q => q.hot === "coffee" && questState(q) === "available")) { save(true); return openStory(null, "Kahve Makinesi", `Bugün ${player.coffee[player.day]}. kahven. Makine sana endişeyle bakıyor gibi.`); }
  }
  if (key === "window") {
    player.windowViews++; if (player.windowViews >= 4) unlockAch("window"); save(true);
    const H = HOTSPOTS.window; return openStory(null, "Pencere", H.ambient[(player.day + (player.dayPhase === "after" ? 3 : 0)) % H.ambient.length]);
  }
  if (key === "lounge" && player.day === 5 && player.dayPhase === "after" && !QUESTS.some(q => q.hot === "lounge" && questState(q) === "available")) return openStory(null, "Dinlenme Alanı", HOTSPOTS.lounge.eveningFriday);
  if (key === "desk") { const c = activeCase(); if (c) return go("case", c.id); const pc = prepCase(); if (pc) return openQuest(pc.requires.find(q => !player.sideDone.includes(q))); return go("cases"); }
  if (key === "whiteboard" && !QUESTS.some(q => q.hot === "whiteboard" && questState(q) === "available")) return devPlan();
  const q = QUESTS.find(q => q.hot === key && questState(q) === "available");
  if (q) return openQuest(q.id);
  if (key === "maya") return mayaTalk();
  const H = HOTSPOTS[key];
  if (H.locked && isHotLocked(key)) return openStory(null, H.label, H.locked);
  const amb = H.ambient || ["Burada yeni bir şey yok."];
  openStory(null, H.label, amb[(player.day + player.sideDone.length) % amb.length]);
}
function startCareerFresh() {
  showTitle = false;
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(CHECKPOINT_KEY); } catch (e) { /* yok say */ }
  const anim = player.profile.animations;
  player = freshPlayer(); player.profile.animations = anim; player.screen = "profile"; save(true); closeModal(); render();
  focusIn("#profileName");
}
function rideElevator(btn) {
  btn.disabled = true;
  const cine = $("cine"), disp = $("floorDisplay");
  const finish = () => { player.started = true; player.day = 1; addInbox("maya", "Nexora'ya hoş geldin! İlk vakan seni bekliyor."); go("inbox"); };
  if (!animOn()) { finish(); return; }
  cine.classList.add("swipe");
  setTimeout(() => {
    cine.classList.add("riding"); $("cineTitle").textContent = "Yukarı çıkıyorsun…"; $("cineText").textContent = "Kartın onaylandı. Kapılar kapanıyor.";
    let f = 0;
    const t = setInterval(() => {
      f++; disp.textContent = String(f);
      if (f >= 8) {
        clearInterval(t);
        cine.classList.add("arrived"); $("cineTime").textContent = "08:52, 8. kat";
        $("cineTitle").textContent = "8. kat. Analitik."; $("cineText").textContent = "Kapılar açılıyor. Maya elinde bir dizüstü ve bir kahveyle sana doğru geliyor.";
        setTimeout(() => cine.classList.add("enter"), 1500);
        setTimeout(finish, 2500);
      }
    }, 300);
  }, 1100);
}

document.addEventListener("input", e => {
  if (e.target.id === "profileName") { const b = $("badgeName"); if (b) b.textContent = e.target.value.trim() || "Adın"; e.target.classList.remove("input-error"); }
});
document.addEventListener("click", e => {
  if (e.target === $("modal")) { closeModal(); return; }
  const hotEl = e.target.closest("[data-hot]");
  if (hotEl && !hotEl.closest(".is-static")) { onHot(hotEl.dataset.hot); return; }
  const el = e.target.closest("[data-action],[data-nav]"); if (!el || el.disabled) return;
  if (el.dataset.nav && !el.dataset.action) { closeModal(); go(el.dataset.nav); return; }
  const def = el.dataset.def && defOf(el.dataset.def);
  switch (el.dataset.action) {
    case "continue": showTitle = false; player = loadPlayer(); if (player.started && (PRE_START.includes(player.screen) || player.screen === "case")) player.screen = player.screen === "case" ? "case" : "office"; render(); break;
    case "new-career":
      if (hasSave()) openStory(null, "Yeni kariyer başlatılsın mı?", "<p>Bu cihazdaki mevcut kariyerin ve kontrol noktan silinecek. Bu işlem geri alınamaz.</p>",
        [{ label: "Evet, yeni kariyer", attrs: 'data-action="confirm-new"', primary: true }, { label: "Vazgeç", attrs: 'data-action="close-modal"' }]);
      else startCareerFresh();
      break;
    case "confirm-new": startCareerFresh(); break;
    case "start-chapter": startChapter(+el.dataset.ch); break;
    case "back-welcome": player.screen = "welcome"; render(); break;
    case "pick-avatar": {
      player.profile.avatar = el.dataset.avatar;
      document.querySelectorAll(".avatar-choice").forEach(b => { const on = b.dataset.avatar === el.dataset.avatar; b.classList.toggle("selected", on); b.setAttribute("aria-checked", on); });
      const badge = document.querySelector(".badge-card .avatar"); if (badge) badge.outerHTML = avatar("you", 84);
      save(true); break;
    }
    case "finish-profile": {
      const inp = $("profileName"), name = (inp.value || "").trim();
      if (!name) { inp.classList.add("input-error"); inp.focus(); toast("Lütfen adını yaz"); return; }
      player.profile.name = name; player.profile.animations = $("profileAnim").checked;
      player.screen = "firstday"; save(true); render(); break;
    }
    case "ride": rideElevator(el); break;
    case "skip-cine": player.started = true; player.day = 1; addInbox("maya", "Nexora'ya hoş geldin! İlk vakan seni bekliyor."); go("inbox"); break;
    case "open-case": closeModal(); go("case", el.dataset.id); break;
    case "open-quest": openQuest(el.dataset.id); break;
    case "open-event": openEvent(el.dataset.id); break;
    case "open-slack": openSlack(); break;
    case "go-finale": go("finale"); break;
    case "end-day": closeModal(); if (canEndDay()) go("dayend"); break;
    case "evening": chooseEvening(+el.dataset.opt); break;
    case "leave": leaveOffice(); break;
    case "next-morning": clearTimeout(leaveTimer); nextMorning(); break;
    case "skip-morning": { const d = MORNING_DEFS[`morning${player.day}`], pr = prog(d.id); dialogToken++;
      while (pr.step < d.steps.length && d.steps[pr.step].type === "dialog") pr.step++;
      if (pr.step >= d.steps.length) completeMorning(d); else { save(true); render(); } break; }
    case "pick": pickAnswer(def, el.dataset.key, el); break;
    case "builder-run": builderRun(def, el); break;
    case "vis-step": { const d = stepDefFrom(el); if (d) { const pr = prog(d.id); pr.data[el.dataset.key] = (pr.data[el.dataset.key] || 0) + 1; save(true); rerender(d, "both"); } break; }
    case "tree-node": treeSelect(el.dataset.id); break;
    case "tree-close": treeSelect(null); break;
    case "tree-zoom": treeZoom(+el.dataset.z); break;
    case "tree-fit": treeFit(); break;
    case "tree-goto": closeModal(); treeView.sel = el.dataset.id; if (player.screen === "tree") treeSelect(el.dataset.id); else go("tree"); break;
    case "nb-node": nbFocus = el.dataset.id; go("notebook"); break;
    case "note-open": openNote(el.dataset.id); break;
    case "play-preview": { closeModal(); const id = el.dataset.id; delete player.progress[id]; go("preview", id); break; }
    case "reply": replyAnswer(def, +el.dataset.opt); break;
    case "answer": answer(def, +el.dataset.opt, el); break;
    case "next-step": nextStep(def); break;
    case "think": toggleThink(def); break;
    case "hint": revealHint(def); break;
    case "solve": revealSolve(def); break;
    case "dialog-skip": skipDialog(el.closest("[data-dialog]")); break;
    case "pick-tag": prog(def.id).data.active = el.dataset.tag; save(true); rerender(def, "stage"); break;
    case "tag-row": tagRow(def, +el.dataset.row); break;
    case "tag-check": tagCheck(def); break;
    case "toggle": toggleSwitch(def, el.dataset.key); break;
    case "vis-toggle": { const d = stepDefFrom(el); if (d) { const pr = prog(d.id); pr.data[el.dataset.key] = !pr.data[el.dataset.key]; save(true); rerender(d, "both"); } break; }
    case "to-office": go("office"); break;
    case "to-promotion": go("promotion"); break;
    case "close-modal": closeModal(); break;
    case "mark-read": player.unread = 0; save(); render(); break;
    case "revisit": { const c = CASE_BY_ID[el.dataset.id]; openStory("maya", `${c.concept.name}`, `<p>${c.concept.text}</p><ul class="points">${c.concept.points.map(p => `<li>${icon("check")}${p}</li>`).join("")}</ul><p class="quote">“${c.mentor}”</p>`); break; }
    case "save-profile": { const n = ($("setName").value || "").trim(); if (n) player.profile.name = n; save(); render(); toast("Profil kaydedildi"); break; }
    case "toggle-anim": player.profile.animations = el.checked; save(); render(); break;
    case "checkpoint-save": saveCheckpoint(); render(); toast("Kontrol noktası oluşturuldu"); break;
    case "checkpoint-load": if (loadCheckpoint()) { render(); toast("Kontrol noktasına dönüldü"); } break;
    case "reset-ask": openStory(null, "Kariyer sıfırlansın mı?", "<p>Tüm ilerlemen ve kontrol noktan silinecek. Bu işlem geri alınamaz.</p>",
      [{ label: "Evet, sıfırla", attrs: 'data-action="confirm-new"', primary: true }, { label: "Vazgeç", attrs: 'data-action="close-modal"' }]); break;
  }
});
function stepDefFrom(el) { const body = el.closest("[data-step-body]"); const any = body && body.querySelector("[data-def]"); return any ? defOf(any.dataset.def) : null; }
document.addEventListener("change", e => { const el = e.target.closest('[data-action="field"]'); if (el && el.type !== "range") setField(defOf(el.dataset.def), el.dataset.key, el); });
document.addEventListener("input", e => { const el = e.target.closest('[data-action="field"]'); if (el && el.type === "range") setField(defOf(el.dataset.def), el.dataset.key, el); });
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".tnode")) { e.preventDefault(); treeSelect(e.target.dataset.id); return; }
  if (e.key === "Escape" && $("modal").classList.contains("visible")) { closeModal(); return; }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("tr[data-action], [data-pick]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  if (e.key === "Enter" && e.target.id === "profileName") document.querySelector('[data-action="finish-profile"]')?.click();
});

render();

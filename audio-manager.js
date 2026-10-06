/* DATA TYCOON v7.5 — Ses yöneticisi (yeniden yazıldı)
   Neden: önceki sürüm `window.player`'a bakıyordu. engine.js'de oyuncu `let player` ile tanımlı;
   `let` değişkenleri window'a eklenmez, bu yüzden "ofiste miyim?" kontrolü her zaman yanlış
   dönüyor ve ofis sesi her render'da durduruluyordu.

   Mimari
   - İki katmanlı ortam: TABAN (ofis gündüz / gece) + HAVA (yağmur / rüzgâr). Hava tabanın ÜSTÜNE biner.
   - Boşluksuz döngü: her katman iki <audio> öğesiyle çapraz geçiş yapar (MP3 dolgu boşluğu duyulmaz).
   - Tek bir 200 ms'lik "tick": ekranı okur, hedef seviyeleri hesaplar, sesleri yumuşakça hedefe taşır.
     Hangi kod yolu ekranı değiştirirse değiştirsin ses kendiliğinden doğru duruma gelir.
   - Hava sürekliliği: sabah yağmur sahnesi ya da pencereden görülen yağmur, o gün ofiste hafif yağmur katmanı olarak sürer.
   - Efekt çalınca ortam kısa süre kısılır (ducking); modal açıkken ortam geri çekilir.
   - file:// üzerinden de çalışır (HTMLAudio; fetch/WebAudio gerekmez). */
const DT_AUDIO_KEY = "dataTycoonAudioV10BetaLiving";
window.DTSound = {
  cfg: { enabled: true, master: 0.8, ambience: 0.85, sfx: 0.7, music: 0.6 },
  files: {
    officeDay: "office-day-living-v6.mp3", officeNight: "office-night.mp3", rain: "rain-window.mp3", wind: "wind-window.mp3",
    notification: "notification.mp3", click: "click.mp3", success: "success.mp3", warning: "warning.mp3",
    elevator: "elevator-ding.mp3", promotion: "promotion.mp3", incident: "incident.mp3"
  },
  LOOPS: ["officeDay", "officeNight", "rain", "wind"],
  gains: { officeDay: 0.9, officeNight: 0.85, rain: 0.75, wind: 0.6 },   // dosyalar -24…-30 dBFS RMS'e göre dengelendi
  XF: 2.5, unlocked: false, layers: {}, sfxCache: {}, duck: 1, duckUntil: 0, dayWeather: null, _timer: null,

  init() {
    try { Object.assign(this.cfg, JSON.parse(localStorage.getItem(DT_AUDIO_KEY) || "{}")); } catch (e) {}
    const u = () => this.unlock();
    ["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, u, { once: true, capture: true, passive: true }));
    document.addEventListener("visibilitychange", () => this.tick());
    this.layers.bed = this._layer(); this.layers.wx = this._layer();
    this._timer = setInterval(() => this.tick(), 200);
  },
  save() { try { localStorage.setItem(DT_AUDIO_KEY, JSON.stringify(this.cfg)); } catch (e) {} },
  vol(kind) { return this.cfg.enabled ? Math.max(0, Math.min(1, this.cfg.master * (this.cfg[kind] ?? 1))) : 0; },
  _player() { try { return typeof player !== "undefined" ? player : null; } catch (e) { return null; } },

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    Object.keys(this.files).forEach(k => { if (!this.LOOPS.includes(k)) { const a = new Audio(this.files[k]); a.preload = "auto"; this.sfxCache[k] = a; } });
    this.tick();
  },

  /* ---------- döngü katmanı: iki öğe arasında çapraz geçiş ---------- */
  _layer() { return { name: null, els: [], cur: 0, level: 0, target: 0 }; },
  _ensure(L, name) {
    if (L.name === name && L.els.length) return;
    L.els.forEach(a => { a.pause(); a.removeAttribute("src"); a.load(); });
    L.name = name; L.els = []; L.cur = 0; L.level = 0;
    if (!name) return;
    for (let i = 0; i < 2; i++) { const a = new Audio(this.files[name]); a.preload = "auto"; a.volume = 0; L.els.push(a); }
    const first = L.els[0];   // her seferinde aynı noktadan başlamasın
    /* Office ambience starts from the beginning: silence first, then sparse work sounds. */
  },
  _drive(L, g) {
    L.level += (L.target - L.level) * 0.22; if (Math.abs(L.target - L.level) < 0.002) L.level = L.target;   // ~0,8 sn yumuşak geçiş
    if (!L.els.length) return;
    let a = L.els[L.cur], b = L.els[1 - L.cur];
    if (L.level <= 0.003) { L.els.forEach(e => { if (!e.paused) e.pause(); }); return; }
    // Sıra değişimi, "durmuşsa çal" kontrolünden ÖNCE yapılır; yoksa biten öğe baştan başlar ve geçiş bozulur.
    const dA = a.duration;
    if (a.ended || (dA && isFinite(dA) && a.currentTime >= dA - 0.25 && !b.paused)) { a.pause(); L.cur = 1 - L.cur; [a, b] = [b, a]; }
    if (a.paused) a.play().catch(() => {});
    const d = a.duration, t = a.currentTime; let fa = 1, fb = 0;
    if (d && isFinite(d) && t > d - this.XF) {          // sona yaklaşınca diğer öğe baştan, eşit güçlü geçiş
      if (b.paused) { try { b.currentTime = 0; } catch (e) {} b.play().catch(() => {}); }
      const p = Math.min(1, (t - (d - this.XF)) / this.XF);
      fa = Math.cos(p * Math.PI / 2); fb = Math.sin(p * Math.PI / 2);
    } else if (!b.paused) { b.pause(); }
    a.volume = Math.max(0, Math.min(1, L.level * g * fa));
    b.volume = Math.max(0, Math.min(1, L.level * g * fb));
  },

  /* ---------- sahne → hedef ---------- */
  weatherFromText(text) {
    const t = String(text || "").toLocaleLowerCase("tr-TR");
    if (t.includes("yağmur") || t.includes("sağanak")) return "rain";
    if (t.includes("rüzgar") || t.includes("rüzgâr") || t.includes("dalga") || t.includes("fırtına")) return "wind";
    return "none";
  },
  scene() {
    const p = this._player();
    // Ambience is allowed ONLY when the actually rendered screen is Office.
    // This also prevents the 1–2 second sound leak while the title/landing screen is visible.
    const renderedScreen = document.body?.dataset?.screen || "";
    if (!p || !p.started || !this.unlocked || !this.cfg.enabled || document.hidden ||
        p.screen !== "office" || renderedScreen !== "office") return { bed: null, wx: null };
    const modal = document.getElementById("modal")?.classList.contains("visible");
    const windowModal = modal && !!document.querySelector("#modalCard .window-view-photo");
    const night = p.dayPhase === "after";
    return {
      bed: { name: night ? "officeNight" : "officeDay", lvl: modal && !windowModal ? 0.55 : 1 },
      wx: null
    };
  },
  tick() {
    const sc = this.scene();
    if (performance.now() > this.duckUntil) this.duck += (1 - this.duck) * 0.15;
    const amb = this.vol("ambience") * this.duck;
    [["bed", sc.bed], ["wx", sc.wx]].forEach(([k, want]) => {
      const L = this.layers[k];
      if (want && L.name !== want.name) {
        if (L.name && L.level > 0.01) { L.target = 0; this._drive(L, this.gains[L.name] || 1); return; }   // önce eskisini söndür
        this._ensure(L, want.name);
      }
      L.target = want ? want.lvl * amb : 0;
      this._drive(L, this.gains[L.name] || 1);
    });
  },

  /* ---------- efektler ---------- */
  one(name, kind = "sfx", gain = 1) {
    if (!this.cfg.enabled) return;
    if (!this.unlocked) this.unlock();
    const src = this.files[name]; if (!src || this.LOOPS.includes(name)) return;
    const base = this.sfxCache[name] || (this.sfxCache[name] = new Audio(src));
    const a = base.cloneNode(); a.volume = Math.min(1, this.vol(kind) * gain);
    a.play().catch(() => {});
    this.duck = Math.min(this.duck, kind === "music" ? 0.35 : 0.65); this.duckUntil = performance.now() + (kind === "music" ? 2600 : 700);
    return a;
  },

  /* ---------- oyunun çağırdığı arayüz (geriye uyumlu) ---------- */
  sync() { this.tick(); },
  restoreOffice() { this.tick(); },
  window(text) { const p = this._player(); if (!p) return; const k = this.weatherFromText(text); if (k !== "none") this.dayWeather = { day: p.day, kind: k }; this.tick(); },
  set(k, v) { this.cfg[k] = v; this.save(); this.tick(); },
  state() {   // QA ve hata ayıklama için
    const d = L => ({ name: L.name, level: +L.level.toFixed(3), playing: L.els.some(e => !e.paused), vol: L.els.map(e => +e.volume.toFixed(3)) });
    return { unlocked: this.unlocked, screen: this._player()?.screen, bed: d(this.layers.bed), wx: d(this.layers.wx), dayWeather: this.dayWeather };
  }
};
window.DTSound.init();

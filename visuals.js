
/* =====================================================================
   GÖRSEL YARDIMCILAR — vaka adımlarında kullanılan küçük SVG/HTML parçaları.
   Her önemli öğe data-hl (satır/grup) veya data-hlc (sütun) taşır;
   ipuçları bu anahtarlarla sahnedeki veriyi vurgular.
   ===================================================================== */
const TR_MAP = { "ı": "i", "İ": "i", "ş": "s", "Ş": "s", "ğ": "g", "Ğ": "g", "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c" };
function slug(t) {
  return String(t).replace(/<[^>]*>/g, "").replace(/[ıİşŞğĞüÜöÖçÇ]/g, c => TR_MAP[c]).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const neg = t => `<span class="negative">${t}</span>`;
const pos = t => `<span class="positive">${t}</span>`;
const fmtNum = v => Number(v).toLocaleString("tr-TR");

function kpiStrip(items) {
  return `<div class="kpi-strip">${items.map(([k, v, tone], i) => `<div class="kpi ${tone || ""}" data-hl="${slug(k)}" style="--i:${i}"><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>`;
}
function chartCard(title, inner) { return `<figure class="chart-card"><figcaption>${title}</figcaption>${inner}</figure>`; }
function noteCard(title, text) { return `<div class="note-card" data-hl="${slug(title)}"><span>${title}</span><p>${text}</p></div>`; }
function dataTable(cols, rows, opts = {}) {
  const ck = cols.map(c => slug(c));
  return `<div class="table-wrap"><table class="data-table ${opts.mono ? "mono" : ""}"><thead><tr>${cols.map((c, i) => `<th data-hlc="${ck[i]}">${c}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r, ri) => `<tr data-hl="${slug(r[0])}" style="--i:${ri}">${r.map((c, i) => `<td data-hlc="${ck[i]}"${i === 0 ? ' class="first"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function groupedBars(groups, legend) {
  const W = 520, H = 230, pl = 14, pr = 14, pt = 26, pb = 34;
  const max = Math.max(...groups.flatMap(g => [g.a, g.b])) * 1.08;
  const gw = (W - pl - pr) / groups.length, bw = Math.min(42, gw * 0.3);
  const y = v => pt + (1 - v / max) * (H - pt - pb);
  const bars = groups.map((g, i) => {
    const cx = pl + gw * i + gw / 2;
    return `<g data-hl="${slug(g.label)}">
      <rect class="hl-bg" x="${cx - gw / 2 + 6}" y="${pt - 18}" width="${gw - 12}" height="${H - pt - pb + 40}" rx="10"/>
      <rect class="bar" style="--i:${i * 2}" x="${cx - bw - 3}" y="${y(g.a)}" width="${bw}" height="${H - pb - y(g.a)}" rx="5" fill="var(--bar-prev)"/>
      <rect class="bar" style="--i:${i * 2 + 1}" x="${cx + 3}" y="${y(g.b)}" width="${bw}" height="${H - pb - y(g.b)}" rx="5" fill="var(--bar-now)"/>
      <text x="${cx - bw / 2 - 3}" y="${y(g.a) - 7}" class="svg-val" text-anchor="middle">${fmtNum(g.a)}</text>
      <text x="${cx + bw / 2 + 3}" y="${y(g.b) - 7}" class="svg-val" text-anchor="middle">${fmtNum(g.b)}</text>
      <text x="${cx}" y="${H - 12}" class="svg-lbl" text-anchor="middle">${g.label}</text></g>`;
  }).join("");
  return `<div class="legend"><span><i style="background:var(--bar-prev)"></i>${legend[0]}</span><span><i style="background:var(--bar-now)"></i>${legend[1]}</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Çubuk grafik"><line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="svg-axis"/>${bars}</svg>`;
}

function histogram(bins, marker) {
  const W = 520, H = 220, pl = 10, pr = 10, pt = 30, pb = 34;
  const max = Math.max(...bins.map(b => b[1])) * 1.1, bw = (W - pl - pr) / bins.length;
  const y = v => pt + (1 - v / max) * (H - pt - pb);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram">
    ${bins.map((b, i) => `<g data-hl="${slug(b[0])}"><rect class="hl-bg" x="${pl + i * bw + 1}" y="${pt - 8}" width="${bw - 2}" height="${H - pt - pb + 30}" rx="8"/>
      <rect class="bar" style="--i:${i}" x="${pl + i * bw + 5}" y="${y(b[1])}" width="${bw - 10}" height="${H - pb - y(b[1])}" rx="4" fill="${marker && i === marker[0] ? "var(--mint)" : "var(--bar-prev)"}"/>
      <text x="${pl + i * bw + bw / 2}" y="${y(b[1]) - 6}" class="svg-val" text-anchor="middle">${b[1]}</text>
      <text x="${pl + i * bw + bw / 2}" y="${H - 12}" class="svg-lbl small" text-anchor="middle">${b[0]}</text></g>`).join("")}
    ${marker ? `<text x="${pl + marker[0] * bw + bw / 2}" y="16" class="svg-note" text-anchor="middle">${marker[1]}</text>` : ""}
    <line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="svg-axis"/></svg>`;
}

const SIGNUPS = [4980, 5020, 4940, 4900, 4960, 5010, 4930, 4870, 4820, 4790, 4760, 4705];
function signupChart(d) {
  const vals = d.context ? SIGNUPS : SIGNUPS.slice(-4);
  const W = 520, H = 240, pl = 52, pr = 18, pt = 24, pb = 30;
  const lo = d.zero ? 0 : 4700, hi = d.zero ? 5500 : 4830;
  const x = i => pl + i / (vals.length - 1) * (W - pl - pr), y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const ticks = [0, 0.5, 1].map(t => lo + (hi - lo) * t);
  const col = d.alarm ? "var(--coral)" : "var(--mint)";
  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const off = SIGNUPS.length - vals.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Haftalık kayıt çizgi grafiği">
    <g data-hl="eksen">${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" class="svg-grid"/><text x="${pl - 8}" y="${y(t) + 4}" class="svg-lbl small" text-anchor="end">${fmtNum(Math.round(t))}</text>`).join("")}
    ${!d.zero ? `<text x="${pl + 4}" y="${H - pb - 6}" class="svg-warn">eksen 4.700'den başlıyor</text>` : ""}</g>
    ${d.context ? `<rect x="${x(vals.length - 4)}" y="${pt}" width="${x(vals.length - 1) - x(vals.length - 4)}" height="${H - pt - pb}" fill="var(--mint)" opacity=".07"/>` : ""}
    <polyline class="draw-line" pathLength="1" points="${pts}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${vals.map((v, i) => `<circle class="dot" style="--i:${i}" cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${col}"/><text x="${x(i)}" y="${H - 10}" class="svg-lbl small" text-anchor="middle">H${off + i + 1}</text>`).join("")}
    ${d.label ? `<g class="pop-in"><rect x="${x(vals.length - 1) - 156}" y="${pt + 2}" width="152" height="26" rx="13" fill="var(--surface-3)"/><text x="${x(vals.length - 1) - 80}" y="${pt + 19}" class="svg-note" text-anchor="middle">4 haftada −%2,4</text></g>` : ""}
  </svg>`;
}

function chartSketches() {
  const pie = [30, 22, 16, 13, 11, 8], cols = ["#4DA3FF", "#5EE0B5", "#FFB547", "#A08BFF", "#FF8FB1", "#FF7A70"];
  let a0 = -Math.PI / 2;
  const slices = pie.map((v, i) => { const a1 = a0 + v / 100 * Math.PI * 2; const p = `M80,80 L${80 + 52 * Math.cos(a0)},${80 + 52 * Math.sin(a0)} A52,52 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${80 + 52 * Math.cos(a1)},${80 + 52 * Math.sin(a1)} Z`; a0 = a1; return `<path d="${p}" fill="${cols[i]}" stroke="var(--surface-2)" stroke-width="2"/>`; }).join("");
  const bars = pie.map((v, i) => `<rect class="bar-h" style="--i:${i}" x="20" y="${30 + i * 18}" width="${v * 3.6}" height="12" rx="3" fill="var(--mint)"/>`).join("");
  let b0 = -Math.PI / 2;
  const donut = pie.map((v, i) => { const b1 = b0 + v / 100 * Math.PI * 2; const r = 50, ry = 22; const p = `M${80 + r * Math.cos(b0)},${92 + ry * Math.sin(b0)} A${r},${ry} 0 ${b1 - b0 > Math.PI ? 1 : 0} 1 ${80 + r * Math.cos(b1)},${92 + ry * Math.sin(b1)}`; b0 = b1; return `<path d="${p}" fill="none" stroke="${cols[i]}" stroke-width="18"/>`; }).join("");
  return `<div class="sketches">
    <div data-hl="a"><svg viewBox="0 0 160 160">${slices}</svg><span>A</span></div>
    <div data-hl="b"><svg viewBox="0 0 160 160">${bars}</svg><span>B</span></div>
    <div data-hl="c"><svg viewBox="0 0 160 160"><ellipse cx="80" cy="102" rx="50" ry="22" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="18"/>${donut}</svg><span>C</span></div></div>`;
}

const STORES = (() => {
  const out = [], spec = { small: [[1, 39], [1, 43], [2, 41], [1, 44], [2, 38], [2, 42], [1, 40], [2, 45]],
    medium: [[2, 76], [3, 80], [3, 74], [4, 79], [2, 82], [3, 77], [4, 75], [3, 81]],
    large: [[4, 128], [5, 135], [6, 131], [5, 126], [4, 137], [6, 129], [5, 133], [6, 136]] };
  Object.entries(spec).forEach(([size, arr]) => arr.forEach(([m, s], i) => out.push({ size, m: m + (i % 3 - 1) * 0.14, s })));
  return out;
})();
function storeScatter(bySize) {
  const W = 520, H = 250, pl = 50, pr = 16, pt = 16, pb = 38;
  const x = m => pl + (m - 0.5) / 6 * (W - pl - pr), y = s => pt + (1 - s / 150) * (H - pt - pb);
  const colors = { small: "#FFB547", medium: "#4DA3FF", large: "#A08BFF" };
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mağaza saçılım grafiği">
    ${[0, 50, 100, 150].map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" class="svg-grid"/><text x="${pl - 8}" y="${y(t) + 4}" class="svg-lbl small" text-anchor="end">${t} bin ₺</text>`).join("")}
    ${[1, 2, 3, 4, 5, 6].map(m => `<text x="${x(m)}" y="${H - 18}" class="svg-lbl small" text-anchor="middle">${m}</text>`).join("")}
    <text x="${(W + pl) / 2}" y="${H - 2}" class="svg-lbl small" text-anchor="middle">mağaza başına kahve makinesi</text>
    ${STORES.map((p, i) => `<circle class="dot" style="--i:${i % 12};transition:fill .5s ease ${i * 20}ms" cx="${x(p.m)}" cy="${y(p.s)}" r="7" fill="${bySize ? colors[p.size] : "var(--mint)"}" fill-opacity=".88" stroke="var(--surface-2)" stroke-width="2"/>`).join("")}
  </svg>${bySize ? `<div class="legend pop-in"><span><i style="background:#FFB547"></i>Küçük</span><span><i style="background:#4DA3FF"></i>Orta</span><span><i style="background:#A08BFF"></i>Büyük</span></div>` : ""}`;
}

/* ---------------------------------------------------------------------
   KİŞİLER — diyaloglar için avatarlar
   --------------------------------------------------------------------- */
function personOf(id) {
  if (id === "you") {
    const a = AVATARS.find(x => x.id === player.profile.avatar) || AVATARS[0];
    return { ...PEOPLE.you, ...a, name: playerName() };
  }
  if (id === "buse") return { ...PEOPLE.buse, role: player.screen === "preview" ? PEOPLE_LATER.buse.role : ["Yeni stajyer", "Stajyer", "Junior Veri Analisti"][Math.min(2, (player.chapter || 1) - 1)] };
  return PEOPLE[id];
}
function hairShapes(P, cx, cy, s) {
  const back = P.style === "long" ? `<rect x="${cx - 12.5 * s}" y="${cy - 2 * s}" width="${25 * s}" height="${20 * s}" rx="${6 * s}" fill="${P.hair}"/>` : "";
  const tail = P.style === "ponytail" ? `<circle cx="${cx + 13 * s}" cy="${cy + 2 * s}" r="${5 * s}" fill="${P.hair}"/>` : "";
  const r = P.style === "bob" ? 13.5 : P.style === "short" ? 11.6 : 12.5;
  return back + tail + `<circle cx="${cx}" cy="${cy - 2 * s}" r="${r * s}" fill="${P.hair}"/>`;
}
let _avId = 0;
function avatar(id, size = 44, preset) {
  const photoPeople = {maya:"maya",buse:"buse",deniz:"deniz",alex:"alex",zeynep:"zeynep",ceo:"ceo"};
  if (!preset && photoPeople[id]) return `<img class="avatar photo-avatar" src="char-${photoPeople[id]}.jpg" width="${size}" height="${size}" alt="" loading="eager" decoding="async">`;
  const P = preset || personOf(id), uid = `av${++_avId}`;
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <defs><clipPath id="${uid}"><circle cx="24" cy="24" r="24"/></clipPath></defs>
    <circle cx="24" cy="24" r="24" fill="${P.shirt}" fill-opacity=".22"/>
    <g clip-path="url(#${uid})">
      <rect x="9" y="33" width="30" height="20" rx="12" fill="${P.shirt}"/>
      ${hairShapes(P, 24, 21, 1)}
      <ellipse cx="24" cy="23" rx="9.5" ry="10.5" fill="${P.skin}"/>
      <circle cx="20.5" cy="23" r="1.2" fill="#2a2320"/><circle cx="27.5" cy="23" r="1.2" fill="#2a2320"/>
      <path d="M21 27.5 Q24 29.5 27 27.5" stroke="#2a2320" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g></svg>`;
}
function speakerLine(id) {
  const P = personOf(id);
  return `<div class="speaker">${avatar(id, 44)}<div><strong>${P.name}</strong><span>${P.role}</span></div></div>`;
}

/* ---------------------------------------------------------------------
   İKONLAR
   --------------------------------------------------------------------- */
const ICONS = {
  coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M11 3v3"/>',
  team: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 19a4 4 0 0 1 7 0"/>',
  board: '<rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M8 20l4-4 4 4M7 12l3-3 2 2 4-4"/>',
  chat: '<path d="M4 6h16v10H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
  game: '<path d="M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.3 1.9L14 14h-4l-1.7 1.9A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4z"/><path d="M8 11v3M6.5 12.5h3M16 12h.01M18 13.5h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.6.4-1 1.1-1 1.8V16h-5v-.3c0-.7-.4-1.4-1-1.8A6 6 0 0 1 12 3z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  quest: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>'
};
const icon = (k, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ""}</svg>`;

/* ---------------------------------------------------------------------
   OFİS SAHNESİ — çizim görseli + canlı etkileşim noktaları
   --------------------------------------------------------------------- */
function phase() { return { morning: "sabah", work: "öğlen", after: "akşamüstü" }[player.dayPhase] || "öğlen"; }
function playerName() { return (player.profile && player.profile.name) || "Stajyer"; }

function hotStatus(key) {
  if (key === "desk") {
    const c = activeCase();
    if (!c && prepCase()) return { st: "quest", text: "Önce hazırlık görevi" };
    if (!c) return { st: "idle", text: player.dayPhase === "after" && !player.chapterDone ? "Bugünlük bu kadar" : "Vaka arşivi" };
    const pr = player.progress[c.id];
    return { st: "case", text: pr && pr.step > 0 ? `Vaka ${c.num}'e devam et` : `Vaka ${c.num}: ${c.title}` };
  }
  if (key === "maya" && player.finalePending) return { st: "talk", text: "Toplantı odasına çağırıyor" };
  const ev = player.pendingEvent && EVENT_BY_ID[player.pendingEvent];
  if (ev && ev.who === key) return { st: "talk", text: "Seninle konuşmak istiyor" };
  const q = QUESTS.find(q => q.hot === key && questState(q) === "available");
  if (q) return { st: "quest", text: "Yan görev hazır", q };
  if (key === "whiteboard") return { st: "idle", text: "Gelişim planın" };
  if (key === "window") return { st: "idle", text: "İstanbul manzarası" };
  if (key === "maya") {
    if (caseState(promoCase()) === "gated") return { st: "talk", text: "Seninle konuşmak istiyor" };
    return { st: "idle", text: "Sohbet et" };
  }
  if (HOTSPOTS[key].locked && isHotLocked(key)) return { st: "locked", text: "Şu an meşgul" };
  return { st: "idle", text: "Göz at" };
}
function isHotLocked(key) {
  const qs = QUESTS.filter(q => q.hot === key);
  return qs.length > 0 && qs.every(q => questState(q) === "locked");
}
function officeStage(opts = {}) {
  const spots = opts.static ? "" : Object.entries(HOTSPOTS).filter(([, h]) => h.box).map(([key, h]) => {
    const s = hotStatus(key), [l, t, w, hh] = h.box;
    return `<button class="hotspot hs-${s.st}" data-hot="${key}" style="left:${l}%;top:${t}%;width:${w}%;height:${hh}%" aria-label="${h.label}: ${s.text}">
      <span class="hs-icon">${icon(h.icon)}</span><span class="hs-text"><b>${h.label}</b><small>${s.text}</small></span>
      ${s.st === "quest" ? '<i class="hs-badge">!</i>' : s.st === "case" ? '<i class="hs-badge case">›</i>' : s.st === "talk" ? '<i class="hs-badge talk">…</i>' : ""}</button>`;
  }).join("");
  const lamps = [[62.45, 2.3], [65.7, 11.9], [69.5, 16.4], [74.6, 8.8], [84.2, 8], [48.5, 11.5]];
  return `<div class="office-scroll"><div class="office-stage ${opts.static ? "is-static" : ""}">
    <div class="office-kb">
      <img class="office-img" src="${OFFICE_IMAGE}" alt="Nexora Analytics İstanbul ofisi: Maya, Alex, kahve makinesi, takım panosu, beyaz tahta ve dinlenme alanı" draggable="false">
      <div class="ambient" aria-hidden="true">
        <span class="neon"></span>
        ${lamps.map(([x, y], i) => `<span class="lamp" style="left:${x}%;top:${y}%;--d:${i * 0.7}s"></span>`).join("")}
        <span class="water"></span>
        ${Array.from({ length: 10 }, (_, i) => `<span class="mote" style="left:${8 + i * 9}%;--d:${i * 1.3}s;--x:${(i % 3 - 1) * 14}px"></span>`).join("")}
      </div>
      ${spots}
    </div></div></div>`;
}

/* =====================================================================
   v6.0 LIVING OFFICE — ortak sinematik sahne üreticisi
   Tek bir ağır storyboard yerine mevcut hafif karakter assetleri + ofis
   arka planı kullanır. Böylece tüm kariyerde tutarlı ve hızlıdır.
   ===================================================================== */
const DT_HUMANS = new Set(["maya","buse","deniz","alex","zeynep","ceo","burak"]);
function isHumanSpeaker(id){ return !!id && DT_HUMANS.has(id); }
function sceneMood(def){
  const s = `${def?.id||""} ${def?.title||""} ${def?.hot||""}`.toLocaleLowerCase("tr-TR");
  if (/kahve|coffee|espresso/.test(s)) return {key:"coffee",label:"Kahve alanı",icon:"☕"};
  if (/öğle|lunch/.test(s)) return {key:"lunch",label:"Öğle arası",icon:"◷"};
  if (/incident|alarm|production|prod/.test(s)) return {key:"incident",label:"Production alanı",icon:"!"};
  if (/board|kurul|ceo|strateji/.test(s)) return {key:"board",label:"Yönetim katı",icon:"◆"};
  if (/whiteboard|tahta/.test(s)) return {key:"whiteboard",label:"Beyaz tahta",icon:"✎"};
  if (/review|pr|mentor/.test(s)) return {key:"review",label:"Kod review",icon:"⌘"};
  if (/koridor|asansör/.test(s)) return {key:"corridor",label:"Koridor",icon:"→"};
  if (/toplantı|meeting/.test(s)) return {key:"meeting",label:"Toplantı odası",icon:"◎"};
  return {key:"office",label:"Nexora ofisi",icon:"●"};
}
function encounterSceneHTML(who, def, compact=false){
  if(!isHumanSpeaker(who)) return "";
  const P=personOf(who), mood=sceneMood(def);
  // v6.7: encounter görseli artık ofis fotoğrafından crop üretmiyor.
  // Her ana karakter için oyuncuyla aynı kadrajda, konuşma bağlamına uygun
  // iki kişilik sinematik asset kullanılıyor. Burak için güvenli ofis fallback'i var.
  const paired = ["maya","buse","deniz","alex","zeynep","ceo"].includes(who);
  const scene = paired ? `encounter-${who}-conversation.webp` : OFFICE_IMAGE;
  return `<div class="living-scene paired-scene mood-${mood.key} ${compact?"compact":""}" data-living-scene>
    <img class="paired-scene-photo" src="${scene}" alt="${P.name} ile ${mood.label} konuşması" loading="eager" decoding="async">
    <div class="paired-scene-shade"></div>
    <div class="living-place"><i>${mood.icon}</i><span>${mood.label}</span></div>
    <div class="living-id"><strong>${P.name}</strong><span>${P.role||"Nexora Analytics"}</span></div>
  </div>`;
}

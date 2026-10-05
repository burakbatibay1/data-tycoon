
/* =====================================================================
   v2.7 CİLA KATMANI
   1) Hata düzeltmeleri   2) Kanıt zinciri ve terfi erişilebilirliği
   3) Bölüm meta verisi (zaman atlaması, final, başarımlar)
   4) 4–8. bölümler için ofis hayatı (olay, yan görev, akşam, Slack)
   5) Ara animasyonlar: bölüm girişi, vaka girişi, kariyer ilerleme çubuğu
   ===================================================================== */

/* ---------- 1) Eksik beceri anahtarı ---------- */
SKILLS.communication = SKILLS.communication || { name: "İletişim", color: "#FF8FB1" };

/* ---------- 2) Kanıt bağları ---------- */
function linkSrc(cid, ...srcs) {
  const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === cid)); if (!n) return;
  const c = n.concepts.find(c => c.id === cid); srcs.forEach(s => { if (!c.src.includes(s)) c.src.push(s); }); CONCEPT_BY_ID[cid] = { ...c, node: n.id };
}
function addConcept(nodeId, id, name, src, note) {
  const n = NODE_BY_ID[nodeId]; if (!n || n.concepts.some(c => c.id === id)) return;
  const c = C(id, name, src, note); n.concepts.push(c); CONCEPT_BY_ID[id] = { ...c, node: nodeId };
}
// bağsız vakalar
["q.missing", "eda.segment", "st.robust", "viz.context"].forEach(c => linkSrc(c, "case006"));
addConcept("modeling", "mo.cluster", "Kümeleme ve iş anlamı", ["case034"], "Bir kümeleme, ancak her küme için farklı bir iş aksiyonu üretiyorsa anlamlıdır. 'Dört küme çıktı' bir sonuç değil, bir başlangıçtır.");
addConcept("mlform", "mf.noml", "Kural mı, model mi?", ["case045"], "Basit bir iş kuralı aynı işi daha ucuz ve açıklanabilir yapıyorsa model kurma. Önce kuralı temel al.");
linkSrc("gen.choice", "case047"); linkSrc("gen.eval", "case047");
addConcept("leadership", "le.buildbuy", "Yap mı, satın al mı?", ["case051"], "Maliyet, gizlilik, performans ve bakım yükünü birlikte tart; satın almak da bir sorumluluk devri değildir.");
linkSrc("le.prioritize", "case052");

/* ---------- 3) 4–8. bölümler için yeni yan görevler (aynı zamanda pratik kanıtı) ---------- */
const LATE_QUESTS = [
  { id: "sq_ch6_canary", chapter: 6, after: "case042", hot: "alex", who: "alex", title: "Kanarya dağıtımı", xp: 50, rewards: { dataQuality: 4, businessThinking: 4 },
    lesson: "Yeni bir modeli önce trafiğin küçük bir kısmına aç, iş metriğini izle, sorun görürsen tek adımda geri al. Geri alma planı olmadan canlıya çıkılmaz.",
    steps: [{ type: "dialog", who: "alex", cta: "Planı gör", lines: ["Yeni churn modelini yarın canlıya alıyoruz. Ürün ekibi 'herkese birden açalım' diyor.", "Senin planın ne?"] },
      { type: "choice", prompt: "Yeni modeli canlıya nasıl alırsın?", goal: "Güvenli dağıtım ve geri alma planı kurmak.",
        options: [{ label: "Herkese aynı anda aç, sorun olursa düzeltiriz", fb: "Sorun olursa tüm müşteriler etkilenir ve düzeltme saatler sürer." },
          { label: "Önce trafiğin %5'ine aç, iş metriğini ve hata oranını izle; eşik aşılırsa eski modele tek komutla dön", correct: true, fb: "Alex: “Kanarya + geri alma. Gece nöbetçisi seni sevecek.”" }] }] },
  { id: "sq_ch6_drift", chapter: 6, after: "case043", hot: "teamboard", who: "deniz", title: "Kırmızı alarm, sakin iş", xp: 45, rewards: { statistics: 5 },
    lesson: "Bir girdi kayması alarmı tek başına aksiyon gerektirmez; önce iş metriğine etkisini ölç. Kayma + iş etkisi birlikte değerlendirilir.",
    steps: [{ type: "choice", who: "deniz", prompt: "Deniz: “İzleme panosunda yaş dağılımı alarmı üç gündür kırmızı. Ama kurtarılan müşteri sayısı sabit. Modeli yeniden eğitelim mi?”", goal: "Veri kaymasını iş etkisiyle birlikte okumak.",
      options: [{ label: "Evet, alarm kırmızı", fb: "Her yeniden eğitimin maliyeti ve riski var; iş etkisi yokken acele gereksiz." },
        { label: "Önce kaymanın tahmin kalitesine ve iş metriğine etkisini ölçelim; etki yoksa eşiği gözden geçirip izlemeye devam edelim", correct: true, fb: "Deniz: “Alarmı sarıya çekip haftalık rapora ekledim.”" }] }] },
  { id: "sq_ch7_feedback", chapter: 7, after: "case050", hot: "lounge", who: "buse", title: "Buse'ye ikinci geri bildirim", xp: 45, rewards: { businessThinking: 5 },
    lesson: "İyi geri bildirim davranışa odaklanır, örnek verir ve bir sonraki adımı kişinin kendisinin bulmasına alan bırakır.",
    steps: [{ type: "dialog", who: "buse", cta: "Dinle", lines: ["Buse: “Sunumum kötü geçti. Kurul soruları karşısında dağıldım.”"] },
      { type: "reply", who: "buse", prompt: "Buse'ye ne söylersin?",
        options: [{ label: "“İlk slaytta cevabı söylemedin; kurul onu aradı. Bir dahaki sbusere ilk cümlen ne olurdu?”", reply: "Buse düşünüyor: “Öneri, sonra kanıt.” Ertesi hafta sunumunu bu sırayla yapıyor.", trust: {} },
          { label: "“Kötü değildi, takma kafana.”", reply: "Buse rahatladı ama ne değiştireceğini bilmiyor." },
          { label: "“Bir dahaki sunumu ben yaparım.”", reply: "Buse hiçbir şey öğrenmeden bir fırsatı kaybetti." }] }] },
  { id: "sq_ch7_okr", chapter: 7, after: "case051", hot: "whiteboard", who: "maya", title: "Çeyreğin üç hedefi", xp: 45, rewards: { businessThinking: 6 },
    lesson: "Bir ekip için az sayıda, ölçülebilir ve etkisi en yüksek hedef seç; her şeye 'evet' demek hiçbir şeye zaman bırakmaz.",
    steps: [{ type: "choice", who: "maya", prompt: "Maya: “Ekibin bu çeyrek için 9 hedef önerdi. Kaç tanesini seçersin ve nasıl?”", goal: "Önceliklendirmeyi pratiğe dökmek.",
      options: [{ label: "Hepsini; ekip yetenekli", fb: "Dokuz hedefin hepsi yarım kalır." },
        { label: "Etki × fizibilite × risk ile sıralayıp ilk üçü; diğerleri bilinçli olarak sonraya", correct: true, fb: "Maya: “Söylemesi kolay, 'hayır' demesi zor. Sen dedin.”" }] }] },
  { id: "sq_ch8_postmortem", chapter: 8, after: "case056", hot: "maya", who: "burak", title: "Bir yıl sonra ROI", xp: 50, rewards: { businessThinking: 6 },
    lesson: "Bir YZ yatırımının getirisini artımsal değerle ölç: aynı dönemde yatırım olmasaydı ne olurdu? Kullanım ve benimseme de getirinin parçasıdır.",
    steps: [{ type: "choice", who: "burak", prompt: "Burak: “Geçen yılki tahminleme platformu 'stok maliyetini %12 düşürdü' diyorlar. CFO doğru mu diye soruyor.”", goal: "Yatırım getirisini nedensel düşünceyle ölçmek.",
      options: [{ label: "Evet, stok maliyeti düştü", fb: "Aynı dönemde tedarik fiyatları da düştüyse bu düşüşün bir kısmı platformdan değil." },
        { label: "Platformu kullanmayan ürün gruplarındaki değişimle karşılaştırıp artımsal etkiyi hesaplayalım; benimseme oranını da raporlayalım", correct: true, fb: "Burak: “Artımsal etki %7 çıktı. Hâlâ iyi, ama artık savunulabilir.”" }] }] },
  { id: "sq_ch8_portfolio", chapter: 8, after: "case057", hot: "teamboard", who: "maya", title: "Portföy gözden geçirmesi", xp: 50, rewards: { businessThinking: 6 },
    lesson: "Bir proje portföyü yaşayan bir şeydir: her çeyrek, getirisi kanıtlanmayanı durdurmak da strateji kararıdır.",
    steps: [{ type: "choice", who: "maya", prompt: "Maya (artık başka şirkette, danışman olarak): “Portföyünde 9 aydır sonuç vermeyen bir proje var. Ekip 'biraz daha zaman' istiyor.”", goal: "Portföy kararını kanıta göre vermek.",
      options: [{ label: "Biraz daha zaman verelim, emek harcandı", fb: "Batık maliyet kararı yönlendirmemeli." },
        { label: "Önceden konan çıkış kriterine bakalım; karşılanmadıysa durdurup ekibi en yüksek etkili projeye kaydıralım", correct: true, fb: "Maya: “Durdurmak da liderliktir.”" }] }] }
];
LATE_QUESTS.forEach(q => { q.kind = "quest"; q.modal = true; QUESTS.push(q); QUEST_BY_ID[q.id] = q; });
linkSrc("ops.rollback", "sq_ch6_canary"); linkSrc("mon.drift", "sq_ch6_drift"); linkSrc("mon.business", "sq_ch6_drift");
linkSrc("le.feedback", "sq_ch7_feedback"); linkSrc("le.prioritize", "sq_ch7_okr");
linkSrc("str.roi", "sq_ch8_postmortem"); linkSrc("str.portfolio", "sq_ch8_portfolio");
// 5. bölüm görevlerine de bölüm bilgisi ver (rehberlik politikası ve kilit için)
QUESTS.forEach(q => { if (!q.chapter && q.after && CASE_BY_ID[q.after]) q.chapter = CASE_BY_ID[q.after].chapter || 1; });

/* ---------- 4) Bölüm meta verisi ---------- */
const CH_META = {
  2: { months: ["Eylül", "Aralık"], end: "Junior Veri Analisti olarak iki haftan" },
  3: { months: ["Aralık", "Kasım"], end: "Veri Analisti olarak iki buçuk haftan" },
  4: { months: ["Kasım", "2 yıl sonra"], end: "Junior Veri Bilimci olarak ilk modellerin" },
  5: { months: ["", "3,5 yıl sonra"], end: "Veri Bilimci olarak canlıya giden modellerin" },
  6: { months: ["", "6 yıl sonra"], end: "Kıdemli Veri Bilimci olarak sistemlerin" },
  7: { months: ["", "9 yıl sonra"], end: "Lider olarak ekibin" },
  8: { months: ["", "12 yıl sonra"], end: "Veri Direktörü olarak şirketin" }
};
const FINALE_LINES = {
  5: () => ["Otur. Bu kez sana bir soru soracağım: modelin canlıda ne kadar iyi?", "Üç buçuk yıl önce 'önce temeli geç' demiştim. Bugün temeli geçmekle kalmadın, ne zaman geçmediğini de söyledin.", `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. Artık model değil, sistem düşüneceksin.`],
  6: () => ["Gece 02:13'teki olayı yönetişini izledim. Kimseyi suçlamadın, önce müşteriyi korudun.", "Kıdem, doğru cevabı bilmek değil; yanlış gittiğinde ne yapacağını bilmektir.", `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. Bundan sonra senin işin, başkalarının işini iyi yapmasını sağlamak.`],
  7: () => ["Buse'nin modelini incelerken ona cevabı vermedin; soruyu verdin. Ben de sana öyle yapmıştım.", "Dokuz yıl önce bir stajyerdin. Bugün bir ekibin pusulasısın.", `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. Artık soru 'hangi model?' değil, 'şirket veriyi nasıl kullanmalı?'.`],
  8: () => ["Kurul toplantısından çıktın. Telefonunda Maya'dan bir mesaj var.", "“On iki yıl önce sana hangi bölgeye bakacağını söylüyordum. Bugün bir şirketin hangi yöne bakacağını sen söylüyorsun.”", "“Kariyerinin bu bölümü tamamlandı. Ama veri hiç bitmez. Gurur duyuyorum.”"]
};
(() => { const st = FINALE.steps[0], orig = st.lines; st.lines = () => (FINALE_LINES[player.chapter] ? FINALE_LINES[player.chapter]() : orig()); })();
for (let ch = 4; ch <= 8; ch++) ACHIEVEMENTS["promoted" + ch] = ACHIEVEMENTS["promoted" + ch] || { t: (ROLES[ch] || ROLES[ROLES.length - 1]).title, d: `${ch}. bölümü tamamladın.` };
ACHIEVEMENTS.career_complete = { t: "Uçtan uca kariyer", d: "Stajyerlikten Veri Direktörlüğüne kadar tüm bölümleri bitirdin." };
completeFinale = function () {
  delete player.progress.finale;
  player.finaleDone = true; player.finalePending = false; player.promoted = true; player.career = PROMOTION.title;
  unlockAch(player.chapter === 1 ? "promoted" : "promoted" + player.chapter);
  if (player.chapter === 8) unlockAch("career_complete");
  go("promotion");
};
COMPLETE.finale = completeFinale;

/* sabah sahneleri: bölüm başı zaman atlaması, son gün terfi, arada çeşitlilik */
(() => {
  const cycle = ["laptop", "standup", "rain", "urgent"], known = ["laptop", "standup", "rain", "urgent", "promo", "timeskip", "meeting"];
  for (let ch = 2; ch <= 8; ch++) {
    const s = CH_START[ch], e = (CH_START[ch + 1] || 60) - 1;
    for (let d = s; d <= e; d++) {
      const m = MORNING_DEFS[`morning${d}`]; if (!m) continue;
      if (d === s) m.scene = "timeskip";
      else if (d === e) m.scene = "promo";
      else if (ch >= 4 || !known.includes(m.scene)) m.scene = cycle[(d - s) % cycle.length];
      if (m.scene === "laptop" && !m.notifications) m.notifications = [["maya", "Günün vakası masanda."], ["alex", "Kahve?"], ["zeynep", "Bir sorum var…"]];
    }
  }
})();
sceneHTML = (orig => function (kind, m) {
  if (kind === "timeskip") {
    const ch = player.chapter || 2, cm = CAREER_MAP[ch - 1], mo = (CH_META[ch] || {}).months || ["", ""];
    return `<div class="scene-art timeskip" style="--img:url('${OFFICE_IMAGE}')"><div class="ts-clock"><span>${ch - 1}. bölüm</span><i>→</i><span>${ch}. bölüm</span></div><div class="ts-big">${cm.time}</div><div class="ts-badge">${avatar("you", 44)}<div><b>${playerName()}</b><small>${cm.role}</small></div></div></div>`;
  }
  return orig(kind, m) || orig("laptop", { notifications: [] });
})(sceneHTML);
viewChapter = (orig => function () { return orig().replace("<h2>Bu bölüm</h2>", `<h2>${(CH_META[player.chapter] || {}).end || "Bu bölüm"}</h2>`); })(viewChapter);

/* ---------- 5) 4–8. bölüm ofis hayatı ---------- */
const LATE_EVENTS = [
  { id: "ev_ch4_label", who: "zeynep", days: [25, 32], notify: "Churn tanımı değişti mi?", title: "Hangi churn?", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "zeynep", prompt: "“Pazarlama churn'ü '30 gün alışveriş yapmayan' diye tanımlamış, Finans '60 gün'. Modelin hedefi hangisi olmalı?”", goal: "Hedef tanımını iş aksiyonuna bağlamak.",
      options: [{ label: "Hangisi daha çok veri veriyorsa", fb: "Hedef veri miktarına göre değil, alınacak aksiyona göre seçilir." }, { label: "Teklifin işe yarayacağı zaman penceresine göre; aksiyon 30 günde etkiliyse 30 gün", correct: true, fb: "Zeynep: “Teklif ekibine sordum: ilk ay kritik. 30 gün.”" }] }] },
  { id: "ev_ch4_gpu", who: "deniz", days: [26, 32], notify: "GPU bütçesi onaylandı mı?", title: "Büyük model hevesi",
    steps: [{ type: "reply", who: "deniz", prompt: "“Ekip, churn için büyük bir derin öğrenme modeli istiyor ve GPU bütçesi talep etti. Ne dersin?”",
      options: [{ label: "“Önce lojistik regresyon temelini görelim; fark yoksa bütçeye gerek yok.”", reply: "Deniz: “Temel model zaten hedefin %95'ini veriyormuş. Bütçe kurtuldu.”", trust: { deniz: 1 } },
        { label: "“Onaylayalım, ekip motive olsun.”", reply: "Üç hafta sonra derin model temelden sadece %1 iyi çıktı." }, { label: "“Bilmiyorum, Maya'ya sor.”", reply: "Deniz biraz şaşırdı; artık bu soruları sana getiriyorlar." }] }] },
  { id: "ev_ch5_llm", who: "ceo", days: [34, 40], notify: "ChatGPT'ye sorsak?", title: "CEO'nun fikri", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "ceo", prompt: "Kerem: “Churn modeline ne gerek var? Müşteri listesini bir LLM'e verip 'kim ayrılır' diye soralım.”", goal: "LLM kullanımını değerlendirmeyle sınamak.",
      options: [{ label: "İyi fikir, hemen deneyelim", fb: "Müşteri verisini dış bir modele vermek hem KVKK hem doğruluk riski." }, { label: "Aynı test setinde mevcut modelle karşılaştırmadan karar vermeyelim; kişisel veriyi de dışarı göndermeyelim", correct: true, fb: "Kerem: “Mantıklı. Sonucu gelecek hafta görelim.”" }] }] },
  { id: "ev_ch5_buse", who: "buse", days: [35, 40], notify: "Bir dakika?", title: "Buse'nin ilk modeli",
    steps: [{ type: "reply", who: "buse", prompt: "Buse: “İlk modelimi kurdum ama sunmaya korkuyorum. Ya yanlışsa?”",
      options: [{ label: "“Önce temelle karşılaştır, sonra bana göster. Yanlışı birlikte buluruz.”", reply: "Buse: “Tamam! Yarın sabah.”", trust: {} }, { label: "“Herkes yanlış yapar, sun gitsin.”", reply: "Buse sunumda temel modeli unuttu; kurul sordu." }] }] },
  { id: "ev_ch6_oncall", who: "deniz", days: [42, 48], notify: "Nöbet listesi", title: "Gece nöbeti",
    steps: [{ type: "reply", who: "deniz", prompt: "“Canlı modeller için nöbet listesi hazırlıyoruz. Seni de yazayım mı?”",
      options: [{ label: "“Yaz. Ama önce bir müdahale kılavuzu yazalım ki gece kimse tahmin yürütmesin.”", reply: "Deniz: “Kılavuz fikri harika. İlk sayfayı sen yazar mısın?”", trust: { deniz: 1 } }, { label: "“Bu iş veri bilimcilerin değil.”", reply: "Deniz: “Model senin, gece de senin.” Haklı." }] }] },
  { id: "ev_ch6_vendor", who: "burak", days: [43, 48], notify: "Satıcı demosu", title: "%99 doğruluk vaadi", xp: 15, rewards: { statistics: 3 },
    steps: [{ type: "choice", who: "burak", prompt: "“Bir satıcı 'dolandırıcılık modelimiz %99 doğru' diyor. Satın alalım mı?”", goal: "Satıcı iddiasını değerlendirmek.",
      options: [{ label: "%99 iyi, alalım", fb: "Dolandırıcılık %0,5 ise herkese 'temiz' diyen model de %99,5." }, { label: "Bizim verimizle, zaman ayrımlı bir testte recall ve yanlış alarm maliyetini görmeden hayır", correct: true, fb: "Burak: “Satıcı kendi verimizle test kabul etti. %99 oradan sonra %71 recall'a döndü.”" }] }] },
  { id: "ev_ch7_hiring", who: "alex", days: [50, 54], notify: "Mülakat paneline katılır mısın?", title: "Mülakat", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "alex", prompt: "“Aday, son projesinde %99 AUC aldığını söylüyor. Hangi soruyu sorarsın?”", goal: "Bir adayı düşünme biçimiyle değerlendirmek.",
      options: [{ label: "“Hangi algoritmayı kullandın?”", fb: "Algoritma, en az bilgi veren sorudur." }, { label: "“Tahmin anında hangi bilgiler vardı ve test setini nasıl ayırdın?”", correct: true, fb: "Aday duraksıyor: test setini rastgele ayırmış ve iptal tarihi özniteliği varmış. Alex not alıyor." }] }] },
  { id: "ev_ch7_alex", who: "alex", days: [51, 54], notify: "Kahve?", title: "Alex yorgun",
    steps: [{ type: "reply", who: "alex", prompt: "Alex: “Üç projeye birden bakıyorum. Açıkçası tükeniyorum.”",
      options: [{ label: "“Birini benimle birlikte sonraki çeyreğe kaydıralım; hangisi en az etkili?”", reply: "Alex rahatlıyor: “Teşekkürler. Bunu söylemek zordu.”", trust: { alex: 2 } }, { label: "“Herkes yoğun, biraz daha dayan.”", reply: "Alex başını sallıyor ama gözleri yorgun." }] }] },
  { id: "ev_ch8_press", who: "zeynep", days: [56, 59], notify: "Bir gazeteci arıyor", title: "Basın sorusu", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "zeynep", prompt: "“Bir gazeteci müşteri kararlarında yapay zekâ kullanıp kullanmadığımızı soruyor. Ne diyelim?”", goal: "YZ kullanımında şeffaflık ve hesap verebilirlik.",
      options: [{ label: "“Yorum yok.”", fb: "Saklanan bilgi, haber olunca güveni daha çok yıkar." }, { label: "Hangi kararlarda model kullandığımızı, insan gözetimini ve itiraz yolunu açıkça anlatalım", correct: true, fb: "Haber 'şeffaf YZ kullanımı' başlığıyla çıkıyor." }] }] },
  { id: "ev_ch8_buse", who: "buse", days: [57, 59], notify: "Buse terfi etti!", title: "Buse'nin terfisi",
    steps: [{ type: "reply", who: "buse", prompt: "Buse: “Kıdemli Veri Bilimci oldum! İlk gün medyanı sana sormuştum, hatırlıyor musun?”",
      options: [{ label: "“Hatırlıyorum. Şimdi sıra sende: bir stajyere aynı soruyu sabırla cevapla.”", reply: "Buse gülümsüyor: “Söz.”" }, { label: "“Tebrikler, hak ettin.”", reply: "Buse: “Senden öğrendim.”" }] }] }
];
LATE_EVENTS.forEach(e => { e.kind = "event"; e.modal = true; EVENTS.push(e); EVENT_BY_ID[e.id] = e; });
linkSrc("mf.target", "ev_ch4_label"); linkSrc("mo.baseline", "ev_ch4_gpu"); linkSrc("gen.eval", "ev_ch5_llm"); linkSrc("ev.accuracy", "ev_ch6_vendor"); linkSrc("ra.oversight", "ev_ch8_press");
Object.assign(EVENINGS, {
  28: [{ label: "Eve git", result: "İlk modelinin temel modeli geçtiğini kutlamak için erken çıktın." }, { label: "20 dakika kal ve incele", late: true, result: "Hata analizinde yeni müşterilerde modelin zayıf olduğunu fark ettin.", skills: { dataExploration: 2 } }, { label: "Buse'yle konuş", result: "Buse'ye train/test ayrımını çizerek anlattın.", trust: { alex: 1 } }],
  37: [{ label: "Eve git", result: "Kalibrasyon grafiği rüyana girmedi." }, { label: "20 dakika kal ve incele", late: true, result: "SHAP grafiğinde bir öznitelik hatası buldun ve düzelttin.", skills: { statistics: 2 } }, { label: "Zeynep'le konuş", result: "Zeynep pazarlama ekibine açıklanabilirlik sunumu istiyor.", trust: { zeynep: 1 } }],
  45: [{ label: "Eve git", result: "Nöbet sende değil. Telefon sessiz." }, { label: "20 dakika kal ve incele", late: true, result: "Önyargı analizinde küçük bir alt grubu yeniden kontrol ettin; sonuç değişmedi." }, { label: "Deniz'le konuş", result: "Müdahale kılavuzunun ilk taslağı bitti.", trust: { deniz: 1 } }],
  52: [{ label: "Eve git", result: "Ekibine erken çıkmalarını söyledin. Sen de çıktın." }, { label: "20 dakika kal ve incele", late: true, result: "Yarınki kapsam toplantısı için seçenekleri tek sayfaya döktün.", skills: { businessThinking: 2 } }, { label: "Alex'le konuş", result: "Alex'le hangi projeden vazgeçileceğini konuştunuz.", trust: { alex: 1 } }],
  57: [{ label: "Eve git", result: "Boğaz'da yürüdün. On iki yıl hızlı geçti." }, { label: "20 dakika kal ve incele", late: true, result: "Yarınki kurul sunumunun ilk cümlesini on kez yeniden yazdın." }, { label: "Ekiple dinlenme alanına geç", result: "Ekip sana küçük bir sürpriz yapmış: ilk gün kartının fotoğrafı.", trust: { alex: 1, deniz: 1, zeynep: 1 } }]
});
SLACK.push(
  { day: 24, ch: "#veri-bilimi", msgs: [["alex", "Veri bilimi ekibine hoş geldin! 🎉"], ["maya", "İlk kural: model kurmadan önce problemi kur."]] },
  { day: 28, ch: "#veri-bilimi", msgs: [["buse", "Temel model %70 recall, benim model %72… 😅"], ["alex", "Fark yoksa temel kazanır."]] },
  { day: 33, ch: "#genel", msgs: [["deniz", "Yeni Veri Bilimcimiz! 👏"], ["zeynep", "Modelini pazarlamaya da anlatır mısın?"]] },
  { day: 37, ch: "#veri-bilimi", msgs: [["alex", "Kalibrasyon grafiği eğri çıktı, neden?"], ["maya", "Olasılık ≠ sıralama."]] },
  { day: 41, ch: "#genel", msgs: [["deniz", "Kıdemli Veri Bilimcimizi tebrik ediyoruz!"], ["burak", "Artık canlı sistemler de sizde 😄"]] },
  { day: 44, ch: "#olaylar", msgs: [["deniz", "Feature pipeline gecikti, alarm açıldı."], ["alex", "Kılavuz 3. adım: önce etkilenen müşteri sayısı."]] },
  { day: 49, ch: "#liderlik", msgs: [["maya", "Artık soruların cevabı değil, doğru soruyu soran sensin."], ["buse", "İlk model review'ım yarın 😬"]] },
  { day: 55, ch: "#genel", msgs: [["ceo", "Yeni Veri Direktörümüze hoş geldin diyelim."], ["deniz", "Ofisin en eski kahve müşterisi artık yönetim katında ☕"]] }
);

/* ---------- 6) Ara animasyonlar ve ilerleme göstergeleri ---------- */
function introOverlay(html, cls, ms) {
  if (!animOn()) return;
  document.querySelector(".intro-ov")?.remove();
  const o = document.createElement("div"); o.className = `intro-ov ${cls}`; o.innerHTML = html; o.tabIndex = -1;
  const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 450); };
  o.addEventListener("click", close); document.body.appendChild(o); o.focus();
  if (ms) setTimeout(close, ms);
}
startChapter = (orig => function (n) {
  orig(n);
  const cm = CAREER_MAP[n - 1], branches = SKILL_TREE.filter(x => x.ch === n).map(x => x.name);
  introOverlay(`<div class="ci-card"><span class="ci-num">${n}. BÖLÜM</span><span class="ci-time">${cm.time}</span><h2>${cm.role}</h2><p>${cm.axis}</p>
    ${branches.length ? `<div class="ci-branches"><span>Yeni yetenek dalları</span>${branches.map(b => `<i>${b}</i>`).join("")}</div>` : ""}
    <div class="ci-guide">Rehberlik: ${GUIDANCE[n].label}</div><button class="primary-button">Başla</button></div>`, "chapter-intro", 0);
})(startChapter);
let lastIntroCase = null;
go = (orig => function (screen, param) {
  orig(screen, param);
  if (screen === "case" && param && CASE_BY_ID[param] && lastIntroCase !== param) {
    const c = CASE_BY_ID[param], pr = player.progress[param];
    if (pr && pr.step > 0) return;
    lastIntroCase = param;
    introOverlay(`<div class="cs-card"><span class="cs-num">VAKA ${c.num}</span><h2>${c.title}</h2><p>${c.short}</p>
      <div class="cs-meta"><span>${c.concept.name}</span><span>Zorluk ${"●".repeat(Math.max(1, c.difficulty || 1))}${"○".repeat(Math.max(0, Math.max(3, c.difficulty || 1) - Math.max(1, c.difficulty || 1)))}</span><span>+${c.xp} XP</span>${c.promotion ? "<span class='promo'>Terfi vakası</span>" : ""}</div></div>`, "case-intro", 2100);
  }
})(go);
renderTop = (orig => function () {
  orig();
  if (!player.started) { document.getElementById("careerTrack")?.remove(); return; }
  let t = document.getElementById("careerTrack");
  if (!t) { t = document.createElement("div"); t.id = "careerTrack"; t.className = "career-track"; const cs = document.querySelector(".career-status"); if (cs) cs.insertBefore(t, cs.querySelector(".phone-btn")); }
  const ch = player.chapter || 1, cs = CASES.filter(c => (c.chapter || 1) === ch), done = cs.filter(c => isDone(c.id)).length;
  t.innerHTML = `<span class="status-label">Kariyer: ${ch}. bölüm / 8</span><div class="ct-segs">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<i class="${i < ch || (i === ch && player.chapterDone) ? "done" : i === ch ? "now" : ""}" title="${CAREER_MAP[i - 1].role}">${i === ch && !player.chapterDone ? `<b style="width:${done / Math.max(1, cs.length) * 100}%"></b>` : ""}</i>`).join("")}</div>`;
})(renderTop);

/* ---------- 4. bölüm yan görevleri ---------- */
[
  { id: "sq_ch4_split", chapter: 4, after: "case026", hot: "alex", who: "buse", title: "Buse'nin train/test kodu", xp: 45, rewards: { dataExploration: 5 },
    lesson: "Ön işleme (ölçekleme, eksik değer doldurma) yalnızca eğitim verisiyle öğrenilir, sonra teste uygulanır. Aksi hâlde test bilgisi eğitime sızar.",
    steps: [{ type: "dialog", who: "buse", cta: "Kodu aç", lines: ["Buse: “Modelim testte de çok iyi. Ama Alex 'bir şey sızıyor' diyor. Nerede?”"] },
      { type: "pick", label: "Bul", correct: "l2", prompt: "Sızıntıya yol açan satıra tıkla.", goal: "Ön işlemede veri sızıntısını görmek.",
        picks: { l2: "Ölçekleyici tüm veriyle (test dahil) eğitiliyor; test setinin ortalaması ve varyansı modele sızıyor. Önce böl, sonra yalnızca eğitimle fit et.", other: "Bu satır doğru." },
        visual: (d, id) => `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>buse_model.ipynb</span></div>${["X, y = df[features], df['churn_30d']", "X = StandardScaler().fit_transform(X)", "X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2)", "model = LogisticRegression().fit(X_tr, y_tr)"].map((l, i) => `<div class="code-line pickable" ${pickAttrs(id, "l" + (i + 1))}><span class="ln">${i + 1}</span><code>${l}</code></div>`).join("")}</div>` }] },
  { id: "sq_ch4_missing", chapter: 4, after: "case028", hot: "teamboard", who: "deniz", title: "Boş gelir alanı", xp: 40, rewards: { dataQuality: 5 },
    lesson: "Eksik değerin kendisi bilgi taşıyabilir. Doldurmadan önce neden eksik olduğunu sor; gerekirse 'eksik mi?' bayrağını ayrı bir öznitelik yap.",
    steps: [{ type: "choice", who: "deniz", prompt: "Deniz: “Müşterilerin %18'inde 'gelir' alanı boş. Ekip ortalamayla dolduralım diyor. Sence?”", goal: "Eksik değeri bilgi olarak düşünmek.",
      options: [{ label: "Ortalamayla doldurmak yeterli", fb: "Eksiklik rastgele değilse (örneğin hiç fatura almamış müşteriler) bu bilgiyi silmiş olursun." },
        { label: "Önce neden eksik olduğuna bakalım; eğitim verisinin medyanıyla doldurup ayrıca 'gelir_eksik' bayrağı ekleyelim", correct: true, fb: "Deniz: “Eksik olanların churn oranı iki katıymış. Bayrak modelin en güçlü özniteliklerinden biri çıktı.”" }] }] }
].forEach(q => { q.kind = "quest"; q.modal = true; QUESTS.push(q); QUEST_BY_ID[q.id] = q; });
linkSrc("fe.leak", "sq_ch4_split"); linkSrc("mo.split", "sq_ch4_split"); linkSrc("fe.missing", "sq_ch4_missing");

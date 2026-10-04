
/* =====================================================================
   CHAPTER 3 — VERİ ANALİSTİ (11 ay sonra), BİRİNCİ PARÇA: VAKA 015–019
   Zincir: segmentasyon → kohort → huni → karıştırıcı → deney tuzakları
   Her vakada bir Python (pandas) adımı. Rehberlik: ipucu XP'ye mal olur.
   ===================================================================== */
CH_START[3] = 15;
PROMOTIONS[3] = { title: "Junior Veri Bilimci", req: { analytics: 2, exppit: 3, causal: 3, python: 3, privacy: 1, forecasting: 1, "eda@2": 3 } };

function pyCard(file, lines, out) {
  return `<div class="code-card py"><div class="code-top"><i></i><i></i><i></i><span>${file}</span></div>${lines.map((l, i) => `<div class="code-line"><span class="ln">${i + 1}</span><code>${l.replace(/\b(import|as|def|return|for|in|True|False)\b/g, "<b>$1</b>").replace(/('[^']*')/g, "<em>$1</em>")}</code></div>`).join("")}${out ? `<div class="py-out"><span>Çıktı</span>${out}</div>` : ""}</div>`;
}
const COHORT = { Oca: [100, 62, 51, 46, 43, 41], Şub: [100, 61, 50, 45, 42], Mar: [100, 44, 33, 29], Nis: [100, 42, 31], May: [100, 43] };
function cohortHeat(id, pick) {
  const cols = ["Ay 0", "Ay 1", "Ay 2", "Ay 3", "Ay 4", "Ay 5"];
  return `<div class="table-wrap"><table class="data-table heat"><thead><tr><th>Kayıt ayı (kohort)</th>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>
    ${Object.entries(COHORT).map(([k, v]) => `<tr ${pick ? `class="pickable" ${pickAttrs(id, slug(k))}` : ""}><td class="first">${k} 2025</td>${cols.map((_, i) => v[i] != null ? `<td style="--h:${v[i]}"><span>%${v[i]}</span></td>` : `<td class="empty"></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const FUNNEL = [["Ziyaret", 50000, 50000], ["Ürün görüntüleme", 31000, 30500], ["Sepete ekleme", 9300, 9150], ["Ödeme sayfası", 5600, 5500], ["Satın alma", 3900, 2090]];
function funnelBars(id, pick) {
  return `<div class="funnel">${FUNNEL.map(([n, a, b], i) => { const drop = i ? Math.round((1 - b / FUNNEL[i - 1][2]) * 100) : 0, prev = i ? Math.round((1 - a / FUNNEL[i - 1][1]) * 100) : 0;
    return `<div class="fn-row ${pick ? "pickable" : ""}" ${pick ? pickAttrs(id, "s" + i) : ""} style="--w:${b / 500}%"><span class="fn-name">${n}</span><div class="fn-bar"><i></i><b>${fmtNum(b)}</b></div><span class="fn-drop">${i ? `−%${drop} <small>(geçen ay −%${prev})</small>` : ""}</span></div>`; }).join("")}</div>`;
}

const CH3A_CASES = [
{
  id: "case015", num: "015", chapter: 3, title: "Kaybolan Müşteri", difficulty: 2, xp: 180, after: "case014",
  short: "Müşteri sayısı büyüyor ama tekrar alım oranı düşüyor. Hangi müşteriler kayboluyor?",
  tags: ["Kohort", "Tutundurma", "Python"], nodes: ["analytics", "python"], rewards: { dataExploration: 8, businessThinking: 4 },
  concept: { name: "Kohort analizi", en: "cohort analysis", text: "Müşterileri başladıkları döneme göre gruplayıp her grubun zaman içindeki davranışını izlemek. Karışık bir ortalamanın gizlediği değişimleri gösterir.", points: [] },
  mentor: "Ortalama tutundurma oranı geçmişle bugünü karıştırır. Kohort tablosu ikisini ayırır.",
  portfolio: { title: "Mart kohortu tutundurma analizi", text: "Kohort tablosuyla tutundurmadaki düşüşün Mart'tan itibaren gelen yeni müşterilerde başladığını ve ilk sipariş kuponunun kaldırılmasına denk geldiğini gösterdim." },
  review: { happened: "Tekrar alım oranındaki düşüş eski müşterilerden değil, Mart'tan sonra kaydolanlardan geliyordu.", discovered: "Kohort tablosu her müşteri grubunu kendi başlangıç noktasından izleyerek karışımı ayırdı.", habit: "Tutundurma ya da tekrar alım soruluyorsa önce kayıt dönemine göre kohort kur.", watch: "Son kohortların az gözlemi vardır; ilk aylarını eski kohortların ilk aylarıyla karşılaştır." },
  steps: [
    { type: "dialog", who: "burak", cta: "Veriye bak", lines: ["Aktif müşteri sayımız büyüyor ama tekrar alım oranı %48'den %39'a düştü. CFO endişeli.", "Maya: Ne olduğunu değil, neden olduğunu soruyorum bu sbuser."] },
    { type: "choice", label: "Soruyu kur", prompt: "Tek bir 'tekrar alım oranı' bu soruyu neden cevaplayamaz?", goal: "Ortalamanın karışık gruplar barındırdığını fark etmek.",
      think: ["Bu oranı kimler oluşturuyor: yeni gelenler mi, yıllardır alışveriş yapanlar mı?"], hints: [{ t: "Müşteri tabanı büyüyorsa, oranda yeni müşterilerin payı da büyür." }],
      options: [{ label: "Oran yanlış hesaplanmıştır", fb: "Hesap doğru; sorun neyi karıştırdığı." },
        { label: "Yeni ve eski müşteriler aynı oranda karışıyor; büyüyen yeni müşteri akışı oranı değiştirebilir. Müşterileri başladıkları aya göre ayırmalıyım.", correct: true, fb: "Aynen. Bu ayrıma kohort denir. Şimdi tabloyu kuralım." },
        { label: "Daha uzun bir dönemin ortalamasına bakmak gerekir", fb: "Daha uzun ortalama karışımı daha da büyütür." }] },
    { type: "builder", label: "Python", prompt: "pandas ile kohort tablosunu kur", sub: "pivot_table'ın parametrelerini seç ve çalıştır.", goal: "pivot_table ile kohort tablosu oluşturmak.",
      think: ["Satırlarda ne olmalı: müşterinin başladığı ay mı, siparişin ayı mı?", "Bir müşteri bir ayda birden çok sipariş verebilir; neyi saymalısın?"],
      hints: [{ t: "Satırlar kohort (kayıt ayı), sütunlar kayıttan bu yana geçen ay olmalı." }, { t: "count sipariş sayar; aynı müşteri iki kez sayılır. Tekil müşteriyi saymalısın." }],
      fields: [
        { key: "index", label: "index (satırlar)", options: [["signup_month", "'signup_month'"], ["order_month", "'order_month'"]] },
        { key: "columns", label: "columns (sütunlar)", options: [["months_since", "'months_since_signup'"], ["order_month", "'order_month'"]] },
        { key: "agg", label: "aggfunc", options: [["count", "'count'"], ["nunique", "'nunique'"]] }],
      run: "Hücreyi çalıştır",
      visual: d => pyCard("kohort.ipynb", ["import pandas as pd", "orders = pd.read_parquet('orders.parquet')", `cohort = orders.pivot_table(index='${d.index || "?"}', columns='${d.columns === "months_since" ? "months_since_signup" : d.columns || "?"}',`, `                            values='customer_id', aggfunc='${d.agg || "?"}')`, "retention = cohort.div(cohort[0], axis=0) * 100"],
        d.ran ? (d.index === "signup_month" && d.columns === "months_since" && d.agg === "nunique" ? cohortHeat() : d.index === "order_month" ? "<p class='muted'>Satırlar sipariş ayı: her müşteri birçok satıra dağıldı, kohort oluşmadı.</p>" : d.columns === "order_month" ? "<p class='muted'>Sütunlar takvim ayı: kohortlar farklı yerlerden başlıyor, karşılaştırılamıyor.</p>" : "<p class='muted'>Tutundurma %100'ü aşıyor: aynı müşterinin birden çok siparişi ayrı sayıldı.</p>") : ""),
      check: d => d.index === "signup_month" && d.columns === "months_since" && d.agg === "nunique" ? { ok: true, title: "Kohort tablosu hazır", fb: "Her satır bir kayıt ayı, her sütun kayıttan bu yana geçen ay. Şimdi tabloyu oku." }
        : d.agg === "count" && d.index === "signup_month" ? { ok: false, fb: "Tutundurma %100'ü aşıyor: count siparişleri sayıyor, tekil müşteriyi değil. Hangi aggfunc tekil sayar?" }
        : { ok: false, fb: "Tablo kohort gibi görünmüyor. Satırlar müşterinin başladığı ay, sütunlar o andan bu yana geçen süre olmalı." } },
    { type: "pick", label: "Oku", correct: "mar", prompt: "Tutundurmanın kötüleşmeye başladığı ilk kohorta tıkla.", goal: "Kohort tablosunda kırılma noktasını bulmak.",
      hints: [{ t: "'Ay 1' sütununu yukarıdan aşağı oku." }],
      picks: { mar: "Mart kohortundan itibaren Ay 1 tutundurması %61–62'den %44'e düşüyor. Eski kohortlar aynı yaşlarda hâlâ normal.", oca: "Ocak kohortu normal: Ay 1'de %62.", sub: "Şubat kohortu normal: Ay 1'de %61.", other: "Bu kohort zaten düşük, ama ilk kırılma daha önce." },
      visual: (d, id) => chartCard("Kohort tutundurması: ilk ay %100", cohortHeat(id, true)) },
    { type: "choice", label: "Açıkla", prompt: "Mart'ta ne değişmiş olabilir?", goal: "Kohort kırılmasını bir olayla eşleştirmek.",
      hints: [{ t: "Sadece yeni kohortlar etkileniyor. Hangi değişiklik sadece yeni müşterileri etkiler?" }],
      visual: () => noteCard("Ürün değişiklik günlüğü", "3 Mart: ilk siparişte %20 hoş geldin kuponu kaldırıldı. 15 Mart: kargo ücreti eşiği 250 ₺'den 300 ₺'ye çıktı (tüm müşteriler)."),
      options: [{ label: "Kargo eşiğinin artması", fb: "Bu tüm müşterileri etkiler; eski kohortlar da düşerdi. Onlar sabit." },
        { label: "Hoş geldin kuponunun kaldırılması: sadece yeni gelenlerin ilk deneyimini etkiliyor", correct: true, fb: "Eski kohortlar etkilenmemiş, Mart'tan sonrakiler etkilenmiş. Kupon olmadan gelen müşteri daha az bağlanıyor gibi görünüyor; bunu bir deneyle doğrulamak gerekir." },
        { label: "Müşteriler genel olarak sadakatsizleşiyor", fb: "Eski kohortlar aynı yaşta aynı tutundurmayı gösteriyor." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir spor salonunda üyelik iptalleri arttı. İlk analizin ne olur?", goal: "Kohort düşüncesini başka bir veride uygulamak.",
      options: [{ label: "Toplam iptal oranının aylık grafiği", fb: "Yeni ve eski üyeler yine karışır." }, { label: "Üyeleri başlangıç ayına göre gruplayıp her grubun aynı yaştaki iptal oranını karşılaştırmak", correct: true, fb: "Kohort. Sonra kırılmanın olduğu dönemde ne değiştiğine bakarsın." }] }
  ]
},
{
  id: "case016", num: "016", chapter: 3, title: "Huniyi Kur", difficulty: 2, xp: 180, after: "case015",
  short: "Trafik aynı, satışlar düştü. Müşteriyi hangi adımda kaybediyoruz?",
  tags: ["Huni", "Python groupby", "Tekil sayım"], nodes: ["analytics", "python"], rewards: { dataExploration: 8, businessThinking: 4 },
  concept: { name: "Huni analizi", en: "funnel analysis", text: "Kullanıcı yolculuğunu sıralı adımlara bölüp her adımda kaybedilen oranı ölçmek. Kayıp en çok nerede arttıysa, sorun oradadır.", points: [] },
  mentor: "Huni, 'satış düştü' cümlesini 'şu adımda şu kadar kişiyi kaybediyoruz' cümlesine çevirir.",
  portfolio: { title: "Ödeme hunisi analizi", text: "Satış düşüşünün ödeme sayfasındaki yeni güvenlik adımından, özellikle mobilde geldiğini huni analiziyle gösterdim." },
  review: { happened: "Satın alma adımındaki kayıp %30'dan %62'ye çıkmıştı; diğer adımlar sabitti.", discovered: "Adımları doğru sırayla kurup tekil kullanıcı sayınca sorun tek adımda göründü.", habit: "Dönüşüm düştüğünde önce huniyi kur ve her adımı geçen dönemle karşılaştır.", watch: "Olay sayısı ile kullanıcı sayısı farklıdır; aynı kişi bir adımı birçok kez tekrarlayabilir." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Huniye bak", lines: ["Bu ay satışlar %46 düştü ama site trafiği neredeyse aynı. Pazarlama 'reklamlar kötü' diyor.", "Ben bilmiyorum. Müşteriyi nerede kaybediyoruz?"] },
    { type: "builder", label: "Python", prompt: "Her huni adımında kaç kişi var? pandas ile say.", goal: "Olay ile kullanıcı sayımını ayırmak.",
      think: ["Aynı kişi ürün sayfasını beş kez görebilir. Neyi saymak istiyorsun?"], hints: [{ t: "count olayları sayar; nunique tekil kullanıcıları." }],
      fields: [{ key: "agg", label: "events.groupby('step')['user_id'].", options: [["count", "count()"], ["nunique", "nunique()"]] }],
      run: "Hücreyi çalıştır",
      visual: d => pyCard("huni.ipynb", ["events = pd.read_parquet('events_october.parquet')", `funnel = events.groupby('step')['user_id'].${d.agg || "?"}()`, "funnel.sort_values(ascending=False)"],
        d.ran ? dataTable(["Adım", "Sonuç"], d.agg === "count" ? [["Ziyaret", "50.000"], ["Ürün görüntüleme", "94.800"], ["Sepete ekleme", "12.300"], ["Ödeme sayfası", "7.900"], ["Satın alma", "2.140"]] : FUNNEL.map(([n, , b]) => [n, fmtNum(b)])) : ""),
      check: d => d.agg === "nunique" ? { ok: true, title: "Kişi sayıları hazır", fb: "Her adımda kaç farklı kullanıcı olduğunu biliyoruz. Şimdi huniyi çiz." }
        : { ok: false, fb: "Ürün görüntüleme ziyaretten fazla çıktı: 94.800 > 50.000. count, aynı kişinin her görüntülemesini ayrı sayıyor." } },
    { type: "pick", label: "Bul", correct: "s4", prompt: "Kaybın en çok arttığı adıma tıkla.", goal: "Huni adımlarını geçen dönemle karşılaştırmak.",
      hints: [{ t: "Her adımın düşüşünü geçen ayın aynı adımıyla karşılaştır." }],
      picks: { s4: "Ödeme sayfasından satın almaya geçişte kayıp %30'dan %62'ye çıkmış. Diğer adımlar geçen ayla neredeyse aynı.", s1: "Ürün görüntülemeye geçiş geçen ayla aynı.", s2: "Sepete ekleme oranı değişmemiş.", s3: "Ödeme sayfasına geçiş normal.", other: "Bu adım geçen ayla aynı." },
      visual: (d, id) => chartCard("Ekim hunisi (tekil kullanıcı)", funnelBars(id, true)) },
    { type: "choice", label: "Açıkla", prompt: "Ödeme adımında ne oldu?", goal: "Huni bulgusunu bağlamla açıklamak.",
      hints: [{ t: "Cihaz kırılımına ve değişiklik günlüğüne birlikte bak." }],
      visual: () => dataTable(["Cihaz", "Ödeme → satın alma (Eylül)", "Ekim"], [["Masaüstü", "%71", "%68"], ["Mobil", "%69", "%24"]]) + noteCard("Değişiklik günlüğü", "10 Ekim: kart ödemelerine yeni 3D Secure doğrulama adımı eklendi. Mobil uygulamada SMS kodu ekranı yeni sekmede açılıyor."),
      options: [{ label: "Reklamlar kötü trafik getiriyor", fb: "Trafik kalitesi önceki adımları da etkilerdi; onlar sabit." },
        { label: "Yeni 3D Secure adımı mobilde kırılıyor: SMS ekranı yeni sekmede açılınca kullanıcı ödemeyi tamamlayamıyor", correct: true, fb: "Masaüstü normal, mobil çökmüş. Ürün ekibi bugün düzeltiyor." },
        { label: "Fiyatlar pahalı geldi", fb: "Fiyat sepete eklemeyi de etkilerdi." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir kredi başvuru formunu başlatanların sadece %20'si tamamlıyor. İlk ne yaparsın?", goal: "Huni düşüncesini başka bir süreçte uygulamak.",
      options: [{ label: "Formu baştan tasarlarım", fb: "Neyin bozuk olduğunu bilmeden yeniden tasarım pahalı bir tahmin." }, { label: "Formun her bölümünü huni adımı olarak ölçer, terkin nerede yoğunlaştığını bulurum", correct: true, fb: "Önce nerede, sonra neden." }] }
  ]
},
{
  id: "case017", num: "017", chapter: 3, title: "Simpson Paradoksu", difficulty: 3, xp: 190, after: "case016",
  short: "Dönüşüm arttı ama her segmentte düştü. Nasıl mümkün?",
  tags: ["Karışım etkisi", "Simpson", "Python"], nodes: ["causal", "stats", "python"], rewards: { statistics: 10 },
  concept: { name: "Simpson paradoksu", en: "Simpson's paradox", text: "Segment karışımı değişince toplam oran, her segmentteki eğilimin tersine dönebilir.", points: [] },
  mentor: "Toplam sana bir hikâye anlatır, segmentler başka bir hikâye. Hangisinin soruya cevap verdiğine sen karar verirsin.",
  portfolio: { title: "Ödeme sayfası karışım etkisi", text: "Toplam dönüşüm artarken her cihazda düştüğünü, artışın trafik karışımından geldiğini gösterdim." },
  review: null, steps: null
},
{
  id: "case018", num: "018", chapter: 3, title: "İşe Yarayan Kampanya… Belki", difficulty: 3, xp: 190, after: "case017",
  short: "Kampanyadan sonra satış %18 arttı. Ama aynı hafta başka şeyler de oldu.",
  tags: ["Karıştırıcı", "Önce/sonra", "Python filtreleme"], nodes: ["causal", "stats", "python"], rewards: { statistics: 8, businessThinking: 6 },
  concept: { name: "Önce/sonra karşılaştırmasının sınırı", en: "before/after confounding", text: "Bir müdahaleden sonraki değişim, aynı dönemde olan her şeyin toplamıdır. Müdahalenin etkisini ayırmak için müdahale görmeyen bir karşılaştırma grubu gerekir.", points: [] },
  mentor: "Önce/sonra karşılaştırması 'ne değişti?' sorusunu cevaplar, 'neden?' sorusunu cevaplamaz.",
  portfolio: { title: "Kampanya etkisinin ayrıştırılması", text: "Kampanya sonrası %18'lik artışın büyük kısmının aynı haftaki indirim ve rakip stok sorunundan geldiğini, kampanyasız bölgelerle karşılaştırarak gösterdim." },
  review: { happened: "Kampanya haftasında indirim ve rakip stok sorunu da vardı; kampanyasız bölgeler de %12 büyüdü.", discovered: "Müdahale görmeyen bir grup, aynı dönemdeki diğer etkileri tahmin etmeyi sağladı.", habit: "Bir müdahaleyi değerlendirirken sor: müdahale olmasaydı ne olurdu, bunu neyle tahmin ederim?", watch: "Karşılaştırma grubu benzer değilse bu kaba tahmin de yanılır; ayrıntısını 020'de göreceğiz." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Rakamlara bak", lines: ["Yeni TV kampanyası başladıktan sonraki hafta satışlar %18 arttı! Bütçeyi ikiye katlayalım mı?", "Maya 'önce analist bir baksın' dedi. Yine."] },
    { type: "choice", label: "Takvim", prompt: "Takvime bak: %18'in ne kadarı kampanyadan?", goal: "Önce/sonra karşılaştırmasındaki karıştırıcıları görmek.",
      think: ["Aynı hafta satışları etkileyebilecek başka ne oldu?"], hints: [{ t: "Takvimde kampanya dışında iki olay daha var." }],
      visual: () => noteCard("Kampanya haftası takvimi", "Pazartesi: TV kampanyası 4 bölgede başladı. Aynı gün: tüm şirkette %10 fiyat indirimi. Çarşamba: en büyük rakipte stok sorunu, 10 gün sürdü.") + kpiStrip([["Önceki hafta", "1,40 Mn ₺"], ["Kampanya haftası", "1,65 Mn ₺"], ["Değişim", "+%18"]]),
      options: [{ label: "Tamamı, kampanya başlayınca arttı", fb: "Sonuç ne olurdu? Bütçe ikiye katlanır; indirim ve rakip etkisi bittiğinde satışlar geri düşer ve kampanya 'işe yaramadı' sanılır." },
        { label: "Bu veriyle ayıramıyoruz: aynı hafta indirim ve rakip stok sorunu da var", correct: true, fb: "Doğru. Önce/sonra karşılaştırması aynı dönemdeki her şeyi birlikte ölçer. Bir karşılaştırma grubu lazım." }] },
    { type: "builder", label: "Python", prompt: "Kampanya görmeyen bölgelerde ne oldu? pandas ile filtrele.", goal: "Müdahale görmeyen bir karşılaştırma grubu bulmak.",
      think: ["Kampanya sadece 4 bölgede başladı. Diğer bölgeler sana ne söyler?"], hints: [{ t: "İndirim ve rakip etkisi tüm bölgelerde var; kampanya sadece bazılarında." }],
      fields: [{ key: "sub", label: "sales[ ... ]", options: [["all", "tüm bölgeler"], ["camp", "sales.region.isin(kampanya_bolgeleri)"], ["ctrl", "~sales.region.isin(kampanya_bolgeleri)"]] }],
      run: "Hücreyi çalıştır",
      visual: d => pyCard("kampanya.ipynb", ["kampanya_bolgeleri = ['İstanbul', 'Ankara', 'İzmir', 'Bursa']", `sub = sales[${{ all: ":", camp: "sales.region.isin(kampanya_bolgeleri)", ctrl: "~sales.region.isin(kampanya_bolgeleri)" }[d.sub] || "?"}]`, "sub.groupby('week')['revenue'].sum().pct_change()"],
        d.ran ? kpiStrip([["Seçilen grup", { all: "Tüm bölgeler", camp: "Kampanya bölgeleri", ctrl: "Kampanyasız bölgeler" }[d.sub]], ["Haftalık değişim", { all: "+%17", camp: "+%18", ctrl: "+%12" }[d.sub]]]) : ""),
      check: d => d.sub === "ctrl" ? { ok: true, title: "Karşılaştırma grubu", fb: "Kampanya görmeyen bölgeler de %12 büyümüş: indirim ve rakip etkisi kampanya olmadan da bu kadar artış yaratıyor." }
        : { ok: false, fb: d.sub === "camp" ? "Bu yine kampanya bölgeleri: +%18, aynı karışık rakam." : "Bu tüm bölgeler: kampanyalı ve kampanyasız karışık." } },
    { type: "choice", label: "Tahmin et", prompt: "Kampanyanın etkisi için en makul kaba tahmin ne?", goal: "Karşılaştırma grubuyla etkiyi kabaca ayırmak.",
      hints: [{ t: "Kampanya olmasaydı kampanya bölgeleri de muhtemelen diğerleri kadar büyürdü." }],
      options: [{ label: "+%18", fb: "Bu, kampanya ile diğer etkilerin toplamı." }, { label: "Yaklaşık +6 puan (18 − 12); bölgeler benzerse", correct: true, fb: "Kaba ama dürüst bir tahmin. Bunun ne zaman geçerli olduğunu 020'de, fark içinde fark yöntemiyle göreceğiz." }, { label: "+%12", fb: "Bu kampanyasız bölgelerin büyümesi; kampanyanın etkisi değil." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Yeni bir müdür geldikten sonra ekibin verimliliği %15 arttı. Aynı ay yeni bir yazılım da kullanılmaya başlandı. Müdür ne kadar etkili?", goal: "Karıştırıcıyı başka bir müdahalede tanımak.",
      options: [{ label: "%15 kadar", fb: "Yazılımın etkisi de bu rakamın içinde." }, { label: "Bu veriyle ayıramayız; yazılımı kullanan ama müdürü değişmeyen bir ekip karşılaştırma grubu olabilir", correct: true, fb: "Karşılaştırma grubu: müdahalenin biri var, diğeri yok." }] }
  ]
},
{
  id: "case019", num: "019", chapter: 3, title: "Deneyin Tuzakları", difficulty: 3, xp: 200, after: "case018",
  short: "Ürün ekibinin deney raporu: 'B kazandı.' Rapor dört tuzağa düşmüş olabilir.",
  tags: ["Ara bakış", "SRM", "Çoklu test", "Yenilik etkisi"], nodes: ["exppit", "experiment"], rewards: { statistics: 12 },
  concept: { name: "Deney tuzakları", en: "experiment pitfalls", text: "Ara bakış, örneklem oranı uyumsuzluğu, çoklu karşılaştırma ve yenilik etkisi, doğru kurulmuş bir deneyi bile yanıltabilir.", points: [] },
  mentor: "Bir deneyi yapmak kolaydır. Ona güvenebilmek için önce nasıl bozulabileceğini bilmen gerekir.",
  portfolio: { title: "Deney raporu denetimi", text: "Bir A/B raporunda ara bakış, SRM, çoklu karşılaştırma ve yenilik etkisini tespit edip deneyin düzeltilmiş tasarımını önerdim." },
  review: { happened: "Rapor erken durdurulmuş, gruplar dengesiz, 20 metrikten biri şans eseri anlamlı ve etki günden güne sönüyordu.", discovered: "Her tuzak farklı bir şekilde yanlış pozitif üretir; dördü birden olunca 'kazanan' tamamen şans olabilir.", habit: "Deney sonucunu okumadan önce kontrol listesi: süre, oran, birincil metrik, zaman içinde etki.", watch: "SRM varsa sonuçları hiç yorumlama; önce kurulumu düzelt." },
  steps: [
    { type: "dialog", who: "alex", cta: "Raporu aç", lines: ["Ürün ekibi yeni ödeme butonunun deney raporunu gönderdi: 'B kazandı, herkese açıyoruz.'", "Maya senin denetlemeni istiyor. Bence en az iki şey yanlış. Sen kaç tane bulacaksın?"] },
    { type: "tagger", label: "Denetle", prompt: "Rapordaki her bulguyu etiketle", sub: "Önce bir etiket seç, sonra uyduğu satırlara tıkla.", goal: "Deney raporundaki tuzakları tanımak.",
      think: ["Süre planlandığı gibi mi?", "Gruplar planlanan oranda mı?", "Kaç metriğe bakılmış?", "Etki zamanla nasıl değişiyor?"],
      hints: [{ t: "Plan 50/50 iken 10.412'ye 9.118 bir dağılım sorununa işaret eder: SRM." }, { t: "20 metrikten birinin anlamlı çıkması, %5 hata oranıyla tam beklenen şeydir." }],
      tags: [["ok", "Sorun yok"], ["peek", "Ara bakış"], ["srm", "SRM"], ["multi", "Çoklu karş."], ["novelty", "Yenilik etkisi"]],
      cols: ["Rapordaki bulgu"],
      rows: [
        [["Test 14 gün planlandı; 4. gün p = 0,03 görülünce durduruldu."], "peek"],
        [["Kullanıcı dağılımı A: 10.412, B: 9.118 (plan: %50 / %50)."], "srm"],
        [["20 metrik incelendi; yalnızca 'ortalama sepet' anlamlı çıktı."], "multi"],
        [["B'nin dönüşüm farkı 1. gün +%9, 4. gün +%1."], "novelty"],
        [["Randomizasyon kullanıcı düzeyinde yapıldı."], "ok"],
        [["Birincil metrik önceden 'satın alma dönüşümü' olarak belirlenmişti."], "ok"]],
      rowHints: { peek: "Planlanan süreden önce, ara sonuca bakılarak durdurulan bir test var.", srm: "Planlanan oranla gerçekleşen grup büyüklüklerini karşılaştır.", multi: "Çok sayıda metrikten yalnızca birinin anlamlı çıkması neye işaret eder?", novelty: "Zamanla sönen bir etki neyi düşündürür?", ok: "Bazı satırlar aslında doğru uygulamaları anlatıyor." },
      okText: "Dört tuzağın dördünü de buldun: ara bakış, SRM, çoklu karşılaştırma ve yenilik etkisi. Randomizasyon ve birincil metrik doğruydu." },
    { type: "choice", label: "Öncelik", prompt: "Dört sorundan hangisi sonucu tek başına geçersiz kılar?", goal: "SRM'nin neden en ciddi sorun olduğunu anlamak.",
      hints: [{ t: "Hangi sorun, gruplar arasındaki karşılaştırmanın kendisini bozar?" }],
      options: [{ label: "Yenilik etkisi", fb: "Önemli, ama etkinin büyüklüğünü değiştirir; karşılaştırmayı bozmaz." }, { label: "SRM: gruplar planlandığı gibi dağılmamışsa rastgelelik bozulmuştur; hiçbir sonuç yorumlanamaz", correct: true, fb: "Alex: “Bot filtresi B'deki kullanıcıları siliyormuş. Bütün test baştan.”" }, { label: "Çoklu karşılaştırma", fb: "Bu ikincil metrik sonucunu geçersiz kılar; ama SRM her şeyi." }] },
    { type: "choice", label: "Öner", prompt: "Ürün ekibine önerin:", goal: "Düzeltilmiş bir deney tasarımı önermek.",
      options: [{ label: "B'yi açın, fark küçük de olsa pozitif", fb: "Bozuk bir deneyden çıkan 'küçük pozitif' bilgi değildir." },
        { label: "Bot filtresini düzeltin; 14 gün tek birincil metrikle tekrar çalıştırın, ara bakmayın ve günlük etkiyi izleyin", correct: true, fb: "Dört tuzağa da karşılık gelen bir tasarım." },
        { label: "Testi tamamen bırakın, sezgiyle karar verin", fb: "Deney bozuldu diye deneysel yaklaşımdan vazgeçmek, ilacı bozuk diye tedaviden vazgeçmek gibi." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Pazarlama 12 farklı e-posta başlığını test edip en iyisini seçti; kazananın p değeri 0,04. Ne dersin?", goal: "Çoklu karşılaştırmayı başka bir testte tanımak.",
      options: [{ label: "Kazanan belli, kullanalım", fb: "12 başlıktan birinin şans eseri p < 0,05 çıkması çok olası." }, { label: "12 karşılaştırma yapılmış; kazananı ayrı, yeni bir testte doğrulamalıyız", correct: true, fb: "Ya düzeltme yap ya da kazananı yeniden test et." }] }
  ]
}
];
CH3A_CASES.forEach(c => { c.kind = "case"; CASES.push(c); CASE_BY_ID[c.id] = c; });
(() => { const c = CASE_BY_ID.case017, pv = PREVIEW_BY_ID.pv3; c.steps = pv.steps.map(s => ({ ...s })); c.review = pv.review;
  c.steps.splice(2, 0, { type: "builder", label: "Python", prompt: "Segment içi dönüşüm oranlarını pandas ile hesapla", goal: "Toplam ve segment oranlarını kodla ayırmak.",
    hints: [{ t: "Dönem tek başına toplam oranı verir; segmenti de gruplamaya eklemelisin." }],
    fields: [{ key: "by", label: "df.groupby([...])['converted'].mean()", options: [["p", "['period']"], ["pd", "['period', 'device']"]] }], run: "Hücreyi çalıştır",
    visual: d => pyCard("donusum.ipynb", ["df = pd.read_parquet('checkout_sessions.parquet')", `df.groupby(${d.by === "pd" ? "['period', 'device']" : d.by === "p" ? "['period']" : "?"})['converted'].mean().unstack()`],
      d.ran ? (d.by === "pd" ? dataTable(["Dönem", "Masaüstü", "Mobil"], [["Önce", "%8,0", "%2,0"], ["Sonra", "%7,0", "%1,8"]]) : dataTable(["Dönem", "Dönüşüm"], [["Önce", "%4,0"], ["Sonra", "%4,6"]])) : ""),
    check: d => d.by === "pd" ? { ok: true, title: "Segment içi oranlar", fb: "Her iki cihazda da oran düşmüş. Toplamdaki artış başka bir yerden geliyor." } : { ok: false, fb: "Bu yine toplam: %4,0 → %4,6. Cihazı da grupla." } }); })();
CH3A_CASES.forEach(c => { c.concept.points = [c.review ? c.review.habit : c.concept.text]; });
CASE_BY_ID.case017.concept.points = [PREVIEW_BY_ID.pv3.review.habit];
CH_PROMO_CASE[3] = "case023";

/* ---- tagger için genel başarı metni ---- */

/* ---- kanıt eşlemeleri ---- */
(() => {
  const src = { "an.cohort": ["case015"], "an.funnel": ["case016"], "py.pivot": ["case015"], "py.groupby": ["case016"], "ca.simpson": ["case017"], "ca.mix": ["case017"],
    "exp.peek": ["case019"], "exp.srm": ["case019"], "exp.multi": ["case019"], "exp.novelty": ["case019"], "eda.segment": ["case015"], "eda.grain": ["case016"], "st.confound": ["case018"], "exp.hypo": ["case019"], "lit.change": ["case018"] };
  Object.entries(src).forEach(([cid, s]) => { const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === cid)), c = n.concepts.find(c => c.id === cid); s.forEach(x => { if (!c.src.includes(x)) c.src.push(x); }); CONCEPT_BY_ID[cid] = { ...c, node: n.id }; });
  const add = { causal: [C("ca.beforeafter", "Önce/sonra karşılaştırmasının sınırı", ["case018"], "Bir müdahaleden sonraki değişim, aynı dönemdeki her şeyin toplamıdır. Etkiyi ayırmak için müdahale görmeyen bir karşılaştırma grubu gerekir.")],
    python: [C("py.filter", "Filtreleme (isin, maske)", ["case018"], "sales[sales.region.isin(liste)] ile alt küme seç; ~ işareti maskeyi tersine çevirir.")] };
  Object.entries(add).forEach(([nid, cs]) => { NODE_BY_ID[nid].concepts.push(...cs); cs.forEach(c => { CONCEPT_BY_ID[c.id] = { ...c, node: nid }; }); });
  const notes = { "an.cohort": "Müşterileri başladıkları döneme göre gruplayıp her grubu kendi başlangıcından izle. Karışık ortalamanın gizlediği değişimi gösterir.", "an.funnel": "Yolculuğu sıralı adımlara böl, her adımda kaybedilen oranı geçen dönemle karşılaştır.", "an.price": "Fiyat artınca hacim düşebilir ama ciro ve kâr artabilir; üçüne birlikte bak." };
  Object.entries(notes).forEach(([id, t]) => { const c = SKILL_TREE.flatMap(n => n.concepts).find(c => c.id === id); if (c) c.note = t; if (CONCEPT_BY_ID[id]) CONCEPT_BY_ID[id].note = t; });
  const anP = NODE_BY_ID.analytics.concepts.find(c => c.id === "an.price"); anP.src.push("sq_price"); CONCEPT_BY_ID["an.price"] = { ...anP, node: "analytics" };
})();

/* ---- yan görevler ---- */
[
{ id: "sq_groupby_py", kind: "quest", modal: true, hot: "lounge", who: "buse", after: "case015", chapter: 3, title: "Buse'nin pandas sorusu", xp: 40, rewards: { dataExploration: 5 },
  lesson: "count olayları, nunique tekil değerleri sayar. 'Kaç kişi?' sorusunun cevabı nunique'tir.",
  steps: [{ type: "dialog", who: "buse", cta: "Kodu gör", lines: ["Buse artık Junior Veri Analisti: “Kaç müşteri sipariş verdi diye baktım, toplam müşteri sayımızdan fazla çıktı!”", "“orders.groupby('city')['customer_id'].count() yazdım. Neden?”"] },
    { type: "choice", prompt: "Buse'ye ne söylersin?", goal: "count ile nunique farkını açıklamak.", hints: [{ t: "Bir müşteri kaç sipariş verebilir?" }],
      options: [{ label: "Veri bozuk, mükerrer kayıt var", fb: "Kayıtlar doğru; aynı müşterinin birden çok siparişi var." }, { label: "count her siparişi sayıyor; tekil müşteri için nunique() kullan", correct: true, fb: "Buse: “Grain meselesi! Vaka 008'deki gibi.” Aynen." }] }] },
{ id: "sq_price", kind: "quest", modal: true, hot: "phone", who: "burak", after: "case016", chapter: 3, title: "Fiyat sorusu", xp: 45, rewards: { businessThinking: 6 },
  lesson: "Fiyat artınca hacim düşebilir ama ciro ve kâr artabilir. Fiyat kararını hacim, ciro ve kâr üçlüsüyle birlikte değerlendir.",
  steps: [{ type: "dialog", who: "burak", cta: "Bak", lines: ["Abonelik fiyatını 99 ₺'den 119 ₺'ye çıkardık. Yeni abone sayısı %12 düştü.", "Satış ekibi fiyatı geri almak istiyor. Ne dersin?"] },
    { type: "choice", prompt: "Satış ekibine ne söylersin?", goal: "Fiyat, hacim ve ciroyu birlikte okumak.", hints: [{ t: "Abone başına gelir %20 arttı, abone sayısı %12 düştü. Ciro ne oldu?" }],
      visual: () => dataTable(["Metrik", "Önce", "Sonra"], [["Fiyat", "99 ₺", "119 ₺"], ["Yeni abone", "1.000", "880"], ["Aylık ciro (yeni abonelerden)", "99.000 ₺", "104.720 ₺"], ["İlk ay iptal oranı", "%8", "%9"]]),
      options: [{ label: "Hacim düştü, fiyat geri alınmalı", fb: "Ciro %6 artmış; hacme tek başına bakmak yanıltıcı." }, { label: "Ciro %6 arttı ve iptal oranı neredeyse aynı; fiyatı korumak mantıklı, iptali birkaç ay izleyelim", correct: true, fb: "Burak: “Satış ekibine tablo hâlinde gönderiyorum.”" }] }] }
].forEach(q => { QUESTS.push(q); QUEST_BY_ID[q.id] = q; });

/* ---- sabahlar 15–19 ---- */
Object.assign(MORNINGS, {
  15: { scene: "timeskip", time: "08:30", title: "11 ay sonra", text: "Kartında 'Veri Analisti' yazıyor. Artık seni 'neden' sorularıyla arıyorlar.",
    steps: [{ type: "dialog", who: "maya", cta: "Hazırım", lines: ["Veri Analisti olarak ilk sabahın. Bu dönemde soru 'ne oldu?' değil, 'neden oluyor?'.", "Bir şey daha: ipuçları artık sana XP'ye mal olacak. Önce kendin düşün. Ve Python'u ciddiye al; her vakada kullanacaksın."] },
      { type: "choice", label: "Sabah özeti", who: "maya", prompt: "Maya: “'Ne oldu' ile 'neden oldu' arasındaki fark ne?”", ...STANDUP_GUIDE, hints: [{ t: "Bir değişimi tanımlamak ile ona yol açanı ayırmak farklı işler." }],
        options: [{ label: "Aynı şey, sadece daha ayrıntılı", fb: "Ayrıntı nedeni göstermez." }, { label: "'Ne oldu' değişimi tanımlar; 'neden' değişimin kaynağını, karşılaştırma grubuyla ya da deneyle ayırmayı gerektirir", correct: true, fb: "Maya: “Bu bölümün özeti tam olarak bu.”" }] }] },
  16: { scene: "laptop", time: "08:58", title: "Kohort sabahı", text: "Dünkü kohort tablon CFO'nun masasında.",
    notifications: [["burak", "CFO kohort tablosunu sevdi"], ["zeynep", "Satışlar düştü, acil bakar mısın?"], ["buse", "pandas'ta bir sorum var"]],
    steps: [{ type: "choice", label: "Sabah özeti", who: "burak", prompt: "Burak: “CFO'ya dünkü bulguyu tek cümleyle yaz.”", ...STANDUP_GUIDE, hints: [{ t: "Kim, ne zamandan beri, olası neden, sonraki adım." }],
      options: [{ label: "Tekrar alım oranı düştü.", fb: "Bunu zaten biliyordu." }, { label: "Düşüş Mart'tan sonra gelen yeni müşterilerde; eski kohortlar sabit. Hoş geldin kuponunun kaldırılmasıyla çakışıyor, bir deneyle doğrulamayı öneriyoruz.", correct: true, fb: "Burak: “İşte CFO dili.”" }] }] },
  17: { scene: "standup", time: "09:15", title: "Analytics Daily", text: "Ekip büyüdü: Buse artık Junior Veri Analisti.",
    steps: [{ type: "choice", label: "Stand-up", who: "maya", prompt: "Maya: “Dünkü huni?”", ...STANDUP_GUIDE, hints: [{ t: "Adım, cihaz, neden, aksiyon." }],
      options: [{ label: "Satın alma adımında sorun var.", fb: "Hangi cihaz, ne kadar, neden?" }, { label: "Kayıp sadece ödeme → satın alma adımında, mobilde %69'dan %24'e; yeni 3D Secure ekranı yeni sekmede açılıyor. Ürün ekibi düzeltti.", correct: true, fb: "Maya: “Bu ay en çok kurtarılan ciro bu olabilir.”" }] }] },
  18: { scene: "rain", time: "08:40", title: "Islak bir perşembe", text: "Alex kahvelerle bekliyor. Bu sbuser laptopunu da getirmiş.",
    steps: [{ type: "choice", label: "Sabah özeti", who: "alex", prompt: "Alex: “Dünkü paradoks vakasını Buse'ye nasıl anlatırsın?”", ...STANDUP_GUIDE, hints: [{ t: "Toplam, segmentler, sebep." }],
      options: [{ label: "İstatistik bazen yalan söyler.", fb: "İstatistik değil, toplam yanıltır." }, { label: "Her cihazda dönüşüm düştü ama trafik dönüşümü yüksek masaüstüne kaydığı için toplam arttı; segment içinde karşılaştırmak gerekir.", correct: true, fb: "Alex: “Buse'ye aynen bunu söyleyeceğim.”" }] }] },
  19: { scene: "urgent", time: "08:52", title: "Bütçe kararı", text: "Zeynep'ten büyük harfli bir mesaj: TV bütçesi bugün onaylanacak.",
    steps: [{ type: "choice", label: "Hızlı cevap", who: "zeynep", prompt: "Zeynep: “TV kampanyası işe yaradı mı? Bütçe bugün onaylanacak. TEK CÜMLE!”", ...STANDUP_GUIDE, hints: [{ t: "Kaba tahmin, belirsizlik, öneri." }],
      options: [{ label: "Evet, satışlar %18 arttı.", fb: "O %18'in çoğu indirim ve rakipten." }, { label: "Kaba tahminle etkisi ~6 puan, %18 değil; bütçeyi ikiye katlamadan önce bölgesel bir deneyle ölçelim.", correct: true, fb: "Zeynep: “Bütçeyi beklemeye aldım.”" }] }] }
});
Object.entries(MORNINGS).forEach(([d, m]) => { MORNING_DEFS[`morning${d}`] = { id: `morning${d}`, kind: "morning", day: +d, ...m }; });

/* ---- olaylar, akşamlar, Slack ---- */
[
  { id: "ev_env", who: "alex", days: [16, 23], notify: "Notebook'um senin bilgisayarında çalışmıyor", title: "Benim bilgisayarımda çalışıyordu", xp: 15, rewards: { dataQuality: 2 },
    steps: [{ type: "choice", who: "alex", prompt: "“Kohort notebook'unu çalıştırdım, hata veriyor: pivot_table'da tanımadığı bir parametre. Sende çalışıyordu, değil mi?”", goal: "Tekrarlanabilirliğin ilk adımını görmek.", hints: [{ t: "Aynı kod, farklı kütüphane sürümü." }],
      options: [{ label: "Sende bir sorun var, bende çalışıyor", fb: "Tekrarlanabilir olmayan analiz, başkası için analiz değildir." }, { label: "Kütüphane sürümleri farklı olabilir; kullandığım sürümleri bir requirements dosyasına yazayım", correct: true, fb: "Alex: “Bir sonraki adım ortamı sabitlemek. İleride bunun adı MLOps olacak.”" }] }] },
  { id: "ev_dashboard_cohort", who: "burak", days: [16, 23], notify: "Kohort tablosu dashboard'a girebilir mi?", title: "Kohort dashboard'a",
    steps: [{ type: "reply", who: "burak", prompt: "“CFO kohort tablosunu her ay görmek istiyor. Otomatik hâle getirebilir misin?”",
      options: [{ label: "“Evet; sorguyu zamanlayıp tanım kartını da ekleyeyim.”", reply: "Burak: “Tanım kartı mı? Harika, kimse yanlış okumasın.”", trust: {} }, { label: "“Önce ne için kullanacağını konuşalım; belki üç aylık özet yeter.”", reply: "Burak: “Haklısın, sadece yeni kohortların ilk iki ayı yeter.”", trust: {} }, { label: "“Şu an çok yoğunum.”", reply: "Burak anlayışla karşıladı ama biraz hayal kırıklığına uğradı.", trust: {} }] }] }
].forEach(e => { e.kind = "event"; e.modal = true; EVENTS.push(e); EVENT_BY_ID[e.id] = e; });
Object.assign(EVENINGS, {
  16: [{ label: "Eve git", result: "Akşam yürüyüşü. Kafandan huniler geçmiyor." }, { label: "20 dakika kal ve incele", late: true, result: "Mobil 3D Secure düzeltmesinin canlıya çıktığını kontrol ettin; ilk saatte dönüşüm toparlanıyor.", skills: { dataExploration: 2 } }, { label: "Buse'ye pandas anlat", result: "Buse ilk pivot_table'ını yazdı.", trust: { alex: 1 } }],
  18: [{ label: "Eve git", result: "Yarın deney raporu var. Erken yattın." }, { label: "20 dakika kal ve incele", late: true, result: "Rakibin stok sorununun ne zaman bittiğini araştırdın ama net bir tarih bulamadın." }, { label: "Zeynep'le konuş", result: "Zeynep bölgesel kampanya deneyi fikrine ısındı.", trust: { zeynep: 1 } }]
});
SLACK.push(
  { day: 15, ch: "#genel", msgs: [["deniz", "Yeni Veri Analistimizi tebrik ediyoruz! 🎉"], ["buse", "Ben de Junior Veri Analisti oldum, sayende 🙏"]] },
  { day: 16, ch: "#analytics-team", msgs: [["alex", "Kohort tablosu harika. Notebook'u paylaşır mısın?"], ["maya", "Ve sürümleri yaz lütfen."]] },
  { day: 17, ch: "#urun", msgs: [["zeynep", "Mobil ödeme düzeltmesi canlıda!"], ["ceo", "Hızlı iş, teşekkürler."]] },
  { day: 19, ch: "#deneyler", msgs: [["alex", "Bot filtresi B grubunu siliyormuş. SRM!"], ["maya", "Bu yüzden önce kurulumu kontrol ederiz."]] }
);
Object.assign(AFTER_CASE, {
  case014: "Tebrikler, Veri Analisti. Toplantı odasına gelir misin?",
  case015: "Kohort tablosu CFO'ya gitti. Yarın satış hunisine bakacağız.",
  case016: "Mobil ödeme düzeltildi. Yarın bir paradoksla karşılaşacaksın.",
  case017: "Toplamın yanıltabileceğini artık biliyorsun. Yarın bir kampanya etkisini ayırmaya çalışacağız.",
  case018: "Kaba tahminin dürüsttü. Yarın bir deney raporunu denetleyeceksin.",
  case019: "Dört tuzağı da buldun. Sıradaki konu: karşılaştırma grubuyla nedenselliği ölçmek."
});


/* =====================================================================
   CHAPTER 2 — JUNIOR VERİ ANALİSTİ (3 ay sonra)
   Öğretim standardı: Durum → Keşfet → Karar → Açıkla → Sonuç → Transfer
   → Öğrenme değerlendirmesi → Kanıt. Rehberlik: birlikte çözüm yok.
   ===================================================================== */
CASES.forEach(c => { c.chapter = c.chapter || 1; });
const CH_START = { 1: 1, 2: 7 };
const PROMOTIONS = {
  1: { title: "Junior Veri Analisti", req: { literacy: 3, eda: 3, quality: 3, stats: 4, business: 2, comm: 2 } },
  2: { title: "Veri Analisti", req: { sql: 4, kpi: 3, experiment: 3, python: 1, comm: 3 } }
};

/* ---- küçük sorgu motoru: SQL kurucusunun sonuçları gerçekten hesaplanır ---- */
function groupAgg(rows, key, val, agg = "sum") {
  const m = new Map();
  rows.forEach(r => { const k = r[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(r[val]); });
  return [...m.entries()].map(([k, v]) => [k, agg === "avg" ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : v.reduce((a, b) => a + b, 0)]);
}
function sqlCard(file, lines) {
  return `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>${file}</span></div>${lines.map((l, i) => `<div class="code-line"><span class="ln">${i + 1}</span><code>${l.replace(/\b(SELECT|SUM|AVG|COUNT|DISTINCT|FROM|WHERE|AND|OR|GROUP BY|ORDER BY|JOIN|LEFT|ON|AS|IN)\b/g, "<b>$1</b>").replace(/('[^']*')/g, "<em>$1</em>")}</code></div>`).join("")}</div>`;
}
const DAYS_TR = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DAILY = (() => {
  const base = [396, 352, 341, 348, 377, 421, 410], out = [];
  for (let w = 0; w < 8; w++) for (let d = 0; d < 7; d++) {
    const date = new Date(2024, 8, 9 + w * 7 + d), last = w === 7 && d === 0;
    out.push({ date: `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, "0")}`, dow: DAYS_TR[d], rev: last ? 312 : base[d] + ((w * 13 + d * 7) % 23) - 11, w, d });
  }
  return out.filter(r => !(r.w === 7 && r.d > 0));
})();

const CH2_CASES = [
{
  id: "case007", num: "007", chapter: 2, title: "Pazartesi Düşüşü", difficulty: 1, xp: 140, after: "case006",
  short: "Dashboard pazartesi satışlarının %23 düştüğünü söylüyor. Gerçekten öyle mi?",
  tags: ["SQL", "Filtreleme", "Karşılaştırma tabanı"], nodes: ["sql", "kpi"],
  rewards: { dataExploration: 6, businessThinking: 6 },
  concept: { name: "Doğru karşılaştırma tabanı", en: "baseline selection", text: "Bir değeri neyle karşılaştırdığın, sonucun yarısıdır. Haftalık düzeni olan verilerde aynı günleri, takvim etkisi olan günlerde benzer günleri karşılaştır.", points: [] },
  mentor: "Herkes 'ne kadar düştü?' diye sorar. İyi analist önce 'neye göre?' diye sorar.",
  portfolio: { title: "Pazartesi düşüşü incelemesi", text: "%23'lük 'düşüşün' yanlış karşılaştırma tabanından ve bayram arifesinden kaynaklandığını SQL ile gösterdim." },
  review: { happened: "Dashboard pazartesiyi pazarla karşılaştırıyordu; üstelik o pazartesi bayram arifesiydi.", discovered: "Haftanın gününe göre gruplayınca pazarın her hafta zaten yüksek olduğu, takvime bakınca da arifenin yarım gün olduğu görüldü.", habit: "Bir değişimi okumadan önce sor: neye göre? Aynı gün mü, benzer gün mü?", watch: "Mevsimsellik ve takvim etkisi düzeltilince kalan fark da gerçek olabilir; onu da araştır." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Dashboard'a bak", lines: ["Günaydın! Dashboard'da kırmızı alarm: pazartesi satışları dünkü güne göre %23 düşmüş. 404 bin ₺'den 312 bin ₺'ye.", "Maya 'nereden başlayacağını sen düşün' dedi. Satış müdürü saat 11'de cevap bekliyor."] },
    { type: "builder", label: "Sorgula", prompt: "daily_sales tablosunu sorgula", sub: "Pazartesiyi neyle karşılaştırmak gerektiğini bulmak için önce veriyi gör.",
      goal: "Filtre ve gruplamayla doğru karşılaştırma tabanını bulmak.",
      think: ["Satışların haftalık bir düzeni olabilir mi?", "Pazar günü pazartesiyle karşılaştırılabilir bir gün mü?"],
      hints: [{ t: "Tek bir günü değil, birkaç haftayı haftanın gününe göre grupla." }],
      fields: [
        { key: "range", label: "WHERE (tarih aralığı)", options: [["2d", "Son 2 gün"], ["4m", "Son 4 pazartesi"], ["8w", "Son 8 hafta"]] },
        { key: "group", label: "GROUP BY", options: [["none", "Gruplama yok"], ["dow", "Haftanın günü (ortalama)"]] }],
      run: "Sorguyu çalıştır",
      visual: d => {
        const r = d.range || "2d", g = d.group || "none";
        const where = { "2d": "date >= '2024-10-27'", "4m": "day_of_week = 'Pazartesi' AND date >= '2024-10-07'", "8w": "date >= '2024-09-09'" }[r];
        const sql = sqlCard("pazartesi.sql", g === "dow" ? ["SELECT day_of_week, AVG(revenue)", "FROM daily_sales", `WHERE ${where}`, "GROUP BY day_of_week;"] : ["SELECT date, day_of_week, revenue", "FROM daily_sales", `WHERE ${where};`]);
        if (!d.ran) return sql + `<div class="pick-help">${icon("route")}Filtreyi ve gruplamayı seç, sorguyu çalıştır.</div>`;
        let rows = r === "2d" ? DAILY.slice(-2) : r === "4m" ? DAILY.filter(x => x.d === 0).slice(-4) : DAILY;
        if (g === "dow") { const agg = groupAgg(rows, "dow", "rev", "avg"); return sql + dataTable(["Gün", "Ortalama ciro (bin ₺)"], agg.map(([k, v]) => [k, fmtNum(v)])); }
        return sql + dataTable(["Tarih", "Gün", "Ciro (bin ₺)"], rows.slice(-10).map(x => [x.date, x.dow, x.date === "28.10" ? neg(x.rev) : x.rev]));
      },
      check: d => {
        if (d.range === "2d") return { ok: false, fb: "Sonuç dashboard'un aynısı: pazar 404, pazartesi 312. Tek bir önceki gün, haftalık düzeni göremez." };
        if (d.range === "4m" && d.group !== "dow") return { ok: false, fb: "İyi fikir: pazartesileri pazartesilerle karşılaştırıyorsun. Son pazartesi 312, öncekiler ~395. Düşüş hâlâ var, ama pazarın neden yüksek olduğunu henüz görmedin." };
        if (d.range === "8w" && d.group === "dow") return { ok: true, title: "Düzen görünür oldu", fb: "Hafta sonları her hafta ~410–420 bin ₺, pazartesiler ~396. Pazar ile pazartesiyi karşılaştırmak her hafta 'düşüş' gösterir. Ama bu pazartesinin 312'si yine de normal pazartesinin altında." };
        return { ok: false, fb: "Satır satır 8 haftaya bakmak zor. Haftanın gününe göre grupla." };
      } },
    { type: "choice", label: "Keşfet", prompt: "Bu pazartesi (28 Ekim) normal pazartesiden yine de %21 düşük. Takvime bak: neden olabilir?", goal: "Takvim etkisini fark etmek.",
      think: ["28 Ekim'in ertesi günü ne?"], hints: [{ t: "29 Ekim Cumhuriyet Bayramı.", hl: ["Takvim"] }],
      visual: () => noteCard("Takvim", "28 Ekim Pazartesi: Cumhuriyet Bayramı arifesi, mağazalar 13:00'te kapandı. 29 Ekim Salı: resmî tatil.") + dataTable(["Geçmiş arife günleri", "Normal güne göre"], [["Kurban Bayramı arifesi (Haziran)", "−%23"], ["Ramazan Bayramı arifesi (Nisan)", "−%19"], ["Yılbaşı arifesi (Aralık)", "−%20"]]),
      options: [
        { label: "Satışlarda yapısal bir düşüş başladı", fb: "Sonuç ne olurdu? Satış müdürü acil indirim kampanyası açar; çarşamba her şey normale döner ve kampanya boşa harcanmış olur." },
        { label: "Arife yarım gündü; geçmiş arifeler de normal günden %19–23 düşük", correct: true, fb: "Aynen. −%21, arifeler için tamamen olağan." }] },
    { type: "choice", label: "Açıkla", prompt: "Satış müdürüne ne yazarsın?", goal: "Doğru karşılaştırmayı tek cümlede anlatmak.",
      hints: [{ t: "İki düzeltme var: gün karşılaştırması ve takvim etkisi." }],
      options: [
        { label: "Satışlar %24 düştü, dikkat.", fb: "Bu, yanlış tabanla hesaplanmış sayının tekrarı." },
        { label: "Düşüş yok: pazarla değil önceki pazartesilerle ve arifelerle karşılaştırınca 28 Ekim olağan bir arife günü. Dashboard'u benzer günlerle karşılaştıracak şekilde düzelteceğim.", correct: true, fb: "Sayı, neden ve kalıcı düzeltme. Zeynep: “Müdür rahatladı, teşekkürler!”" },
        { label: "Veri hatalı olabilir, kontrol ediyorum.", fb: "Veri doğru; sorun karşılaştırma tabanında." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Ramazan Bayramı haftasında web trafiği önceki haftaya göre %40 düştü. Neyle karşılaştırırsın?", goal: "Karşılaştırma tabanını başka bir veride seçmek.",
      hints: [{ t: "Benzer bir dönem hangisi?" }],
      options: [{ label: "Önceki haftayla; %40 düşüş alarm verir", fb: "Bayram haftası normal bir haftayla karşılaştırılamaz." }, { label: "Geçen yılın bayram haftasıyla; gerekirse bayram tarihinin kaymasını hesaba katarak", correct: true, fb: "Doğru taban: benzer koşullardaki dönem." }] }
  ]
},
{
  id: "case008", num: "008", chapter: 2, title: "İki Tablo, Tek Cevap", difficulty: 2, xp: 150, after: "case007",
  short: "Satış ve ürün tablolarını birleştir; kategori bazında doğru ciroyu bul.",
  tags: ["SQL", "JOIN", "Grain"], nodes: ["sql", "quality"], rewards: { dataQuality: 6, dataExploration: 6 },
  concept: { name: "JOIN ve grain", en: "joins & grain", text: "JOIN'den önce iki tablonun grain'ini bil; anahtar tekrar ediyorsa satırlar çoğalır.", points: [] },
  mentor: "JOIN yazmak kolaydır. Sonucun doğru olduğunu kanıtlamak işin kendisidir.",
  portfolio: { title: "Kategori cirosu mutabakatı", text: "Fiyat geçmişi tablosunun yarattığı satır çoğalmasını bulup kategori cirosunu Finans'la mutabık hâle getirdim." },
  review: null, steps: null
},
{
  id: "case009", num: "009", chapter: 2, title: "Kimsenin Anlaşamadığı KPI", difficulty: 2, xp: 150, after: "case008", requires: ["sq_defs"],
  short: "Pazarlama 18.400 aktif müşteri diyor, Finans 14.900. İkisi de haklı.",
  tags: ["KPI", "Tanım", "İş anlamı"], nodes: ["kpi", "business"], rewards: { businessThinking: 8, dataLiteracy: 4 },
  concept: { name: "KPI tanımı ve semantik", en: "metric definition", text: "Bir KPI'ın adı değil tanımı vardır: hangi olay, hangi zaman penceresi, hangi kapsam.", points: [] },
  mentor: "Aynı kelimeyi kullanan iki ekip, aynı şeyi kastediyor olmayabilir. Tanımı yazmak bir analistin en sessiz süper gücü.",
  portfolio: { title: "Aktif müşteri tanımı", text: "Pazarlama ve Finans'ın farklı aktif müşteri sayılarını tanım farkına bağladım; iki adlandırılmış metrikte uzlaştırdım." },
  review: { happened: "İki ekip 'aktif müşteri'yi farklı olay ve zaman penceresiyle sayıyordu.", discovered: "Tanımın üç bileşeni (olay, pencere, kapsam) değişince sayı 9 bin ile 19 bin arasında oynuyor.", habit: "Bir metriği kullanmadan önce tanım kartını iste ya da yaz.", watch: "Tek bir 'doğru' tanım dayatmak yerine farklı amaçlar için farklı adlandırılmış metrikler gerekebilir." },
  steps: [
    { type: "dialog", who: "maya", cta: "Tanımlara bak", lines: ["Yönetim toplantısında iki slayt yan yana: Pazarlama 18.400 aktif müşteri diyor, Finans 14.900.", "İkisi de teknik olarak doğru. Hangi tanımın hangi sayıyı ürettiğini bul, sonra bir öneri getir."] },
    { type: "builder", label: "Tanımı kur", prompt: "Pazarlamanın 18.400 sayısını üreten tanımı bul", goal: "KPI'ın bileşenlerini ayırarak bir sayının nereden geldiğini bulmak.",
      think: ["Hazırlık görevinde Zeynep ve Burak ne söylemişti?"], hints: [{ t: "Pazarlama uygulamaya giriş yapanları sayıyor ve kampanya döngüsü bir ay." }],
      fields: [
        { key: "ev", label: "Olay", options: [["login", "Uygulamaya giriş yaptı"], ["buy", "Satın aldı"]] },
        { key: "win", label: "Zaman penceresi", options: [["30", "Son 30 gün"], ["90", "Son 90 gün"]] },
        { key: "test", label: "Test ve personel hesapları", options: [["in", "Dahil"], ["out", "Hariç"]] }],
      run: "Sayıyı hesapla",
      visual: d => {
        const M = { "login-30-in": 18400, "login-30-out": 17950, "login-90-in": 24100, "login-90-out": 23600, "buy-30-in": 9300, "buy-30-out": 9100, "buy-90-in": 15200, "buy-90-out": 14900 };
        const k = `${d.ev || "login"}-${d.win || "30"}-${d.test || "in"}`;
        return sqlCard("aktif_musteri.sql", ["SELECT COUNT(DISTINCT customer_id)", `FROM ${d.ev === "buy" ? "orders" : "app_events"}`, `WHERE event_date >= today - ${d.win || 30}`, d.test === "out" ? "  AND is_test = 0;" : "  ;"]) +
          kpiStrip([["Sonuç", d.ran ? fmtNum(M[k]) : "?"], ["Pazarlama", "18.400"], ["Finans", "14.900"]]);
      },
      check: d => {
        const k = `${d.ev}-${d.win}-${d.test}`;
        if (k === "login-30-in") return { ok: true, title: "Pazarlamanın tanımı bulundu", fb: "Son 30 günde giriş yapan herkes, test hesapları dahil: 18.400." };
        if (k === "buy-90-out") return { ok: false, fb: "Bu tam olarak Finans'ın sayısı: 14.900! Ama önce Pazarlamanınkini bul." };
        return { ok: false, fb: "Bu tanım başka bir sayı üretiyor. Pazarlamanın olayı ve penceresi neydi?" };
      } },
    { type: "choice", label: "Finans", prompt: "Finans'ın 14.900'ü hangi tanımdan geliyor?", goal: "İkinci tanımı çözmek.",
      hints: [{ t: "Finans fatura keser ve çeyreklik bakar." }],
      options: [{ label: "Son 30 günde giriş yapanlar, test hariç", fb: "Bu 17.950 eder." }, { label: "Son 90 günde satın alanlar, test ve personel hariç", correct: true, fb: "Aynen. Finans gelir üreten müşteriyi sayıyor." }] },
    { type: "choice", label: "Öner", prompt: "Şirket ne yapmalı?", goal: "Tanım çatışmasını yönetişimle çözmek.",
      options: [
        { label: "Finans'ın sayısını herkes kullansın", fb: "Pazarlamanın ölçtüğü şey (etkileşim) de değerli; silmek bilgiyi kaybettirir." },
        { label: "İki ayrı adlandırılmış metrik: 'Aylık aktif kullanıcı' ve 'Çeyreklik aktif alıcı'; her birinin yazılı tanım kartı olsun", correct: true, fb: "Maya: “Tartışma bitti. Bunu metrik kataloğuna ekliyoruz.”" },
        { label: "İkisinin ortalamasını raporlayalım: 16.650", fb: "Farklı şeyleri ölçen iki sayının ortalaması hiçbir şeyi ölçmez." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: İki hastane raporunda yatak doluluğu %92 ve %78. İlk sorun ne olur?", goal: "Tanım sorgulamayı başka bir alanda kullanmak.",
      options: [{ label: "Hangisi daha yeni rapor?", fb: "Önce aynı şeyi ölçüp ölçmediklerine bak." }, { label: "Doluluk nasıl tanımlanmış: gece yarısı sayımı mı, günlük ortalama mı; hangi yataklar dahil?", correct: true, fb: "Tanım bileşenleri: ölçüm anı, pencere, kapsam." }] }
  ]
},
{
  id: "case010", num: "010", chapter: 2, title: "Ortalamanın Arkasındaki Müşteri", difficulty: 2, xp: 160, after: "case009",
  short: "Toplam ciro %6 arttı. Herkes mutlu. Ama bir segment sessizce eriyor.",
  tags: ["GROUP BY", "Segmentasyon", "Toplama"], nodes: ["sql", "kpi"], rewards: { dataExploration: 8, businessThinking: 4 },
  concept: { name: "Toplamın gizlediği segment", en: "aggregation masking", text: "Büyüyen bir toplam, küçülen bir segmenti gizleyebilir. Toplamı her zaman ana segmentlere ayırarak da raporla.", points: [] },
  mentor: "İyi haber de analiz edilmeyi hak eder. Kötü haberler genelde iyi haberlerin içinde saklanır.",
  portfolio: { title: "Kurumsal segment erimesi", text: "Toplam %6 büyürken kurumsal segmentin %18 küçüldüğünü buldum; kayıp müşteri listesi satış ekibine iletildi." },
  review: { happened: "Bireysel ve KOBİ büyümesi kurumsal segmentteki %18'lik kaybı toplamda gizledi.", discovered: "GROUP BY ile segment kırılımı toplamın ardındaki farklı hikâyeleri gösterdi.", habit: "İyi bir toplamı raporlarken de ana segmentlere ayır.", watch: "Çok fazla kırılım gürültü üretir; iş açısından anlamlı segmentleri seç." },
  steps: [
    { type: "dialog", who: "burak", cta: "Rakamlara bak", lines: ["Çeyrek sonu raporu hazır: toplam ciro %6 arttı. CFO'ya 'her şey yolunda' yazacağım.", "Maya göndermeden önce bir kontrol etmeni istedi. Bence gerek yok ama…"] },
    { type: "builder", label: "Kır", prompt: "Toplamı anlamlı bir boyuta göre kır", goal: "GROUP BY ile toplamın arkasındaki segmentleri görmek.",
      think: ["Şirketin farklı davranan müşteri grupları hangileri?"], hints: [{ t: "Müşteri tipine göre ayır." }],
      fields: [{ key: "g", label: "GROUP BY", options: [["none", "Gruplama yok"], ["region", "Bölge"], ["segment", "Müşteri segmenti"], ["channel", "Kanal"]] }],
      run: "Sorguyu çalıştır",
      visual: d => {
        const g = d.g || "none", T = { none: [["Toplam", 4200, 4452]], region: [["İstanbul", 1900, 2010], ["Ankara", 980, 1040], ["İzmir", 760, 800], ["Bursa", 560, 602]], segment: [["Bireysel", 1600, 1824], ["KOBİ", 1300, 1417], ["Kurumsal", 1300, 1066]], channel: [["Online", 2300, 2460], ["Mağaza", 1900, 1992]] }[g];
        return sqlCard("ciro_kirilim.sql", [`SELECT ${g === "none" ? "" : g + ", "}SUM(revenue_q2), SUM(revenue_q3)`, "FROM quarterly_revenue", g === "none" ? ";" : `GROUP BY ${g};`]) +
          (d.ran ? dataTable([g === "none" ? "" : "Grup", "Q2 (bin ₺)", "Q3 (bin ₺)", "Değişim"], T.map(([k, a, b]) => [k, fmtNum(a), fmtNum(b), (b - a) / a < -0.05 ? neg(`−%${Math.round((a - b) / a * 100)}`) : pos(`+%${Math.round((b - a) / a * 100)}`)])) : "");
      },
      check: d => d.g === "segment" ? { ok: true, title: "Gizlenen segment", fb: "Bireysel +%14, KOBİ +%9, Kurumsal −%18. Toplamdaki %6 büyüme kurumsal kaybı gizliyor." }
        : d.g === "none" ? { ok: false, fb: "Bu sadece toplam: +%6. Kırılım yok." }
        : { ok: false, fb: "Bu kırılımda her grup benzer büyüyor. Müşterilerin farklı davrandığı başka bir boyut olabilir mi?" } },
    { type: "choice", label: "Açıkla", prompt: "Kurumsal düşüş toplamda neden görünmüyor?", goal: "Toplamanın maskeleme etkisini açıklamak.",
      options: [{ label: "Kurumsal segment küçük olduğu için önemsiz", fb: "Kurumsal toplam cironun neredeyse üçte biri; önemsiz değil." }, { label: "Diğer segmentlerin büyümesi kurumsaldaki kaybı telafi edip toplamda gizliyor", correct: true, fb: "Aynen. Toplam bir ağırlıklı özettir; içindeki zıt hareketler birbirini götürür." }] },
    { type: "choice", label: "Öner", prompt: "Burak'a ne önerirsin?", goal: "Bulguyu aksiyona çevirmek.",
      options: [
        { label: "Raporu olduğu gibi gönder, genel tablo olumlu", fb: "Sonuç ne olurdu? İki çeyrek sonra kurumsal kayıp toplamı da aşağı çeker ve 'neden kimse görmedi?' sorusu sana gelir." },
        { label: "Toplamın yanına segment tablosunu ekle; kurumsalda kaybedilen hesapların listesini satış ekibiyle paylaş", correct: true, fb: "Burak: “İyi ki baktın. Üç büyük hesap rakibe geçmiş; satış ekibi arıyor.”" }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir okulda ortalama sınav puanı 3 puan arttı. Müdür kutlama planlıyor. Ne sorarsın?", goal: "Maskeleme etkisini başka bir veride fark etmek.",
      options: [{ label: "Kaç öğrenci sınava girdi?", fb: "Önemli ama asıl soru gruplar arası farklılık." }, { label: "Sınıflara ya da derslere göre kırınca düşen bir grup var mı?", correct: true, fb: "Toplamın altında zıt hareketler olabilir." }] }
  ]
},
{
  id: "case011", num: "011", chapter: 2, title: "Örneklem Ne Kadar Emin?", difficulty: 2, xp: 160, after: "case010",
  short: "Pazarlama 200 kişilik bir örneklemden %8,4 dönüşüm buldu. Ne kadar emin olabiliriz?",
  tags: ["Belirsizlik", "Güven aralığı"], nodes: ["experiment", "stats"], rewards: { statistics: 10 },
  concept: { name: "Güven aralığı sezgisi", en: "confidence interval", text: "Bir örneklemden elde edilen sayı tek bir nokta değil, bir aralıktır. Örneklem büyüdükçe aralık daralır (kabaca √n ile).", points: [] },
  mentor: "Belirsizliği söylemek zayıflık değil. Belirsizliği gizleyen sayı, en tehlikeli sayıdır.",
  portfolio: { title: "Dönüşüm tahmininin belirsizliği", text: "200 kişilik örneklemden çıkan %8,4'ün yaklaşık ±4 puanlık belirsizlik taşıdığını gösterdim; örneklem büyüklüğü önerisi getirdim." },
  review: { happened: "Aynı topluluktan alınan 200 kişilik örneklemler %5 ile %12 arasında sonuç verdi.", discovered: "Örneklem 10 katına çıkınca dağılım yaklaşık 3 kat daraldı.", habit: "Bir tahmin verirken aralığını da ver.", watch: "Güven aralığı, örneklemin rastgele ve temsilî olduğunu varsayar; seçim yanlılığını düzeltmez." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Simülasyonu aç", lines: ["Yeni açılış sayfası için 200 ziyaretçiye baktık: dönüşüm %8,4! Eski sayfada %7'ydi.", "Maya 'önce bu sayının ne kadar sağlam olduğunu göster' dedi. Ne demek istiyor?"] },
    { type: "choice", label: "Yeniden örnekle", explore: [{ key: "n", min: 5 }, "big"], prompt: "Aynı topluluktan tekrar tekrar örneklem al, sonra örneklemi büyüt. Ne görüyorsun?", goal: "Örneklem büyüklüğünün belirsizliğe etkisini deneyerek görmek.",
      think: ["200 kişilik örneklemler ne kadar dalgalanıyor?", "2.000 kişiye çıkınca ne değişiyor?"], hints: [{ t: "Noktaların yayıldığı aralığı iki örneklem büyüklüğünde karşılaştır." }],
      visual: d => {
        const small = [8.4, 6.0, 10.5, 7.0, 11.5, 5.5, 9.0, 7.5, 12.0, 8.0], large = [8.1, 7.4, 8.9, 7.8, 8.6, 7.2, 8.3, 7.9, 8.8, 7.6];
        const n = d.n || 0, vals = (d.big ? large : small).slice(0, Math.max(n, 1));
        const W = 520, H = 120, x = v => 20 + (v - 4) / 10 * (W - 40);
        return chartCard(`${d.big ? "2.000" : "200"} kişilik örneklemlerden dönüşüm tahminleri (%)`, `<svg class="chart" viewBox="0 0 ${W} ${H}"><line x1="20" x2="${W - 20}" y1="70" y2="70" class="svg-axis"/>
          ${[4, 6, 8, 10, 12, 14].map(t => `<text x="${x(t)}" y="92" class="svg-lbl small" text-anchor="middle">%${t}</text>`).join("")}
          <line x1="${x(8)}" x2="${x(8)}" y1="20" y2="76" stroke="var(--mint)" stroke-dasharray="4 4"/><text x="${x(8) + 4}" y="16" class="svg-note">gerçek oran %8</text>
          ${n ? vals.map((v, i) => `<circle class="dot" style="--i:${i}" cx="${x(v)}" cy="${62 - (i % 3) * 10}" r="6" fill="${d.big ? "var(--violet)" : "var(--blue)"}"/>`).join("") : ""}
          ${n >= 3 ? `<text x="${W / 2}" y="112" class="svg-warn" text-anchor="middle">yayılım: %${Math.min(...vals)} – %${Math.max(...vals)}</text>` : ""}</svg>
          <div class="stage-actions"><button class="chip-toggle on" data-action="vis-step" data-key="n" ${n >= 10 ? "disabled" : ""}>${icon("route")} Yeniden örnekle (${n}/10)</button><button class="chip-toggle ${d.big ? "on" : ""}" data-action="vis-toggle" data-key="big">${d.big ? "2.000 kişilik örneklem" : "Örneklemi 2.000'e çıkar"}</button></div>`);
      },
      options: [
        { label: "Her örneklem aşağı yukarı aynı sonucu veriyor; %8,4 kesin", fb: "200 kişilik örneklemler %5,5 ile %12 arasında gezindi." },
        { label: "200 kişiyle sonuç ±4 puan oynuyor; 2.000 kişiyle yaklaşık ±1 puana iniyor", correct: true, fb: "Aynen. Örneklemi 10 katına çıkarmak belirsizliği yaklaşık √10 ≈ 3 kat azaltır." }] },
    { type: "choice", label: "Karar", prompt: "Yeni sayfa eskisinden (%7) daha mı iyi?", goal: "Belirsizlik aralığıyla karar vermek.",
      options: [{ label: "Evet, %8,4 > %7", fb: "Sonuç ne olurdu? Tüm trafiği yeni sayfaya çevirirsin; bir ay sonra gerçek oranın %7,2 olduğu ortaya çıkar." }, { label: "Bilemeyiz: %8,4'ün aralığı (~%4,5–%12) %7'yi rahatça içeriyor; daha büyük bir örneklem ya da düzgün bir deney gerekli", correct: true, fb: "Zeynep: “Yani bir A/B testi mi kurmalıyız?” Maya gülümsüyor: “Yarın.”" }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: 100 kişilik bir ankette adayların biri %52 oy alıyor. Kazanır mı?", goal: "Belirsizliği başka bir tahminde okumak.",
      options: [{ label: "Evet, %50'nin üstünde", fb: "100 kişilik ankette aralık yaklaşık ±10 puan." }, { label: "Söylenemez; yaklaşık %42–%62 aralığı %50'yi içeriyor", correct: true, fb: "Anket haberlerindeki 'hata payı' tam olarak bu." }] }
  ]
},
{
  id: "case012", num: "012", chapter: 2, title: "Pazarlamanın Sevdiği Deney", difficulty: 3, xp: 180, after: "case011",
  short: "İlk A/B testin. Kontrol %8,1, kampanya %8,7. Kazandık mı?",
  tags: ["A/B testi", "Etki büyüklüğü", "Örneklem büyüklüğü"], nodes: ["experiment", "business"], rewards: { statistics: 10, businessThinking: 6 },
  concept: { name: "A/B testi iş akışı", en: "experiment design", text: "Hipotez → birincil ve koruma metriği → randomizasyon birimi → süre/örneklem → etki ve belirsizlik → karar.", points: [] },
  mentor: "Deney, 'işe yaradı mı?' sorusuna en dürüst cevaptır. Ama ancak önceden planlanırsa.",
  portfolio: { title: "İlk A/B testi", text: "Kampanya testini planladım; 0,6 puanlık farkın belirsizlik aralığı içinde kaldığını gösterip yeterli örneklem büyüklüğünü hesapladım." },
  review: { happened: "Kampanya grubu 0,6 puan önde görünüyordu ama aralık sıfırı içeriyordu.", discovered: "Önceden belirlenmiş metrik, birim ve süre olmadan deney sonucu yorumlanamaz; küçük etkiler büyük örneklem ister.", habit: "Deneyi başlatmadan önce planı yaz: metrik, koruma metriği, birim, süre.", watch: "'Anlamlı değil' demek 'etki yok' demek değildir; sadece bu veriyle ayırt edemediğimiz anlamına gelir." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Deneyi planla", lines: ["Dünkü konuşmadan sonra yeni e-posta kampanyası için gerçek bir A/B testi yapalım dedik.", "Ama nasıl kurulur, bilmiyorum. Önce planı senden istiyorum."] },
    { type: "builder", label: "Planla", prompt: "Deney planını kur", goal: "Bir deneyin temel tasarım kararlarını vermek.",
      think: ["Neyi iyileştirmek istiyoruz, neyi bozmamalıyız?", "Aynı kişi iki grupta da görünebilir mi?"], hints: [{ t: "Ziyaret bazında rastgele atarsan aynı kişi iki versiyonu da görebilir." }, { t: "Haftalık düzen var; 3 gün bir haftayı bile kapsamaz." }],
      fields: [
        { key: "metric", label: "Birincil metrik", options: [["conv", "Satın alma dönüşümü"], ["pv", "Sayfa görüntüleme"]] },
        { key: "guard", label: "Koruma metriği", options: [["none", "Yok"], ["refund", "İade oranı"]] },
        { key: "unit", label: "Randomizasyon birimi", options: [["visit", "Ziyaret"], ["user", "Kullanıcı"]] },
        { key: "dur", label: "Süre", options: [["3d", "3 gün"], ["2w", "2 hafta"]] }],
      run: "Planı onayla",
      visual: d => `<div class="plan-card">${[["Hipotez", "Yeni e-posta satın alma dönüşümünü artırır."], ["Birincil metrik", { conv: "Satın alma dönüşümü", pv: "Sayfa görüntüleme" }[d.metric] || "?"], ["Koruma metriği", { none: "—", refund: "İade oranı" }[d.guard] || "?"], ["Birim", { visit: "Ziyaret", user: "Kullanıcı" }[d.unit] || "?"], ["Süre", { "3d": "3 gün", "2w": "2 hafta" }[d.dur] || "?"]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div>`,
      check: d => {
        if (d.metric !== "conv") return { ok: false, fb: "Sayfa görüntüleme artabilir ama satış artmayabilir. Hipotezin metriğini ölç." };
        if (d.unit !== "user") return { ok: false, fb: "Ziyaret bazında atama: aynı kullanıcı iki e-postayı da görebilir ve gruplar karışır." };
        if (d.dur !== "2w") return { ok: false, fb: "3 gün haftalık düzeni kapsamaz ve yenilik etkisini ayıklayamaz." };
        if (d.guard !== "refund") return { ok: false, fb: "Plan neredeyse tamam. Peki kampanya satışı artırıp iadeleri de artırırsa? Bozulmaması gereken metrik ne?" };
        return { ok: true, title: "Plan sağlam", fb: "Birincil metrik, koruma metriği, kullanıcı bazında atama ve iki haftalık süre. Deney başladı." };
      } },
    { type: "choice", label: "Sonuç", prompt: "İki hafta sonra sonuçlar geldi. Kampanya işe yaradı mı?", goal: "Etkiyi belirsizlik aralığıyla yorumlamak.",
      hints: [{ t: "Farkın aralığına bak: sıfırı içeriyor mu?", hl: ["Fark"] }],
      visual: () => dataTable(["Grup", "Kullanıcı", "Dönüşüm"], [["Kontrol", "1.200", "%8,1"], ["Kampanya", "1.200", "%8,7"], ["Fark", "", "+0,6 puan (aralık: −1,6 ile +2,8)"]]) + noteCard("İade oranı", "Kontrol %3,0, kampanya %3,1: değişim yok."),
      options: [
        { label: "Evet, kampanya 0,6 puan daha iyi", fb: "Sonuç ne olurdu? Kampanya tüm müşterilere gider; gerçek etki sıfıra yakınsa e-posta bütçesi boşa harcanır ve sonraki testler bu 'kazanca' göre planlanır." },
        { label: "Bu veriyle ayırt edemiyoruz: aralık sıfırı içeriyor; etki ya küçük ya da yok", correct: true, fb: "Doğru. 'Anlamlı değil' = 'etki yok' değil; bu örneklem küçük etkiyi göremiyor." },
        { label: "Kampanya zararlı, durdurmalıyız", fb: "Aralık negatif değerleri de içeriyor ama tahmin pozitif; zararlı olduğunu da söyleyemeyiz." }] },
    { type: "choice", label: "Güç", prompt: "0,6 puanlık bir etkiyi güvenle görebilmek için ne gerekir?", goal: "Örneklem büyüklüğü ve etki büyüklüğü ilişkisini kurmak.",
      options: [{ label: "Aynı testi bir kez daha 2 hafta çalıştırmak", fb: "Toplam 2.400 kullanıcı hâlâ yetersiz." }, { label: "Testten önce etki büyüklüğüne göre örneklem hesaplamak: grup başına ~20.000 kullanıcı", correct: true, fb: "Küçük etkiler büyük örneklem ister. Bu hesap deneyin başında yapılır." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Ürün ekibi bir buton testini her gün kontrol etmiş ve p < 0,05 görünce 4. gün durdurmuş. Sorun ne?", goal: "Ara bakış (peeking) tuzağını tanımak.",
      options: [{ label: "Sorun yok, anlamlı sonuç bulmuşlar", fb: "Her gün bakıp ilk 'anlamlı' anda durmak yanlış pozitif ihtimalini katlar." }, { label: "Ara bakış: süre önceden belirlenmeden tekrar tekrar bakmak yanlış pozitifi artırır", correct: true, fb: "Çözüm: süreyi önceden sabitlemek ya da ardışık test yöntemleri kullanmak." }] }
  ]
},
{
  id: "case013", num: "013", chapter: 2, title: "CEO İçin Dashboard", difficulty: 2, xp: 170, after: "case012",
  short: "12 metrik var. CEO sadece 4 tane görmek istiyor.",
  tags: ["Dashboard", "KPI seçimi", "Görselleştirme"], nodes: ["kpi", "viz"], rewards: { visualization: 10, businessThinking: 6 },
  concept: { name: "Yönetici dashboard'u", en: "executive dashboard", text: "Yönetici dashboard'u her şeyi değil, karar verdiren birkaç metriği gösterir: büyüme, müşteri, kârlılık ve risk.", points: [] },
  mentor: "Bir dashboard'un kalitesi, neyi göstermediğiyle ölçülür.",
  portfolio: { title: "CEO dashboard'u", text: "12 metrikten büyüme, müşteri, kârlılık ve risk eksenlerini kapsayan 4 KPI'lık bir yönetici dashboard'u tasarladım." },
  review: { happened: "12 metrikten dördünü seçip tek ekranlık bir yönetici görünümü kurdun.", discovered: "Gösteriş metrikleri (takipçi, sayfa görüntüleme) karar verdirmez; dengeli bir set büyüme, müşteri, kârlılık ve riski kapsar.", habit: "Her KPI için sor: bu değişirse CEO ne yapar?", watch: "Az metrik, bağlamsız metrik değildir: hedef ve önceki dönem yanında olmalı." },
  steps: [
    { type: "dialog", who: "ceo", cta: "Metriklere bak", lines: ["Kerem Yalçın, CEO: “Şu anki dashboard'da 12 grafik var, hiçbirine bakmıyorum.”", "“Bana sabah kahvemle bakacağım 4 metrik ver. Fazlası değil.”"] },
    { type: "builder", label: "Seç", prompt: "CEO için tam 4 KPI seç", goal: "Karar verdiren dengeli bir KPI seti kurmak.",
      think: ["Hangi metrik değişirse CEO bir şey yapar?", "Büyüme, müşteri, kârlılık ve risk kapsandı mı?"], hints: [{ t: "Takipçi ve sayfa görüntüleme 'gösteriş metriği'dir; tek başına karar verdirmez." }],
      fields: [{ key: "k", label: "Metrikler", type: "check", options: [["rev", "Aylık ciro (büyüme)"], ["buyers", "Aktif alıcı (müşteri)"], ["margin", "Brüt kâr marjı (kârlılık)"], ["churn", "Müşteri kaybı (risk)"], ["pv", "Sayfa görüntüleme"], ["followers", "Sosyal medya takipçisi"], ["tickets", "Destek talebi sayısı"], ["emails", "Gönderilen e-posta"], ["aov", "Ortalama sepet"], ["nps", "NPS"], ["stock", "Stok devir hızı"], ["meetings", "Satış toplantısı sayısı"]] }],
      run: "Dashboard'u oluştur",
      visual: d => {
        const L = { rev: ["Aylık ciro", "4,45 Mn ₺", "+%6"], buyers: ["Aktif alıcı", "14.900", "+%2"], margin: ["Brüt marj", "%38", "−1 pp"], churn: ["Müşteri kaybı", "%3,2", "+0,1 pp"], pv: ["Sayfa görüntüleme", "1,2 Mn", "+%30"], followers: ["Takipçi", "48 bin", "+%12"], tickets: ["Destek talebi", "2.140", "−%4"], emails: ["E-posta", "310 bin", "+%40"], aov: ["Ortalama sepet", "298 ₺", "+%4"], nps: ["NPS", "41", "+2"], stock: ["Stok devri", "6,1", "0"], meetings: ["Toplantı", "212", "+%8"] };
        const sel = d.k || [];
        return `<div class="dash-mock"><div class="dash-top">Nexora, CEO görünümü <span>${sel.length}/4</span></div><div class="dash-grid">${sel.slice(0, 6).map(k => `<div class="dash-tile pop-in"><span>${L[k][0]}</span><b>${L[k][1]}</b><em>${L[k][2]} geçen aya göre</em></div>`).join("") || `<p class="muted">Soldan metrik seç.</p>`}</div></div>`;
      },
      check: d => {
        const s = d.k || [], vanity = s.filter(k => ["pv", "followers", "emails", "meetings"].includes(k));
        if (s.length !== 4) return { ok: false, fb: `CEO tam 4 metrik istedi; şu an ${s.length}.` };
        if (vanity.length) return { ok: false, fb: "Kerem: “Takipçi ya da e-posta sayısı artarsa ne yapacağım?” Gösteriş metrikleri karar verdirmez." };
        const axes = [s.includes("rev"), s.includes("buyers") || s.includes("nps"), s.includes("margin") || s.includes("aov"), s.includes("churn") || s.includes("tickets")];
        if (axes.filter(Boolean).length < 4) return { ok: false, fb: "Dört metrik de seçilmiş ama bir eksen eksik. Büyüme, müşteri, kârlılık ve risk kapsandı mı?" };
        return { ok: true, title: "Dengeli bir set", fb: "Büyüme, müşteri, kârlılık ve risk tek ekranda. Kerem: “İşte buna bakarım.”" };
      } },
    { type: "choice", label: "Göster", prompt: "Aylık ciro kutusunda hangi görsel olmalı?", goal: "Bir KPI'ı bağlamla göstermek.",
      options: [{ label: "Sadece büyük sayı: 4,45 Mn ₺", fb: "Bağlamsız sayı: iyi mi kötü mü?" }, { label: "Son 12 ayın çizgisi + geçen yılın aynı dönemi + hedef çizgisi", correct: true, fb: "Trend, mevsimsellik ve hedef bir arada." }, { label: "Kategorilere göre pasta", fb: "Trendi göstermez ve CEO'nun sorusu bu değil." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir belediye başkanı şehir dashboard'u için 30 metrik istiyor. İlk sorun ne olur?", goal: "KPI seçim ilkesini başka bir bağlamda uygulamak.",
      options: [{ label: "Hangi grafik kütüphanesini kullanalım?", fb: "Araç sonra; önce amaç." }, { label: "Hangi kararları verecek ve hangi metrik değişirse ne yapacak?", correct: true, fb: "Karar → metrik → görsel." }] }
  ]
},
{
  id: "case014", num: "014", chapter: 2, title: "Yönetici Değerlendirmesi", difficulty: 3, xp: 260, after: "case013", promotion: true,
  short: "Maya: “Dashboard'a bak. Yarın kurula ne söylememiz gerektiğini bana anlat.”",
  tags: ["Terfi", "SQL + KPI + belirsizlik + iletişim"], nodes: ["sql", "kpi", "experiment", "comm"], rewards: { businessThinking: 8, dataExploration: 6, statistics: 4, visualization: 4 },
  concept: { name: "Kendi analizini kurmak", en: "self-directed analysis", text: "Kimse sana hangi analizi yapacağını söylemediğinde: anomaliyi bul, sorgula, belirsizliği kontrol et, tek cümleyle öner.", points: [] },
  mentor: "Bu sbuser sana nereye bakacağını söylemedim. Doğru yere baktın. Veri Analisti olmanın tanımı bu.",
  portfolio: { title: "Kurul öncesi bağımsız analiz", text: "Dashboard'daki marj düşüşünü yönlendirme olmadan buldum; kategori ve tedarikçi kırılımıyla nedenini gösterip öneriye bağladım." },
  review: { happened: "Brüt marjdaki 1 puanlık düşüşün tamamı tek bir tedarikçinin zammından geliyordu.", discovered: "Anomaliyi seç, kır, belirsizliği kontrol et, öner: bu dört adım hiçbir yönlendirme olmadan uygulandı.", habit: "Belirsiz bir talepte önce 'en çok neye dikkat edilmeli?' sorusunu kendin sor.", watch: "Bulduğun ilk açıklamaya kapılma; alternatifi (mevsimsellik, kampanya) de ele." },
  steps: [
    { type: "dialog", who: "maya", cta: "Dashboard'u aç", lines: ["Bu senin terfi vakan. Hangi analizi yapacağını söylemeyeceğim.", "Dashboard'a bak. Yarın kurula ne söylememiz gerektiğini bana anlat."] },
    { type: "pick", label: "Anomali", correct: "margin", prompt: "Kurulun en çok dikkat etmesi gereken metriğe tıkla.", goal: "Belirsiz bir talepte önceliği kendin belirlemek.",
      hints: [{ t: "Hatırlatma: büyüklük, yön ve beklenen aralığın dışına çıkma birlikte değerlendirilir." }],
      picks: { margin: "Brüt marj 1 puan düştü: 4,45 Mn ₺ cironun %1'i, ayda ~45 bin ₺ ve normal aralığının dışında.", rev: "Ciro beklenen aralıkta büyüyor.", buyers: "Aktif alıcı +%2, normal aralıkta.", churn: "Müşteri kaybı 0,1 puan oynamış; gürültü düzeyinde.", other: "Bu metrik beklenen aralıkta." },
      visual: (d, id) => `<div class="dash-mock"><div class="dash-top">Nexora, CEO görünümü</div><div class="dash-grid">${[["rev", "Aylık ciro", "4,45 Mn ₺", "+%6", "beklenen: +%4–8"], ["buyers", "Aktif alıcı", "14.900", "+%2", "beklenen: 0–3"], ["margin", "Brüt marj", "%38", "−1,0 pp", "beklenen: ±0,3"], ["churn", "Müşteri kaybı", "%3,2", "+0,1 pp", "beklenen: ±0,3"]]
        .map(([k, t, v, c, e]) => `<div class="dash-tile pickable" ${pickAttrs(id, k)}><span>${t}</span><b>${v}</b><em>${c} geçen aya göre</em><small>${e}</small></div>`).join("")}</div></div>` },
    { type: "builder", label: "Sorgula", prompt: "Marj düşüşünün kaynağını sorgula", goal: "Anomaliyi uygun boyutta kırmak.",
      hints: [{ t: "Hatırlatma, Vaka 010: toplamı anlamlı bir boyuta göre kır." }],
      fields: [{ key: "g", label: "GROUP BY", options: [["region", "Bölge"], ["category", "Kategori"], ["supplier", "Tedarikçi"]] }],
      run: "Sorguyu çalıştır",
      visual: d => {
        const T = { region: [["İstanbul", "%38,1", "%37,2"], ["Ankara", "%38,9", "%37,8"], ["İzmir", "%39,2", "%38,3"], ["Bursa", "%38,6", "%37,6"]], category: [["Elektronik", "%31,0", "%27,4"], ["Ev", "%42,1", "%42,0"], ["Ofis", "%44,0", "%43,9"]], supplier: [["Anadolu Elektronik", "%30,2", "%24,1"], ["Diğer elektronik tedarikçileri", "%31,8", "%31,7"], ["Ev ve ofis tedarikçileri", "%43,0", "%42,9"]] }[d.g || "region"];
        return sqlCard("marj.sql", [`SELECT ${d.g || "region"}, margin_last_month, margin_this_month`, "FROM margin_summary", `GROUP BY ${d.g || "region"};`]) + (d.ran ? dataTable(["Grup", "Geçen ay", "Bu ay"], T) : "");
      },
      check: d => d.g === "supplier" ? { ok: true, title: "Kaynak bulundu", fb: "Tek bir tedarikçi (Anadolu Elektronik) zam yapmış; marjı 6 puan düşmüş, diğer herkes sabit." }
        : d.g === "category" ? { ok: false, fb: "Düşüş elektronikte yoğunlaşıyor. Bir seviye daha in: elektroniğin içinde ne değişti?" }
        : { ok: false, fb: "Tüm bölgelerde benzer düşüş var; sorun bölgesel değil. Başka bir boyut dene." } },
    { type: "choice", label: "Belirsizlik", prompt: "Bu düşüş gürültü olabilir mi?", goal: "Bulguyu belirsizlikle sınamak.",
      options: [{ label: "Olabilir; marj her ay oynar", fb: "Normal aralık ±0,3 puan; −1,0 bunun üç katı ve tek bir kaynağa bağlanıyor." }, { label: "Hayır: düşüş normal aralığın üç katı ve tamamı tek bir tedarikçinin fiyat değişikliğiyle açıklanıyor", correct: true, fb: "Büyüklük + somut neden + tutarlılık." }] },
    { type: "choice", label: "Öner", prompt: "Kurula tek cümlen ne?", goal: "Analizi karar cümlesine çevirmek.",
      options: [
        { label: "Marj düştü, maliyetleri genel olarak düşürmeliyiz.", fb: "Sorun genel değil; tek bir tedarikçide." },
        { label: "Marjdaki 1 puanlık düşüşün tamamı Anadolu Elektronik'in zammından geliyor (ayda ~45 bin ₺); satın alma alternatif teklif alıyor, fiyatları gözden geçiriyoruz ve tedarikçi marjını dashboard'a ekliyoruz.", correct: true, fb: "Sayı, kaynak, etki, aksiyon ve izleme. Maya bir süre sessiz kalıyor, sonra başını sallıyor." },
        { label: "Ciro büyüyor, marjdaki küçük düşüş önemsiz.", fb: "Ayda 45 bin ₺ ve sürerse yılda yarım milyon; önemsiz değil." }] }
  ]
}
];
CH2_CASES.forEach(c => { c.kind = "case"; c.concept.points = c.concept.points.length ? c.concept.points : [c.review ? c.review.habit : c.concept.text]; CASES.push(c); CASE_BY_ID[c.id] = c; });
/* Vaka 008, önizlemedeki oynanışı gerçek vakaya taşır */
(() => { const c = CASE_BY_ID.case008, pv = PREVIEW_BY_ID.pv2; c.steps = pv.steps.map(s => ({ ...s })); c.review = pv.review; c.concept.points = [pv.review.habit]; c.steps[0] = { ...pv.steps[0], lines: ["Kategori bazında eylül cirosu lazım, yarınki satış toplantısı için.", "Maya: Nereden başlayacağını sana bırakıyorum."] }; })();
const CH_PROMO_CASE = { 1: "case006", 2: "case014" };

/* ---- kanıt eşlemeleri: Chapter 2 vakaları ağaca bağlanır ---- */
const ADD_SRC = { "sql.join": ["case008"], "sql.grain": ["case008"], "sql.group": ["case007", "case010", "sq_groupby"], "kpi.def": ["case009", "sq_defs"], "kpi.agree": ["case009"], "kpi.dash": ["case013"],
  "exp.ci": ["case011"], "exp.hypo": ["case012"], "exp.power": ["case012"], "exp.peek": ["sq_peeking", "case012"], "py.pandas": ["sq_merge"], "com.oneliner": ["morning"] };
Object.entries(ADD_SRC).forEach(([cid, src]) => { const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === cid)), c = n.concepts.find(c => c.id === cid); c.src.push(...src); });
const NEW_CONCEPTS = {
  sql: [C("sql.where", "Filtre ve tarih mantığı", ["case007"], "WHERE ile doğru dönemi ve satırları seç; tarih koşullarında sınırları (dahil/hariç) kontrol et."), C("sql.null", "NULL ve COUNT farkı", ["sq_null"], "COUNT(*) tüm satırları, COUNT(sütun) yalnızca dolu değerleri sayar. Eksik değer sonucu sessizce değiştirir.")],
  kpi: [C("kpi.baseline", "Doğru karşılaştırma tabanı", ["case007"], "Bir değişimi neye göre hesapladığın sonucun yarısıdır: aynı gün, benzer dönem, takvim etkisi."), C("kpi.mask", "Toplamın gizlediği segment", ["case010", "case014"], "Büyüyen bir toplam, küçülen bir segmenti gizleyebilir. Ana segmentleri her zaman ayrıca raporla.")],
  experiment: [C("exp.guard", "Koruma metriği ve randomizasyon birimi", ["case012"], "Birincil metriğin yanında bozulmaması gereken bir metrik izle; atamayı kullanıcı düzeyinde yap.")]
};
Object.entries(NEW_CONCEPTS).forEach(([nid, cs]) => { NODE_BY_ID[nid].concepts.push(...cs); cs.forEach(c => { CONCEPT_BY_ID[c.id] = { ...c, node: nid }; }); });
["sql.join", "sql.grain", "sql.group", "kpi.def", "kpi.agree", "kpi.dash", "exp.ci", "exp.hypo", "exp.power", "exp.peek", "py.pandas"].forEach(id => { const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === id)), c = n.concepts.find(c => c.id === id); CONCEPT_BY_ID[id] = { ...c, node: n.id }; });
const CH2_NOTES = { "sql.group": "GROUP BY satırları bir boyuta göre toplar. Toplamı bölmek, ortalamanın ve toplamın gizlediğini gösterir.", "kpi.def": "Her KPI'ın tanım kartı: olay, zaman penceresi, kapsam, sahip.", "kpi.agree": "Farklı amaçlara hizmet eden metrikleri tek sayıya zorlamak yerine ayrı adlarla tanımla.", "kpi.dash": "Yönetici dashboard'u karar verdiren birkaç metriği bağlamıyla gösterir.", "exp.ci": "Örneklemden gelen her sayı bir aralıktır. Örneklem büyüdükçe aralık √n ile daralır.", "exp.hypo": "Deney planı: hipotez, birincil metrik, koruma metriği, birim ve süre deneyden önce yazılır.", "exp.power": "Küçük etkileri görmek büyük örneklem ister; örneklem büyüklüğü deneyden önce hesaplanır.", "exp.peek": "Sonuca her gün bakıp ilk 'anlamlı' anda durmak yanlış pozitifi katlar.", "py.pandas": "pandas'ta merge sonrası satır sayısını kontrol et; validate parametresi beklenmeyen çoğalmayı yakalar." };
Object.entries(CH2_NOTES).forEach(([id, t]) => { const c = SKILL_TREE.flatMap(n => n.concepts).find(c => c.id === id); if (c && !c.note) c.note = t; if (CONCEPT_BY_ID[id] && !CONCEPT_BY_ID[id].note) CONCEPT_BY_ID[id].note = t; });

/* ---- Chapter 2 yan görevleri ---- */
const CH2_QUESTS = [
{ id: "sq_defs", kind: "quest", modal: true, prep: true, hot: "desk", who: "maya", after: "case008", title: "Tanımları topla", xp: 35, rewards: { businessThinking: 5 },
  lesson: "Bir metrik tartışmasına girmeden önce her ekibin tanımını yazılı olarak topla: olay, zaman penceresi, kapsam.",
  steps: [
    { type: "dialog", who: "maya", cta: "Sorulara geç", lines: ["Yarın aktif müşteri tartışmasına gireceğiz. Önce iki ekipten tanımlarını topla.", "Doğru soruları sorarsan cevabın yarısı zaten gelir."] },
    { type: "choice", label: "Doğru soru", prompt: "Zeynep ve Burak'a hangi soruları sorarsın?", goal: "Bir metriği bileşenlerine ayırarak sorgulamak.", hints: [{ t: "Bir sayımı tanımlayan üç şey: ne sayılıyor, ne zamandan beri, kim dahil." }],
      options: [{ label: "“Sayınız neden bu kadar yüksek/düşük?”", fb: "Savunmaya iter, tanımı ortaya çıkarmaz." }, { label: "“Hangi olayı sayıyorsunuz, hangi zaman penceresinde, kimleri hariç tutuyorsunuz?”", correct: true, fb: "Zeynep: “Son 30 günde giriş yapan herkes.” Burak: “Son 90 günde fatura kesilen, test hariç.” Yarın için hazırsın." }, { label: "“Hangi tablodan çekiyorsunuz?”", fb: "Yararlı ama tanımın kendisini söylemez." }] }] },
{ id: "sq_groupby", kind: "quest", modal: true, hot: "lounge", who: "buse", after: "case007", title: "Buse'nin GROUP BY sorusu", xp: 40, rewards: { dataExploration: 5 },
  lesson: "SELECT'te toplanmayan her sütun GROUP BY'da olmalı; yoksa sorgu ya hata verir ya da anlamsız sonuç döner.",
  steps: [
    { type: "dialog", who: "buse", cta: "Bakayım", lines: ["Buse (hâlâ stajyer, ama artık SQL öğreniyor): “Bölge bazında ciro istiyorum ama sorgum hata veriyor.”", "“SELECT region, SUM(amount) FROM sales; yazdım. Neden olmuyor?”"] },
    { type: "choice", prompt: "Buse'ye ne söylersin?", goal: "GROUP BY kuralını açıklamak.", hints: [{ t: "SUM her bölge için ayrı mı, tek bir toplam mı hesaplanmalı?" }],
      options: [{ label: "SUM yerine COUNT kullan", fb: "Sorun toplama fonksiyonu değil, gruplama." }, { label: "Sonuna GROUP BY region ekle; toplanmayan her sütun gruplanmalı", correct: true, fb: "Buse: “Çalıştı! Kuralı not aldım.”" }, { label: "region sütununu kaldır", fb: "O zaman bölge bazında ciro alamaz." }] }] },
{ id: "sq_null", kind: "quest", modal: true, hot: "alex", who: "alex", after: "case008", title: "Kaybolan 312 müşteri", xp: 40, rewards: { dataQuality: 5 },
  lesson: "COUNT(*) tüm satırları, COUNT(sütun) yalnızca dolu değerleri sayar. Eksik değerler sayımı sessizce değiştirir.",
  steps: [
    { type: "dialog", who: "alex", cta: "Göster", lines: ["İki sorgu, aynı tablo, farklı sonuç. COUNT(*) 4.812 diyor, COUNT(email) 4.500.", "Hangisi müşteri sayısı?"] },
    { type: "choice", prompt: "Fark nereden geliyor?", goal: "NULL değerlerin sayıma etkisini görmek.", hints: [{ t: "COUNT(sütun) hangi satırları atlar?" }],
      visual: () => sqlCard("say.sql", ["SELECT COUNT(*), COUNT(email), COUNT(DISTINCT customer_id)", "FROM customers;"]) + kpiStrip([["COUNT(*)", "4.812"], ["COUNT(email)", "4.500"], ["DISTINCT id", "4.812"]]),
      options: [{ label: "312 satır mükerrer", fb: "DISTINCT customer_id de 4.812; mükerrer yok." }, { label: "312 müşterinin e-postası boş (NULL); COUNT(email) onları saymıyor", correct: true, fb: "Müşteri sayısı 4.812. E-postasız müşteriler kampanya listesine de girmiyor; ayrıca raporla." }] }] },
{ id: "sq_merge", kind: "quest", modal: true, hot: "alex", who: "alex", after: "case009", title: "pandas'ta merge kazası", xp: 45, rewards: { dataExploration: 4, dataQuality: 4 },
  lesson: "merge sonrası satır sayısını kontrol et; validate='many_to_one' gibi parametreler beklenmeyen çoğalmayı hata olarak yakalar.",
  steps: [
    { type: "dialog", who: "alex", cta: "Notebook'u aç", lines: ["Python tarafına da bir göz atalım. Aynı JOIN hatası pandas'ta da olur.", "Bu notebook'ta satır sayısı merge'den sonra artmış. Hangi satır kurtarır?"] },
    { type: "pick", label: "Düzelt", correct: "l3", prompt: "Hatayı yakalayacak satıra tıkla.", goal: "pandas'ta güvenli birleştirme alışkanlığı.", hints: [{ t: "merge fonksiyonunun beklenen ilişkiyi kontrol eden bir parametresi var." }],
      picks: { l3: "validate='many_to_one': her siparişin tek bir ürüne eşlendiğini garanti eder; aksi hâlde hata verir.", other: "Bu satır sorunu fark etmez." },
      visual: (d, id) => `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>kategori.ipynb</span></div>${["sales = pd.read_csv('sales.csv')            # 52.000 satır", "products = pd.read_csv('products.csv')", "df = sales.merge(products, on='product_id', validate='many_to_one')", "df = sales.merge(products, on='product_id')  # 91.400 satır (!)", "df.groupby('category')['amount'].sum()"].map((l, i) => `<div class="code-line pickable" ${pickAttrs(id, "l" + (i + 1))}><span class="ln">${i + 1}</span><code>${l}</code></div>`).join("")}</div>` }] },
{ id: "sq_peeking", kind: "quest", modal: true, hot: "phone", who: "zeynep", after: "case012", title: "Her gün bir bakış", xp: 40, rewards: { statistics: 5 },
  lesson: "Deney süresini önceden belirle ve ara sonuçlara göre durdurma. Her bakış, şans eseri 'anlamlı' görme ihtimalini artırır.",
  steps: [
    { type: "dialog", who: "zeynep", cta: "Cevap ver", lines: ["Yeni testi her sabah kontrol ediyorum. Bugün p = 0,04 çıktı!", "Testi bugün durdurup kazananı ilan edeyim mi?"] },
    { type: "choice", prompt: "Ne dersin?", goal: "Ara bakış tuzağından kaçınmak.", hints: [{ t: "Planlanan süre neydi?" }],
      options: [{ label: "Evet, p < 0,05", fb: "14 gün bakıldığında şans eseri en az bir gün p < 0,05 görme ihtimali çok daha yüksek." }, { label: "Hayır; planlanan iki haftayı tamamla, kararı o zaman ver", correct: true, fb: "Zeynep: “Sabırsızlık en pahalı yanlışmış.”" }] }] }
];
CH2_QUESTS.forEach(q => { QUESTS.push(q); QUEST_BY_ID[q.id] = q; });

/* ---- Chapter 2 sabahları (gün 7–14) ---- */
Object.assign(MORNINGS, {
  7: { scene: "timeskip", time: "08:30", title: "3 ay sonra", text: "Kartında artık 'Junior Veri Analisti' yazıyor. Masan da değişti: pencere kenarı.",
    steps: [
      { type: "dialog", who: "maya", cta: "Hazırım", lines: ["Junior Veri Analisti olarak ilk sabahın. Tebrikler, yeniden.", "Bu bölümde sana artık her şeyi söylemeyeceğim. Birlikte çözme yok; ipuçları var ama nereden başlayacağını sen düşüneceksin."] },
      { type: "choice", label: "Sabah özeti", who: "maya", prompt: "Maya: “Stajyerlik döneminden tek bir alışkanlık seçsen, hangisi?”", ...STANDUP_GUIDE,
        hints: [{ t: "Her vakada ilk ne yaptın?" }],
        options: [{ label: "Hızlı cevap vermek", fb: "Hız güzel, ama doğru soruyla gelmeyen hız pahalı." }, { label: "Bir sayıyı görünce önce 'neye göre, nerede, hangi tanımla?' diye sormak", correct: true, fb: "Maya: “İşte bu bölümde en çok buna ihtiyacın olacak.”" }] }] },
  8: { scene: "laptop", time: "08:55", title: "Sabah mesajları", text: "Laptopu açıyorsun. Dünkü pazartesi analizine teşekkür mesajları.",
    notifications: [["zeynep", "Satış müdürü teşekkür ediyor!"], ["maya", "Bugün tablolar birleşecek."], ["alex", "JOIN'lerde dikkat 😉"], ["buse", "GROUP BY konusunda bir sorum var"]],
    steps: [{ type: "choice", label: "Sabah özeti", who: "zeynep", prompt: "Zeynep: “Satış müdürüne dünkü bulguyu tek cümleyle bir daha yazar mısın?”", ...STANDUP_GUIDE, hints: [{ t: "Neye göre karşılaştırdın ve ne buldun?" }],
      options: [{ label: "Pazartesi satışları düşmedi.", fb: "Doğru ama neden ve nasıl düzelteceğimiz eksik." }, { label: "Önceki pazartesiler ve arifelerle karşılaştırınca 28 Ekim olağan; dashboard'u benzer günlerle karşılaştıracak şekilde güncelliyoruz.", correct: true, fb: "Zeynep: “Kopyalıyorum!”" }] }] },
  9: { scene: "standup", time: "09:15", title: "Analytics Daily", text: "Sabah toplantısı. Bu sbuser Buse de var.",
    steps: [{ type: "choice", label: "Stand-up", who: "maya", prompt: "Maya: “Dünkü kategori cirosu ne oldu?”", ...STANDUP_GUIDE, hints: [{ t: "Ne yanlıştı, nasıl düzeldi, sonuç ne?" }],
      options: [{ label: "JOIN yaptım.", fb: "Sürecin bir adımı; bulgu değil." }, { label: "Fiyat geçmişi tablosu ciroyu 14,7 Mn'ye şişiriyordu; tekil ürün tablosu ve LEFT JOIN ile 8,2 Mn'de Finans'la mutabık; 0,2 Mn kategorisiz satış ayrıca raporlandı.", correct: true, fb: "Maya: “Buse, bunu not al.”" }] }] },
  10: { scene: "rain", time: "08:40", title: "Sağanak ve kahve", text: "Yine yağmur. Alex iki kahveyle bekliyor; bu sbuser yanında Burak da var.",
    steps: [{ type: "choice", label: "Sabah özeti", who: "burak", prompt: "Burak: “Aktif müşteri tartışması nasıl bitti? CFO soracak.”", ...STANDUP_GUIDE, hints: [{ t: "İki tanım, iki ad." }],
      options: [{ label: "Finans haklı çıktı.", fb: "İkisi de haklıydı; farklı şeyleri ölçüyorlardı." }, { label: "İki farklı tanım vardı; artık 'Aylık aktif kullanıcı' (18.400) ve 'Çeyreklik aktif alıcı' (14.900) diye iki ayrı metriğimiz ve tanım kartları var.", correct: true, fb: "Burak: “Mükemmel, CFO'ya böyle iletiyorum.”" }] }] },
  11: { scene: "urgent", time: "08:50", title: "CFO soruyor", text: "Telefonun titriyor: Burak'tan büyük harfli bir mesaj.",
    steps: [{ type: "choice", label: "Hızlı cevap", who: "burak", prompt: "Burak: “CFO kurumsal segmenti sordu. TEK CÜMLE!”", ...STANDUP_GUIDE, hints: [{ t: "Toplam, segment ve aksiyon." }],
      options: [{ label: "Kurumsal kötü gidiyor.", fb: "Ne kadar, neden, ne yapıyoruz?" }, { label: "Toplam %6 büyürken kurumsal %18 küçüldü; üç büyük hesap rakibe geçti, satış ekibi geri kazanma görüşmelerinde.", correct: true, fb: "Burak: “İletildi.”" }] }] },
  12: { scene: "laptop", time: "09:05", title: "Deney günü", text: "Bugün ilk A/B testini planlayacaksın. Gelen kutusu kalabalık.",
    notifications: [["zeynep", "Kampanya testi için hazırız!"], ["alex", "Randomizasyon birimine dikkat"], ["maya", "Önce plan, sonra deney"]],
    steps: [{ type: "choice", label: "Sabah özeti", who: "zeynep", prompt: "Zeynep: “Dünkü %8,4 sonucunu pazarlama ekibine nasıl anlatayım?”", ...STANDUP_GUIDE, hints: [{ t: "Sayı + belirsizlik + sonraki adım." }],
      options: [{ label: "Yeni sayfa %8,4, harika.", fb: "Belirsizlik eksik." }, { label: "200 kişilik örneklemde %8,4; aralık yaklaşık %4,5–%12, eskisinden iyi olduğunu söyleyemiyoruz; bugün düzgün bir A/B testi kuruyoruz.", correct: true, fb: "Zeynep: “Çok daha dürüst. Böyle yazıyorum.”" }] }] },
  13: { scene: "standup", time: "09:15", title: "Analytics Daily", text: "Herkes deney sonucunu merak ediyor.",
    steps: [{ type: "choice", label: "Stand-up", who: "maya", prompt: "Maya: “Kampanya testi ne dedi?”", ...STANDUP_GUIDE, hints: [{ t: "Etki, aralık, anlamı, sonraki adım." }],
      options: [{ label: "Kampanya kazandı, +0,6 puan.", fb: "Aralık sıfırı içeriyordu." }, { label: "+0,6 puan ama aralık −1,6 ile +2,8; bu örneklemle ayırt edemiyoruz. Grup başına ~20 bin kullanıcıyla yeniden planlıyoruz.", correct: true, fb: "Maya: “Mükemmel. Belirsizliği söylemek güç ister.”" }] }] },
  14: { scene: "promo", time: "08:45", title: "Terfi günü", text: "Maya masana geliyor. Elinde bir çıktı: CEO dashboard'u.",
    steps: [{ type: "dialog", who: "maya", cta: "Dinliyorum", lines: ["Üç aydır neredeyse hiç yönlendirme yapmadım. Fark ettin mi?", "Bugün hiç yapmayacağım. Ama önce dünkü dashboard'u Kerem'e nasıl özetlediğini duymak istiyorum."] },
      { type: "choice", label: "Son özet", who: "maya", prompt: "Dashboard'u CEO'ya nasıl özetledin?", ...STANDUP_GUIDE, hints: [{ t: "Kaç metrik, hangi eksenler, neden?" }],
        options: [{ label: "12 metrik yerine 4 metrik koydum.", fb: "Ne yaptığını söylüyor, neden yaptığını değil." }, { label: "Büyüme, müşteri, kârlılık ve riski kapsayan 4 KPI; her biri hedef ve geçen yılla birlikte, gösteriş metrikleri çıkarıldı.", correct: true, fb: "Maya: “Tamam. Bugün dashboard'a sen bakacaksın.”" }] }] }
});
Object.entries(MORNINGS).forEach(([d, m]) => { MORNING_DEFS[`morning${d}`] = { id: `morning${d}`, kind: "morning", day: +d, ...m }; });

/* ---- Chapter 2 ofis olayları, akşamlar, Slack ---- */
const CH2_EVENTS = [
  { id: "ev_slowquery", who: "deniz", days: [8, 14], notify: "Veri ambarı yavaşladı, senin sorgun mu?", title: "Yavaşlayan veri ambarı", xp: 15, rewards: { dataExploration: 2 },
    steps: [{ type: "choice", who: "deniz", prompt: "“Veri ambarı 20 dakikadır kilitli. Logda senin adınla 2 milyar satırlık bir sorgu var. Ne yapalım?”", goal: "Sorgu maliyetini düşünmek.", hints: [{ t: "Tüm tabloyu tarayan sorgular paylaşılan kaynağı tıkar." }],
      options: [{ label: "Bekleyelim, birazdan biter", fb: "Herkes beklemeye devam eder." }, { label: "Sorguyu durdurup tarih filtresi ve gerekli sütunlarla yeniden yazarım; önce küçük bir örnekte denerim", correct: true, fb: "Deniz: “Ambar nbuses aldı. Teşekkürler!”" }, { label: "Gece çalıştırırım", fb: "Sorun zamanlama değil, gereksiz tarama." }] }] },
  { id: "ev_onemore", who: "zeynep", days: [9, 14], notify: "Dashboard'a bir metrik daha?", title: "Bir metrik daha", 
    steps: [{ type: "reply", who: "zeynep", prompt: "“CEO dashboard'una sosyal medya takipçisini de ekleyebilir miyiz? Pazarlama çok istiyor.”",
      options: [{ label: "“CEO bunu görünce ne karar verecek? Yoksa pazarlama dashboard'unda kalsın.”", reply: "Zeynep: “Haklısın… Pazarlama panosuna koyalım.”", trust: { zeynep: 1 } }, { label: "“Tamam, ekleyelim.”", reply: "Dashboard 5 metriğe çıktı. Kerem bir hafta sonra 'bu ne?' diye sordu.", trust: {} }, { label: "“Hayır.”", reply: "Zeynep biraz bozuldu. Belki gerekçeyi de söylemek iyi olurdu.", trust: {} }] }] },
  { id: "ev_access", who: "alex", days: [8, 14], notify: "Müşteri tablosuna tam erişim ister misin?", title: "Erişim isteği", xp: 15, rewards: { businessThinking: 2 },
    steps: [{ type: "choice", who: "alex", prompt: "“İşini hızlandırmak için sana müşteri tablosunun tamamına (ad, telefon, adres dahil) erişim açabilirim. İster misin?”", goal: "En az yetki ilkesini uygulamak.", hints: [{ t: "Analizlerinde kişisel alanlara ihtiyacın var mı?" }],
      options: [{ label: "Evet, ne kadar çok o kadar iyi", fb: "İhtiyacın olmayan kişisel veri, sadece risk demek." }, { label: "Sadece analiz için gereken sütunlara, kişisel alanlar maskelenmiş erişim yeter", correct: true, fb: "Alex: “En az yetki. Güvenlik ekibi seni sevecek.”" }] }] },
  { id: "ev_buse_lunch", who: "buse", days: [9, 14], notify: "Öğle yemeği?", title: "Buse ile öğle yemeği",
    steps: [{ type: "reply", who: "buse", prompt: "“Stajım bitiyor. Sence veri bilimine geçmek için ne yapmalıyım?”",
      options: [{ label: "“İstatistik ve SQL temelini sağlamlaştır; her vakada önce soruyu doğru kur.”", reply: "Buse: “Not aldım. Bir gün sana model review yaptıracağım, görürsün!”", flag: { buse_advice: true } }, { label: "“Bir sürü kurs al, sertifika topla.”", reply: "Buse biraz düşünüyor: “Kurslar mı, pratik mi?”" }, { label: "“Bilmiyorum, ben de daha yeniyim.”", reply: "Buse: “Dürüstlüğün hoş. Birlikte öğreniriz.”" }] }] }
];
CH2_EVENTS.forEach(e => { e.kind = "event"; e.modal = true; EVENTS.push(e); EVENT_BY_ID[e.id] = e; });
Object.assign(EVENINGS, {
  9: [{ label: "Eve git", result: "Akşam yürüyüşü. Kafanda JOIN'ler dönmüyor, iyi." }, { label: "20 dakika kal ve incele", late: true, result: "Kategorisiz satışların yeni ürün kodlarından geldiğini doğruladın ve not bıraktın.", skills: { dataQuality: 2 } }, { label: "Buse'ye SQL anlat", result: "Buse ilk GROUP BY'ını yazdı. Gözleri parlıyordu.", trust: { alex: 1 } }],
  11: [{ label: "Eve git", result: "Hafta sonu başlıyor. Telefonunu sessize aldın." }, { label: "20 dakika kal ve incele", late: true, result: "Kurumsal kayıplarda ortak bir şey aradın ama bulamadın. Bazen veri sadece veridir." }, { label: "Ekiple dinlenme alanına geç", result: "Alex bir istatistik bilmecesi sordu, kimse çözemedi.", trust: { alex: 1, deniz: 1 } }],
  13: [{ label: "Eve git", result: "Yarın büyük gün. Erken yattın." }, { label: "20 dakika kal ve incele", late: true, result: "Deney raporunu yeniden okudun ve bir yazım hatası düzelttin.", skills: { visualization: 1 } }, { label: "Maya'yla konuş", result: "Maya: “Yarın sadece kendine güven.”", trust: { maya: 1 } }]
});
SLACK.push(
  { day: 7, ch: "#genel", msgs: [["deniz", "Analitik ekibinin yeni Junior Veri Analisti'ni tebrik edelim! 🎉"], ["zeynep", "Sonunda! Artık sorularımı resmî olarak sana sorabilirim 😄"]] },
  { day: 8, ch: "#analytics-team", msgs: [["alex", "products tablosunda fiyat geçmişi var, JOIN'lerde dikkat."], ["maya", "Her JOIN'den sonra satır sayısını kontrol edin."]] },
  { day: 10, ch: "#metrik-katalogu", msgs: [["maya", "Yeni kanal: her KPI'ın tanım kartı burada."], ["burak", "Çeyreklik aktif alıcı eklendi ✅"]] },
  { day: 12, ch: "#deneyler", msgs: [["zeynep", "İlk kampanya testi başladı!"], ["alex", "Kimse ara sonuçlara bakmasın lütfen 🙏"]] },
  { day: 14, ch: "#analytics-team", msgs: [["maya", "Bugün kurul hazırlığı. Herkes sessiz mod."], ["buse", "Bol şans! 🍀"]] }
);

Object.assign(AFTER_CASE, {
  case007: "Satış müdürü rahatladı. Yarın iki tabloyu birleştireceğiz; JOIN'lerde satır sayısını kontrol etmeyi unutma.",
  case008: "Kategori cirosu Finans'la tuttu. Yarın aktif müşteri tartışmasına giriyoruz; önce tanımları topla.",
  case009: "Metrik kataloğuna iki yeni kart eklendi. Burak'ın çeyrek sonu raporuna yarın bir göz at.",
  case010: "Satış ekibi kurumsal hesapları arıyor. Yarın belirsizlik üzerine çalışacağız.",
  case011: "Zeynep A/B testi istiyor. Yarın ilk deneyini planlayacaksın.",
  case012: "Belirsizliği dürüstçe söyledin. Yarın Kerem için dashboard'u yeniden kuruyoruz.",
  case013: "Kerem dashboard'u sevdi. Becerilerin hazır olduğunda yarın terfi vakan masanda.",
  case014: "Tebrikler, Veri Analisti. Toplantı odasına gelir misin?"
});

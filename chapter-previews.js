
/* =====================================================================
   BÖLÜM ÖNİZLEMELERİ — her bölümden oynanabilir bir vaka.
   Yeni adım türü "builder": oyuncu seçim yapar, sonucu canlı görür, çalıştırır.
   Bölümün rehberlik politikası (GUIDANCE) otomatik uygulanır.
   ===================================================================== */
const PEOPLE_LATER = { buse: { role: "Junior Veri Bilimci" } };
function resultTable(rows, total, note) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Kategori</th><th>Eylül cirosu</th></tr></thead><tbody>
    ${rows.map(([k, v], i) => `<tr style="--i:${i}"><td class="first">${k}</td><td>${v}</td></tr>`).join("")}
    <tr class="total-row"><td>Toplam</td><td>${total}</td></tr></tbody></table></div>${note ? noteCard("Finans kontrolü", note) : ""}`;
}
const PREVIEWS = [
{
  id: "pv2", kind: "preview", chapter: 2, num: "008", title: "İki Tablo, Tek Cevap", nodes: ["sql", "quality"],
  short: "Satış ve ürün tablolarını birleştir; kategori bazında doğru ciroyu bul.",
  review: { happened: "Ürün tablosunda her ürünün fiyat geçmişi ayrı satırdaydı; birleştirme ciroyu neredeyse ikiye katladı.", discovered: "JOIN'den önce iki tablonun grain'ini bilmek gerekir; LEFT JOIN eşleşmeyenleri görünür kılar.", habit: "Her JOIN'den sonra satır sayısını ve toplamı bilinen bir değerle karşılaştır.", watch: "LEFT JOIN her zaman doğru değildir; soruya göre eşleşmeyenleri ayrıca raporla." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Tablolara bak", lines: ["Kategori bazında eylül cirosu lazım, yarınki satış toplantısı için.", "Maya: Bu sbuser nereden başlayacağını sana bırakıyorum."] },
    { type: "choice", label: "Soruyu kur", prompt: "Sorguyu yazmadan önce: sonuç tablosunda bir satır neyi temsil etmeli?", goal: "SQL'den önce çıktının grain'ini belirlemek.",
      think: ["Zeynep tam olarak ne istiyor?", "Bu çıktı için hangi tablolar gerekli?"], hints: [{ t: "İstenen şey 'kategori bazında ciro'." }],
      options: [{ label: "Bir sipariş", fb: "Sipariş düzeyinde binlerce satır olur; Zeynep kategori toplamı istiyor." }, { label: "Bir kategori", correct: true, fb: "Doğru. Sipariş satırlarını kategoriye göre toplayacaksın; kategori bilgisi ürün tablosunda." }, { label: "Bir ürün ve gün", fb: "Bu ara bir adım olabilir ama istenen çıktı değil." }] },
    { type: "builder", label: "Sorguyu kur", prompt: "Sorguyu kur ve çalıştır", sub: "Finans'ın eylül toplamı 8,2 Mn ₺. Sonucun bununla tutmalı.", goal: "JOIN türünü ve birleştirme anahtarını doğru seçmek.",
      think: ["Ürün tablosunda bir ürün kaç kez geçiyor?", "Ürün tablosunda olmayan satışlar ne olmalı?"],
      hints: [{ t: "products tablosu her fiyat değişikliğini yeni satır olarak tutuyor. Bir ürün birden çok satırda olabilir." }, { t: "INNER JOIN, ürün tablosunda karşılığı olmayan satışları sessizce düşürür." }],
      fields: [
        { key: "table", label: "Ürün tablosu", options: [["raw", "products (tüm fiyat geçmişi)"], ["cur", "products_current (ürün başına tek satır)"]] },
        { key: "join", label: "JOIN türü", options: [["inner", "INNER JOIN"], ["left", "LEFT JOIN"]] },
        { key: "key", label: "Anahtar", options: [["pid", "s.product_id = p.product_id"], ["oid", "s.order_id = p.product_id"]] }],
      run: "Sorguyu çalıştır",
      visual: (d) => {
        const t = d.table || "raw", j = d.join || "inner", k = d.key || "pid";
        const sql = `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>kategori_ciro.sql</span></div>
          ${["SELECT p.category, SUM(s.amount)", "FROM sales s", `${j === "left" ? "LEFT" : "INNER"} JOIN ${t === "cur" ? "products_current" : "products"} p`, `  ON ${k === "pid" ? "s.product_id = p.product_id" : "s.order_id = p.product_id"}`, "WHERE s.month = '2024-09'", "GROUP BY p.category;"].map((l, i) => `<div class="code-line"><span class="ln">${i + 1}</span><code>${l.replace(/(SELECT|SUM|FROM|LEFT|INNER|JOIN|ON|WHERE|GROUP BY)/g, "<b>$1</b>").replace(/('[^']*')/g, "<em>$1</em>")}</code></div>`).join("")}</div>`;
        if (!d.ran) return sql + `<div class="pick-help">${icon("route")}Seçimleri yap ve sorguyu çalıştır.</div>`;
        if (k === "oid") return sql + resultTable([["(eşleşme yok)", "0,3 Mn ₺"]], "0,3 Mn ₺", "Neredeyse hiçbir satır eşleşmedi: anahtar yanlış.");
        if (t === "raw") return sql + resultTable([["Elektronik", "6,1 Mn ₺"], ["Ev", "4,9 Mn ₺"], ["Ofis", "3,7 Mn ₺"]], "14,7 Mn ₺", "Finans 8,2 Mn ₺ diyor. Bir gecede satışları neredeyse ikiye mi katladık?");
        if (j === "inner") return sql + resultTable([["Elektronik", "3,4 Mn ₺"], ["Ev", "2,7 Mn ₺"], ["Ofis", "1,9 Mn ₺"]], "8,0 Mn ₺", "0,2 Mn ₺ eksik. Bazı satışlar sonuçta yok.");
        return sql + resultTable([["Elektronik", "3,4 Mn ₺"], ["Ev", "2,7 Mn ₺"], ["Ofis", "1,9 Mn ₺"], ["(kategorisiz, yeni ürünler)", "0,2 Mn ₺"]], "8,2 Mn ₺", "Tutuyor. Kategorisiz 0,2 Mn ₺ ayrıca raporlanmalı.");
      },
      check: d => {
        if (d.key === "oid") return { ok: false, fb: "Sipariş numarasını ürün numarasıyla eşleştirdin; neredeyse hiçbir satır birleşmedi." };
        if ((d.table || "raw") === "raw") return { ok: false, fb: "Alex masasından bağırıyor: “Bir gecede satışları neredeyse ikiye katlamışız. Keşke gerçekten öyle olsaydı.” Ürün tablosunda her ürün birden çok satırda; JOIN satış satırlarını çoğalttı." };
        if ((d.join || "inner") === "inner") return { ok: false, fb: "8,0 Mn ₺: 0,2 Mn ₺ kayıp. INNER JOIN, ürün tablosunda henüz kaydı olmayan yeni ürünlerin satışlarını sessizce düşürdü." };
        return { ok: true, title: "Toplam tutuyor", fb: "8,2 Mn ₺. Ürün başına tek satırlık tablo grain sorununu, LEFT JOIN de kayıp satışları çözdü." };
      } },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Müşteri tablosunu adres tablosuyla birleştirince müşteri sayısı 12.000'den 15.300'e çıktı. Neden?", goal: "JOIN sonrası çoğalmayı başka bir tabloda tanımak.",
      hints: [{ t: "Bir müşterinin kaç adresi olabilir?" }],
      options: [{ label: "Yeni müşteriler eklendi", fb: "JOIN yeni müşteri yaratmaz; mevcut satırları çoğaltabilir." }, { label: "Bazı müşterilerin birden fazla adresi var; adres tablosunun grain'i müşteri değil", correct: true, fb: "Aynen. Ya varsayılan adresi seçersin ya da müşteri sayarken DISTINCT kullanırsın." }] }
  ]
},
{
  id: "pv3", kind: "preview", chapter: 3, num: "017", title: "Simpson Paradoksu", nodes: ["causal", "stats"],
  short: "Dönüşüm arttı ama her segmentte düştü. Nasıl mümkün?",
  review: { happened: "Yeni ödeme sayfası her cihazda dönüşümü düşürdü; toplam oran ise trafik masaüstüne kaydığı için arttı.", discovered: "Toplam oran, segment oranlarının ağırlıklı ortalamasıdır; ağırlıklar değişince toplam yanıltır.", habit: "Dönemleri karşılaştırırken segment karışımının değişip değişmediğine bak.", watch: "Her segmentlemede paradoks aranmaz; ilgili segment iş mantığıyla seçilmeli." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Verilere bak", lines: ["Müjde! Yeni ödeme sayfasından sonra dönüşüm %4,0'dan %4,6'ya çıktı.", "Ürün ekibi tüm sayfaları yeni tasarıma geçirmek istiyor. Sen ne dersin?"] },
    { type: "choice", label: "Kır ve bak", explore: ["byDevice"], prompt: "Yeni ödeme sayfası dönüşümü artırdı mı?", sub: "Önce veriyi cihaza göre kır.", goal: "Toplam ile segment oranlarını birlikte okumak.",
      think: ["Toplam oran hangi oranların ortalaması?", "Trafiğin cihaz dağılımı değişti mi?"], hints: [{ t: "Her iki cihazda da oran düşmüş. Ama trafiğin dağılımına bak." }],
      visual: d => chartCard("Dönüşüm oranı, önce ve sonra", d.byDevice
        ? groupedBars([{ label: "Mobil", a: 2.0, b: 1.8 }, { label: "Masaüstü", a: 8.0, b: 7.0 }], ["Önce", "Sonra"]) + dataTable(["Cihaz", "Ziyaret (önce → sonra)", "Dönüşüm (önce → sonra)"], [["Mobil", "10.000 → 7.000", "%2,0 → %1,8"], ["Masaüstü", "5.000 → 8.000", "%8,0 → %7,0"]])
        : groupedBars([{ label: "Tüm trafik", a: 4.0, b: 4.6 }], ["Önce", "Sonra"])) +
        `<div class="stage-actions"><button class="chip-toggle ${d.byDevice ? "on" : ""}" data-action="vis-toggle" data-key="byDevice">${d.byDevice ? "Cihaza göre kırıldı" : "Cihaza göre kır"}</button></div>`,
      options: [
        { label: "Evet, toplam dönüşüm %15 arttı", fb: "Her iki cihazda da oran düştü. Toplamı yükselten sayfa değil, trafiğin masaüstüne kayması." },
        { label: "Hayır; her cihazda dönüşüm düştü, toplamı yükselten trafiğin dönüşümü yüksek masaüstüne kayması", correct: true, fb: "Aynen. Aynı dönemde bir masaüstü kampanyası trafiği değiştirmiş. Sayfa aslında daha kötü." }] },
    { type: "choice", label: "Adlandır", prompt: "Bu durumu nasıl adlandırır ve nasıl karşılaştırırsın?", goal: "Paradoksu adlandırmak ve doğru karşılaştırmayı seçmek.",
      hints: [{ t: "Sorun segmentlerin ağırlığının değişmesi." }],
      options: [{ label: "Örneklem hatası; daha çok veri topla", fb: "15.000 ziyaret küçük değil. Sorun belirsizlik değil, karışım." }, { label: "Simpson paradoksu; segment içinde karşılaştır ya da karışımı sabitleyerek standardize et", correct: true, fb: "Doğru. Karışımı önceki dönemle sabitlersen 'sonra' oranı %3,9 çıkar: düşüş." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir üniversitede iki fakültede de kadın adayların kabul oranı daha yüksek, ama üniversite genelinde daha düşük. Ne oluyor?", goal: "Paradoksu başka bir alanda tanımak.",
      hints: [{ t: "Kadın adaylar hangi fakültelere daha çok başvuruyor?" }],
      options: [{ label: "Kabul sürecinde kadınlara karşı ayrımcılık var", fb: "Her fakültede kadınların oranı daha yüksek. Genel tablo başvuru karışımından geliyor." }, { label: "Kadınlar kabul oranı düşük fakültelere daha çok başvuruyor; karışım genel oranı aşağı çekiyor", correct: true, fb: "Bu, 1973 Berkeley vakasının ta kendisi." }] }
  ]
},
{
  id: "pv4", kind: "preview", chapter: 4, num: "026", title: "%97 Doğruluk!", nodes: ["mlform", "modeling", "evaluation"],
  short: "Churn modeli %97 doğru. Herkes seviniyor. Sen?",
  review: { happened: "Model herkese 'kalır' diyerek %97 doğruluğa ulaştı ama tek bir churn eden müşteriyi yakalamadı.", discovered: "Dengesiz veride doğruluk yanıltır; önce naif temeli, sonra azınlık sınıfını ne kadar yakaladığını ölç.", habit: "Her modeli önce temelle karşılaştır: Baseline before sophistication.", watch: "Recall'u artırmak yanlış alarmları da artırır; bedeli bir sonraki bölümün konusu." },
  steps: [
    { type: "dialog", who: "maya", cta: "Başlayalım", lines: ["Artık sadece ne olduğunu açıklamayacağız. Tahmin edeceğiz.", "Alex ilk churn modelini kurdu ve doğruluk %97. Yönetim yarın canlıya almak istiyor."] },
    { type: "builder", label: "Problemi kur", prompt: "Modeli değerlendirmeden önce problemi doğru kur", goal: "Gözlem birimi, hedef ve öznitelik penceresini zamana göre tanımlamak.",
      fields: [
        { key: "unit", label: "Gözlem birimi", options: [["order", "Sipariş"], ["customer", "Müşteri"], ["day", "Gün"]] },
        { key: "target", label: "Hedef", options: [["past", "Geçen ay iptal etti mi?"], ["next30", "Önümüzdeki 30 gün içinde iptal edecek mi?"], ["spend", "Toplam harcama"]] },
        { key: "window", label: "Öznitelik penceresi", options: [["past90", "Gözlem tarihinden önceki 90 gün"], ["all", "Tüm geçmiş + sonraki 30 gün"]] }],
      run: "Kurguyu onayla",
      visual: d => `<div class="timeline-card"><div class="tl-axis"><span class="tl-feat ${d.window === "all" ? "bad" : ""}">Öznitelik penceresi<br><b>${d.window === "all" ? "geçmiş + gelecek" : "önceki 90 gün"}</b></span><span class="tl-now">Gözlem tarihi<br><b>bugün</b></span><span class="tl-target">Hedef penceresi<br><b>${d.target === "next30" ? "sonraki 30 gün" : d.target === "past" ? "geçen ay (!)" : "—"}</b></span></div>
        <p class="muted small">Birim: <b>${{ order: "sipariş", customer: "müşteri", day: "gün" }[d.unit] || "—"}</b></p></div>`,
      check: d => {
        if (d.unit !== "customer") return { ok: false, fb: "Churn eden şey bir müşteri. Teklif de müşteriye gidecek." };
        if (d.target !== "next30") return { ok: false, fb: d.target === "past" ? "Geçmişi tahmin etmek işe yaramaz; aksiyon alacağın zaman çoktan geçmiş." : "Harcama bir regresyon hedefi; soru 'kim ayrılacak?'" };
        if (d.window !== "past90") return { ok: false, fb: "Öznitelik penceresi gelecekteki 30 günü içeriyor: model cevabı önceden görüyor. Bu bir sızıntı." };
        return { ok: true, title: "Kurgu doğru", fb: "Müşteri; önümüzdeki 30 günde iptal; bugünden önceki 90 günün verisi. Şimdi modele bakabiliriz." };
      } },
    { type: "choice", label: "Temel", prompt: "Değerlendirme tablosunun ilk satırına bak. Model ne kadar iyi?", goal: "Modeli naif temelle karşılaştırmak.",
      visual: () => dataTable(["Model", "Doğruluk"], [["Temel: herkese 'kalır' de", "%97,0"], ["Alex'in modeli", "%97,2"]]) + noteCard("Veri", "10.000 müşterinin 300'ü (%3) churn etti."),
      options: [{ label: "Çok iyi, %97 harika bir oran", fb: "Hiçbir şey yapmayan temel de %97 alıyor. Model ona göre neredeyse hiç iyi değil." }, { label: "Neredeyse temelden farksız; bu dengesiz veride doğruluk yanıltıcı", correct: true, fb: "Doğru. Maya'nın sözü: Önce temeli geç." }] },
    { type: "choice", label: "Sonuç", prompt: "Canlı simülasyon sonucu ekranda. Hangi metriğe bakmalıydık?", goal: "Azınlık sınıfını ne kadar yakaladığını ölçmek.",
      visual: () => kpiStrip([["Gerçek churn", "300"], ["Yakalanan", "0", "bad"], ["Doğruluk", "%97"], ["Kurtarılan müşteri", "0", "bad"]]),
      options: [{ label: "Doğruluk yeterli; daha çok veriyle düzelir", fb: "Model kimseyi işaretlemiyor. Doğruluk bunu göstermiyor." }, { label: "Churn edenlerin ne kadarını yakaladığımız (recall) ve işaretlediklerimizin ne kadarının gerçekten ayrıldığı (precision)", correct: true, fb: "Aynen. Bir sonraki bölümde bunların hangisinin daha pahalı olduğuna karar vereceksin." }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir dolandırıcılık modeli %99,5 doğru. İşlemlerin %0,5'i dolandırıcılık. Ne sorarsın?", goal: "Doğruluk tuzağını başka bir problemde fark etmek.",
      options: [{ label: "Harika, hemen canlıya alalım", fb: "Herkese 'temiz' diyen model de %99,5 alır." }, { label: "Temel model ne alıyor ve dolandırıcılıkların kaçını yakalıyor?", correct: true, fb: "İki soru, tek refleks." }] }
  ]
},
{
  id: "pv5", kind: "preview", chapter: 5, num: "035", title: "Eşiği Kim Belirler?", nodes: ["evaluation", "calibration"],
  short: "Yanlış pozitif ve yanlış negatifin bedeli farklı. Eşiği sen seç.",
  review: { happened: "Varsayılan 0,5 eşiği iş maliyetini en aza indirmiyordu; en ucuz nokta 0,4'tü.", discovered: "Eşik bir iş kararıdır: yanlış pozitifin ve yanlış negatifin maliyetine göre seçilir.", habit: "Önce hata maliyetlerini sor, sonra metriği ve eşiği seç.", watch: "Olasılıklar kalibre değilse maliyet hesabı da yanlış olur." },
  steps: [
    { type: "dialog", who: "maya", cta: "Rakamlara bak", lines: ["Modelin hazır. Soru artık hangi müşteriye teklif yapılacağı.", "Kaybettiğimiz bir müşteri bize 1.200 ₺'ye, gereksiz bir teklif 150 ₺'ye mal oluyor."] },
    { type: "builder", label: "Eşiği seç", prompt: "Toplam maliyeti en aza indiren eşiği bul", goal: "Eşiği hata maliyetine göre seçmek.",
      fields: [{ key: "thr", label: "Karar eşiği", type: "range", min: 0.1, max: 0.9, step: 0.1, def: 0.5 }],
      run: "Bu eşiği uygula",
      visual: d => {
        const T = { 0.1: [285, 2400, 15], 0.2: [270, 1300, 30], 0.3: [250, 700, 50], 0.4: [225, 380, 75], 0.5: [195, 200, 105], 0.6: [160, 110, 140], 0.7: [120, 55, 180], 0.8: [80, 25, 220], 0.9: [40, 8, 260] };
        const thr = (+(d.thr ?? 0.5)).toFixed(1), rows = Object.entries(T).map(([t, [tp, fp, fn]]) => [t, tp, fp, fn, fp * 150 + fn * 1200]);
        return `<div class="table-wrap"><table class="data-table thr-table"><thead><tr><th>Eşik</th><th>Yakalanan</th><th>Gereksiz teklif</th><th>Kaçan</th><th>Toplam maliyet</th></tr></thead><tbody>
          ${rows.map(([t, tp, fp, fn, c]) => `<tr class="${(+t).toFixed(1) === thr ? "sel" : ""}"><td>${t}</td><td>${tp}</td><td>${fmtNum(fp)}</td><td>${fn}</td><td><div class="cost"><i style="width:${c / 3800}%"></i><b>${fmtNum(c)} ₺</b></div></td></tr>`).join("")}</tbody></table></div>`;
      },
      check: d => {
        const thr = +(+(d.thr ?? 0.5)).toFixed(1);
        if (thr === 0.4) return { ok: true, title: "En düşük maliyet", fb: "0,4'te toplam maliyet 147 bin ₺; varsayılan 0,5'e göre 9 bin ₺ daha ucuz ve 30 müşteri daha kurtarılıyor." };
        return { ok: false, fb: thr < 0.4 ? "Daha çok müşteri yakalıyorsun ama gereksiz tekliflerin maliyeti patlıyor." : "Tekliflerden tasarruf ediyorsun ama kaçan müşteriler çok daha pahalı." };
      } },
    { type: "choice", label: "Kalibrasyon", prompt: "Model 0,8 olasılık verdiği 100 müşteriden sadece 52'si gerçekten ayrıldı. Bu ne demek?", goal: "Kalibrasyonu ayırt etme gücünden ayırmak.",
      options: [{ label: "Model kötü, çöpe atalım", fb: "Sıralaması iyi olabilir; sorun olasılıkların ölçeği." }, { label: "Olasılıklar kalibre değil; maliyet hesabından önce kalibre etmeliyiz", correct: true, fb: "Doğru. Kalibrasyon sonrası 0,4 eşiğinin karşılığı da değişir." }] },
    { type: "reply", label: "Canlı kararı", who: "maya", prompt: "Maya: “Canlıya hangi kurulumu alıyoruz? Birden fazla makul cevap var; seçimin ileride karşına çıkacak.”",
      options: [
        { label: "Gradient Boosting (AUC 0,89). İzlemeyi sonraki çeyreğe bırakalım, önce hız.", reply: "Maya: “Anlaşıldı. Hızlı çıkıyoruz. Riski not ediyorum.”", flag: { prod_model: "fast_nomonitor" } },
        { label: "Biraz daha zayıf ama kalibre edilmiş model (AUC 0,87) + kayma izleme ve aylık rapor.", reply: "Maya: “Daha yavaş ama sağlam. Bunu savunabilirim.”", flag: { prod_model: "calibrated_monitored" } },
        { label: "Önce 4 haftalık pilot: model sadece bir bölgede çalışsın.", reply: "Maya: “Temkinli. Pilot verisiyle karar verelim.”", flag: { prod_model: "pilot" } }] }
  ]
},
{
  id: "pv6", kind: "preview", chapter: 6, num: "041", title: "Model Bozuldu", nodes: ["monitoring", "mlops"],
  short: "Churn modelinin iş etkisi düşüyor. Neden?",
  review: { happened: "Yeni mobil uygulama oturum sayısını katlayınca model herkesi 'bağlı müşteri' sandı.", discovered: "Girdi dağılımı değişince (veri kayması) model eğitimde hiç görmediği bir dünyada tahmin yapar.", habit: "Canlı modelde yalnızca metriği değil girdilerin dağılımını ve iş sonucunu izle.", watch: "Her kayma yeniden eğitim gerektirmez; önce iş etkisini ölç." },
  steps: [
    { type: "dialog", who: "maya", cta: "İzleme paneline bak", lines: () => {
      const f = (player.flags || {}).prod_model;
      return f === "fast_nomonitor" ? ["Üç yıl önce izlemeyi sonraya bırakmıştık, hatırlıyor musun?", "Üç aydır kimse fark etmemiş: churn kampanya bütçesinin üçte biri yanlış müşterilere gidiyor."]
        : f === "calibrated_monitored" ? ["Kurduğun kayma izleme iki hafta önce sarı alarm verdi.", "İş etkisi henüz küçük ama yükseliyor. Kaynağını bul."]
        : ["Pilotla başladığımız model şimdi tüm şirkette çalışıyor.", "Son çeyrekte kurtarılan müşteri sayısı düşüyor. Nedenini bul."];
    } },
    { type: "pick", label: "Kaynağı bul", correct: "sessions", prompt: "İzleme panelinde sorunun kaynağına tıkla.", goal: "Kaymayı izleme verisinden teşhis etmek.",
      picks: { sessions: "Oturum sayısının dağılımı yeni mobil uygulamayla tamamen değişmiş. Model yüksek oturumu 'bağlılık' olarak öğrenmişti.", rows: "Satır sayısı stabil; veri hattı çalışıyor.", other: "Bu grafik normal görünüyor." },
      visual: (d, id) => `<div class="mon-grid">
        ${[["rows", "Günlük satır sayısı", "Stabil", [50, 52, 49, 51, 50, 52, 51, 50]], ["sessions", "Öznitelik: aylık oturum sayısı (ortalama)", "Değişti", [12, 13, 12, 12, 29, 34, 36, 37]], ["age", "Öznitelik: müşteri yaşı (ortalama)", "Stabil", [34, 34, 35, 34, 34, 35, 34, 34]], ["saved", "Kurtarılan müşteri / ay", "Düşüyor", [120, 118, 121, 117, 96, 81, 72, 66]]]
          .map(([k, t, s, v]) => { const mx = Math.max(...v) * 1.15; return `<div class="mon-card pickable" ${pickAttrs(id, k)}><span>${t}</span><svg viewBox="0 0 160 50"><polyline points="${v.map((y, i) => `${i * 22 + 4},${48 - y / mx * 44}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="2.5"/></svg><b>${s}</b></div>`; }).join("")}</div>` },
    { type: "choice", label: "Teşhis", prompt: "Bu hangi tür bir sorun?", goal: "Veri kayması ile kavram kaymasını ayırmak.",
      options: [{ label: "Kavram kayması: müşteriler artık farklı nedenlerle ayrılıyor", fb: "Ayrılma nedenleri değişmedi; değişen, modelin gördüğü girdinin ölçeği." }, { label: "Veri kayması: bir girdinin dağılımı değişti", correct: true, fb: "Doğru. Oturum sayısı artık aynı şeyi ölçmüyor." }, { label: "Veri hattı hatası", fb: "Satır sayısı ve diğer girdiler normal." }] },
    { type: "choice", label: "Karar", prompt: "Ne yaparsın?", goal: "Teknik ve iş kararını birlikte vermek.",
      options: [{ label: "Modeli hemen kapatalım", fb: "Kampanya tamamen durur; daha kötü bir sonuç." }, { label: "Oturum özniteliğini kanal bazında yeniden tanımla, güncel veriyle yeniden eğit, girdi kayması alarmı ekle", correct: true, fb: "Sorunu kaynağında çözüp tekrarını önlüyorsun." }, { label: "Eşiği düşürelim, daha çok müşteri işaretlensin", fb: "Bozuk bir girdiyi eşikle telafi edemezsin." }] }
  ]
},
{
  id: "pv7", kind: "preview", chapter: 7, num: "048", title: "Buse'nin Model İncelemesi", nodes: ["leadership"],
  short: "İlk haftanda medyanı anlattığın stajyer şimdi bir model kurdu.",
  review: { happened: "Buse tahmin anında bilinmeyen bir sütunu öznitelik olarak kullanmıştı.", discovered: "İnceleme yaparken önce zaman çizelgesine bak; geri bildirimde hatayı birlikte bulmak kalıcı öğrenme sağlar.", habit: "Hatayı düzeltme, düzeltmeyi öğret.", watch: "Nazik olmak net olmamak demek değildir; sızıntı canlıya çıkmamalı." },
  steps: [
    { type: "dialog", who: "buse", cta: "Kodu aç", lines: ["Buse Yılmaz, Junior Veri Bilimci: “Hatırlıyor musun, ilk haftamda bana medyanı anlatmıştın?”", "“İlk churn modelimi kurdum, AUC 0,97! İncelemen için gönderiyorum. Yarın Maya'ya sunacağım.”"] },
    { type: "pick", label: "İncele", correct: "l3", prompt: "Buse'nin notebook'undaki sorunlu satırı bul.", goal: "Başkasının modelinde sızıntıyı bulmak.",
      picks: { l3: "İptal talebi tarihi, müşteri iptal etmeye karar verdikten sonra oluşur. Tahmin anında bilinmez: sızıntı.", other: "Bu satır doğru görünüyor." },
      visual: (d, id) => `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>buse_churn_model.ipynb</span></div>
        ${["df = load('customers_2031')", "features = ['tenure', 'monthly_spend', 'sessions_90d',", "            'support_tickets', 'cancel_request_date']", "X_train, X_test = split(df, by='signup_month')", "model = GradientBoosting().fit(X_train[features], y_train)", "auc(model, X_test)  # 0.97"]
          .map((l, i) => `<div class="code-line pickable" ${pickAttrs(id, "l" + (i + 1))}><span class="ln">${i + 1}</span><code>${l}</code></div>`).join("")}</div>` },
    { type: "reply", label: "Geri bildirim", who: "buse", prompt: "Buse'ye nasıl geri bildirim verirsin?",
      options: [
        { label: "“Bu kabul edilemez bir hata, yarın sunma.”", reply: "Buse: “Tamam…” Akşam Maya'ya Buse'nin moralinin bozuk olduğunu söylüyorlar." },
        { label: "“Harika başlangıç. Gel 3. satırı birlikte zaman çizelgesine koyalım: bu bilgi tahmin anında var mı?”", reply: "Buse on dakika sonra yazıyor: “Buldum! Sızıntıymış. AUC 0,81'e indi ama gerçek.”", flag: { mentored_buse: true } },
        { label: "“Ben düzeltirim, sen uğraşma.”", reply: "Model düzeldi ama Buse ne olduğunu hiç öğrenmedi." }] }
  ]
},
{
  id: "pv8", kind: "preview", chapter: 8, num: "054", title: "2 Milyon Avroluk YZ Bahsi", nodes: ["strategy"],
  short: "Bütçe iki projeye yetiyor. Hangileri?",
  review: { happened: "Üç yatırımdan ikisini seçip kurula gerekçelendirdin.", discovered: "Strateji kararında tek doğru yok: getiri, risk, hazırlık ve ölçülebilirlik birlikte tartılır.", habit: "Her yatırım için bir ölçüm planı ve çıkış kriteri koy.", watch: "En yüksek getiri tahmini genelde en belirsiz olandır." },
  steps: [
    { type: "dialog", who: "ceo", cta: "Seçenekleri aç", lines: ["Kerem Yalçın, CEO: “Kurul yapay zekâya 2 milyon avro ayırdı. Üç teklif var, ikisine yetiyor.”", "“Önümüzdeki üç yıl için hangisi? Gerekçeni duymak istiyorum.”"] },
    { type: "builder", label: "Portföy", prompt: "Bütçeyi aşmadan iki yatırım seç", goal: "Yatırımları getiri, risk ve hazırlığa göre birlikte değerlendirmek.",
      fields: [{ key: "pick", label: "Yatırımlar", type: "check", options: [["fc", "Tahminleme platformu (0,6 Mn €)"], ["rec", "Öneri motoru (1,1 Mn €)"], ["gen", "Üretken YZ asistanı (0,9 Mn €)"]] }],
      run: "Kurula sun",
      visual: d => {
        const sel = d.pick || [], cost = { fc: 0.6, rec: 1.1, gen: 0.9 }, tot = sel.reduce((a, k) => a + cost[k], 0);
        return dataTable(["Yatırım", "Maliyet", "Beklenen getiri", "Risk", "Hazırlık"], [["Tahminleme platformu", "0,6 Mn €", "2,1x", "Düşük", "Veri hazır"], ["Öneri motoru", "1,1 Mn €", "3,0x", "Orta", "Veri kalitesi işi gerekiyor"], ["Üretken YZ asistanı", "0,9 Mn €", "0,8x – 4x", "Yüksek", "KVKK ve değerlendirme seti yok"]]) +
          kpiStrip([["Seçilen", `${sel.length} / 2`], ["Toplam", `${String(tot.toFixed(1)).replace(".", ",")} Mn €`, tot > 2 ? "bad" : ""], ["Bütçe", "2,0 Mn €"]]);
      },
      check: d => {
        const sel = (d.pick || []).slice().sort().join("+"), n = (d.pick || []).length;
        if (n !== 2) return { ok: false, fb: "Kurul tam iki proje bekliyor." };
        const out = { "fc+rec": "Kurul ikna oldu: biri hızlı ve güvenli, diğeri büyük getirili. 3. yılda tahmini 4,6 Mn € katkı. Öneri motoru için veri kalitesi işini ilk çeyreğe koydun.", "fc+gen": "Kurul temkinli ama heyecanlı. Tahminleme ilk yıl kendini öder; asistan için KVKK ve değerlendirme seti hazırlamadan canlıya çıkmama koşulu koydun.", "gen+rec": "Tam 2,0 Mn €. Kurul getiriyi seviyor ama iki proje de hazırlık istiyor; ilk yıl sonuç gelmezse baskı büyük olacak. Riskli ama savunulabilir." }[sel];
        return { ok: true, title: "Kurul kararını verdi", fb: out };
      } },
    { type: "choice", label: "Gerekçe", prompt: "Kurula sunumunun ilk cümlesi hangisi olmalı?", goal: "Bir yatırım kararını kurula gerekçelendirmek.",
      options: [{ label: "“En yeni teknolojiler bunlar, geride kalmamalıyız.”", fb: "Kurul moda değil getiri ve risk duymak ister." }, { label: "“İki yatırımın beklenen getirisi, riski, hazırlık işi ve hangi metrikle başarılı sayılacağı şöyle…”", correct: true, fb: "Getiri, risk, hazırlık ve ölçüm. Kurul başını sallıyor." }] },
    { type: "dialog", who: "maya", cta: "Mesajı kapat", lines: ["Telefonuna bir mesaj düşüyor. Gönderen: Maya Chen, şimdi başka bir şirkette Veri Direktörü.", "“İlk günün aklıma geldi. Sana hangi bölgeye bakacağını söylüyordum. Bugün şirketin hangi yöne bakacağını sen söylüyorsun. Gurur duyuyorum.”"] }
  ]
}
];
PREVIEWS.forEach(p => { p.kind = "preview"; });
const PREVIEW_BY_ID = Object.fromEntries(PREVIEWS.map(p => [p.id, p]));

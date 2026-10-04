
/* =====================================================================
   CHAPTER 3, İKİNCİ PARÇA: VAKA 020–023
   Nedensellik (fark içinde fark) → KVKK → tahminleme → terfi vakası
   ===================================================================== */
function trendLines(pre, w = 520, h = 200) {
  const T = [100, 102, 101, 104, 103, 105, 106, 107, 125], Cn = [120, 122, 121, 124, 123, 125, 126, 127, 134];
  const all = [...T, ...Cn], mn = Math.min(...all) - 5, mx = Math.max(...all) + 5, x = i => 40 + i / 8 * (w - 60), y = v => 20 + (1 - (v - mn) / (mx - mn)) * (h - 50);
  const line = (a, col) => `<polyline class="draw-line" pathLength="1" points="${a.map((v, i) => `${x(i)},${y(v)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3"/>`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}"><rect x="${x(7.5)}" y="10" width="${x(8) - x(7.5) + 12}" height="${h - 40}" fill="var(--amber)" opacity=".08"/>
    <text x="${x(8)}" y="${h - 12}" class="svg-lbl small" text-anchor="middle">kampanya</text><text x="${x(0)}" y="${h - 12}" class="svg-lbl small">8 hafta önce</text>
    ${line(Cn, "var(--blue)")}${line(T, "var(--mint)")}</svg><div class="legend"><span><i style="background:var(--mint)"></i>Kampanya bölgeleri</span><span><i style="background:var(--blue)"></i>Kontrol bölgeleri</span></div>`;
}
const MONTHLY = [3.1, 3.0, 3.3, 3.4, 3.6, 3.5, 3.4, 3.5, 3.7, 3.9, 4.3, 5.6, 3.4, 3.3, 3.6, 3.7, 3.9, 3.8, 3.7, 3.9, 4.0, 4.2, 4.7];
function salesChart() {
  const W = 520, H = 200, x = i => 30 + i / 23 * (W - 50), y = v => 15 + (1 - (v - 2.5) / 3.5) * (H - 45);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline class="draw-line" pathLength="1" points="${MONTHLY.map((v, i) => `${x(i)},${y(v)}`).join(" ")}" fill="none" stroke="var(--mint)" stroke-width="2.5"/>
    ${MONTHLY.map((v, i) => i === 11 ? `<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="var(--amber)"/><text x="${x(i)}" y="${y(v) - 9}" class="svg-note" text-anchor="middle">Aralık</text>` : "").join("")}
    <circle cx="${x(23)}" cy="${y(5.9)}" r="6" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="3 3"/><text x="${x(23) - 4}" y="${y(5.9) - 10}" class="svg-lbl small" text-anchor="end">bu Aralık ?</text>
    <text x="30" y="${H - 6}" class="svg-lbl small">2 yıl önce Ocak</text><text x="${W - 20}" y="${H - 6}" class="svg-lbl small" text-anchor="end">Kasım (son ay)</text></svg>`;
}
const CH3B_CASES = [
{
  id: "case020", num: "020", chapter: 3, title: "Önce/Sonra Yetmez", difficulty: 3, xp: 200, after: "case019",
  short: "Bölgesel kampanya deneyinde gruplar baştan farklı. Etkiyi nasıl ölçersin?",
  tags: ["Fark içinde fark", "Paralel eğilim", "Python"], nodes: ["causal", "python"], rewards: { statistics: 10, businessThinking: 6 },
  concept: { name: "Fark içinde fark", en: "difference-in-differences", text: "Müdahale gören ve görmeyen grupların değişimlerini karşılaştır. İki grup müdahale olmasaydı aynı eğilimde gidecekse, değişim farkı müdahalenin etkisidir.", points: [] },
  mentor: "Kampanyayı mükemmel bir deneyle ölçemiyorsak, en azından neyle karşılaştırdığımızı dürüstçe söyleyelim.",
  portfolio: { title: "Bölgesel kampanya etkisi (DiD)", text: "Baştan farklı bölgelerde kampanya etkisini fark içinde fark yöntemiyle +6 puan olarak tahmin ettim; paralel eğilim varsayımını kontrol ettim." },
  review: { happened: "Kampanya bölgeleri kontrolden baştan küçüktü; sadece sonrayı karşılaştırmak kampanyayı zararlı, sadece önce/sonra bakmak çok başarılı gösteriyordu.", discovered: "İki grubun değişimlerinin farkı, ortak etkileri (indirim, mevsim) birbirinden düşer ve kampanyanın etkisini bırakır.", habit: "Bir müdahaleyi ölçerken sor: müdahale olmasaydı ne olurdu? Onu en iyi temsil eden grup hangisi?", watch: "Paralel eğilim varsayımı bozuksa fark içinde fark da yanılır; öncesini mutlaka çiz." },
  steps: [
    { type: "dialog", who: "maya", cta: "Veriye bak", lines: ["Zeynep TV kampanyasını bu sbuser 4 bölgede yaptı, 4 bölge kontrol olarak kaldı. Ama kampanya bölgeleri baştan daha küçük.", "Üç farklı yöntemle üç farklı cevap çıkıyor. Hangisi doğru, sen söyle."] },
    { type: "builder", label: "Yöntem", prompt: "Kampanyanın etkisini hangi karşılaştırmayla ölçersin?", goal: "Farklı karşılaştırmaların neyi ölçtüğünü görmek.",
      think: ["Sadece sonrayı karşılaştırırsan grupların baştan farkı ne olur?", "Sadece kampanya bölgesinin önce/sonrası ortak etkileri ayırabilir mi?"],
      hints: [{ t: "Her iki grubun da değişimini hesapla, sonra farkını al." }],
      fields: [{ key: "m", label: "Karşılaştırma", options: [["after", "Sadece sonrası: kampanya vs kontrol"], ["ba", "Sadece kampanya bölgeleri: önce vs sonra"], ["did", "İki grubun değişimlerinin farkı"]] }],
      run: "Hesapla",
      visual: d => dataTable(["Grup", "Önce (bin ₺/hafta)", "Sonra", "Değişim"], [["Kampanya bölgeleri", "400", "472", "+%18"], ["Kontrol bölgeleri", "500", "560", "+%12"]]) +
        (d.ran ? kpiStrip([["Tahmini etki", { after: "−%16", ba: "+%18", did: "+6 puan" }[d.m]]]) : ""),
      check: d => d.m === "did" ? { ok: true, title: "Fark içinde fark", fb: "Kontrol bölgeleri de %12 büyümüş (indirim, mevsim). Kampanya bölgeleri %18. Fark: +6 puan." }
        : d.m === "after" ? { ok: false, fb: "Sonuç ne olurdu? 'Kampanya bölgeleri %16 geride, kampanya zararlı' denir ve iyi bir kampanya iptal edilir. Ama bu fark kampanyadan önce de vardı." }
        : { ok: false, fb: "+%18, kampanyayla birlikte o dönemde olan her şeyi içeriyor. Vaka 018'deki tuzak." } },
    { type: "choice", label: "Varsayım", prompt: "Bu yöntemin geçerli olması için ne doğru olmalı? Grafiğe bak.", goal: "Paralel eğilim varsayımını kontrol etmek.",
      hints: [{ t: "Kampanyadan önceki 8 haftada iki çizgi nasıl ilerliyor?" }],
      visual: () => chartCard("Haftalık satış endeksi, kampanyadan önce ve sonra", trendLines()),
      options: [{ label: "İki grubun büyüklüğü aynı olmalı", fb: "Gerekmez; zaten farklılar. Önemli olan eğilimleri." },
        { label: "Kampanya olmasaydı iki grup aynı eğilimde ilerlerdi; kampanya öncesi 8 haftada çizgiler paralel görünüyor", correct: true, fb: "Paralel eğilim varsayımı. Grafik bunu destekliyor; kesin kanıt değil ama makul." },
        { label: "Kampanya rastgele atanmış olmalı", fb: "Rastgele atama en iyisi; ama bu yöntem tam da rastgele atama yokken kullanılır." }] },
    { type: "builder", label: "Python", prompt: "Etkiyi pandas ile hesapla", goal: "Fark içinde farkı kodla ifade etmek.",
      hints: [{ t: "Önce her grubun kendi değişimini hesapla." }],
      fields: [{ key: "f", label: "etki =", options: [["a", "t_post - c_post"], ["b", "t_post / t_pre - 1"], ["c", "(t_post / t_pre - 1) - (c_post / c_pre - 1)"]] }], run: "Hücreyi çalıştır",
      visual: d => pyCard("did.ipynb", ["g = df.groupby(['group', 'period'])['revenue'].mean()", "t_pre, t_post = g['kampanya', 'once'], g['kampanya', 'sonra']", "c_pre, c_post = g['kontrol', 'once'], g['kontrol', 'sonra']", `etki = ${{ a: "t_post - c_post", b: "t_post / t_pre - 1", c: "(t_post / t_pre - 1) - (c_post / c_pre - 1)" }[d.f] || "?"}`], d.ran ? `<p><b>${{ a: "-88.0", b: "0.18", c: "0.06" }[d.f]}</b></p>` : ""),
      check: d => d.f === "c" ? { ok: true, title: "0,06", fb: "Altı puanlık etki, ortak etkiler çıkarıldıktan sonra." } : { ok: false, fb: d.f === "a" ? "Bu sadece sonrası farkı: gruplar baştan farklı." : "Bu sadece kampanya grubunun değişimi." } },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir şehirde yeni bisiklet yolları yapıldı ve kazalar %20 azaldı. Etkisini nasıl ölçersin?", goal: "Fark içinde farkı başka bir alanda uygulamak.",
      options: [{ label: "%20, öncesine göre azaldı", fb: "Aynı dönemde her yerde kaza azalmış olabilir." }, { label: "Bisiklet yolu yapılmayan benzer şehirlerin aynı dönemdeki değişimiyle karşılaştırırım", correct: true, fb: "Kontrol şehirleri, ortak eğilimi temsil eder." }] }
  ]
},
{
  id: "case021", num: "021", chapter: 3, title: "Ajansa Giden Veri", difficulty: 2, xp: 180, after: "case020",
  short: "Ajans kampanya için müşteri verisi istiyor. Dosya hazır, gönder tuşu bir tık uzakta.",
  tags: ["KVKK", "Veri minimizasyonu", "Python"], nodes: ["privacy", "python"], rewards: { businessThinking: 10 },
  concept: { name: "Veri minimizasyonu", en: "data minimization", text: "Amaca yetecek en az veriyi paylaş. Kişisel alanları çıkar, gerekenleri takma ad ya da gruplarla değiştir, hukuki dayanağı ve sözleşmeyi kontrol et.", points: [] },
  mentor: "Teknik olarak gönderebilmen, göndermenin doğru olduğu anlamına gelmez. Bu cümleyi kariyerin boyunca hatırla.",
  portfolio: { title: "Ajans verisinin KVKK uyumu", text: "Ajansa gidecek müşteri dosyasından kişisel alanları çıkarıp yaş ve harcama gruplarına dönüştürdüm; paylaşımı KVKK onayına bağladım." },
  review: { happened: "Ajansa ad, telefon ve doğum tarihi içeren bir dosya gitmek üzereydi; ajansın ihtiyacı segment ve gruplardı.", discovered: "Her sütun için 'amaç için gerekli mi?' sorusu dosyayı yarıya indirdi; geri kalanı gruplanınca kimlik riski azaldı.", habit: "Bir veriyi paylaşmadan önce her sütuna sor: gerekli mi, kişisel mi, gruplanabilir mi?", watch: "Küçük gruplar (örn. bir ilçede tek bir 80+ yaşlı müşteri) gruplansa da kişiyi tanımlayabilir." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Dosyaya bak", lines: ["Ajans yeni kampanya için müşteri verimizi istiyor. Dosyayı hazırladım, şimdi gönderiyorum!", "Maya 'göndermeden önce bir analist baksın' dedi. Hızlı bakar mısın?"] },
    { type: "tagger", label: "Sütunlar", prompt: "Her sütun için karar ver", sub: "Ajansın amacı: segmentlere göre kampanya mesajı tasarlamak.", goal: "Her alan için gereklilik ve kişisellik değerlendirmesi yapmak.",
      think: ["Ajans bu sütunla ne yapacak?", "Bu sütun tek başına ya da başkalarıyla birlikte bir kişiyi tanımlar mı?"],
      hints: [{ t: "Ajans kişiye değil segmente mesaj tasarlayacak. Ad, telefon, e-posta gerekmiyor." }, { t: "Doğum tarihi ve harcama gibi alanlar gruplanırsa (yaş grubu, harcama aralığı) amaç için yeterli olur." }],
      tags: [["need", "Gerekli, kalsın"], ["drop", "Çıkar"], ["mask", "Grupla / takma ad"]],
      cols: ["Sütun", "Örnek"],
      rows: [[["ad_soyad", "Ayşe Demir"], "drop"], [["telefon", "0532 *** ** 17"], "drop"], [["e_posta", "ayse@mail.com"], "drop"], [["musteri_id", "C-10021"], "mask"], [["dogum_tarihi", "14.03.1991"], "mask"], [["sehir", "İzmir"], "need"], [["segment", "KOBİ"], "need"], [["son_6_ay_harcama", "4.820 ₺"], "mask"]],
      rowHints: { drop: "Doğrudan kişiyi tanımlayan ve amaç için gerekmeyen alanlar çıkarılmalı.", mask: "Bazı alanlar gerekli bilgiyi taşır ama gruplanmalı ya da takma adla değiştirilmeli.", need: "Segment mesajı için doğrudan gereken alanlar kalabilir." },
      okText: "Üç sütun çıktı, üçü gruplandı ya da takma adla değişti, ikisi kaldı. Dosya amaç için yeterli, kişiyi tanımlamıyor.", okTitle: "Minimize edildi" },
    { type: "builder", label: "Python", prompt: "Kararlarını pandas ile uygula", goal: "Kişisel veriyi kodla çıkarmak ve maskelemek.",
      hints: [{ t: "Takma ad için kimliği geri döndürülemez bir karmaya çevir; yaş için pd.cut ile gruplar oluştur." }],
      fields: [
        { key: "drop", label: "df.drop(columns=[...])", options: [["one", "['ad_soyad']"], ["three", "['ad_soyad', 'telefon', 'e_posta']"]] },
        { key: "id", label: "musteri_id", options: [["keep", "olduğu gibi bırak"], ["hash", "df['musteri_id'].map(hash_with_salt)"]] },
        { key: "age", label: "yaş", options: [["dob", "dogum_tarihi kalsın"], ["bin", "pd.cut(yas, [18, 30, 45, 60, 99])"]] }],
      run: "Hücreyi çalıştır",
      visual: d => pyCard("ajans_dosyasi.ipynb", [`df = df.drop(columns=${d.drop === "three" ? "['ad_soyad', 'telefon', 'e_posta']" : d.drop === "one" ? "['ad_soyad']" : "[?]"})`, d.id === "hash" ? "df['musteri_id'] = df['musteri_id'].map(hash_with_salt)" : "# musteri_id değişmedi", d.age === "bin" ? "df['yas_grubu'] = pd.cut(yas, [18, 30, 45, 60, 99]); df = df.drop(columns=['dogum_tarihi'])" : "# dogum_tarihi değişmedi", "df['harcama_araligi'] = pd.cut(df['son_6_ay_harcama'], [0, 1000, 5000, 20000, 1e9])"],
        d.ran ? `<p class="muted">Kalan sütunlar: ${[d.drop !== "three" && "telefon, e_posta", d.id === "hash" ? "musteri_id (takma ad)" : "musteri_id", d.age === "bin" ? "yas_grubu" : "dogum_tarihi", "sehir", "segment", "harcama_araligi"].filter(Boolean).join(", ")}</p>` : ""),
      check: d => d.drop === "three" && d.id === "hash" && d.age === "bin" ? { ok: true, title: "Dosya hazır", fb: "Kişisel alanlar çıktı, kimlik takma ada, doğum tarihi yaş grubuna dönüştü." }
        : { ok: false, fb: d.drop !== "three" ? "Telefon ve e-posta hâlâ dosyada." : d.id !== "hash" ? "Müşteri numarası, şirketin elindeki verilerle kişiye bağlanabilir." : "Doğum tarihi tek başına bile kişiyi daraltır; yaş grubu yeter." } },
    { type: "choice", label: "Son adım", prompt: "Dosya teknik olarak hazır. Göndermeden önce son adım ne?", goal: "Teknik önlemle hukuki dayanağı birlikte düşünmek.",
      options: [{ label: "Şifreli zip yapıp göndermek", fb: "Aktarım güvenliği önemli ama paylaşımın dayanağını sağlamaz." },
        { label: "KVKK sorumlusunun onayı ve ajansla veri işleme sözleşmesi; dosyada yalnızca amaç için gereken alanlar olduğunu belgelemek", correct: true, fb: "Zeynep: “Hukuk iki saatte onayladı. Sözleşme zaten varmış, ama dosya önceki hâliyle uygun değilmiş.”" }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: İK maaş analizini dışarıdaki bir danışmana göndermek istiyor. Dosyada departman, unvan, yaş ve maaş var. Risk ne?", goal: "Küçük grup ile kimlik tespiti riskini görmek.",
      options: [{ label: "İsim yok, risk yok", fb: "Tek kişilik bir departmanda unvan + yaş kişiyi tanımlar." }, { label: "Küçük gruplar (tek kişilik unvan, departman) kişiyi tanımlayabilir; bu grupları birleştirmeli ya da çıkarmalıyım", correct: true, fb: "Anonimleştirme sadece isim silmek değildir." }] }
  ]
},
{
  id: "case022", num: "022", chapter: 3, title: "Gelecek Ay", difficulty: 3, xp: 200, after: "case021",
  short: "CFO aralık satışlarının tahminini istiyor. İlk tahmin modelin.",
  tags: ["Tahminleme", "Mevsimsellik", "Zamana göre ayırma", "Python"], nodes: ["forecasting", "python"], rewards: { statistics: 10, dataExploration: 6 },
  concept: { name: "Tahminlemenin temeli", en: "forecasting basics", text: "Önce naif bir temel kur (geçen yılın aynı ayı), geçmişi zamana göre bölerek test et, geleceği yalnızca geçmişten tahmin et ve aralıkla raporla.", points: [] },
  mentor: "Geleceği tahmin etmenin ilk kuralı: modelin geleceği hiç görmemiş olmalı. Bu kural yakında hayatının merkezine yerleşecek.",
  portfolio: { title: "Aralık satış tahmini", text: "Mevsimsel naif temel, zamana göre geri test ve gecikmeli özniteliklerle aralık satışını aralıklı tahmin ettim." },
  review: { happened: "Rastgele bölmeyle model %4 hatayla harika görünüyordu; zamana göre test edince gerçek hata %11'di.", discovered: "Zaman serisinde geleceğe ait bilgi eğitime sızınca model gerçekte olduğundan iyi görünür.", habit: "Zamanla ilgili her tahminde: önce naif temel, sonra zamana göre test, öznitelikler yalnızca geçmişten.", watch: "Kampanya, tatil gibi tekrarlamayan olaylar mevsimsel naif temeli şaşırtabilir; bunları ayrıca işaretle." },
  steps: [
    { type: "dialog", who: "burak", cta: "Seriye bak", lines: ["CFO aralık satışının tahminini istiyor; stok ve kadro planı buna göre yapılacak.", "Geçen ay 4,7 Mn ₺'ydi. 'Aynı kalır' desem olur mu?"] },
    { type: "choice", label: "Temel", prompt: "Model kurmadan önce hangi basit tahmini temel alırsın?", goal: "Mevsimselliği görerek doğru naif temeli seçmek.",
      think: ["Geçen aralıkta ne oldu?"], hints: [{ t: "Grafikte her aralıkta bir zirve var." }],
      visual: () => chartCard("Aylık satış, milyon ₺", salesChart()),
      options: [{ label: "Geçen ay: 4,7 Mn ₺", fb: "Aralık her yıl zirve yapıyor; geçen ayı tekrarlamak mevsimselliği kaçırır." },
        { label: "Geçen yılın aralığı, bu yılın büyümesiyle ölçeklenmiş: ~5,9 Mn ₺", correct: true, fb: "Mevsimsel naif temel. Herhangi bir model en azından bunu geçmeli." },
        { label: "Son 12 ayın ortalaması: ~3,9 Mn ₺", fb: "Ortalama mevsimselliği yok eder." }] },
    { type: "builder", label: "Test", prompt: "Modelin hatasını nasıl ölçersin?", goal: "Zaman serisinde doğru doğrulama düzenini seçmek.",
      hints: [{ t: "Gerçekte, geleceği tahmin ederken geleceğe ait hiçbir veriyi görmezsin." }],
      fields: [{ key: "split", label: "Ayırma", options: [["random", "Rastgele %80 eğitim / %20 test"], ["time", "İlk 18 ay eğitim, son 5 ay test"]] }], run: "Geri testi çalıştır",
      visual: d => d.ran ? kpiStrip([["Test hatası (MAPE)", d.split === "random" ? "%4" : "%11", d.split === "random" ? "" : ""], ["Mevsimsel naif temel", "%13"]]) : `<div class="pick-help">${icon("route")}Ayırma yöntemini seç.</div>`,
      check: d => d.split === "time" ? { ok: true, title: "Gerçekçi hata", fb: "%11: mevsimsel naif temelden (%13) biraz iyi. Gerçekçi bir başlangıç." }
        : { ok: false, fb: "Sonuç ne olurdu? %4 hatayla CFO'ya güven verirsin; aralıkta gerçek hata %11 çıkar ve stok planı şaşar. Rastgele bölmede model, test ayının komşu aylarını eğitimde görüyor." } },
    { type: "builder", label: "Python", prompt: "Öznitelikleri yalnızca geçmişten üret", goal: "Zaman sırasını koruyarak öznitelik üretmek.",
      hints: [{ t: "shift(-1) bir sonraki ayı getirir: gelecek. Hareketli ortalama da o ayı içermemeli." }],
      fields: [
        { key: "lag", label: "gecen_yil =", options: [["p12", "sales.shift(12)"], ["m1", "sales.shift(-1)"]] },
        { key: "roll", label: "son_3_ay =", options: [["center", "sales.rolling(3, center=True).mean()"], ["past", "sales.shift(1).rolling(3).mean()"]] }], run: "Hücreyi çalıştır",
      visual: d => pyCard("tahmin.ipynb", ["sales = df.set_index('month')['revenue']", `features['gecen_yil'] = ${d.lag === "m1" ? "sales.shift(-1)" : d.lag === "p12" ? "sales.shift(12)" : "?"}`, `features['son_3_ay'] = ${d.roll === "center" ? "sales.rolling(3, center=True).mean()" : d.roll === "past" ? "sales.shift(1).rolling(3).mean()" : "?"}`]),
      check: d => d.lag === "p12" && d.roll === "past" ? { ok: true, title: "Sadece geçmiş", fb: "İki öznitelik de tahmin anında bilinen bilgiyle hesaplanıyor." }
        : { ok: false, fb: d.lag === "m1" ? "shift(-1) gelecek ayın satışını getiriyor: model cevabı görüyor." : "center=True penceresi gelecek ayı da içeriyor." } },
    { type: "choice", label: "Raporla", prompt: "CFO'ya tahmini nasıl verirsin?", goal: "Tahmini belirsizliğiyle raporlamak.",
      options: [{ label: "Aralık satışı 5,82 Mn ₺ olacak.", fb: "Kesin tek sayı yanlış bir güven verir." }, { label: "~5,8 Mn ₺, büyük olasılıkla 5,2–6,4 aralığında; geçen yılın aralığı ve bu yılın büyümesi temel alındı", correct: true, fb: "Burak: “Stok planına aralığın üst ucunu, kadroya ortasını koyuyoruz.”" }] },
    { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir dondurma satış modeli rastgele bölmeyle %98 doğruluk alıyor. Ne sorarsın?", goal: "Zamansal doğrulamayı başka bir problemde uygulamak.",
      options: [{ label: "Harika, kullanalım", fb: "Zaman serisinde rastgele bölme geleceği sızdırır." }, { label: "Zamana göre bölünce sonuç ne oluyor ve öznitelikler yalnızca geçmişten mi?", correct: true, fb: "Bu iki soru, bir sonraki bölümde sızıntı konusunun temeli olacak." }] }
  ]
},
{
  id: "case023", num: "023", chapter: 3, title: "Kurul Tek Cevap İstiyor", difficulty: 3, xp: 280, after: "case022", promotion: true,
  short: "Kurul: 'Hoş geldin kuponunu geri getirmeli miyiz?' Kimse sana yöntem söylemiyor.",
  tags: ["Terfi", "Kohort + deney + nedensellik + KVKK"], nodes: ["analytics", "causal", "privacy", "comm"], rewards: { businessThinking: 10, statistics: 6, dataExploration: 4 },
  concept: { name: "Nedensel bir iş sorusunu cevaplamak", en: "causal business question", text: "Doğru veriyi seç (kohort), etkiyi doğru karşılaştırmayla ölç (deney/DiD), maliyetle tart, kişisel veriyi gerekmedikçe kullanma, tek cümleyle öner.", points: [] },
  mentor: "On bir ay önce sana 'neden oluyor?' sorusunu öğretmeye başladım. Bugün kurula neden olduğunu sen anlattın.",
  portfolio: { title: "Hoş geldin kuponu kararı", text: "Kuponun etkisini bölgesel deney ve fark içinde farkla ölçtüm (+12 puan ilk ay tutundurma), maliyetle karşılaştırıp kurula net pozitif bir öneri sundum." },
  review: { happened: "Kupon deneyi ilk ay tutundurmayı kontrol bölgelerine göre 12 puan artırdı; kupon başına maliyet, ek tutundurmanın değerinden düşüktü.", discovered: "Kohort (015), karşılaştırma grubu (018, 020), maliyet ve KVKK (021) birleşince belirsiz bir soru net bir karara dönüştü.", habit: "Bir 'yapalım mı?' sorusunda: etki × değer − maliyet, ve etkiyi doğru karşılaştırmayla ölç.", watch: "Kısa dönem tutundurma uzun dönem değeri garanti etmez; kararı 3 ay sonra yeniden ölç." },
  steps: [
    { type: "dialog", who: "maya", cta: "Başla", lines: ["Kurul tek bir soru soruyor: hoş geldin kuponunu geri getirmeli miyiz?", "Bu senin terfi vakan. Yöntem söylemeyeceğim. Zeynep geçen ay üç bölgede kuponu deneme amaçlı geri getirmişti; veri hazır."] },
    { type: "builder", label: "Kur", prompt: "Analizini kur", goal: "Doğru metrik ve doğru karşılaştırmayı kendin seçmek.",
      hints: [{ t: "Hatırlatma: kuponun etkisi yeni müşterilerde görülür (Vaka 015) ve karşılaştırma grubu gerekir (Vaka 020)." }],
      fields: [{ key: "metric", label: "Metrik", options: [["total", "Toplam tekrar alım oranı"], ["cohort", "Yeni kohortun ilk ay tutundurması"]] }, { key: "comp", label: "Karşılaştırma", options: [["ba", "Kupon bölgelerinde önce/sonra"], ["did", "Kupon bölgeleri vs kontrol, değişim farkı"]] }],
      run: "Analizi çalıştır",
      visual: d => d.ran ? dataTable(["Grup", "Önceki kohort, Ay 1", "Kuponlu kohort, Ay 1", "Değişim"], d.metric === "cohort" ? [["Kupon bölgeleri", "%44", "%58", "+14 puan"], ["Kontrol bölgeleri", "%43", "%45", "+2 puan"]] : [["Kupon bölgeleri", "%39", "%41", "+2 puan"], ["Kontrol bölgeleri", "%40", "%40", "0"]]) : `<div class="pick-help">${icon("route")}Metriği ve karşılaştırmayı seç.</div>`,
      check: d => d.metric === "cohort" && d.comp === "did" ? { ok: true, title: "Etki: +12 puan", fb: "Kuponlu yeni kohortlar ilk ayda kontrol bölgelerine göre 12 puan daha fazla tutunuyor." }
        : d.metric !== "cohort" ? { ok: false, fb: "Toplam oranda yeni müşterilerin etkisi eski müşterilerle seyreliyor. Kupon kimleri etkiler?" }
        : { ok: false, fb: "+14 puan, o dönemdeki her şeyi içeriyor; kontrol bölgeleri de 2 puan artmış." } },
    { type: "choice", label: "Maliyet", prompt: "Kupon kârlı mı?", goal: "Etkiyi değerle ve maliyetle tartmak.",
      visual: () => dataTable(["Kalem", "Değer"], [["Kupon maliyeti (yeni müşteri başına)", "20 ₺"], ["İlk ayda tutunan bir müşterinin 6 aylık ortalama katkısı", "380 ₺"], ["Ek tutundurma", "+12 puan"]]),
      hints: [{ t: "100 yeni müşteri: maliyet ve ek katkıyı ayrı ayrı hesapla." }],
      options: [{ label: "Hayır: 100 müşteriye 2.000 ₺ harcıyoruz", fb: "Ek tutunan 12 müşterinin katkısını unuttun." }, { label: "Evet: 100 yeni müşteride 2.000 ₺ maliyete karşılık ~12 × 380 = ~4.560 ₺ ek katkı", correct: true, fb: "Kupon başına yaklaşık 2,3 kat geri dönüş." }] },
    { type: "choice", label: "Veri", prompt: "Kurul üyelerinden biri 'kuponu kullanan müşterilerin listesini görelim' diyor. Ne dersin?", goal: "Kişisel veriyi gerekmedikçe kullanmamak.",
      options: [{ label: "Listeyi isimleriyle sunarım", fb: "Kararın kişisel listeye ihtiyacı yok." }, { label: "Karar için toplu sonuçlar yeterli; kişisel liste gerekmez ve paylaşılmamalı", correct: true, fb: "Maya küçük bir not alıyor." }] },
    { type: "choice", label: "Öner", prompt: "Kurula tek cümlen:", goal: "Nedensel bir bulguyu karar cümlesine çevirmek.",
      options: [{ label: "Kupon tekrar alımı artırıyor, geri getirelim.", fb: "Ne kadar, nasıl ölçüldü, maliyeti ne?" },
        { label: "Kontrollü bölgesel deneyde kupon yeni müşterilerin ilk ay tutundurmasını 12 puan artırdı; maliyetin ~2,3 katı katkı getiriyor. Tüm bölgelerde geri getirip 3 ay sonra kohort tutundurmasıyla yeniden ölçmeyi öneriyoruz.", correct: true, fb: "Kurul başkanı: “Bu, son bir yılda duyduğum en net cevap.”" },
        { label: "Veriler karışık, daha fazla analiz gerekli.", fb: "Elinde kontrollü bir deney var; belirsizliği gizlemek de karar vermemek de bir seçim." }] }
  ]
}
];
CH3B_CASES.forEach(c => { c.kind = "case"; c.concept.points = [c.review.habit]; CASES.push(c); CASE_BY_ID[c.id] = c; });

/* ---- kanıt eşlemeleri ---- */
(() => {
  const src = { "ca.did": ["case020", "case023"], "ca.beforeafter": ["case020"], "pr.kvkk": ["case021", "case023"], "pr.minimize": ["case021", "case023"], "pr.anon": ["case021"], "py.privacy": ["case021"],
    "fc.baseline": ["case022"], "fc.season": ["case022"], "fc.backtest": ["case022"], "py.datetime": ["case022"], "an.cohort": ["case023"], "bus.summary": ["case023"], "com.exec": ["case023"], "py.filter": ["case020"] };
  Object.entries(src).forEach(([cid, s]) => { const n = SKILL_TREE.find(n => n.concepts.some(c => c.id === cid)), c = n.concepts.find(c => c.id === cid); s.forEach(x => { if (!c.src.includes(x)) c.src.push(x); }); CONCEPT_BY_ID[cid] = { ...c, node: n.id }; });
  const notes = { "ca.did": "Müdahale gören ve görmeyen grupların değişim farkı, ortak etkileri çıkarır. Paralel eğilim varsayımına dayanır; öncesini çizerek kontrol et.",
    "pr.anon": "Anonimleştirme sadece isim silmek değildir: küçük gruplar ve alan birleşimleri kişiyi tanımlayabilir.", "fc.baseline": "Her tahmin modeli önce naif bir temeli geçmeli: mevsimli seride geçen yılın aynı dönemi.",
    "fc.season": "Tekrarlayan dönemsel desenler (aralık zirvesi) tahminin en büyük parçası olabilir.", "fc.backtest": "Zaman serisinde test, eğitimden sonraki dönemlerde yapılır; rastgele bölme geleceği sızdırır." };
  Object.entries(notes).forEach(([id, t]) => { const c = SKILL_TREE.flatMap(n => n.concepts).find(c => c.id === id); if (c) c.note = t; if (CONCEPT_BY_ID[id]) CONCEPT_BY_ID[id].note = t; });
})();

/* ---- sabahlar 20–23, akşamlar, Slack, final ---- */
Object.assign(MORNINGS, {
  20: { scene: "laptop", time: "09:00", title: "Deney sonrası", text: "Ürün ekibi deneyi düzeltip yeniden başlattı. Gelen kutunda teşekkürler var.",
    notifications: [["alex", "SRM gitti, gruplar dengeli 👍"], ["zeynep", "Bölgesel kampanya verisi hazır"], ["maya", "Bugün nedensellik günü"]],
    steps: [{ type: "choice", label: "Sabah özeti", who: "alex", prompt: "Alex: “Dünkü denetimi ürün ekibine tek cümleyle nasıl özetledin?”", ...STANDUP_GUIDE, hints: [{ t: "Hangi sorunlar, hangisi en ciddi, ne yapıldı." }],
      options: [{ label: "Deney kötüydü.", fb: "Neden, ne yapıldı?" }, { label: "Dört tuzak vardı; en ciddisi SRM'ydi (bot filtresi). Düzeltildi, 14 gün tek birincil metrikle yeniden çalışıyor.", correct: true, fb: "Alex: “Ürün ekibi raporunu panolarına asmış.”" }] }] },
  21: { scene: "standup", time: "09:15", title: "Analytics Daily", text: "Herkes kampanya etkisinin ne çıktığını merak ediyor.",
    steps: [{ type: "choice", label: "Stand-up", who: "maya", prompt: "Maya: “Kampanyanın etkisi?”", ...STANDUP_GUIDE, hints: [{ t: "Yöntem, sonuç, varsayım." }],
      options: [{ label: "+%18.", fb: "O önce/sonra rakamı." }, { label: "Fark içinde farkla +6 puan; kampanya öncesi eğilimler paralel olduğu için tahmin makul.", correct: true, fb: "Maya: “Yöntem + sonuç + varsayım. Mükemmel.”" }] }] },
  22: { scene: "rain", time: "08:45", title: "Yağmur ve hukuk", text: "Zeynep, KVKK sorumlusuyla toplantıdan dönüyor.",
    steps: [{ type: "choice", label: "Sabah özeti", who: "zeynep", prompt: "Zeynep: “Dünkü dosya meselesini ekibe nasıl anlatayım?”", ...STANDUP_GUIDE, hints: [{ t: "Ne çıkarıldı, ne gruplandı, hangi onay alındı." }],
      options: [{ label: "Veriyi gönderdik.", fb: "Nasıl gönderildiği asıl konu." }, { label: "Kişisel alanları çıkardık, kimliği takma ada ve yaşı gruplara çevirdik; KVKK onayı ve sözleşmeyle paylaştık.", correct: true, fb: "Zeynep: “Bunu pazarlama ekibinin kılavuzuna ekliyorum.”" }] }] },
  23: { scene: "promo", time: "08:40", title: "Kurul günü", text: "Maya elinde kurul gündemiyle masana geliyor.",
    steps: [{ type: "dialog", who: "maya", cta: "Dinliyorum", lines: ["Bugün kurul toplanıyor ve senin analizini dinlemek istiyorlar.", "Önce dünkü tahmini nasıl sunduğunu duymak istiyorum."] },
      { type: "choice", label: "Son özet", who: "maya", prompt: "Aralık tahminini CFO'ya nasıl sundun?", ...STANDUP_GUIDE, hints: [{ t: "Tahmin, aralık, nasıl test edildi." }],
        options: [{ label: "5,82 Mn ₺.", fb: "Tek sayı, aralık yok." }, { label: "~5,8 Mn ₺, 5,2–6,4 aralığında; mevsimsel naif temeli geçen ve zamana göre test edilen bir modelle.", correct: true, fb: "Maya: “Tamam. Kurula hazırsın.”" }] }] }
});
Object.entries(MORNINGS).forEach(([d, m]) => { MORNING_DEFS[`morning${d}`] = { id: `morning${d}`, kind: "morning", day: +d, ...m }; });
Object.assign(EVENINGS, {
  20: [{ label: "Eve git", result: "Paralel eğilimler rüyana girmedi. İyi." }, { label: "20 dakika kal ve incele", late: true, result: "Kontrol bölgelerinden birinde kampanya haftası yerel bir festival olduğunu buldun ve not ettin.", skills: { statistics: 2 } }, { label: "Alex'le konuş", result: "Alex sana fark içinde fark üzerine sevdiği bir makaleyi önerdi.", trust: { alex: 1 } }],
  22: [{ label: "Eve git", result: "Yarın kurul günü. Erken yattın." }, { label: "20 dakika kal ve incele", late: true, result: "Kupon deneyinin bölgelerini bir kez daha kontrol ettin; her şey yerinde." }, { label: "Maya'yla konuş", result: "Maya: “Yarın onlar soracak, sen cevaplayacaksın. Benim işim bitti.”", trust: { maya: 1 } }]
});
SLACK.push(
  { day: 21, ch: "#pazarlama", msgs: [["zeynep", "Bölgesel kampanya sonucu: +6 puan (DiD) 📊"], ["ceo", "Bütçeyi bu sonuca göre planlayalım."]] },
  { day: 22, ch: "#kvkk", msgs: [["zeynep", "Ajans dosyası onaylandı ✅"], ["burak", "Bu süreci Finans için de kullanalım."]] },
  { day: 23, ch: "#analytics-team", msgs: [["maya", "Bugün kurul var. Herkes sessiz mod 🤫"], ["buse", "Bol şans! 🍀"]] }
);
Object.assign(AFTER_CASE, {
  case020: "Fark içinde fark çalıştı. Yarın ajans dosyasına bakacaksın; dikkatli ol.",
  case021: "Dosya onaylandı. Yarın CFO aralık tahminini istiyor.",
  case022: "Tahmin aralığın stok planına girdi. Becerilerin hazırsa yarın kurul var.",
  case023: "Tebrikler. Toplantı odasına gelir misin?"
});
ACHIEVEMENTS.promoted3 = { t: "Junior Veri Bilimci", d: "Bir 'neden' sorusunu kurula kendin cevapladın." };

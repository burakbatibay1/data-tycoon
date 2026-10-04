
/* =====================================================================
   CHAPTER 1 ÖĞRETİM STANDARDI
   Durum → Keşfet → Karar → Açıkla → Transfer + Öğrenme değerlendirmesi
   ===================================================================== */
function dotStrip(vals, d) {
  const W = 520, H = 150, pl = 20, pr = 20, max = Math.max(...vals) * 1.05, x = v => pl + v / max * (W - pl - pr);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length, s = [...vals].sort((a, b) => a - b);
  const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  const outlier = Math.max(...vals);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Nokta grafiği">
    <line x1="${pl}" x2="${W - pr}" y1="90" y2="90" class="svg-axis"/>
    ${[0, 250, 500, 750, 1000, 1250].filter(t => t < max).map(t => `<text x="${x(t)}" y="112" class="svg-lbl small" text-anchor="middle">${fmtNum(t)} ₺</text>`).join("")}
    ${vals.map((v, i) => `<g ${v === outlier ? 'data-hl="aykiri"' : ""}><circle class="dot" style="--i:${i}" cx="${x(v)}" cy="${80 - (i % 2) * 14}" r="8" fill="${v === outlier ? "var(--amber)" : "var(--blue)"}" stroke="var(--surface)" stroke-width="2"/></g>`).join("")}
    ${d.mean ? `<g class="pop-in"><line x1="${x(mean)}" x2="${x(mean)}" y1="30" y2="96" stroke="var(--coral)" stroke-width="2.5" stroke-dasharray="5 4"/><text x="${x(mean) + 6}" y="26" class="svg-warn" style="fill:var(--coral)">Ortalama ${fmtNum(Math.round(mean))} ₺</text></g>` : ""}
    ${d.median ? `<g class="pop-in"><line x1="${x(med)}" x2="${x(med)}" y1="44" y2="96" stroke="var(--mint)" stroke-width="2.5"/><text x="${x(med) + 6}" y="134" class="svg-note">Medyan ${fmtNum(med)} ₺</text></g>` : ""}
  </svg>`;
}
const SAMPLES = [63, 70, 57, 67, 60, 73, 63, 53, 67, 70];
function sampleView(d) {
  const n = d.n || 0;
  return chartCard("Rastgele 30 kişilik örneklemler: 'Kahveden memnunum' oranı", `<div class="samples">
    ${Array.from({ length: Math.max(n, 1) }, (_, i) => i < n ? `<div class="sample pop-in" style="--w:${SAMPLES[i]}%"><span>Örneklem ${i + 1}</span><i></i><b>%${SAMPLES[i]}</b></div>` : `<div class="sample empty"><span>Henüz örneklem yok</span></div>`).join("")}
    </div><div class="stage-actions"><button class="chip-toggle on" data-action="vis-step" data-key="n" ${n >= SAMPLES.length ? "disabled" : ""}>${icon("route")} Yeniden örnekle</button></div>`);
}

/* ---- transfer adımları: kavramı yeni bir durumda kullan ---- */
const TRANSFERS = {
  case001: { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir kafe zincirinde müşteri memnuniyeti %6 düştü. 12 şube var. İlk ne yaparsın?",
    goal: "Segment analizini farklı bir problemde kullanmak.", hints: [{ t: "İzmir'de ilk ne yapmıştın? Toplamı gruplara böl." }], takeaway: "Toplam bir değişimi gördüğünde önce 'nerede?' diye sor.",
    options: [
      { label: "Tüm şubelere yeni bir müşteri hizmetleri eğitimi planlarım", fb: "Neden ve yer bilinmeden şirket geneli aksiyon, Vaka 001'deki ulusal kampanya hatasının aynısı." },
      { label: "Memnuniyeti şube bazında kırar, düşüşün nerede yoğunlaştığına bakarım", correct: true, fb: "Aynen. Sonra o şubede bir seviye daha inersin: vardiya, ürün, puanlama sistemi." },
      { label: "Anketi tekrar yaparım; belki ölçüm hatasıdır", fb: "Olabilir, ama önce elindeki veriyi segmentlere bölmek çok daha ucuz." }] },
  case002: { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: İK 212 çalışan, bordro 205 çalışan diyor. İlk neye bakarsın?",
    goal: "Mutabakat yaklaşımını farklı bir alanda kullanmak.", hints: [{ t: "Finans ve CRM farkını nasıl kapatmıştın? İki listede neyin farklı sayıldığını ara." }], takeaway: "İki sayı tutmuyorsa: mükerrerleri, test/geçersiz kayıtları ve tanım farklarını tek tek say.",
    options: [
      { label: "Bordro sistemi daha resmî, onun sayısını kullanırım", fb: "Bu, CRM'e Finans'ın sayısını kullandırmakla aynı hata: sorun saklanır." },
      { label: "İki listeyi kişi bazında eşleştirir; mükerrer, ayrılmış ve kapsam dışı (stajyer, danışman) kayıtları sayarım", correct: true, fb: "Muhtemelen 7 kişilik fark stajyerlerden ve ayrılıp İK listesinden düşülmemiş kişilerden geliyor. Tanımı da yazılı hâle getirirsin." },
      { label: "Ortalamasını alırım: 208,5", fb: "Ortalama iki yanlışı birleştirmez; sadece ikisini de gizler." }] },
  case003: { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: 40 kişilik bir şirkette CEO'nun maaşı diğerlerinin 25 katı. 'Tipik çalışan maaşı' için hangisini kullanırsın?",
    goal: "Ortalama-medyan seçimini başka bir veride uygulamak.", hints: [{ t: "Burada da tek bir dev değer var mı?" }], takeaway: "Aykırı değer varsa tipik değeri medyanla anlat; ortalamayı da yanında açıklayarak ver.",
    options: [
      { label: "Ortalama maaş", fb: "CEO'nun maaşı ortalamayı yukarı çeker; çalışanların çoğu ortalamanın altında kalır." },
      { label: "Medyan maaş", correct: true, fb: "Medyan 'ortadaki çalışan'ı gösterir ve CEO'nun maaşından neredeyse etkilenmez. Medyanın her zaman doğru olmadığını unutma: toplam bordro maliyeti soruluyorsa toplam gerekir." }] },
  case004: { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Bir sunumda memnuniyet 4,1'den 4,3'e çıkmış; çubuklar 4,0'dan başlıyor ve ikinci çubuk üç kat uzun görünüyor. Ne dersin?",
    goal: "Eksen kesmeyi farklı bir grafikte fark etmek.", hints: [{ t: "Çubuk uzunluğu neyle orantılı olmalı?" }], takeaway: "Çubuk grafikte uzunluk değerle orantılı olmalı; bu yüzden eksen sıfırdan başlar.",
    options: [
      { label: "Memnuniyet üç katına çıkmış, harika", fb: "4,1'den 4,3'e %5'lik bir artış. Kesik eksen onu üç kat gibi gösteriyor." },
      { label: "Eksen 4,0'dan başlıyor; çubuklar sıfırdan başlamalı ya da değişim çizgi grafikte etiketle gösterilmeli", correct: true, fb: "Aynen. Artış gerçek ama küçük: yaklaşık %5." }] },
  case005: { type: "choice", label: "Transfer", transfer: true, prompt: "Yeni durum: Daha çok doktoru olan hastane servislerinde ölüm oranı daha yüksek. Doktorlar zararlı mı?",
    goal: "Karıştırıcı değişkeni başka bir alanda bulmak.", hints: [{ t: "Kahve makinelerinde üçüncü değişken neydi? Burada hangi servisler daha çok doktor alır?" }], takeaway: "Bir korelasyon gördüğünde sor: iki değişkeni birden etkileyen üçüncü bir şey var mı?",
    options: [
      { label: "Evet, doktor sayısı azaltılmalı", fb: "Bu, kahve makinelerinden satış beklemek kadar hatalı bir nedensellik çıkarımı." },
      { label: "Hayır; ağır hastalar yoğun servislere gider, bu servisler hem daha çok doktor alır hem ölüm oranı yüksektir", correct: true, fb: "Karıştırıcı: hastalık ağırlığı. Aynı ağırlıktaki hastaları karşılaştırmadan sonuç çıkarılamaz." }] }
};
Object.entries(TRANSFERS).forEach(([id, st]) => CASE_BY_ID[id].steps.push(st));

/* ---- öğrenme değerlendirmesi ve vakadaki yetenekler ---- */
const REVIEWS = {
  case001: { happened: "Şirket geneli %8,4'lük düşüşün dörtte üçü tek bir bölgedeki tek bir mağazadan geliyordu.", discovered: "Toplamı segmentlere bölüp bir seviye daha inince neden görünür oldu.", habit: "Her toplam değişimde önce 'nerede?', sonra 'neden?' diye sor.", watch: "En büyük ₺ kaybı her zaman en büyük sorun değildir; yüzdelere de bak." },
  case002: { happened: "İki ekip aynı müşterileri farklı kurallarla sayıyordu.", discovered: "412 mükerrer + 164 test hesabı farkı tam olarak kapattı.", habit: "Analizden önce tekillik, bütünlük ve geçerlilik kontrolü yap.", watch: "Eksik bir alan kaydı otomatik olarak geçersiz yapmaz; iş kuralını sor." },
  case003: { happened: "Tek bir toptancı ortalama sipariş tutarını dört katına çıkarmıştı.", discovered: "Ortalama aykırı değerlerden etkilenir; medyan daha sağlamdır (robust).", habit: "Özet ölçü seçmeden önce dağılıma bak.", watch: "Medyan her zaman daha iyi değildir. Toplam bütçe ya da ciro soruluyorsa ortalama ve toplam gerekir." },
  case004: { happened: "Kesik bir eksen %2,4'lük mevsimsel düşüşü çöküş gibi gösterdi.", discovered: "Eksen, bağlam ve etiket bir grafiğin ne söylediğini belirler.", habit: "Yayından önce sor: eksen nerede başlıyor, bağlam yeterli mi, değişim etiketli mi?", watch: "Çizgi grafikte ekseni kesmek bazen meşrudur; ama bunu açıkça belirtmelisin." },
  case005: { happened: "Kahve makinesi ile satış arasındaki ilişkiyi mağaza büyüklüğü açıklıyordu.", discovered: "Karıştırıcıyı sabit tutunca ilişki kayboldu.", habit: "Korelasyon gördüğünde üçüncü bir değişkene göre grupla; emin değilsen küçük bir deney öner.", watch: "Korelasyonun yokluğu da nedenselliğin yokluğunu kanıtlamaz." },
  case006: { happened: "Churn artışı temizlik sonrası küçüldü ve tek bir kampanya kohortuna indi.", discovered: "Beş kavramı sırayla birleştirince belirsiz bir soru net bir öneriye dönüştü.", habit: "Temizle → segmentle → özetle → göster → öner.", watch: "Kurul cevabın kendisi kadar nasıl vardığını da sorar; adımlarını not al." }
};
Object.entries(REVIEWS).forEach(([id, r]) => { CASE_BY_ID[id].review = r; });
const CASE_NODES = { case001: ["eda", "business"], case002: ["quality", "literacy"], case003: ["stats", "eda"], case004: ["viz", "comm"], case005: ["stats", "business"], case006: ["quality", "stats", "comm"] };
Object.entries(CASE_NODES).forEach(([id, n]) => { CASE_BY_ID[id].nodes = n; });

/* ---- hazırlık görevleri: vaka açılmadan önce yapılması gereken işler ---- */
CASE_BY_ID.case002.requires = ["sq_grain"];
CASE_BY_ID.case003.requires = ["sq_eda"];
const PREP_QUESTS = [
{
  id: "sq_grain", kind: "quest", modal: true, prep: true, hot: "desk", who: "maya", after: "case001", title: "Bir satır neyi temsil ediyor?", xp: 30,
  rewards: { dataLiteracy: 4, dataExploration: 4 }, lesson: "Bir tabloya bakınca ilk soru: bir satır neyi temsil ediyor (grain)? Bunu bilmeden saymak, toplamak ve tabloları birleştirmek hataya açıktır.",
  steps: [
    { type: "dialog", who: "maya", cta: "Tabloya bak", lines: ["Yarınki vakaya geçmeden önce sana bir alışkanlık kazandırmak istiyorum.", "Bir tabloya ilk baktığında sorman gereken tek soru: bir satır neyi temsil ediyor?"] },
    { type: "choice", label: "Grain", prompt: "Bu tabloda bir satır neyi temsil ediyor?", goal: "Bir tablonun gözlem birimini (grain) tanımak.",
      think: ["Aynı müşteri birden fazla satırda geçiyor mu?", "Satırları birbirinden ayıran sütunlar hangileri?"],
      hints: [{ t: "C01 iki kez geçiyor ama farklı tarihlerde. Satır müşteri olamaz.", hl: ["C01"] }],
      solve: ["C01 iki satırda var, yani satır müşteri değil.", "Her satır bir müşterinin belirli bir tarihteki siparişi.", "Grain: sipariş (müşteri × tarih)."], takeaway: "Grain'i bil: bir satır = bir sipariş, bir müşteri, bir gün…",
      visual: () => dataTable(["Müşteri", "Şehir", "Sipariş tarihi", "Tutar"], [["C01", "İzmir", "02.10", "1.200 ₺"], ["C01", "İzmir", "04.10", "850 ₺"], ["C02", "Ankara", "04.10", "600 ₺"], ["C03", "Bursa", "05.10", "2.100 ₺"]], { mono: true }),
      options: [{ label: "Bir müşteri", fb: "C01 iki satırda geçiyor. Satır müşteri olsaydı her müşteri bir kez görünürdü." }, { label: "Bir sipariş (müşteri × tarih)", correct: true, fb: "Aynen. Her satır bir müşterinin bir günkü siparişi." }, { label: "Bir şehir", fb: "İzmir iki kez geçiyor; şehir de satırı tanımlamıyor." }] },
    { type: "choice", label: "Uygula", transfer: true, prompt: "Bu tabloda kaç farklı müşteri olduğunu bulmak için satırları saymak yeterli mi?", goal: "Grain bilgisini saymaya uygulamak.",
      hints: [{ t: "Satır sayısı 4, ama C01 iki kez geçiyor." }], takeaway: "Satır saymak, grain'in saymak istediğin şey olduğu durumda doğrudur. Değilse tekil (DISTINCT) say.",
      options: [{ label: "Evet, 4 müşteri var", fb: "4 sipariş var, 3 müşteri. Satırları saymak siparişleri sayar." }, { label: "Hayır; tekil müşteri ID'lerini saymalıyım: 3 müşteri", correct: true, fb: "Doğru. Bu fark, yarın CRM'deki mükerrer kayıtları anlamanın da anahtarı." }] }
  ]
},
{
  id: "sq_eda", kind: "quest", modal: true, prep: true, hot: "desk", who: "alex", after: "case002", title: "Yeni veri setinin ilk 10 dakikası", xp: 35,
  rewards: { dataExploration: 6, dataQuality: 2 }, lesson: "Her yeni veri setinde aynı sırayı izle: satır neyi temsil ediyor → sütunlar ve tipler → eksik ve mükerrer → dağılımlar ve aykırılar → ilişkiler. Bu kontrol listesi artık Not Defteri'nde.",
  steps: [
    { type: "dialog", who: "alex", cta: "Göster bakalım", lines: ["Yarın Satış'ın sipariş verisine bakacaksın. Bin satır, on iki sütun.", "Herkesin kendi ritüeli var. Yeni bir veri seti geldiğinde senin ilk 10 dakikan nasıl geçer?"] },
    { type: "choice", label: "EDA sırası", prompt: "Yeni bir veri setinde en mantıklı ilk adımlar sırası hangisi?", goal: "Keşifsel veri analizi (EDA) için bir kontrol listesi edinmek.",
      think: ["Grafik çizmeden önce neyi bilmen gerekir?", "Hangi adım diğerlerinin doğruluğunu etkiler?"],
      hints: [{ t: "Grain'i ve veri kalitesini bilmeden çizilen grafikler yanlış şeyi gösterebilir." }],
      solve: ["Önce satır neyi temsil ediyor ve sütunlar ne?", "Sonra eksik, mükerrer ve geçersiz kayıtlar.", "Ancak bundan sonra dağılımlar, aykırı değerler ve ilişkiler."], takeaway: "EDA kontrol listesi: grain → sütunlar/tipler → eksik/mükerrer → dağılımlar/aykırılar → ilişkiler.",
      options: [
        { label: "Hemen ilişki grafikleri çiz, ilginç bir şey bul", fb: "Mükerrer kayıtlar varsa o ilginç ilişki sahte çıkabilir." },
        { label: "Grain → sütunlar ve tipler → eksik ve mükerrer → dağılımlar ve aykırılar → ilişkiler", correct: true, fb: "Alex: “Benim ritüelim de bu. Yarın siparişlerde bunu kullan.”" },
        { label: "Önce bir model kur, hangi değişkenlerin önemli olduğunu görürsün", fb: "Veriyi tanımadan model kurmak, kirli verinin kalıplarını öğrenmek demek." }] }
  ]
},
{
  id: "sq_sampling", kind: "quest", modal: true, hot: "coffee", who: "deniz", after: "case003", title: "Her ölçüm farklı çıkıyor", xp: 40,
  rewards: { statistics: 7 }, lesson: "Aynı topluluktan alınan her örneklem biraz farklı sonuç verir (örneklem değişkenliği). Tek bir ölçüm kesin bir sayı değil, bir aralığın içindeki bir noktadır.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Ölçelim", lines: ["Kahve memnuniyeti için her gün rastgele 30 kişiye soruyorum. Pazartesi %63, salı %70 çıktı.", "Hangisi doğru? Yoksa memnuniyet bir günde 7 puan mı arttı?"] },
    { type: "choice", label: "Yeniden örnekle", explore: [{ key: "n", min: 4 }], prompt: "Aynı 210 kişiden tekrar tekrar 30 kişi seç. Ne fark ediyorsun?", goal: "Örneklem değişkenliğini deneyerek görmek.",
      sub: "En az dört kez yeniden örnekle.",
      think: ["Topluluk (210 kişi) değişmedi. Peki sonuç neden değişiyor?", "Sonuçlar hangi aralıkta geziniyor?"],
      hints: [{ t: "Örneklemler %53 ile %73 arasında geziniyor. Pazartesi ile salı arasındaki fark bu aralığın içinde mi?" }],
      solve: ["Topluluk aynı; sadece kimin seçildiği değişiyor.", "30 kişilik örneklemler yaklaşık %55–%75 arasında dalgalanıyor.", "Pazartesi–salı farkı bu doğal dalgalanmanın içinde; memnuniyet değişmemiş olabilir."],
      takeaway: "Küçük örneklemlerde sonuçlar doğal olarak dalgalanır. Fark, bu dalgalanmadan büyük değilse anlamlı sayma.",
      visual: d => sampleView(d),
      options: [
        { label: "Memnuniyet her gün gerçekten değişiyor", fb: "Topluluk hiç değişmedi; aynı 210 kişiden örnek alıyoruz. Değişen sadece kimin seçildiği." },
        { label: "Her örneklem farklı kişilerden oluştuğu için sonuç doğal olarak dalgalanıyor; %63 ile %70 arasındaki fark bu dalgalanmanın içinde", correct: true, fb: "Aynen. Bu dalgalanmanın büyüklüğünü ölçmek, bir sonraki bölümde öğreneceğin güven aralığının ta kendisi." },
        { label: "Anket bozuk, sonuçlara güvenilmez", fb: "Anket çalışıyor; sadece tek bir ölçümün belirsizliği olduğunu kabul etmemiz gerekiyor." }] }
  ]
}];
PREP_QUESTS.forEach(q => { QUESTS.push(q); QUEST_BY_ID[q.id] = q; });

/* ---- gerçekçilik için ek ofis olayları ---- */
const MORE_EVENTS = [
  { id: "ev_kvkk", who: "zeynep", days: [3, 6], notify: "Ajans müşteri listesini istiyor, atayım mı?", title: "Ajansa giden Excel", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "zeynep", prompt: "“Reklam ajansı kampanya için müşteri listemizi istiyor: ad, telefon, e-posta, son siparişler. Excel'le atabilir miyim?”",
      goal: "Kişisel veriyle çalışırken ilk refleksi kazanmak.", think: ["Ajansın bu alanların hepsine gerçekten ihtiyacı var mı?", "Kişisel veriyi şirket dışına göndermenin kuralı ne?"],
      hints: [{ t: "Teknik olarak gönderebilmen, göndermenin uygun olduğu anlamına gelmez. Hangi alanlar gerekli, kim onay vermeli?" }],
      solve: ["Ad, telefon ve e-posta kişisel veri; KVKK kapsamında.", "Ajansın büyük ihtimalle sadece segment ve sayılara ihtiyacı var.", "Gerekli alanları netleştir, kişisel verileri çıkar ya da anonimleştir, hukuk/KVKK onayı al."],
      takeaway: "Bir sütunu paylaşmadan önce sor: gerçekten gerekli mi, kişisel mi, onay var mı?",
      options: [
        { label: "Evet, ajans bizim iş ortağımız", fb: "İş ortağı olmak kişisel veriyi paylaşmak için yeterli değil; açık bir hukuki dayanak ve sözleşme gerekir." },
        { label: "Önce hangi alanların gerektiğini netleştirelim; kişisel verileri çıkarıp segment düzeyinde paylaşalım ve KVKK onayı alalım", correct: true, fb: "Zeynep: “Ajansa sordum, sadece segment büyüklükleri lazımmış. Az kalsın bütün listeyi atıyordum.”" },
        { label: "Şifreli bir zip dosyasıyla gönderelim, sorun olmaz", fb: "Şifre teknik güvenliği artırır ama paylaşımın kendisi hâlâ uygun olmayabilir." }] }] },
  { id: "ev_mistake", who: "burak", days: [3, 6], notify: "Dünkü raporda bir sayı tuhaf…", title: "Senin hatan mı?", xp: 15, rewards: { dataQuality: 2, businessThinking: 2 },
    steps: [{ type: "choice", who: "burak", prompt: "“Dün gönderdiğin tabloda Ankara geliri iki kez yazılmış gibi duruyor. CFO bu tabloyu sabah sunumunda kullandı.”",
      goal: "Kendi hatanı profesyonelce yönetmek.", think: ["İlk iş ne olmalı: savunma mı, kontrol mü?", "Tabloyu kimler kullandı?"],
      hints: [{ t: "Önce doğrula, sonra kabul et, sonra etkiyi sınırla." }],
      solve: ["Sorguyu kontrol et; gerçekten hata var mı?", "Varsa açıkça kabul et ve düzeltilmiş sürümü gönder.", "Tabloyu kullananları bilgilendir ve tekrarını önleyecek kontrolü ekle."],
      takeaway: "Hata yaptığında: doğrula, kabul et, düzelt, bilgilendir, önle.",
      options: [
        { label: "Veri ekibinin tablosu, benim hatam olamaz", fb: "Kontrol etmeden reddetmek güveni hızla kaybettirir." },
        { label: "Hemen kontrol ederim; hata bendeyse kabul edip düzeltilmiş tabloyu ve etkisini CFO'ya bildiririm", correct: true, fb: "Burak: “Açıklığın için teşekkürler. CFO düzeltmeyi sunumdan önce gördü bile.”" },
        { label: "Sessizce düzeltip yeni sürümü paylaşırım", fb: "Eski sayı zaten kullanıldı. Kimseye söylemezsen yanlış karar düzeltilmeden kalabilir." }] }] },
  { id: "ev_vpn", who: "deniz", days: [2, 6], notify: "VPN gitti!", title: "VPN koptu",
    steps: [{ type: "reply", who: "deniz", prompt: "“Bütün şirkette VPN çöktü. Veri tabanına en az bir saat erişim yok. Ne yapıyorsun?”",
      options: [
        { label: "Bu arada analiz notlarımı düzenler, raporun taslağını yazarım.", reply: "Deniz: “Akıllıca. Ben de kahve makinesinin kireç kaydını tutacağım.”", trust: { deniz: 1 } },
        { label: "Alex'le dünkü vakayı konuşurum.", reply: "Deniz: “Alex zaten seni arıyordu.”", trust: { alex: 1 } },
        { label: "Kısa bir yürüyüşe çıkarım.", reply: "Deniz: “Bazen en iyi analiz bilgisayardan uzakta yapılır.”", trust: {} }] }] },
  { id: "ev_drill", who: "deniz", days: [2, 5], notify: "Yangın tatbikatı başlıyor!", title: "Yangın tatbikatı",
    steps: [{ type: "reply", who: "deniz", prompt: "Alarmlar çalıyor. Deniz elinde bir yelekle koridorda: “Tatbikat! Herkes merdivenlere!”",
      options: [
        { label: "Dizüstümü kapatıp hemen merdivenlere giderim.", reply: "Deniz: “Örnek davranış. Listeye 'ilk 10' diye yazıyorum.”", trust: { deniz: 1 } },
        { label: "Önce açık analizimi kaydedeyim, 30 saniye.", reply: "Deniz: “Gerçek yangında o 30 saniye çok uzun. Ama bu sbuser affettim.”", trust: {} },
        { label: "Maya'ya yardım edip ekibin çıkmasına yardımcı olurum.", reply: "Maya merdivende gülümsüyor: “Teşekkürler.”", trust: { maya: 1 } }] }] }
];
MORE_EVENTS.forEach(e => { e.kind = "event"; e.modal = true; EVENTS.push(e); EVENT_BY_ID[e.id] = e; });

/* =====================================================================
   VAKA 001 ve 006: keşif adımları (sorgu kurucusu) ve yanlış kararın sonucu
   ===================================================================== */
function breakdownTable(rows) {
  return dataTable(["Grup", "Ağustos", "Eylül", "Değişim"], rows.map(([k, a, b]) => {
    const d = b - a, pct = a ? (d / a * 100) : -100, txt = `${d >= 0 ? "+" : "−"}${fmtNum(Math.abs(d))} bin ₺ (${d >= 0 ? "+" : "−"}%${String(Math.abs(pct).toFixed(1)).replace(".", ",")})`;
    return [k, `${fmtNum(a)} bin ₺`, `${fmtNum(b)} bin ₺`, pct < -10 ? neg(txt) : d >= 0 ? pos(txt) : txt];
  }));
}
const C001_GROUPS = {
  none: [["Toplam", 1930, 1768]],
  region: [["İstanbul", 840, 806], ["Ankara", 420, 407], ["İzmir", 390, 269], ["Bursa", 280, 286]],
  channel: [["Online", 760, 752], ["Perakende", 900, 765], ["Toptan", 270, 251]],
  category: [["Elektronik", 980, 895], ["Ev", 610, 560], ["Ofis", 340, 313]]
};
const C001_EXPLORE = { type: "builder", label: "Kır", prompt: "Toplam düşüşü bir boyuta göre kır", sub: "Hangi kırılımın düşüşün nerede yoğunlaştığını gösterdiğini dene.",
  goal: "Toplam bir değişimi gruplara bölerek nerede yoğunlaştığını keşfetmek.",
  think: ["Düşüş her yere eşit mi dağılmış, yoksa bir yerde mi toplanmış?", "Hangi kırılımda gruplardan biri diğerlerinden çok farklı davranıyor?"],
  hints: [{ t: "Kategori kırılımında her grup aşağı yukarı aynı oranda düşüyor. Coğrafyaya bakmayı dene." }],
  solve: ["Kategoriye göre: hepsi ~%8–9 düşmüş; düşüş eşit dağılmış, sürücü burada değil.", "Kanala göre: perakende düşmüş ama hangi perakende?", "Bölgeye göre: üç bölge yaklaşık sabit, İzmir −%31. Düşüş tek bir bölgede yoğunlaşmış."],
  takeaway: "Toplamı farklı boyutlara göre kır; gruplardan biri ötekilerden ayrışana kadar dene.",
  fields: [{ key: "g", label: "GROUP BY", options: [["none", "Gruplama yok"], ["category", "Ürün kategorisi"], ["channel", "Kanal"], ["region", "Bölge"]] }],
  run: "Sorguyu çalıştır",
  visual: d => sqlCard("satis_kirilim.sql", [`SELECT ${d.g && d.g !== "none" ? d.g + ", " : ""}SUM(aug), SUM(sep)`, "FROM monthly_sales", d.g && d.g !== "none" ? `GROUP BY ${d.g};` : ";"]) + (d.ran ? breakdownTable(C001_GROUPS[d.g || "none"]) : `<div class="pick-help">${icon("route")}Bir kırılım seç ve sorguyu çalıştır.</div>`),
  check: d => d.g === "region" ? { ok: true, title: "Düşüş tek bölgede", fb: "İstanbul, Ankara ve Bursa yaklaşık sabit; İzmir −%31. Şimdi bu tabloyu yakından okuyalım." }
    : d.g === "category" ? { ok: false, fb: "Her kategori ~%8–9 düşmüş: düşüş kategorilere eşit dağılmış. Sürücü burada değil." }
    : d.g === "channel" ? { ok: false, fb: "Perakende −%15, ama hangi perakende? Kanal bilgisi yeri söylemiyor. Başka bir boyut dene." }
    : { ok: false, fb: "Bu sadece toplam: −%8,4. Kırılım olmadan nerede olduğunu göremezsin." } };
const C001_DRILL = { type: "builder", label: "Bir seviye in", prompt: "Sadece İzmir'i al ve bir seviye daha kır", goal: "Bulduğun segmentin içinde nedeni aramak (drill-down).",
  think: ["İzmir'in hangi parçası düştü?", "Kanal mı yeterli, yoksa daha da aşağı inmek mi gerekiyor?"],
  hints: [{ t: "Kanal kırılımı perakendeyi gösteriyor. İzmir'de kaç perakende mağaza var?" }],
  solve: ["Kanala göre: online ve toptan sabit, perakende 210'dan 98'e.", "Mağazaya göre: Alsancak normal, Karşıyaka 115'ten 0'a.", "Düşüşün kaynağı tek bir mağaza."],
  takeaway: "Bir segment bulduğunda durma: en küçük anlamlı birime kadar in.",
  fields: [{ key: "g", label: "GROUP BY (WHERE region = 'İzmir')", options: [["channel", "Kanal"], ["store", "Mağaza"]] }],
  run: "Sorguyu çalıştır",
  visual: d => sqlCard("izmir.sql", [`SELECT ${d.g || "channel"}, SUM(aug), SUM(sep)`, "FROM monthly_sales", "WHERE region = 'İzmir'", `GROUP BY ${d.g || "channel"};`]) +
    (d.ran ? breakdownTable(d.g === "store" ? [["Alsancak mağazası", 95, 98], ["Karşıyaka mağazası", 115, 0], ["İzmir online", 120, 118], ["İzmir toptan", 60, 53]] : [["Online", 120, 118], ["Perakende mağazalar", 210, 98], ["Toptan", 60, 53]]) : ""),
  check: d => d.g === "store" ? { ok: true, title: "Kaynak bulundu", fb: "Karşıyaka mağazası eylülde hiç satış yapmamış. Alsancak normal. Şimdi nedenini bulalım." }
    : { ok: false, fb: "Perakende 112 bin ₺ düşmüş. İyi; ama İzmir'de iki mağaza var. Hangisi?" } };
(() => {
  const s = CASE_BY_ID.case001.steps;
  s.splice(1, 0, C001_EXPLORE);
  const drillIdx = s.findIndex(x => x.label === "Bir seviye in");
  const explain = { ...s[drillIdx], label: "Açıkla", prompt: "Karşıyaka mağazası neden hiç satış yapmamış olabilir? En olası açıklama ne?", goal: "Veriyi bağlamla (takvim, olay) birleştirip nedeni bulmak.",
    visual: () => noteCard("Operasyon takvimi, İzmir", "Karşıyaka mağazası 2–30 Eylül arası tadilat nedeniyle kapalı. 1 Ekim'de açılıyor. Alsancak mağazası: normal çalışma saatleri."),
    hints: [{ t: "Operasyon takvimi o mağazada ne olduğunu doğrudan söylüyor.", hl: ["Operasyon takvimi, İzmir"] }] };
  s.splice(drillIdx, 1, C001_DRILL, explain);
})();

/* ---- Vaka 006: temizlik ve segment adımları kurucuya döner ---- */
const C006_CLEAN = { type: "builder", label: "Temizle", prompt: "Churn'ü hesaplamadan önce hangi kayıtları hariç tutarsın?", sub: "Seçimlerini değiştirdikçe churn oranının nasıl değiştiğini izle.",
  goal: "Oran hesaplamadan önce veriyi doğru temizlemek.",
  hints: [{ t: "Hatırlatma, Vaka 002: mükerrer ve test kayıtları sayıları şişirir. Eksik bir şehir bilgisi ise müşterinin gerçekten ayrıldığı gerçeğini değiştirmez." }],
  solve: ["Mükerrer iptaller aynı kaybı iki kez sayar: çıkar.", "Test hesapları gerçek müşteri değil: çıkar.", "Şehri eksik müşteriler gerçekten ayrıldı: tut. Sonuç %4,0."],
  takeaway: "Önce temizle, sonra oran hesapla. Eksik bir alan kaydı otomatik olarak geçersiz yapmaz.",
  fields: [{ key: "ex", label: "Hariç tutulacak kayıtlar", type: "check", options: [["dup", "Mükerrer iptal olayları (180)"], ["test", "Test hesapları (40)"], ["nocity", "Şehri kayıtlı olmayan müşteriler (95)"]] }],
  run: "Churn'ü hesapla",
  visual: d => {
    const ex = d.ex || [], rate = { "": 4.6, dup: 4.1, test: 4.5, nocity: 4.3, "dup+test": 4.0, "dup+nocity": 3.8, "nocity+test": 4.2, "dup+nocity+test": 3.7 }[ex.slice().sort().join("+")];
    const rows = 1240 - (ex.includes("dup") ? 180 : 0) - (ex.includes("test") ? 40 : 0) - (ex.includes("nocity") ? 95 : 0);
    return kpiStrip([["İptal olayı", fmtNum(rows)], ["Aylık churn", `%${String(rate.toFixed(1)).replace(".", ",")}`, rate > 4.05 ? "bad" : ""], ["Geçen ay", "%3,1"]]) +
      dataTable(["Profilleme sonucu", "Satır"], [["İptal olayı (ham)", "1.240"], ["Mükerrer iptal (aynı müşteri, aynı gün)", "180"], ["Test hesabı", "40"], ["Şehri kayıtlı olmayan müşteri", "95"]]);
  },
  check: d => {
    const ex = (d.ex || []).slice().sort().join("+");
    if (ex === "dup+test") return { ok: true, title: "Temiz oran: %4,0", fb: "220 hatalı satırı çıkardın; churn %4,6 değil %4,0. Hâlâ %3,1'in üstünde ama hikâye şimdiden farklı." };
    if (ex.includes("nocity")) return { ok: false, fb: "Sonuç ne olurdu? Churn %3,7–3,8 görünür ve kurul sorunu küçümser. Ama şehri eksik 95 kişi gerçekten ayrılan müşteriler; onları silmek gerçeği saklamak olur." };
    return { ok: false, fb: "Oran hâlâ şişkin. Aynı müşteriyi iki kez sayan ya da gerçek müşteri olmayan kayıtlar duruyor." };
  } };
const C006_SEGMENT = { type: "builder", label: "Segmentle", prompt: "Artışın nereden geldiğini bulmak için churn'ü kır", goal: "Artışın kaynağını segmentlerde bulmak.",
  hints: [{ t: "Hatırlatma, Vaka 001: toplam bir sayı nerede olduğunu söylemez. Müşterilerin nereden geldiği farklı davranışa yol açabilir mi?" }],
  solve: ["Plana göre: hepsi 0,1 puan oynamış, gürültü.", "Şehre göre: her şehirde benzer artış; sorun coğrafi değil.", "Edinim kanalına göre: Ağustos TikTok kampanyasıyla gelenlerde %11,8. Kaynak bu kohort."],
  takeaway: "Ortalama bir artış çoğu zaman tek bir segmentteki büyük artıştır.",
  fields: [{ key: "g", label: "GROUP BY", options: [["plan", "Abonelik planı"], ["city", "Şehir"], ["channel", "Edinim kanalı"]] }],
  run: "Sorguyu çalıştır",
  visual: d => {
    const T = { plan: [["Basic plan", "%3,0", "%3,1"], ["Pro plan", "%3,2", "%3,3"], ["Yıllık plan", "%1,1", "%1,0"]], city: [["İstanbul", "%3,1", "%4,0"], ["Ankara", "%3,0", "%3,9"], ["İzmir", "%3,2", "%4,1"]],
      channel: [["Organik", "%2,9", "%3,0"], ["Reklam", "%3,5", "%3,6"], ["Rbuserans", "%2,2", "%2,2"], ["Ağustos TikTok kampanyası", "yok", neg("%11,8")]] }[d.g || "plan"];
    return sqlCard("churn_kirilim.sql", [`SELECT ${d.g || "plan"}, churn_last_month, churn_this_month`, "FROM churn_clean", `GROUP BY ${d.g || "plan"};`]) + (d.ran ? dataTable(["Segment", "Geçen ay", "Bu ay"], T) : "");
  },
  check: d => d.g === "channel" ? { ok: true, title: "Kaynak bir kohort", fb: "Kampanya kohortu %11,8 kayıpla ayrılıyor, diğer kanallar sabit." }
    : d.g === "city" ? { ok: false, fb: "Her şehirde aynı artış var: sorun coğrafi değil, her şehre yayılmış bir şey." }
    : { ok: false, fb: "Planlar 0,1 puan oynamış: gürültü. Başka bir boyut dene." } };
(() => {
  const s = CASE_BY_ID.case006.steps;
  s.splice(s.findIndex(x => x.label === "Temizle"), 1, C006_CLEAN);
  s.splice(s.findIndex(x => x.label === "Segmentle"), 1, C006_SEGMENT);
})();

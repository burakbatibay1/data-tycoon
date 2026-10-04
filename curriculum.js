
/* =====================================================================
   MÜFREDAT — yetenek ağacı (skill → kavram → önkoşul → kanıt → kaynak),
   rehberlik politikası, 8 bölümlük kariyer haritası ve bölüm önizlemeleri.
   Kanıt saklanmaz; tamamlanan vaka/görev/olaylardan her sbuserinde hesaplanır.
   ===================================================================== */
const AREA = { found: "#8C9AB3", analytics: "#4DA3FF", stats: "#A08BFF", business: "#FF7A70", ml: "#5EE0B5", sys: "#FFB547", lead: "#FF8FB1" };
const C = (id, name, src = [], note = "") => ({ id, name, src, note });
const SKILL_TREE = [
  { id: "found", name: "Veri Temelleri", ch: 1, x: 800, y: 70, area: "found", req: [], root: true, concepts: [] },
  { id: "literacy", name: "Veri Okuryazarlığı", ch: 1, x: 420, y: 200, area: "analytics", req: ["found"], concepts: [
    C("lit.change", "Mutlak ve göreli değişim", ["case001", "sq_whiteboard"], "Bir değişimi hem birim (₺, adet) hem yüzde olarak oku. Büyük bir segmentte küçük yüzde, küçük bir segmentte büyük yüzdeden daha çok ₺ edebilir."),
    C("lit.pp", "Yüzde puan", ["sq_whiteboard"], "%2'den %3'e çıkış +1 yüzde puandır, göreli olarak %50 artıştır. Hangisini kastettiğini her zaman söyle."),
    C("lit.weighted", "Ağırlıklı ortalama", ["sq_alex"], "Farklı büyüklükteki grupların ortalamasını alırken her grubu büyüklüğüyle ağırlıklandır: toplam değer / toplam adet."),
    C("lit.asym", "Yüzde değişimin asimetrisi", ["sq_selin"], "%50 düşüşü telafi etmek için %100 artış gerekir. Yüzde her sbuserinde yeni tabana göre hesaplanır."),
    C("lit.units", "Birim ve toplama düzeyi", ["sq_ceo", "ev_revenue"], "Ay ile çeyreği, toplam ile birim başına değeri aynı grafikte ya da cümlede karıştırma.")] },
  { id: "eda", name: "Keşifsel Veri Analizi", ch: 1, x: 800, y: 200, area: "analytics", req: ["found"], concepts: [
    C("eda.grain", "Bir satır neyi temsil eder? (grain)", ["sq_grain"], "Her tablonun bir gözlem birimi vardır: sipariş, müşteri, gün. Saymadan, toplamadan ve birleştirmeden önce bunu bil."),
    C("eda.checklist", "EDA kontrol listesi", ["sq_eda"], "Grain → sütunlar ve tipler → eksik ve mükerrer → dağılımlar ve aykırılar → ilişkiler.", ),
    C("eda.segment", "Segmentasyon", ["case001"], "Toplam bir sayıyı gruplara böl; değişimin nerede yoğunlaştığını gör."),
    C("eda.drill", "Bir seviye in (drill-down)", ["case001"], "Bulduğun segmenti alt kırılımlara ayır ve veriyi bağlamla (takvim, olay) birleştir."),
    C("eda.gaps", "Eksik dönemleri bulmak", ["sq_monday"], "Çizgi grafik eksik günlerin üstünden geçebilir. Bir düşüşü yorumlamadan önce her dönemin verisi var mı, kontrol et.")] },
  { id: "business", name: "İş Odaklı Düşünme", ch: 1, x: 1180, y: 200, area: "business", req: ["found"], concepts: [
    C("bus.summary", "Sayı + neden + beklenti", ["case001"], "İyi bir analitik özet ne olduğunu, nedenini ve ne bekleneceğini söyler; aksiyon nedenle orantılı olur."),
    C("bus.define", "Metrik tanımı sözleşmesi", ["sq_teamboard", "ev_kpi"], "Her KPI'ın yazılı tanımı, sahibi, kaynağı ve güncellenme sıklığı olmalı. Tanım değişirse seride kırılma oluşur."),
    C("bus.denominator", "Payda kontrolü", ["sq_marketing"], "Bir oran değişince payı ve paydayı ayrı ayrı kontrol et; payda tanımı değiştiyse oranlar karşılaştırılamaz."),
    C("bus.pilot", "Önce pilot", ["case005"], "Emin olmadığın büyük bir yatırımdan önce küçük, rastgele bir pilot yap."),
    C("bus.clarify", "Talebi netleştirmek", ["sq_inbox"], "Veri çekmeden önce sor: hangi karar, hangi kitle, hangi dönem?"),
    C("bus.uncertain", "Belirsizlikte karar", ["ev_ceo30"], "Acele taleplerde tahmini aralık, varsayımlar ve kesinleşme zamanını birlikte ver.")] },
  { id: "quality", name: "Veri Kalitesi", ch: 1, x: 300, y: 340, area: "analytics", req: ["literacy"], concepts: [
    C("q.dup", "Mükerrer kayıt", ["case002", "sq_excel"], "Aynı varlık iki kez sayılırsa toplamlar şişer. Mükerreri ID'ye değil doğal anahtara (e-posta, fatura no) göre ara."),
    C("q.missing", "Eksik değer", ["case002"], "Eksik bir alan kaydı otomatik olarak geçersiz yapmaz; iş kuralını sor."),
    C("q.invalid", "Geçersiz ve test kayıtları", ["case002"], "Şirketin kendi test/QA hesapları müşteri değildir; veri hattında filtrelenmeli."),
    C("q.recon", "Mutabakat", ["case002"], "İki sayı tutmuyorsa farkı kalem kalem açıkla; aritmetik tam kapanmalı."),
    C("q.dates", "Tarih formatları", ["sq_printer"], "GG/AA ile AA/GG karışırsa veriler sessizce yanlış aya kayar. Tarihleri kaynağına göre okuyup ISO formatında sakla."),
    C("q.pipeline", "Veri hattı hataları", ["ev_pipeline", "ev_dashboard"], "Hatada önce teşhis, sonra düzeltme; bu arada kullanıcılara verinin güncel olmadığını bildir.")] },
  { id: "stats", name: "İstatistiksel Düşünme", ch: 1, x: 640, y: 340, area: "stats", req: ["eda"], concepts: [
    C("st.dist", "Dağılım", ["case003"], "Tek bir sayıya güvenmeden önce değerlerin nasıl dağıldığına bak: histogram, nokta grafiği."),
    C("st.robust", "Ortalama, medyan ve sağlamlık", ["case003"], "Aykırı değerli çarpık dağılımlarda medyan tipik gözlemi daha iyi temsil eder. Ama toplam soruluyorsa ortalama gerekir."),
    C("st.outlier", "Aykırı değerler", ["case003"], "Aykırı değeri silme; kim olduğunu bul, gerçekse ayrı segment olarak analiz et."),
    C("st.sampling", "Örneklem değişkenliği", ["sq_sampling", "sq_coffee"], "Aynı topluluktan alınan her örneklem biraz farklı sonuç verir. Küçük farklar bu doğal dalgalanmanın içinde olabilir."),
    C("st.bias", "Seçim yanlılığı", ["sq_lunch", "sq_lounge"], "Kimin cevap verdiği ya da kimin örneğe girdiği sonucu belirler."),
    C("st.corr", "Korelasyon ve nedensellik", ["case005"], "Birlikte hareket etmek, birinin diğerine neden olduğu anlamına gelmez."),
    C("st.confound", "Karıştırıcı değişken", ["case005"], "İki değişkeni birden etkileyen üçüncü faktörü sabit tutup tekrar bak.")] },
  { id: "viz", name: "Görselleştirme", ch: 1, x: 960, y: 340, area: "analytics", req: ["eda"], concepts: [
    C("viz.axis", "Dürüst eksen", ["case004"], "Çubuk grafiklerde eksen sıfırdan başlar; uzunluk değerle orantılı olmalı."),
    C("viz.context", "Bağlam", ["case004"], "Kısa bir pencere normal dalgalanmayı kriz gibi gösterir; geçmişi ve normal aralığı ekle."),
    C("viz.choice", "Grafik türü seçimi", ["case004"], "Kategorileri karşılaştırırken sıralı çubuk; zaman için çizgi. Pasta ve 3D'den kaçın."),
    C("viz.units", "Tutarlı birimler", ["sq_ceo"], "Bir grafikteki tüm çubuklar aynı birimi ve aynı zaman aralığını göstermeli.")] },
  { id: "comm", name: "İletişim", ch: 1, x: 1300, y: 340, area: "business", req: ["business"], concepts: [
    C("com.oneliner", "Tek cümlelik özet", ["morning"], "Ne oldu + nerede + neden + ne yapıyoruz. Sabah toplantısında bir cümle yeter."),
    C("com.sowhat", "Peki ne olacak? (so what)", ["sq_mentor"], "Bir bulgu, bir karar için ne anlama geldiği söylenince içgörüye dönüşür."),
    C("com.exec", "Yöneticiye otuz saniye", ["sq_meeting"], "Bir sayı, bir eşik, bir karar."),
    C("com.teach", "Bir kavramı öğretmek", ["ev_intern"], "Formülden önce sezgi: somut bir benzetme kalıcıdır."),
    C("com.peer", "Akran incelemesi", ["sq_peerreview"], "Önemli bir analizden önce tanımı, paydayı, zaman penceresini ve alternatif açıklamaları sorgula.")] },
  { id: "sql", name: "SQL ve Veri İşleme", ch: 2, x: 300, y: 480, area: "analytics", req: ["quality", "eda"], concepts: [
    C("sql.logic", "Mantıksal filtreler (AND/OR)", ["sq_sql"], "Birden çok koşulun hepsi gerekiyorsa AND; OR sonucu genişletir."),
    C("sql.join", "JOIN türleri", ["pv2"], "INNER JOIN eşleşmeyenleri atar, LEFT JOIN sol tablonun tüm satırlarını korur."),
    C("sql.grain", "JOIN sonrası grain", ["pv2"], "Birleştirdiğin tabloda anahtar tekrar ediyorsa satırlar çoğalır ve toplamlar şişer."),
    C("sql.group", "GROUP BY ve toplama"), C("sql.window", "Pencere fonksiyonları"), C("sql.cte", "CTE ile okunur sorgular")] },
  { id: "python", name: "Python ile Veri", ch: 2, x: 560, y: 480, area: "analytics", req: ["eda"], concepts: [C("py.pandas", "groupby ve merge"), C("py.missing", "Eksik veriyle çalışmak"), C("py.repro", "Tekrarlanabilir notebook")] },
  { id: "kpi", name: "KPI Tasarımı", ch: 2, x: 1180, y: 480, area: "business", req: ["business", "literacy"], concepts: [C("kpi.def", "KPI tanımı ve semantik"), C("kpi.dash", "Yönetici dashboard'u"), C("kpi.agree", "Paydaşları aynı tanımda buluşturmak")] },
  { id: "experiment", name: "Deney Tasarımı", ch: 2, x: 640, y: 620, area: "stats", req: ["stats"], concepts: [C("exp.hypo", "Hipotez, birincil ve koruma metriği"), C("exp.ci", "Güven aralığı"), C("exp.power", "Örneklem büyüklüğü ve güç"), C("exp.peek", "Ara bakış (peeking)"), C("exp.srm", "Örneklem oranı uyumsuzluğu")] },
  { id: "analytics", name: "Kohort ve Huni Analizi", ch: 3, x: 1000, y: 620, area: "analytics", req: ["sql", "kpi"], concepts: [C("an.cohort", "Kohort ve tutundurma"), C("an.funnel", "Huni ve düşüş noktası"), C("an.price", "Fiyat–hacim dengesi")] },
  { id: "privacy", name: "Veri Gizliliği ve KVKK", ch: 3, x: 1320, y: 620, area: "business", req: ["business"], concepts: [
    C("pr.kvkk", "KVKK ile ilk refleks", ["ev_kvkk"], "Bir sütunu paylaşmadan önce sor: gerçekten gerekli mi, kişisel mi, hukuki dayanak ve onay var mı?"),
    C("pr.minimize", "Veri minimizasyonu", ["ev_kvkk"], "Amaca yetecek en az veriyi kullan; segment düzeyi çoğu zaman yeter."), C("pr.anon", "Anonimleştirme ve takma ad")] },
  { id: "causal", name: "Nedensellik", ch: 3, x: 820, y: 760, area: "stats", req: ["stats", "experiment"], concepts: [
    C("ca.simpson", "Simpson paradoksu", ["pv3"], "Toplam oran artarken her segmentteki oran düşebilir; bunu segment karışımındaki değişim yapar."),
    C("ca.mix", "Karışım etkisi ve standardizasyon", ["pv3"], "Dönemleri karşılaştırırken segment karışımını sabit tut ya da segment içi karşılaştır."),
    C("ca.did", "Fark içinde fark (DiD)"), C("ca.uplift", "Uplift: kim 'bizim yüzümüzden' alır?")] },
  { id: "forecasting", name: "Tahminleme", ch: 3, x: 300, y: 760, area: "ml", req: ["stats", "python"], concepts: [C("fc.baseline", "Naif tahmin temeli"), C("fc.season", "Trend ve mevsimsellik"), C("fc.backtest", "Zamana göre ayrım ve geriye dönük test")] },
  { id: "mlform", name: "ML Problem Kurgusu", ch: 4, x: 560, y: 900, area: "ml", req: ["stats", "sql"], concepts: [
    C("mf.target", "Hedef ve tahmin ufku", ["pv4"], "Hedefi zamanla birlikte tanımla: 'önümüzdeki 30 gün içinde iptal'."),
    C("mf.window", "Öznitelik penceresi", ["pv4"], "Öznitelikler yalnızca gözlem tarihinden önceki bilgiden gelir; gelecekten bilgi sızdırma."),
    C("mf.action", "Tahminin iş aksiyonu")] },
  { id: "featureeng", name: "Öznitelik Mühendisliği", ch: 4, x: 300, y: 1040, area: "ml", req: ["mlform", "quality"], concepts: [C("fe.missing", "Eksik değer işleme"), C("fe.encode", "Kodlama ve ölçekleme"), C("fe.leak", "Sızıntıyı tanımak")] },
  { id: "modeling", name: "Modelleme", ch: 4, x: 560, y: 1040, area: "ml", req: ["mlform"], concepts: [
    C("mo.baseline", "Önce temeli geç", ["pv4"], "Her modeli önce naif bir tahminle karşılaştır. Temeli geçemeyen model işe yaramaz."),
    C("mo.split", "Train / test ayrımı"), C("mo.overfit", "Aşırı öğrenme")] },
  { id: "evaluation", name: "Model Değerlendirme", ch: 4, x: 820, y: 1040, area: "ml", req: ["modeling", "stats"], concepts: [
    C("ev.accuracy", "Doğruluk tuzağı", ["pv4"], "Dengesiz veride herkese çoğunluk sınıfını söyleyen model de yüksek doğruluk alır. Asıl sınıfı ne kadar yakaladığına bak."),
    C("ev.threshold", "Eşik ve hata maliyeti", ["pv5"], "Eşiği yanlış pozitif ve yanlış negatifin iş maliyetine göre seç."),
    C("ev.pr", "Precision ve recall"), C("ev.error", "Hata analizi")] },
  { id: "xai", name: "Açıklanabilirlik", ch: 5, x: 420, y: 1180, area: "ml", req: ["modeling"], concepts: [C("xai.global", "Genel açıklama"), C("xai.local", "Tekil tahmini açıklamak")] },
  { id: "calibration", name: "Kalibrasyon", ch: 5, x: 700, y: 1180, area: "ml", req: ["evaluation"], concepts: [
    C("cal.prob", "Olasılık kalibrasyonu", ["pv5"], "Model %80 dediğinde gerçekten yaklaşık %80'i gerçekleşiyor mu? Sıralamada iyi bir model olasılıkta kötü olabilir."),
    C("cal.disc", "Ayırt etme ve kalibrasyon farkı")] },
  { id: "genai", name: "Üretken YZ Sistemleri", ch: 5, x: 980, y: 1180, area: "ml", req: ["evaluation"], concepts: [C("gen.eval", "LLM değerlendirme seti"), C("gen.rag", "Getirme mi üretme mi hatası?"), C("gen.choice", "Prompt, RAG ya da ince ayar")] },
  { id: "mlops", name: "MLOps", ch: 6, x: 420, y: 1320, area: "sys", req: ["modeling", "python"], concepts: [
    C("ops.retrain", "Yeniden eğitim kararı", ["pv6"], "Kayma görüldüğünde güncel veriyle yeniden eğit ve sonucu izleme ile doğrula."),
    C("ops.version", "Veri ve model sürümleme"), C("ops.rollback", "Geri alma planı")] },
  { id: "monitoring", name: "İzleme", ch: 6, x: 700, y: 1320, area: "sys", req: ["mlops", "evaluation"], concepts: [
    C("mon.drift", "Veri kayması", ["pv6"], "Girdi dağılımı değişince model, hiç görmediği bir dünyada tahmin yapar."),
    C("mon.concept", "Kavram kayması"), C("mon.business", "İş metriğini izlemek")] },
  { id: "responsible", name: "Sorumlu YZ", ch: 6, x: 1000, y: 1320, area: "sys", req: ["xai", "privacy"], concepts: [C("ra.bias", "Alt grup performansı"), C("ra.oversight", "İnsan gözetimi")] },
  { id: "leadership", name: "Liderlik ve Mentorluk", ch: 7, x: 560, y: 1460, area: "lead", req: ["comm"], concepts: [
    C("le.review", "Model incelemesi", ["pv7"], "Başkasının işini incelerken önce zaman çizelgesine ve hedef tanımına bak."),
    C("le.feedback", "Gelişim odaklı geri bildirim", ["pv7"], "Hatayı düzeltmek yerine birlikte bulmak, kişinin bir dahakine kendi bulmasını sağlar."),
    C("le.prioritize", "Proje önceliklendirme")] },
  { id: "governance", name: "Veri Yönetişimi", ch: 7, x: 900, y: 1460, area: "lead", req: ["responsible", "kpi"], concepts: [C("gov.metric", "Ortak metrik yönetişimi"), C("gov.model", "Model yönetişimi")] },
  { id: "strategy", name: "Veri ve YZ Stratejisi", ch: 8, x: 730, y: 1600, area: "lead", req: ["leadership", "governance"], concepts: [
    C("str.portfolio", "Yatırım portföyü", ["pv8"], "Projeleri etki × fizibilite × risk × maliyet üzerinden birlikte değerlendir."),
    C("str.roi", "ROI, risk ve ölçüm planı", ["pv8"], "Bir yatırım önerisi beklenen getiriyi, belirsizliği ve nasıl ölçüleceğini birlikte söyler."),
    C("str.org", "Veri organizasyonu kurmak")] }
];
const NODE_BY_ID = Object.fromEntries(SKILL_TREE.map(n => [n.id, n]));
const CONCEPT_BY_ID = Object.fromEntries(SKILL_TREE.flatMap(n => n.concepts.map(c => [c.id, { ...c, node: n.id }])));

/* Junior Veri Analisti terfisi artık kanıta dayalı */
PROMOTION.req = { literacy: 3, eda: 3, quality: 3, stats: 4, business: 2, comm: 2 };

/* Rehberlik politikası: kariyer ilerledikçe oyun elini bırakır */
const GUIDANCE = {
  1: { label: "Hedef, yaklaşım, ipucu ve birlikte çözüm", think: true, hints: true, solve: true, cost: 0 },
  2: { label: "Birlikte çözüm kalkar", think: true, hints: true, solve: false, cost: 0 },
  3: { label: "İpucu XP'ye mal olur", think: true, hints: true, solve: false, cost: 10 },
  4: { label: "Vaka sırasında ipucu yok, sonunda değerlendirme", think: false, hints: false, solve: false },
  5: { label: "Sadece vaka sonu değerlendirmesi", think: false, hints: false, solve: false },
  6: { label: "Problemin dışında yönlendirme yok", think: false, hints: false, solve: false, goal: false },
  7: { label: "Tam belirsizlik", think: false, hints: false, solve: false, goal: false },
  8: { label: "Tam belirsizlik, kalıcı sonuçlar", think: false, hints: false, solve: false, goal: false }
};

const CAREER_MAP = [
  { ch: 1, role: "Veri Stajyeri", time: "1. hafta", axis: "Veri okuryazarlığı, kalite, betimleme", maya: "“İzmir'e bak.”",
    cases: ["001 Satış Gizemi", "002 Kirli Veri", "003 Yanıltıcı Ortalama", "004 Dashboard Krizi", "005 Korelasyon Tuzağı", "006 Yönetim Kurulu Sorusu"] },
  { ch: 2, role: "Junior Veri Analisti", time: "3 ay sonra", axis: "SQL, KPI, toplama, belirsizlik, ilk deney", maya: "“Veriyi incele.”", preview: "pv2",
    cases: ["007 Pazartesi Düşüşü", "008 İki Tablo, Tek Cevap", "009 Kimsenin Anlaşamadığı KPI", "010 Ortalamanın Arkasındaki Müşteri", "011 Örneklem Ne Kadar Emin?", "012 Pazarlamanın Sevdiği Deney", "013 CEO İçin Dashboard", "014 Yönetici Değerlendirmesi"] },
  { ch: 3, role: "Veri Analisti", time: "11 ay sonra", axis: "Kohort, huni, karıştırıcılar, deney tuzakları, nedensellik, KVKK, Python", maya: "“Neden oluyor?”", preview: "pv3",
    cases: ["015 Kaybolan Müşteri (kohort)", "016 Huniyi Kur (huni)", "017 Simpson Paradoksu (karışım)", "018 İşe Yarayan Kampanya… Belki (karıştırıcı)", "019 Deneyin Tuzakları", "020 Önce/Sonra Yetmez (nedensellik)", "021 Ajansa Giden Veri (KVKK)", "022 Gelecek Ay (tahminleme)", "023 Kurul Tek Cevap İstiyor"] },
  { ch: 4, role: "Junior Veri Bilimci", time: "2 yıl sonra", axis: "Problem kurgusu, temel model, ön işleme, değerlendirme", maya: "“Bir yaklaşım geliştir.”", preview: "pv4",
    cases: ["024 Yapay Zekâyla Churn'ü Azaltalım (iş → tahmin problemi)", "025 Zamanı Doğru Kur (birim, hedef, pencere, ufuk)", "026 Önce Temeli Geç (temel ve iş aksiyonu)", "027 İlk Modelin", "028 %97 Doğruluk!", "029 Precision mı Recall mu?", "030 Öznitelik Atölyesi", "031 Şüpheli Derecede Mükemmel Model", "032 Model İncelemesi"] },
  { ch: 5, role: "Veri Bilimci", time: "3,5 yıl sonra", axis: "İleri ML, tahminleme, XAI, kalibrasyon, üretken YZ", maya: "“Bunu canlıya almalı mıyız?”", preview: "pv5",
    cases: ["033 Kim Ayrılacak?", "034 Müşteri DNA'sı", "035 Ağaç mı Doğrusal mı?", "036 Eşiği Kim Belirler?", "037 Bu Tahmini Açıkla", "038 Yarının Satışları", "039 LLM'i Nasıl Ölçeriz?", "040 Canlı Aday"] },
  { ch: 6, role: "Kıdemli Veri Bilimci", time: "6 yıl sonra", axis: "Canlı sistemler, kayma, MLOps, nedensellik, YZ sistemleri", maya: "“Modelin iş etkisi üç aydır düşüyor.”", preview: "pv6",
    cases: ["041 Tekrarlanamayan Notebook", "042 Model Bozuldu", "043 Çevrimdışı Harika, Canlıda Kötü", "044 Zamansal Sızıntı", "045 ML Kullanmalı mıyız?", "046 Önyargılı Model", "047 RAG mı İnce Ayar mı?", "048 02:13'teki Olay"] },
  { ch: 7, role: "Lider Veri Bilimci", time: "9 yıl sonra", axis: "İnceleme, mentorluk, yönetişim, portföy", maya: "“Ekibin önerisini değerlendir.”", preview: "pv7",
    cases: ["049 Buse'nin Model İncelemesi", "050 Üç Ekip, Tek Metrik", "051 Yap mı Satın Al mı?", "052 İmkânsız Teslim Tarihi", "053 Ekip Hangi Projeye?", "054 Lider Değerlendirmesi"] },
  { ch: 8, role: "Veri Direktörü", time: "12 yıl sonra", axis: "Organizasyon, yatırım, YZ yönetişimi, strateji", maya: "“Şirket ne yapmalı?”", preview: "pv8",
    cases: ["055 2 Milyon Avroluk YZ Bahsi", "056 YZ Yönetişim Krizi", "057 Veri Organizasyonunu Kur", "058 YZ Bize Para Kazandırıyor mu?", "059 Son Yönetim Kurulu"] }
];
const chapterNow = () => (player.chapter || 1) + (player.promoted ? 1 : 0);

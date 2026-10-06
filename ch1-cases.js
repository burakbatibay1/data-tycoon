"use strict";
/* =====================================================================
   DATA TYCOON 2.0 — Türkçe, öğretici sürüm
   Akış: VERİ (kişiler, beceriler, vakalar, yan görevler) -> GÖRSELLER
         -> MOTOR (kayıt, ödüller, adım çalıştırıcı, rehberlik)
         -> EKRANLAR -> OLAYLAR
   Her seçim adımında öğretici alanlar:
     goal     : bu adımın öğrenme hedefi
     think    : cevabı söylemeden yaklaşımı anlatan sorular
     hints    : kademeli ipuçları; hl ile sahnedeki veriyi vurgular
     solve    : birlikte çözüm (adım adım akıl yürütme)
     takeaway : doğru cevaptan sonra akılda kalacak kural
   ===================================================================== */

const SAVE_KEY = "dataTycoon_tr_v20";
const CHECKPOINT_KEY = "dataTycoon_tr_v20_checkpoint";
const LEGACY_KEYS = ["dataTycoonSave_manual_v17", "dataTycoonManualSlot_v17", "dataTycoonSave_v05"];
const XP_PER_LEVEL = 250;
const OFFICE_IMAGE = "virelio-ofis.jpg";

const SKILLS = {
  dataLiteracy:     { name: "Veri Okuryazarlığı",  color: "#5EE0B5" },
  dataExploration:  { name: "Veri Keşfi",          color: "#4DA3FF" },
  dataQuality:      { name: "Veri Kalitesi",       color: "#FFB547" },
  statistics:       { name: "İstatistik",          color: "#A08BFF" },
  visualization:    { name: "Görselleştirme",      color: "#FF8FB1" },
  businessThinking: { name: "İş Odaklı Düşünme",   color: "#FF7A70" }
};

const PROMOTION = {
  title: "Junior Veri Analisti",
  req: { dataLiteracy: 48, dataExploration: 45, dataQuality: 32, statistics: 40, businessThinking: 50 }
};

const ROLES = [
  { title: "Veri Stajyeri", text: "Veriyi incelemeyi, metrikleri okumayı ve iş problemlerini yapılandırılmış biçimde çözmeyi öğren." },
  { title: "Junior Veri Analisti", text: "Küçük analizleri baştan sona üstlen, bulgularını paydaşlara sun." },
  { title: "Veri Analisti", text: "SQL, deney tasarımı ve iş iletişimi." },
  { title: "Junior Veri Bilimci", text: "Regresyon, sınıflandırma, kümeleme ve model değerlendirme." },
  { title: "Veri Bilimci", text: "Bağımsız modelleme, doğrulama, tahminleme ve açıklanabilirlik." },
  { title: "Kıdemli Veri Bilimci", text: "Veri sızıntısı, dağılım kayması, kalibrasyon ve canlı sistem dengeleri." },
  { title: "Lider Veri Bilimci", text: "Projeleri yönet, ekibe mentorluk yap, teknik yönü belirle." },
  { title: "Veri Direktörü", text: "Veri organizasyonunu, portföyünü ve stratejisini kur." }
];

const AVATARS = [
  { id: "a1", skin: "#D9A27A", hair: "#2A211C", shirt: "#4DA3FF", style: "short" },
  { id: "a2", skin: "#F1C9A5", hair: "#5A3520", shirt: "#5EE0B5", style: "long" },
  { id: "a3", skin: "#B97D55", hair: "#1B120C", shirt: "#A08BFF", style: "bob" },
  { id: "a4", skin: "#EDC09B", hair: "#9A6A3A", shirt: "#FF8FB1", style: "ponytail" },
  { id: "a5", skin: "#8D5A3B", hair: "#141010", shirt: "#FFB547", style: "short" },
  { id: "a6", skin: "#E3B08A", hair: "#3E3E46", shirt: "#FF7A70", style: "bob" }
];

const PEOPLE = {
  maya:  { name: "Maya Chen",   role: "Analitik Müdürü, mentorun", skin: "#E9B994", hair: "#1F1A17", shirt: "#A08BFF", style: "bob" },
  alex:  { name: "Alex Rivera", role: "Kıdemli Veri Analisti",     skin: "#B97D55", hair: "#24170F", shirt: "#3FC79C", style: "short" },
  deniz: { name: "Deniz Aydın", role: "Ofis ve Operasyon Lideri",  skin: "#F1C9A5", hair: "#8A5228", shirt: "#FFB547", style: "long" },
  zeynep: { name: "Zeynep Acar",  role: "Satış Lideri",              skin: "#DFA47C", hair: "#3A2418", shirt: "#FF7A70", style: "ponytail" },
  burak: { name: "Burak Öz",    role: "Finans Lideri",             skin: "#EDC09B", hair: "#4A4A4A", shirt: "#7C8DB5", style: "short" },
  you:   { name: "Sen",         role: "Veri Stajyeri",             skin: "#D9A27A", hair: "#2A211C", shirt: "#4DA3FF", style: "short" }
};

/* ---------------------------------------------------------------------
   VAKALAR
   --------------------------------------------------------------------- */
const CASES = [
{
  id: "case001", num: "001", title: "Satış Gizemi", difficulty: 1, xp: 100,
  short: "Şirket satışları %8,4 düştü. Düşüşün nereden geldiğini bul.",
  tags: ["Veri Keşfi", "Segmentasyon"],
  rewards: { dataLiteracy: 10, dataExploration: 15, businessThinking: 10 },
  concept: { name: "Segment analizi", en: "segmentation",
    text: "Şirket geneli bir sayıyı gruplara (bölge, kanal, mağaza) böl. Sürücü (driver) görünür olana kadar bir seviye daha in.",
    points: ["Toplam bir sayı ne olduğunu söyler, nerede olduğunu söylemez.", "Hem mutlak (₺) hem yüzdesel değişime bak; ikisi farklı hikâye anlatabilir.", "Bir segment bulduğunda bir seviye daha in: kanal, mağaza, ürün.", "Öneri; sayı, neden ve beklenti içermeli."] },
  mentor: "Şirket geneli bir KPI sana bir şey olduğunu söyler. Segmentasyon nerede olduğunu söyler; açıklama da orada yaşar.",
  portfolio: { title: "Bölgesel satış incelemesi", text: "%8,4'lük satış düşüşünü İzmir perakende kanalındaki geçici mağaza kapanışına bağladım; bu kapanış düşüşün %75'ini açıklıyordu." },
  steps: [
    { type: "dialog", who: "maya", cta: "Satış verisini aç",
      lines: ["Günaydın! Yönetim, eylül satışlarının ağustosa göre %8,4 düştüğünü fark etti.",
              "Kimse çözüm önermeden önce düşüşün nereden geldiğini bilmek istiyorlar. Bölgesel rakamlardan başla. Takılırsan sağ panelde ipucu var, kullanmaktan çekinme."] },
    { type: "choice", label: "Sürücüyü bul",
      goal: "Mutlak ve yüzdesel değişimi birlikte okuyarak düşüşün kaynağını bulmak.",
      prompt: "Düşüşü hangi bölge sürüklüyor?",
      sub: "Hem ₺ cinsinden değişime hem yüzdesel değişime bak.",
      think: ["Toplam düşüş kaç bin ₺? Her bölge bu düşüşün ne kadarını açıklıyor?", "Büyük bir bölgede küçük bir yüzde, küçük bir bölgede büyük bir yüzdeden daha çok ₺ edebilir. Hangisi daha büyük?"],
      hints: [
        { t: "Toplam düşüş 162 bin ₺. Tablodaki ₺ değişimlerini topla ve hangisinin bu toplama en çok katkı yaptığına bak.", hl: ["Değişim"] },
        { t: "Bir bölgenin hem en büyük ₺ kaybı hem de en büyük yüzde düşüşü var. İki grafiğe birden bak: çubuklar arasındaki en büyük boşluk nerede?", hl: ["İzmir"] }],
      solve: ["Toplam düşüş: 1.930 − 1.768 = 162 bin ₺.", "İstanbul −34, Ankara −13, İzmir −121, Bursa +6 bin ₺.", "121 / 162 ≈ %75. Düşüşün dörtte üçü tek bölgeden geliyor: İzmir."],
      takeaway: "Önce toplam değişimi hesapla, sonra her segmentin bu değişime katkısını (contribution) bul.",
      visual: () => kpiStrip([["Ağustos", "1,93 Mn ₺"], ["Eylül", "1,77 Mn ₺"], ["Değişim", "−%8,4", "bad"]]) +
        chartCard("Bölgesel satışlar, bin ₺", groupedBars([
          { label: "İstanbul", a: 840, b: 806 }, { label: "Ankara", a: 420, b: 407 },
          { label: "İzmir", a: 390, b: 269 }, { label: "Bursa", a: 280, b: 286 }], ["Ağustos", "Eylül"])) +
        dataTable(["Bölge", "Ağustos", "Eylül", "Değişim"], [
          ["İstanbul", "840 bin ₺", "806 bin ₺", neg("−34 bin ₺ (−%4,0)")], ["Ankara", "420 bin ₺", "407 bin ₺", neg("−13 bin ₺ (−%3,1)")],
          ["İzmir", "390 bin ₺", "269 bin ₺", neg("−121 bin ₺ (−%31,0)")], ["Bursa", "280 bin ₺", "286 bin ₺", pos("+6 bin ₺ (+%2,1)")]], { hlCols: ["Değişim"] }),
      options: [
        { label: "İstanbul", fb: "İstanbul en büyük bölge; küçük yüzdeler bile ₺ olarak büyük görünür. Ama 34 bin ₺ kayıp, toplam düşüşün yalnızca beşte biri." },
        { label: "Ankara", fb: "Ankara %3,1 geriledi; bu normal aylık dalgalanma düzeyinde. Aykırı olan segmenti ara." },
        { label: "İzmir", correct: true, fb: "İzmir, 162 bin ₺'lik toplam düşüşün 121 bin ₺'sini kaybetti. Sorunun %75'i tek bölgede." },
        { label: "Bursa", fb: "Bursa aslında %2,1 büyüdü. Düşüşün kaynağı olamaz; elenebilecek tek bölge bu." }] },
    { type: "choice", label: "Bir seviye in", who: "maya",
      goal: "Bulduğun segmenti alt kırılımlara ayırıp nedeni bulmak (drill-down).",
      prompt: "Demek İzmir. Şimdi bir seviye daha in. En olası açıklama ne?",
      think: ["İzmir'in hangi kanalı düştü, hangisi sabit kaldı?", "Tek bir kanal düştüyse sebep o kanala özgü bir şey olabilir mi? Operasyon notlarında ne yazıyor?"],
      hints: [
        { t: "Üç kanalı karşılaştır. İkisi neredeyse aynı kalmış, biri yarıdan fazla düşmüş.", hl: ["Perakende mağazalar"] },
        { t: "Operasyon takvimi o kanalda ne olduğunu doğrudan söylüyor.", hl: ["Operasyon takvimi, İzmir"] }],
      solve: ["Online: 120 → 118 (neredeyse sabit). Toptan: 60 → 53 (hafif).", "Perakende: 210 → 98, yani −112 bin ₺. İzmir düşüşünün neredeyse tamamı burada.", "Operasyon takvimi: Karşıyaka mağazası eylül boyunca tadilat için kapalıydı. Neden geçici ve operasyonel."],
      takeaway: "Bir segmenti bulmak yarı yoldur. Nedeni bulmak için bir alt kırılıma in ve veriyi bağlamla (takvim, olay, kampanya) birleştir.",
      visual: () => chartCard("İzmir kanal kırılımı, bin ₺", groupedBars([
          { label: "Online", a: 120, b: 118 }, { label: "Perakende mağazalar", a: 210, b: 98 }, { label: "Toptan", a: 60, b: 53 }], ["Ağustos", "Eylül"])) +
        noteCard("Operasyon takvimi, İzmir", "Karşıyaka mağazası 2–30 Eylül arası tadilat nedeniyle kapalı. 1 Ekim'de açılıyor. Alsancak mağazası: normal çalışma saatleri."),
      options: [
        { label: "İzmir'de online talep çöktü", fb: "Online neredeyse sabit (120'den 118 bin ₺'ye). Müşteriler online almaya devam ediyor." },
        { label: "Karşıyaka mağazası ay boyunca kapalı olduğu için perakende düştü", correct: true, fb: "Aynen öyle. Perakende 112 bin ₺ kaybederken online sabit kaldı; takvim de nedenini söylüyor. Neden operasyonel ve geçici." },
        { label: "İzmir genelinde fiyatlar çok yüksek", fb: "Sorun fiyat olsaydı online ve toptan da düşerdi. Düşüş tek kanalda yoğunlaşmış." },
        { label: "Veri muhtemelen yanlış", fb: "Sormak her zaman iyi alışkanlık; ama toplamlar finansla tutuyor ve takvim somut bir neden veriyor." }] },
    { type: "choice", label: "Öneri",
      goal: "Bulguyu yöneticinin karar verebileceği bir cümleye çevirmek.",
      prompt: "Yönetime ne söylersin?",
      sub: "E-postanın ilk satırına yazacağın özeti seç.",
      think: ["İyi bir özet üç şey içerir: sayı, neden, beklenti/aksiyon.", "Önerdiğin aksiyon, bulduğun nedenle orantılı mı?"],
      hints: [
        { t: "Neden yerel ve geçici. Ulusal ölçekte bir aksiyon bu nedene uyar mı?" },
        { t: "Sayıyı (%75), yeri (İzmir perakende), nedeni (kapanış) ve beklentiyi (ekimde toparlanma) içeren seçeneği ara." }],
      solve: ["Kampanya önerisi yerel bir sorunu ulusal sorun gibi ele alıyor.", "Bölgeyi sorgulamak, sağlıklı online ve toptan kanalları yok sayıyor.", "Doğru özet: düşüşün %75'i İzmir perakendeden, Karşıyaka kapanışı nedeniyle; ekimde toparlanma beklenir, izlenecek."],
      takeaway: "İyi bir analitik özet = sayı + neden + beklenti. Aksiyon, nedenin büyüklüğüyle orantılı olmalı.",
      options: [
        { label: "Satışlar %8,4 düştü. Ülke çapında indirim kampanyası başlatmalıyız.", fb: "Sonuç ne olurdu? 420 bin ₺'lik kampanya ekimde başlar, Karşıyaka mağazası da aynı ay açılır. Satışlar toparlanır ve herkes kampanyayı başarı sanar. Yanlış ders, pahalı bir fatura." },
        { label: "Düşüşün %75'i İzmir perakendeden, büyük ölçüde Karşıyaka mağazasının kapanmasından geliyor. Ekimde toparlanma bekliyoruz, açılışı izleyeceğiz.", correct: true, fb: "Net, sayısal, nedeni açıklıyor ve beklenti koyuyor. Bu bir analist cevabı." },
        { label: "İzmir düşük performans gösteriyor; bölgeyi tutup tutmamayı değerlendirmeliyiz.", fb: "İzmir'in online ve toptan kanalları sağlıklı. Tek mağazanın tadilatı bölgeyi sorgulamak için sebep değil." }] }
  ]
},
{
  id: "case002", num: "002", title: "Kirli Veri", difficulty: 1, xp: 120, after: "case001",
  short: "Finans ve CRM farklı müşteri sayıları raporluyor. Nedenini bul.",
  tags: ["Veri Kalitesi", "Mükerrer kayıt", "Eksik değer"],
  rewards: { dataQuality: 25, dataLiteracy: 10, dataExploration: 5, businessThinking: 5 },
  concept: { name: "Veri kalitesi kontrolleri", en: "data quality checks",
    text: "Analizden önce üç şeyi kontrol et: tekillik (mükerrer kayıt), bütünlük (eksik değer) ve geçerlilik (test veya çöp kayıt).",
    points: ["Aynı kişi farklı ID, büyük/küçük harf ya da yazımla tekrar edebilir: e-posta gibi doğal anahtarlara bak.", "Boş ID her zaman silinecek kayıt demek değildir; iş kuralını sor.", "Farkı kapatırken sayıları gerçekten topla: 412 + 164 = 576.", "Kalıcı çözüm kaynakta olur: kısıt, filtre ve tek tanım."] },
  mentor: "Sayılar üzerine tartışmaların çoğu aslında tanımlar üzerine tartışmadır. İki ekibe de aynı müşteri tanımını verdin.",
  portfolio: { title: "Müşteri sayısı mutabakatı", text: "CRM müşteri tablosunu profilledim; 412 mükerrer kayıt ve 164 test hesabı bularak Finans ile CRM arasındaki 576 müşterilik farkı kapattım." },
  steps: [
    { type: "dialog", who: "maya", cta: "CRM örneğini aç",
      lines: ["Bir sayı sorunumuz var. Finans 11.906 müşterimiz olduğunu söylüyor, CRM ise 12.482.",
              "İki ekip de haklı olduğundan emin. CRM tablosundan 12 satırlık bir örnek çektim. Her satırı etiketle, sonra tüm dosyaya bakarız."] },
    { type: "tagger", label: "Satırları etiketle",
      goal: "Mükerrer, eksik ve geçersiz kayıtları gözle tanımayı öğrenmek.",
      prompt: "Her CRM satırını etiketle",
      sub: "Önce soldan bir etiket seç, sonra uyduğu satırlara tıkla.",
      think: ["Mükerrer: aynı kişi iki kez mi var? Ad yazımı, büyük harf ya da ID farklı olabilir; e-posta ve tarih aynıdır.", "Eksik ID: customer_id alanı boş mu?", "Test hesabı: e-posta şirketin kendi alan adında mı (virelio.com)?"],
      hints: [
        { t: "E-posta sütununu yukarıdan aşağı oku. Aynı e-posta (büyük/küçük harf farkıyla bile) iki kez geçiyorsa ikinci satır mükerrerdir. Üç tane var.", hl: ["email"] },
        { t: "customer_id sütununda kırmızı 'null' yazan iki satır eksik ID. virelio.com ile biten iki e-posta test hesabı. Geri kalan beş satır temiz.", hl: ["customer_id"] }],
      solve: ["Mükerrer: 3. satır (Ayşe, aynı e-posta büyük harfle), 7. satır (Can, aynı e-posta yeni ID), 12. satır (Zeynep, aynı e-posta, 'İzmir' yazımı).", "Eksik ID: 4. ve 10. satırlar.", "Test hesabı: 5. ve 8. satırlar (virelio.com).", "Temiz: 1, 2, 6, 9, 11."],
      takeaway: "Mükerreri ID'ye göre değil, doğal anahtara (e-posta, tarih) göre ara. Yazım farkları mükerreri gizler.",
      tags: [["ok", "Temiz"], ["dup", "Mükerrer"], ["missing", "Eksik ID"], ["test", "Test hesabı"]],
      cols: ["customer_id", "name", "email", "city", "created"],
      rows: [
        [["C-10021", "Ayşe Demir", "ayse.demir@mail.com", "Istanbul", "2024-03-11"], "ok"],
        [["C-10022", "Mehmet Kaya", "mkaya@mail.com", "Ankara", "2024-03-12"], "ok"],
        [["C-10021", "Ayse Demir", "AYSE.DEMIR@mail.com", "istanbul", "2024-03-11"], "dup"],
        [["", "Melis Arslan", "m.arslan@mail.com", "Izmir", "2024-04-02"], "missing"],
        [["C-10035", "TEST USER", "test@virelio.com", "", "2024-04-05"], "test"],
        [["C-10036", "Can Yılmaz", "can.yilmaz@mail.com", "Bursa", "2024-04-07"], "ok"],
        [["C-10037", "Can Yilmaz", "can.yilmaz@mail.com", "Bursa", "2024-04-07"], "dup"],
        [["C-10040", "QA Virelio", "qa+1@virelio.com", "Istanbul", "2024-04-10"], "test"],
        [["C-10041", "Elif Şahin", "elif.sahin@mail.com", "Ankara", "2024-04-11"], "ok"],
        [["", "Burak Öztürk", "b.ozturk@mail.com", "Istanbul", "2024-04-15"], "missing"],
        [["C-10044", "Derya Kara", "derya.kara@mail.com", "Izmir", "2024-04-18"], "ok"],
        [["C-10045", "Derya Kara", "derya.kara@mail.com", "İzmir", "2024-04-18"], "dup"]
      ],
      rowHints: { dup: "Aynı kişinin (aynı e-posta, aynı tarih) iki kez geçtiği satırları ara; ID veya yazım farklı olabilir.",
               missing: "Bazı satırlarda customer_id hiç yok.",
               test: "virelio.com adresli e-postalar şirketin kendi test/QA hesaplarıdır, müşteri değildir.",
               ok: "Sorunlu diye etiketlediğin bazı satırlar aslında temiz." } },
    { type: "choice", label: "Mutabakat",
      goal: "Bulunan sorunları sayılarla farka bağlamak (reconciliation).",
      prompt: "576 müşterilik farkı hangi sorunlar açıklıyor?",
      sub: "CRM 12.482 eksi Finans 11.906 = 576.",
      think: ["Farkı açıklayan kombinasyon tam olarak 576 etmeli. Toplamları gerçekten hesapla.", "Finans hangi kayıtları zaten sayıyor? Burak'ın notunu oku."],
      hints: [
        { t: "Her seçeneği topla: 412, 412+164, 412+164+238, 238+164. Hangisi 576?", hl: ["Mükerrer müşteri", "Test / QA hesapları"] },
        { t: "Burak'ın notuna göre Finans ID'si eksik müşterileri de sayıyor; yani eksik ID'ler iki sistem arasında fark yaratmaz.", hl: ["Burak'tan, Finans"] }],
      solve: ["412 + 164 = 576: fark tam olarak kapanıyor.", "238 eksik ID kaydı Finans'ta da sayıldığı için farka dahil değil.", "Sonuç: CRM mükerrerleri ve test hesaplarını sayıyor, Finans saymıyor."],
      takeaway: "Mutabakatta tahmin değil aritmetik konuşur. Fark tam kapanmıyorsa hikâye eksiktir.",
      visual: () => kpiStrip([["CRM", "12.482"], ["Finans", "11.906"], ["Fark", "576", "bad"]]) +
        dataTable(["Tüm CRM tablosu kontrolü", "İşaretlenen satır"], [["Mükerrer müşteri", "412"], ["Test / QA hesapları", "164"], ["customer_id eksik", "238"]]) +
        noteCard("Burak'tan, Finans", "Faturalamayı e-posta adresine göre yapıyoruz; ID'si olmayan müşteriler de faturalarımızda var."),
      options: [
        { label: "Sadece mükerrer kayıtlar", fb: "412 yakın ama 164 müşteri açıklanmadan kalıyor." },
        { label: "Mükerrer kayıtlar + test hesapları", correct: true, fb: "412 + 164 = 576. Fark tam bu. Finans ikisini de zaten hariç tutuyor, CRM sayıyor." },
        { label: "Mükerrer + test hesapları + eksik ID'ler", fb: "Bu 814 eder, farktan fazla. Burak'ın notu Finans'ın ID'siz müşterileri de saydığını söylüyor." },
        { label: "Eksik ID'ler + test hesapları", fb: "238 + 164 = 402. Tutmuyor; üstelik Finans eksik ID'li müşterileri zaten sayıyor." }] },
    { type: "choice", label: "Kalıcı çözüm", who: "maya",
      goal: "Veri kalitesi sorununu kaynağında çözmeyi düşünmek.",
      prompt: "Güzel. Bunun tekrar olmasını nasıl engelleriz?",
      think: ["Elle yapılan düzeltme bir sonraki ay ne olur?", "Sorun nerede doğuyor: raporda mı, kaynakta mı?"],
      hints: [{ t: "Kalıcı çözüm üç parçalıdır: kaynakta engelle, otomatik filtrele, tanımı yaz." }],
      solve: ["CRM'e Finans'ın sayısını kullandırmak sorunu saklar.", "Her ay elle temizlik unutulur ve ölçeklenmez.", "Tekil e-posta kısıtı + test alan adı filtresi + yazılı müşteri tanımı sorunu kaynağında bitirir."],
      takeaway: "Veri kalitesi sorunlarını raporda değil kaynakta çöz: kısıt, otomatik filtre, ortak tanım.",
      options: [
        { label: "CRM bundan sonra Finans'ın sayısını kullansın", fb: "Bu sorunu saklar. CRM tablosu diğer tüm analizler için kirli kalmaya devam eder." },
        { label: "Mükerrerleri her ay elle temizleyelim", fb: "Elle temizlik unutulur ve ölçeklenmez. Sorunu kaynağında çöz." },
        { label: "Tekil e-posta kuralı koy, test alan adını veri hattında filtrele ve tek bir müşteri tanımı yaz", correct: true, fb: "Kaynağı düzelt, filtreyi otomatikleştir, tanımda anlaş. Veri ekipleri bu tartışmaları böyle bitirir." }] }
  ]
},
{
  id: "case003", num: "003", title: "Yanıltıcı Ortalama", difficulty: 2, xp: 140, after: "case002",
  short: "Pazarlama, ortalama sipariş 412 ₺ olduğu için 400 ₺'lik bir paket istiyor.",
  tags: ["İstatistik", "Ortalama ve medyan"],
  rewards: { statistics: 20, dataLiteracy: 10, dataExploration: 10 },
  concept: { name: "Ortalama ve medyan", en: "mean vs median",
    text: "Veri birkaç dev değerle çarpıksa (skewed), medyan tipik durumu ortalamadan çok daha iyi anlatır.",
    points: ["Ortalama, aykırı değerlere (outlier) çok duyarlıdır; medyan değildir.", "Tek bir sayıya güvenmeden önce dağılıma (histogram) bak.", "Aykırı değerler gerçekse silme; ayrı segment olarak analiz et.", "Fiyatlama gibi kararlar 'tipik müşteriye' göre verilir."] },
  mentor: "Ortalamalar özetler, özetler de bir şeyleri saklar. Tek bir sayıya güvenmeden önce dağılıma bak.",
  portfolio: { title: "Sipariş tutarı analizi", text: "412 ₺'lik ortalama sipariş tutarının tek bir toptancı yüzünden şiştiğini, tipik siparişin 96 ₺ olduğunu gösterdim; paket fiyatlaması bu bulguyla yeniden yapıldı." },
  steps: [
    { type: "dialog", who: "zeynep", cta: "Siparişlere bak",
      lines: ["Merhaba! Ben Zeynep, Satış'tan. Pazarlama bir premium paket tasarlıyor ve fiyatı 400 ₺ koymuşlar.",
              "Mantıkları şu: ortalama sipariş tutarımız 412 ₺, yani 400 ₺'lik paket müşterilerin zaten harcadığına uyuyor. Maya basmadan önce senin bir göz atmanı istedi."] },
    { type: "choice", label: "Keşfet", explore: ["mean", "median"],
      goal: "İki ölçüyü kendin deneyip hangisinin 'tipik' siparişi temsil ettiğini görmek.",
      prompt: "Önce küçük bir örnekle başla: Kuzey bölgesinden 8 sipariş. Tipik sipariş ne kadar?",
      sub: "Grafiğin altındaki iki aracı da dene, sonra karar ver.",
      think: ["Noktaların çoğu nerede toplanıyor?", "Ortalama çizgisi noktaların çoğunun yanında mı?"],
      hints: [{ t: "Sağda tek başına duran bir sipariş var. Ortalamayı o mu çekiyor?", hl: ["aykiri"] }],
      solve: ["Ortalama 239 ₺, ama 8 siparişin 7'si 62–131 ₺ arasında.", "1.240 ₺'lik tek sipariş ortalamayı yukarı çekiyor.", "Medyan 100 ₺: siparişlerin yarısı altında, yarısı üstünde. Tipik olan bu."],
      takeaway: "Önce dağılıma bak, sonra özet ölçüyü seç. Aykırı değer varsa ortalama tipik olanı temsil etmeyebilir.",
      visual: d => chartCard("Kuzey bölgesinden 8 sipariş, ₺", dotStrip([62, 75, 88, 96, 104, 118, 131, 1240], d) +
        `<div class="stage-actions"><button class="chip-toggle ${d.mean ? "on" : ""}" data-action="vis-toggle" data-key="mean">Ortalamayı hesapla</button><button class="chip-toggle ${d.median ? "on" : ""}" data-action="vis-toggle" data-key="median">Medyanı hesapla</button></div>`),
      options: [
        { label: "Yaklaşık 239 ₺ (ortalama)", fb: "Ortalama çizgisine bak: 8 siparişin 7'si onun epey solunda. 239 ₺ bu siparişlerin çoğunu temsil etmiyor." },
        { label: "Yaklaşık 100 ₺ (medyan)", correct: true, fb: "Medyan, noktaların toplandığı yerde duruyor. Tek bir büyük sipariş onu neredeyse hiç etkilemiyor." }] },
    { type: "choice", label: "Tipik sipariş",
      goal: "Çarpık bir dağılımda 'tipik' değeri doğru ölçüyle bulmak.",
      prompt: "Şimdi 1.000 siparişin tamamı. Tipik bir müşteri sipariş başına gerçekte ne kadar harcıyor?",
      think: ["Histogramda siparişlerin çoğu hangi aralıkta toplanıyor?", "412 ₺ civarında kaç sipariş var? Ortalama gerçekten 'tipik' müşteriyi temsil ediyor mu?"],
      hints: [
        { t: "Histogramın en yüksek çubuklarına bak: siparişlerin büyük kısmı 50–150 ₺ arasında.", hl: ["50–100 ₺", "100–150 ₺"] },
        { t: "Medyan, siparişleri sıraladığında tam ortadakidir: siparişlerin yarısı bunun altında kalır. Hangi ölçü histogramın yoğun bölgesine düşüyor?", hl: ["Medyan"] }],
      solve: ["1.000 siparişin 520'si 100 ₺'nin altında.", "Medyan 96 ₺: siparişlerin yarısı bunun altında.", "Ortalama 412 ₺ ise 400 ₺ üzeri yalnızca 30 siparişin (%3) bölgesine düşüyor. Tipik değer medyandır."],
      takeaway: "Sağa çarpık dağılımda ortalama > medyan olur. 'Tipik' için medyanı kullan.",
      visual: () => kpiStrip([["Sipariş", "1.000"], ["Ortalama", "412 ₺"], ["Medyan", "96 ₺"]]) +
        chartCard("Sipariş tutarları, sipariş sayısı", histogram([
          ["0–50 ₺", 180], ["50–100 ₺", 340], ["100–150 ₺", 250], ["150–200 ₺", 120], ["200–400 ₺", 80], ["400 ₺–1 bin", 22], ["1 bin ₺+", 8]], [1, "Medyan 96 ₺"])),
      options: [
        { label: "Yaklaşık 412 ₺, yani ortalama", fb: "Histograma bak: 412 ₺ civarında neredeyse hiç sipariş yok. Ortalamayı bir şey yukarı çekiyor." },
        { label: "Yaklaşık 96 ₺, yani medyan", correct: true, fb: "Siparişlerin yarısı 96 ₺'nin altında. Tipik müşteri bu ve 400 ₺'den çok uzak." },
        { label: "1.000 ₺ ve üzeri", fb: "1.000 siparişin yalnızca 8'i bu kadar büyük. Bunlar istisna, tipik değil." }] },
    { type: "choice", label: "Aykırı değerler",
      goal: "Ortalamayı neyin çarpıttığını bulmak.",
      prompt: "Ortalama neden medyandan bu kadar yüksek?",
      think: ["En büyük siparişler kimden geliyor?", "Bu siparişler gerçek mi, hatalı mı? Fatura notunda ne yazıyor?"],
      hints: [
        { t: "En büyük üç siparişin müşteri adına bak. Aynı mı?", hl: ["#4471", "#4502", "#4610"] },
        { t: "Bu üç sipariş toplam yaklaşık 287 bin ₺. 1.000 siparişe bölündüğünde ortalamaya tek başına kaç ₺ ekler?" }],
      solve: ["Kuzey Toptan'ın üç siparişi: 118.500 + 96.200 + 72.300 ≈ 287.000 ₺.", "287.000 / 1.000 ≈ 287 ₺. Ortalamanın 412 ₺ olmasının büyük kısmı bu üç sipariş.", "Faturalar doğrulanmış; veri hatası değil, gerçek ama tipik olmayan bir müşteri."],
      takeaway: "Ortalama ile medyan arasındaki büyük fark, aykırı değer olduğunu söyler. Önce kim olduklarını bul.",
      visual: () => dataTable(["En büyük siparişler", "Müşteri", "Tutar"], [
          ["#4471", "Kuzey Toptan Ltd.", "118.500 ₺"], ["#4502", "Kuzey Toptan Ltd.", "96.200 ₺"], ["#4610", "Kuzey Toptan Ltd.", "72.300 ₺"],
          ["#4388", "Ege Ofis Malzemeleri", "4.100 ₺"], ["#4655", "Bireysel müşteri", "1.240 ₺"]]) +
        noteCard("Faturalar", "Beş siparişin hepsi doğrulanmış ve ödenmiş. Bunlar gerçek siparişler."),
      options: [
        { label: "Tek bir toptan müşteri birkaç dev sipariş verdi", correct: true, fb: "Kuzey Toptan'ın üç siparişi 287 bin ₺ ediyor. 1.000 siparişe yayıldığında ortalamayı tek başına yaklaşık 290 ₺ yükseltiyor." },
        { label: "Müşterilerin çoğu 400 ₺'den fazla harcıyor", fb: "Histogram tam tersini gösterdi: siparişlerin %90'dan fazlası 200 ₺'nin altında." },
        { label: "Bu bir veri giriş hatası", fb: "Kontrol etmek iyi refleks; ama faturalar doğrulanmış. Siparişler gerçek, sadece tipik değil." }] },
    { type: "choice", label: "Pazarlamaya öneri",
      goal: "İstatistiksel bulguyu iş kararına çevirmek.",
      prompt: "Pazarlamaya ne söylersin?",
      think: ["Paket kimin için? Bireysel müşteri mi, toptancı mı?", "Gerçek veriyi silmek doğru bir yöntem mi?"],
      hints: [
        { t: "İki farklı müşteri grubu var: tipik bireysel müşteri ve toptancı. Her birine ayrı bakmak mantıklı mı?" }],
      solve: ["400 ₺'lik paket müşterilerin %3'üne uyar.", "Gerçek veriyi silmek sonucu güzelleştirir ama yalan söyletir.", "Doğrusu: paketi medyana göre (90–120 ₺) fiyatla, toptancıyı ayrı segment olarak analiz et."],
      takeaway: "Aykırı değerleri silme, ayrı segment yap. Fiyatı tipik müşteriye göre koy.",
      options: [
        { label: "400 ₺'lik paket kalsın; ortalama bunu destekliyor", fb: "Sonuç ne olurdu? İlk ay 1.000 müşteriden 11'i paketi alır; stoklar depoda kalır. Ortalamayı tek bir toptancı şişiriyordu." },
        { label: "Paketi 90–120 ₺ civarında fiyatlayalım, toptancıları ayrı bir segment olarak ele alalım", correct: true, fb: "Bireysel fiyatlama için medyanı kullan, toptanı ayrı analiz et. Böylece iki gruba da kendine uyan bir teklif gider." },
        { label: "Ortalama normal görünsün diye toptan siparişleri silelim", fb: "Gerçek veriyi bir sayı güzel görünsün diye asla silme. Onun yerine segmentle." }] }
  ]
},
{
  id: "case004", num: "004", title: "Dashboard Krizi", difficulty: 2, xp: 160, after: "case003",
  short: "CEO kayıtların çöktüğünü düşünüyor. Grafik yalan söylüyor olabilir.",
  tags: ["Görselleştirme", "İletişim"],
  rewards: { visualization: 25, dataLiteracy: 10, businessThinking: 10 },
  concept: { name: "Dürüst grafikler", en: "honest visualization",
    text: "Eksen aralığı, bağlam ve etiketler bir grafiğin ne söylediğini belirler. Kesilmiş bir eksen %2'lik düşüşü çöküş gibi gösterebilir.",
    points: ["Çubuk grafiklerde y ekseni sıfırdan başlar; çizgi grafiklerde kesiyorsan bunu açıkça belirt.", "Kısa bir pencere normal dalgalanmayı kriz gibi gösterir; bağlam ekle.", "Değişimi sayıyla etiketle; okuyucu eğimden tahmin etmesin.", "Sıralama ve karşılaştırma için sıralı çubuk grafik, pastadan iyidir."] },
  mentor: "Grafiğin senin argümanın. İnsanlar onu yanlış okuyorsa sorun onlarda değil, grafikte.",
  portfolio: { title: "Kayıt dashboard'u yeniden tasarımı", text: "%2,4'lük mevsimsel düşüşü çöküş gibi gösteren kesik eksenli grafiği düzelttim ve CEO için başlığı yeniden yazdım." },
  steps: [
    { type: "dialog", who: "maya", cta: "Dashboard'u aç",
      lines: ["CEO sabah 7'de yazdı: 'Kayıtlar çöküyor, ne oldu?!'",
              "Rakamlara baktım ve hiçbir şeyin çöktüğünü sanmıyorum. Bence çöken grafik. Saat 10'daki toplantıdan önce düzeltebilir misin?"] },
    { type: "toggles", label: "Grafiği onar",
      goal: "Bir grafiğin hangi tasarım tercihleriyle yanıltıcı hâle geldiğini görmek.",
      prompt: "Kayıt grafiğini onar",
      sub: "Grafiği dürüst yapan düzeltmeleri aç. Hikâyenin nasıl değiştiğini izle.",
      think: ["Y ekseni nereden başlıyor? 4.830'dan 4.705'e düşüş gerçekte yüzde kaç?", "Dört haftalık pencere neyi gizliyor olabilir?", "Okuyucu değişimi eğimden mi tahmin ediyor, sayıdan mı okuyor?"],
      hints: [
        { t: "Grafiğin sol altındaki uyarıya bak: eksen 4.700'den başlıyor. Bu, küçük farkları dev gibi gösterir.", hl: ["eksen"] },
        { t: "Üç düzeltme dürüstlüğü artırır (eksen, bağlam, etiket). Biri ise duyguyu yönlendirir; o kapalı kalmalı." }],
      solve: ["Y eksenini sıfırdan başlat: düşüşün gerçek büyüklüğü görünür.", "12 haftayı göster: 4.870–5.020 arası dalgalanma normal; son dört hafta bu bandın hemen altında.", "−%2,4 etiketini ekle. Alarm kırmızısını kapalı bırak; renk karar vermeden önce panik yaratır."],
      takeaway: "Bir grafiği yayınlamadan önce sor: eksen nereden başlıyor, bağlam yeterli mi, değişim etiketli mi?",
      toggles: [
        { key: "zero", label: "Y eksenini sıfırdan başlat", good: true, note: "Orijinal eksen 4.700'den başlıyordu; küçük hareketleri abartıyordu." },
        { key: "context", label: "4 yerine 12 haftayı göster", good: true, note: "Daha uzun geçmiş, düşüşün normal mevsimsel hareket olduğunu gösteriyor." },
        { key: "label", label: "Değişimi etiketle (−%2,4)", good: true, note: "Etiketli bir sayı, insanların eğimden tahmin yürütmesini engeller." },
        { key: "alarm", label: "Çizgiyi alarm kırmızısı yap", good: false, note: "Kırmızı, kimse veriyi okumadan acil durum sinyali verir." }],
      visual: d => chartCard("Haftalık kayıtlar", signupChart(d)) },
    { type: "choice", label: "Başlık",
      goal: "Doğru ama sakin bir veri başlığı yazmak.",
      prompt: "CEO'nun toplantısı için başlığı seç.",
      think: ["Başlık değişimi sayıyla söylemeli mi?", "Hem paniği hem de inkârı önleyen ifade hangisi?"],
      hints: [{ t: "Gerçek bir düşüş var ama küçük ve normal aralıkta. Hem değişimi hem bağlamı söyleyen seçeneği ara." }],
      solve: ["'Çöküş' bozuk grafiğin hikâyesi.", "'Stabil, bir şey yok' gerçek düşüşü saklar ve güveni zedeler.", "Doğru başlık: −%2,4, 4 hafta, normal mevsimsel aralıkta."],
      takeaway: "İyi başlık = değişim + süre + bağlam. Ne abart ne sakla.",
      options: [
        { label: "Kayıtlar dördüncü haftadır çöküyor", fb: "Bu, bozuk grafiğin anlattığı hikâye. Veri çok daha sakin bir şey söylüyor." },
        { label: "Kayıtlar 4 haftada %2,4 geriledi; normal mevsimsel aralığın içinde", correct: true, fb: "Kesin, dürüst ve sakin. Değişimi adlandırıyor ve bağlamı veriyor." },
        { label: "Kayıtlar stabil, görülecek bir şey yok", fb: "Küçük ama gerçek bir düşüş var. Saklamak, biri fark ettiğinde güvenini kaybettirir." }] },
    { type: "choice", label: "Grafik seçimi", who: "maya",
      goal: "Karşılaştırma için doğru grafik türünü seçmek.",
      prompt: "Gelecek hafta CEO kayıtları altı edinim kanalına göre görmek istiyor. Hangi grafik?",
      think: ["Okuyucu ne yapacak: sıralama ve karşılaştırma mı?", "İnsan gözü açıları mı, uzunlukları mı daha iyi karşılaştırır?"],
      hints: [{ t: "Uzunlukları karşılaştırmak, açıları ya da alanları karşılaştırmaktan çok daha kolaydır.", hl: ["b"] }],
      solve: ["Pasta: altı benzer dilimi sıralamak neredeyse imkânsız.", "3D halka: öndeki dilimler perspektifle büyür, veri çarpılır.", "Sıralı çubuk: sıralama ve karşılaştırma anında okunur."],
      takeaway: "Kategorileri karşılaştırırken varsayılan seçimin sıralı çubuk grafik olsun.",
      visual: () => chartCard("Seçenek taslakları", chartSketches()),
      options: [
        { label: "A: altı dilimli pasta grafik", fb: "İnsanlar açıları karşılaştırmakta zorlanır; altı benzer dilimi sıralamak neredeyse imkânsız." },
        { label: "B: büyükten küçüğe sıralı çubuk grafik", correct: true, fb: "Sıralı çubuklar sıralamayı ve karşılaştırmayı anında okunur kılar. Sıkıcı ve tam olarak doğru." },
        { label: "C: 3D halka grafik", fb: "3D, izleyiciye yakın dilimleri çarpıtır. Bilgi değil süs ekler." }] }
  ]
},
{
  id: "case005", num: "005", title: "Korelasyon Tuzağı", difficulty: 3, xp: 180, after: "case004",
  short: "Daha çok kahve makinesi olan mağazalar daha çok satıyor. Virelio 40 makine almalı mı?",
  tags: ["İstatistik", "Nedensellik"],
  rewards: { statistics: 15, businessThinking: 15, dataExploration: 10 },
  concept: { name: "Korelasyon nedensellik değildir", en: "correlation vs causation",
    text: "İki değişken, ikisini birden etkileyen üçüncü bir faktör yüzünden birlikte hareket edebilir. Bu faktörü kontrol et ya da deney yap.",
    points: ["Bir korelasyon gördüğünde sor: gruplar arasında başka ne farklı?", "Karıştırıcı değişkeni (confounder) sabit tutup tekrar bak.", "Nedenselliği test etmenin en temiz yolu rastgele deneydir.", "Küçük pilot, büyük ve geri dönüşsüz yatırımdan önce gelir."] },
  mentor: "Biri sana bir korelasyon gösterdiğinde, gruplar arasında başka neyin farklı olduğunu sor. Genellikle bir şey farklıdır.",
  portfolio: { title: "Mağaza kahve makinesi çalışması", text: "Kahve makinesi ile satış arasındaki korelasyonun arkasında mağaza büyüklüğünün olduğunu buldum; 40 makinelik alım yerine 10 mağazalık pilot önerdim." },
  steps: [
    { type: "dialog", who: "deniz", cta: "Mağaza verisine bak",
      lines: ["Deniz ben, Operasyon'dan. Heyecan verici bir şey buldum! Daha çok kahve makinesi olan mağazalar çok daha fazla satıyor.",
              "Küçük mağazalar için 40 yeni makine sipariş etmek üzereyim. Maya önce sana danışmamı istedi. Oldukça net bir örüntü, değil mi?"] },
    { type: "choice", label: "Yakından bak",
      goal: "Bir korelasyonun arkasındaki karıştırıcı değişkeni bulmak.",
      prompt: "Bu örüntüyü başka ne açıklayabilir?",
      sub: "Grafikteki düğmeyi kullan.",
      think: ["Hangi mağazaların daha çok makinesi olur? Neden?", "Aynı faktör satışları da etkiliyor olabilir mi?"],
      hints: [
        { t: "Grafiğin altındaki 'Mağaza büyüklüğüne göre renklendir' düğmesine bas. Noktalar nasıl gruplanıyor?", hl: ["renk"] },
        { t: "Büyük mağazalar sağ üstte, küçükler sol altta. Büyüklük hem makine sayısını hem satışı belirliyor olabilir mi?" }],
      solve: ["Renklendirince üç küme çıkıyor: küçük, orta, büyük.", "Büyük mağazaların daha çok personeli ve alanı var, bu yüzden daha çok makinesi var.", "Aynı büyüklük daha çok müşteri ve satış getiriyor. İki değişkeni de büyüklük yönlendiriyor."],
      takeaway: "Korelasyon gördüğünde üçüncü bir değişkene göre renklendir ya da grupla.",
      visual: d => chartCard("24 mağaza: kahve makinesi ve aylık satış", storeScatter(!!d.bySize) +
        `<div class="stage-actions" data-hl="renk"><button class="chip-toggle ${d.bySize ? "on" : ""}" data-action="vis-toggle" data-key="bySize">${d.bySize ? "Mağaza büyüklüğüne göre renkli" : "Mağaza büyüklüğüne göre renklendir"}</button></div>`),
      options: [
        { label: "Kahve müşterileri daha uzun tutuyor ve daha çok aldırıyor", fb: "Bu nedensel bir hikâye; makul gelebilir ama bu veri onu test etmiyor. Mağaza büyüklüğüne göre renklendirmeyi dene." },
        { label: "Büyük mağazaların hem daha çok makinesi hem daha çok müşterisi var", correct: true, fb: "Mağaza büyüklüğü ikisini de yönlendiriyor. Büyük mağazalar daha çok personel ve alan nedeniyle daha çok makine alıyor; büyük oldukları için de daha çok satıyor." },
        { label: "Bu tesadüfi gürültü", fb: "24 mağazada güçlü bir örüntü var. Gerçek; sadece göründüğü şey değil." }] },
    { type: "choice", label: "Büyüklüğü sabitle",
      goal: "Karıştırıcıyı sabit tutarak ilişkiyi yeniden test etmek.",
      prompt: "Aynı büyüklükteki mağazaları karşılaştır. İlişki devam ediyor mu?",
      think: ["Her büyüklük grubunun içinde iki çubuğu karşılaştır.", "Fark büyük mü, yok denecek kadar küçük mü?"],
      hints: [{ t: "Küçük: 41'e 42. Orta: 78'e 77. Büyük: 131'e 133. Bu farklar anlamlı mı?", hl: ["Küçük", "Orta", "Büyük"] }],
      solve: ["Her grup içinde fark ±2 bin ₺, yani neredeyse sıfır.", "Benzer mağazaları karşılaştırınca makine etkisi kayboluyor.", "Korelasyonun tamamı mağaza büyüklüğünden geliyordu."],
      takeaway: "Karıştırıcıyı sabit tuttuğunda ilişki kayboluyorsa, ilişki nedensel değildi.",
      visual: () => chartCard("Büyüklük grubuna göre ortalama aylık satış, bin ₺", groupedBars([
          { label: "Küçük", a: 41, b: 42 }, { label: "Orta", a: 78, b: 77 }, { label: "Büyük", a: 131, b: 133 }], ["Az makine", "Çok makine"])),
      options: [
        { label: "Evet, daha çok makine hâlâ çok daha yüksek satış demek", fb: "Her büyüklük grubunda çubuklar neredeyse aynı. Makineler görünür bir fark yaratmıyor." },
        { label: "Hayır, her grup içinde satışlar hemen hemen aynı", correct: true, fb: "Benzerini benzeriyle karşılaştırınca etki kayboluyor. Karıştırıcı mağaza büyüklüğüydü." }] },
    { type: "choice", label: "Öneri",
      goal: "Nedenselliği test edecek ucuz bir yol önermek.",
      prompt: "Deniz'e ne önerirsin?",
      think: ["Makinelerin etkisini gerçekten öğrenmenin en temiz yolu nedir?", "40 makine almadan önce riski nasıl küçültürsün?"],
      hints: [{ t: "Rastgele seçilmiş mağazalarda küçük bir deney, etkiyi doğrudan ölçer. Kontrol grubu da gerekir." }],
      solve: ["40 makine almak: korelasyon büyüklükten geliyor; muhtemelen hiçbir şey değişmez.", "Makineleri kaldırmak: aynı hatanın tersi.", "Rastgele 5 mağazaya makine ekle, 5 benzer mağazayla karşılaştır: nedeni doğrudan test eder ve ucuzdur."],
      takeaway: "Emin değilsen önce küçük, rastgele bir pilot yap. Deney, korelasyondan daha güçlü kanıttır.",
      options: [
        { label: "40 makinenin hepsini alalım; korelasyon güçlü", fb: "Korelasyon güçlü ama mağaza büyüklüğünden geliyor. Bütçeyi harcarsın ve muhtemelen değişim görmezsin." },
        { label: "Şimdilik alma. Rastgele 5 mağazada pilot yap ve 5 benzer mağazayla karşılaştır", correct: true, fb: "Küçük ve rastgele bir pilot nedeni doğrudan test eder, maliyeti de tam siparişin küçük bir kısmıdır." },
        { label: "Para kazanmak için büyük mağazalardan makineleri kaldıralım", fb: "Aynı hatanın tersi. Veri makinelerin satışı iki yönde de etkilediğini göstermiyor." }] }
  ]
},
{
  id: "case006", num: "006", title: "Yönetim Kurulu Sorusu", difficulty: 3, xp: 250, after: "case005", promotion: true,
  short: "Yönetim kurulu toplantısından önce müşteri kaybı arttı. Terfi vakan.",
  tags: ["Terfi", "Tüm beceriler"],
  rewards: { dataQuality: 5, statistics: 5, businessThinking: 8, visualization: 5, dataExploration: 5, dataLiteracy: 5 },
  concept: { name: "Uçtan uca analiz", en: "end-to-end analysis",
    text: "Temizle, segmentle, dürüstçe özetle, net görselleştir, sonra öner. İşin tamamı bu, bu sırayla.",
    points: ["Temizle (Vaka 002): mükerrer ve test kayıtları oranları şişirir.", "Segmentle (Vaka 001): artış tek bir gruptan gelebilir.", "Özetle (Vaka 003): çarpık değerlerde medyan.", "Göster (Vaka 004): trend ve bağlam.", "Öner (Vaka 005): nedenle orantılı ve ölçülebilir aksiyon."] },
  mentor: "Saymadan önce temizledin, suçlamadan önce segmentledin, sorulmadan önerdin. Analist ekibine hoş geldin.",
  portfolio: { title: "Yönetim kurulu churn brifingi", text: "Aylık müşteri kaybının %3,1'den %4,0'a (temizlik sonrası) çıkışının tek bir kampanya kohortundan geldiğini, çekirdek kaybın sabit olduğunu gösterdim." },
  steps: [
    { type: "dialog", who: "maya", cta: "Terfi vakasını başlat",
      lines: ["Bu biraz farklı. Aylık müşteri kaybı (churn) %3,1'den %4,6'ya çıktı ve yönetim kurulu cuma toplanıyor.",
              "Bu senin terfi vakan. Bu sbuser ipuçlarım yalnızca hatırlatma olacak: önceki vakalarda öğrendiklerin. Sırayla git: temizle, segmentle, özetle, göster, öner."] },
    { type: "choice", label: "Temizle",
      goal: "Oran hesaplamadan önce veriyi temizlemek.",
      prompt: "Kaybı hesaplamadan önce hangi kayıtlar hariç tutulmalı?",
      think: ["Hangi kayıtlar gerçek bir müşteri kaybını temsil etmiyor?", "Eksik bir alan, kaydı geçersiz yapar mı?"],
      hints: [{ t: "Hatırlatma, Vaka 002: mükerrer ve test kayıtları sayıları şişirir. Eksik bir şehir bilgisi ise müşterinin gerçekten ayrıldığı gerçeğini değiştirmez." }],
      solve: ["Mükerrer iptal olayları aynı kaybı iki kez sayar: çıkar.", "Test hesapları gerçek müşteri değil: çıkar.", "Şehri eksik müşteriler gerçekten ayrıldı: tut. Temizlik sonrası churn %4,0."],
      takeaway: "Önce temizle, sonra oran hesapla. Eksik bir alan kaydı otomatik olarak geçersiz yapmaz.",
      visual: () => dataTable(["Profilleme sonucu", "Satır"], [["İptal olayı", "1.240"], ["Mükerrer iptal (aynı müşteri, aynı gün)", "180"], ["Test hesabı", "40"], ["Şehri kayıtlı olmayan müşteri", "95"]]),
      options: [
        { label: "Hiçbirini; ham tabloyu kullan", fb: "Mükerrer ve test kayıtları kaybı şişirir. Vaka 002'de tam olarak bunu düzelttin." },
        { label: "Mükerrer iptaller ve test hesapları", correct: true, fb: "220 hatalı satırı çıkarınca churn %4,6 değil %4,0. Hâlâ %3,1'in üstünde ama hikâye şimdiden farklı." },
        { label: "Mükerrerler, test hesapları ve şehri eksik müşteriler", fb: "Eksik şehir bilgisi bir iptali geçersiz yapmaz. Onlar gerçekten ayrılan gerçek müşteriler." }] },
    { type: "choice", label: "Segmentle",
      goal: "Artışın kaynağını segmentlerde bulmak.",
      prompt: "Artış nereden geliyor?",
      think: ["Hangi satır diğerlerinden belirgin biçimde farklı?", "Değişim tüm planlara yayılmış mı, tek bir gruba mı yoğunlaşmış?"],
      hints: [{ t: "Hatırlatma, Vaka 001: toplam bir sayı nerede olduğunu söylemez. Tabloda diğerlerinden çok farklı tek bir satır var.", hl: ["Ağustos TikTok kampanyasıyla gelen"] }],
      solve: ["Basic, Pro ve Yıllık plan değişimleri 0,1 puan civarında: gürültü.", "Ağustos TikTok kampanyasıyla gelen kohortun kaybı %11,8.", "Artışın kaynağı tek bir edinim kohortu."],
      takeaway: "Ortalama bir artış çoğu zaman tek bir segmentteki büyük artıştır. Satır satır bak.",
      visual: () => dataTable(["Segment", "Geçen ay", "Bu ay"], [
          ["Basic plan", "%3,0", "%3,1"], ["Pro plan", "%3,2", "%3,3"], ["Yıllık plan", "%1,1", "%1,0"],
          ["Ağustos TikTok kampanyasıyla gelen", "yok", "%11,8"], ["Diğer tüm yeni müşteriler", "%3,4", "%3,5"]]),
      options: [
        { label: "Pro plan", fb: "Pro 0,1 puan oynamış. Bu gürültü." },
        { label: "Ağustos TikTok kampanyasıyla gelen müşteriler", correct: true, fb: "Kampanya kohortu %11,8 kayıpla ayrılıyor, diğer herkes sabit. Artışı tek bir segment açıklıyor." },
        { label: "Tüm müşterilere eşit dağılmış", fb: "Her plan sabit. Diğerlerinden farklı olan tek satırı ara." }] },
    { type: "choice", label: "Özetle",
      goal: "Çarpık bir değeri doğru ölçüyle raporlamak.",
      prompt: "Kampanya kohortunun 'ortalama yaşam boyu değeri' 210 ₺, diğerlerininki 95 ₺. Neyi raporlarsın?",
      think: ["Ortalama ile medyan arasındaki fark ne söylüyor?", "Notta ortalamayı etkileyebilecek bir şey var mı?"],
      hints: [{ t: "Hatırlatma, Vaka 003: birkaç dev değer ortalamayı çeker. Nota bak: üç kurumsal hesap.", hl: ["Not"] }],
      solve: ["Kampanya kohortunda ortalama 210 ₺, medyan 38 ₺: büyük fark, aykırı değer var.", "Üç kurumsal hesap tesadüfen kampanya linkiyle gelmiş ve ortalamayı şişiriyor.", "Tipik kampanya müşterisi 38 ₺ değerinde; diğerlerinin medyanı 92 ₺. Medyanı raporla."],
      takeaway: "Ortalama ve medyan çok farklıysa, kararı medyana göre ver ve aykırı değerleri ayrıca açıkla.",
      visual: () => kpiStrip([["Kampanya ortalaması", "210 ₺"], ["Kampanya medyanı", "38 ₺"], ["Diğerlerinin medyanı", "92 ₺"]]) +
        noteCard("Not", "Üç kurumsal hesap aynı hafta içinde tesadüfen kampanya linki üzerinden kaydoldu."),
      options: [
        { label: "Ortalamayı: kampanya müşterileri iki kattan fazla değerli", fb: "O ortalamayı üç kurumsal hesap şişiriyor. Vaka 003'ün aynısı." },
        { label: "Medyanı: tipik kampanya müşterisi 38 ₺ değerinde, diğerlerinin çok altında", correct: true, fb: "Medyan gerçek tabloyu gösteriyor: kampanya müşterilerinin çoğu düşük değerli ve hızla ayrılıyor." }] },
    { type: "choice", label: "Görselleştir",
      goal: "Yönetim kurulu için trendi, bağlamı ve nedeni tek görselde göstermek.",
      prompt: "Yönetim kurulu slaytına hangi görsel girer?",
      think: ["Kurul neyi görmeli: tek bir sayıyı mı, zaman içindeki değişimi ve nedenini mi?"],
      hints: [{ t: "Hatırlatma, Vaka 004: bağlam ve zaman trendi olmadan tek sayı yanıltır. Nedeni de aynı grafikte gösterebilen seçeneği ara." }],
      solve: ["Gösterge (gauge): tek sayı, karşılaştırma yok, neden yok.", "Pasta: zaman trendini saklar; neden plan türü de değil.", "12 aylık çizgi + kampanya kohortu ayrı çizgi: trend, bağlam ve neden tek bakışta."],
      takeaway: "Yönetim görseli beş saniyede okunmalı: trend + bağlam + neden.",
      options: [
        { label: "Churn'ü kırmızı %4,0 olarak gösteren bir gösterge", fb: "Gösterge tek bir sayıyı karşılaştırma ve neden olmadan gösterir." },
        { label: "Kampanya kohortunun ayrı çizgi olarak gösterildiği 12 aylık churn çizgisi", correct: true, fb: "Trendi, bağlamı ve nedeni tek resimde gösteriyor. Kurul üyeleri beş saniyede anlar." },
        { label: "Plana göre kaybedilen müşterilerin pasta grafiği", fb: "Pasta zaman trendini saklar; üstelik neden plan türü değil." }] },
    { type: "choice", label: "Öner",
      goal: "Nedenle orantılı ve ölçülebilir bir aksiyon önermek.",
      prompt: "Yönetim kuruluna önerin:",
      think: ["Sorun tüm müşterilerde mi, tek bir kohortta mı?", "Önerin nasıl ölçülecek?"],
      hints: [{ t: "Hatırlatma, Vaka 001 ve 005: aksiyon nedenle orantılı olmalı ve ölçülebilmeli. Sorunu yerinde çözen seçeneği ara." }],
      solve: ["Tüm pazarlamayı durdurmak: çekirdek kayıp sabitken büyümeyi öldürür.", "Hiçbir şey yapmamak: bir kanal bir ay içinde ayrılan müşteri getiriyor.", "Kampanyayı tut, kampanya müşterilerine onboarding ekle, kohort tutundurmayı ölç."],
      takeaway: "Öneri = nedeni hedefleyen aksiyon + ölçüm planı.",
      options: [
        { label: "Churn düzelene kadar tüm pazarlamayı durduralım", fb: "Çekirdek kayıp sabit. Tüm pazarlamayı durdurmak tek kohortluk bir sorun için büyümeyi baltalar." },
        { label: "Çekirdek churn yaklaşık %3,1'de sabit. Artış Ağustos kampanya kohortundan geliyor. Kampanyaları sürdürelim ama kampanya kayıtlarına onboarding ekleyip kohort tutundurmayı izleyelim.", correct: true, fb: "Temiz sayılar, kesin bir neden, orantılı bir çözüm ve ölçüm planı. Terfiyi hak eden bir cevap." },
        { label: "%4,0 sektör normlarının içinde, aksiyon gerekmez", fb: "Konu normlar değil. Bir edinim kanalı bir ay içinde ayrılan müşteriler getiriyor; bu düzeltilmeye değer." }] }
  ]
}
];
const CASE_BY_ID = Object.fromEntries(CASES.map(c => [c.id, c]));

/* ---------------------------------------------------------------------
   YAN GÖREVLER — ofisteki kişi ve nesnelere bağlı kısa, isteğe bağlı görevler
   --------------------------------------------------------------------- */
const QUESTS = [
{
  id: "sq_coffee", hot: "coffee", who: "deniz", after: "case001", title: "Kahve makinesi deneyi", xp: 40,
  rewards: { statistics: 8, businessThinking: 4 }, lesson: "Tek günlük küçük sayılar kanıt değildir. Yeterli veri topla ve konum gibi bariz yanlılıkları ortadan kaldır.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Bakalım",
      lines: ["Ah, yeni veri insanı sen misin? Tam zamanında.", "Eskisinin yanına yeni bir espresso makinesi koyduk. Pazartesi yenisi 14, eskisi 9 fincan verdi. Yeni modelden beş tane daha sipariş etmek üzereyim."] },
    { type: "choice", prompt: "Deniz'e tavsiyen ne?",
      goal: "Küçük örnek ve yenilik etkisini fark etmek.",
      think: ["Bir günlük veri ne kadar güvenilir?", "Yeni makinenin başka bir avantajı (konum, yenilik) olabilir mi?"],
      hints: [{ t: "Toplam 23 fincan ve yeni makine ilk gününde. 'Yenilik etkisi' ve konum sonucu etkileyebilir; ikisini de nasıl ortadan kaldırırsın?" }],
      solve: ["Bir gün ve 23 fincan çok küçük bir örnek.", "Yeni makine merak çeker (yenilik etkisi) ve kapıya daha yakın olabilir.", "İki hafta veri topla ve yarıda yerlerini değiştir."],
      takeaway: "Karar vermeden önce yeterli süre veri topla ve bariz avantajları (konum, yenilik) dengele.",
      visual: () => chartCard("Pazartesi, verilen fincan", groupedBars([{ label: "Pazartesi", a: 14, b: 9 }], ["Yeni makine", "Eski makine"])),
      options: [
        { label: "14'e 9 açık ara kazanç. Sipariş ver.", fb: "Bir gün, 23 fincan ve yeni makine pırıl pırıl. Gerçek para harcamak için yeterli değil." },
        { label: "İki hafta veri topla ve yarısında makinelerin yerlerini değiştir", correct: true, fb: "İki hafta yenilik etkisini yumuşatır, yer değişimi de 'kapıya yakın' avantajını ortadan kaldırır." },
        { label: "Hangisini tercih ettiklerini soran bir anket gönder", fb: "İnsanların söylediğiyle yaptığı çoğu zaman farklıdır. Elinde kullanım verisi var; sadece daha fazlasını topla." }] },
    { type: "dialog", who: "deniz", cta: "Harika",
      lines: ["İki hafta sonra: yerlerini değiştirdikten sonra yeni makine 112, eski makine 108 fincan.", "Yani neredeyse berabere. Bütçemi kurtardın. Bu hafta kahveler benden."] }
  ]
},
{
  id: "sq_whiteboard", hot: "whiteboard", who: "maya", after: "case001", title: "Beyaz tahtadaki KPI", xp: 30,
  rewards: { dataLiteracy: 8, statistics: 2 }, lesson: "%2'den %3'e çıkış +1 yüzde puandır ama göreli olarak %50 artıştır. Hangisini kastettiğini her zaman söyle.",
  steps: [
    { type: "choice", prompt: "Biri tahtaya bunu yazmış. Doğru ifade hangisi?",
      goal: "Yüzde puan ile yüzdesel değişimi ayırmak.",
      think: ["Mutlak fark kaç puan?", "Göreli değişim: fark / başlangıç değeri."],
      hints: [{ t: "Mutlak fark: 3 − 2 = 1 puan. Göreli değişim: 1 / 2 = ?" }],
      solve: ["Mutlak fark: 3 − 2 = 1 yüzde puan (pp).", "Göreli değişim: 1 / 2 = %50.", "Doğru ifade: +1 yüzde puan, yani %50 göreli artış."],
      takeaway: "Oranlar arasındaki farkı 'yüzde puan' ile, göreli değişimi '%' ile söyle.",
      visual: () => `<div class="whiteboard-card"><span class="marker-text">Dönüşüm oranı<br>Q2: %2 → Q3: %3<br><b>= %1 artış!!</b></span></div>`,
      options: [
        { label: "Doğru: %1 artış", fb: "Fark 1 yüzde puan; ama oran başlangıç değerinin yarısı kadar arttı. '%1' bunu küçümser." },
        { label: "+1 yüzde puan, yani %50 göreli artış", correct: true, fb: "Aynen. Mutlak fark için yüzde puan, göreli değişim için yüzde." },
        { label: "%150 artış", fb: "3, 2'nin %150'si; yani artış %150 değil %50." }] }
  ]
},
{
  id: "sq_printer", hot: "teamboard", who: "deniz", after: "case001", title: "Panodaki tuhaf rapor", xp: 40,
  rewards: { dataQuality: 10, dataLiteracy: 2 }, lesson: "Karışık tarih formatları (GG/AA ve AA/GG) veriyi sessizce yanlış aya taşır. Tarihleri içe aktarırken kaynağa göre okuyup ISO formatına çevir.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Göster",
      lines: ["Aylık sipariş raporunu panoya astım ama tuhaf: bazı aylar neredeyse boş, bazılarında açıklanamayan sıçramalar var.", "Kimse o sıçramaları hatırlamıyor. Ham satırlara bakabilir misin?"] },
    { type: "choice", prompt: "Bu tarihlerde neler oluyor?",
      goal: "Tarih formatı uyumsuzluğunu tanımak.",
      think: ["Hangi satırlarda 'kastedilen' ile 'raporun okuduğu' tarih farklı?", "Hatalı satırların ortak noktası ne?"],
      hints: [{ t: "Hatalı satırların hepsi aynı kaynaktan geliyor. O kaynak tarihi hangi sırayla yazıyor olabilir?", hl: ["AB web mağazası"] }],
      solve: ["AB mağazası tarihleri GG/AA, ABD mağazası AA/GG yazıyor.", "Rapor hepsini AA/GG okuyor; AB siparişleri yanlış aylara düşüyor (4 Mayıs → 5 Nisan, 12 Nisan → 4 Aralık).", "Çözüm: içe aktarırken kaynağa göre oku ve ISO formatına (YYYY-AA-GG) çevir."],
      takeaway: "Birden fazla kaynaktan gelen tarihleri kaynağına göre okuyup ISO formatında sakla.",
      visual: () => dataTable(["Kaynak", "order_date (ham)", "Kastedilen", "Raporun okuduğu"], [
          ["AB web mağazası", "04/05/2024", "4 Mayıs", neg("5 Nisan")], ["ABD web mağazası", "04/05/2024", "5 Nisan", "5 Nisan"],
          ["AB web mağazası", "02/04/2024", "2 Nisan", neg("4 Şubat")], ["ABD web mağazası", "05/02/2024", "2 Mayıs", "2 Mayıs"],
          ["AB web mağazası", "12/04/2024", "12 Nisan", neg("4 Aralık")]], { mono: true }),
      options: [
        { label: "İki web mağazası tarihleri farklı formatlarda yazıyor", correct: true, fb: "AB mağazası gün/ay, ABD mağazası ay/gün yazıyor; rapor hepsini ay/gün okuyor. AB siparişleri yanlış aylara zıplıyor." },
        { label: "O aylar gerçekten yoğun ya da durgundu", fb: "Son iki sütunu karşılaştır: aynı sipariş raporda başka bir aya düşüyor." },
        { label: "Rapor yanlış basılmış", fb: "Yazıcı kendisine verileni bastı. Sorun daha yukarıda, veride." }] }
  ]
},
{
  id: "sq_teamboard", hot: "teamboard", who: "maya", after: "case001", title: "Bu KPI kimin?", xp: 35,
  rewards: { dataLiteracy: 5, businessThinking: 6 }, lesson: "Sahibi, tanımı ve güncellenme sıklığı olmayan bir KPI, karar aracı değil tekrarlayan bir tartışma olur.",
  steps: [
    { type: "choice", prompt: "Panoda “Aktif Müşteri” yazıyor. Metrik yayına girmeden önce yanına ne yazılmalı?",
      goal: "Bir metriğin 'sözleşmesini' tanımlamak.",
      think: ["Vaka 002'de iki ekip neden farklı sayı raporluyordu?", "Bir metriğe kim sahip çıkacak, ne zaman güncellenecek?"],
      hints: [{ t: "Vaka 002'yi hatırla: sorun tanımdaydı. Tanım, sahip, kaynak ve güncellenme sıklığı bir metriğin sözleşmesidir." }],
      solve: ["Sadece hedef yazmak, 'aktif'in ne demek olduğunu herkesin yorumuna bırakır.", "Renkli ok yönetim değildir.", "Tanım + sahip + kaynak + güncellenme sıklığı = metrik sözleşmesi."],
      takeaway: "Her KPI'ın yazılı bir tanımı, sahibi, kaynağı ve güncellenme sıklığı olmalı.",
      visual: () => noteCard("Takım panosu", "AKTİF MÜŞTERİ — hedef: bu çeyrek +%8"),
      options: [
        { label: "Sadece hedef. Aktif müşterinin ne olduğunu herkes bilir.", fb: "Vaka 002 bu varsayımın neden tehlikeli olduğunu gösterdi." },
        { label: "Tanım, sahip, kaynak ve güncellenme sıklığı", correct: true, fb: "Artık metriğin bir sözleşmesi var: ne demek, kime ait, nereden gelir ve ne zaman güncellenir." },
        { label: "Yöneticiler önemli olduğunu anlasın diye yeşil bir ok", fb: "Renk yönetişim değildir. Belirsizlik olduğu gibi kalır." }] }
  ]
},
{
  id: "sq_alex", hot: "alex", who: "alex", after: "case002", title: "Alex'in pivot tablosu", xp: 50,
  rewards: { dataExploration: 10, dataLiteracy: 4 }, lesson: "Ortalamaların ortalaması grup büyüklüklerini yok sayar. Ağırlıklı ortalama kullan: toplam değer / toplam adet.",
  steps: [
    { type: "dialog", who: "alex", cta: "Bakayım",
      lines: ["Selam, ben Alex. Müşteri tablosunu temizlediğini duydum. Saygılar.", "Hızlı bir kontrol yapar mısın? Şirket geneli ortalama sipariş tutarı lazım. Dört bölge ortalamasının ortalamasını aldım, 100 ₺ çıktı. Bir şey tuhaf geliyor."] },
    { type: "choice", prompt: "Doğru şirket geneli ortalama sipariş tutarı nedir?",
      goal: "Ağırlıklı ortalamayı hesaplamak.",
      think: ["Her bölgenin sipariş sayısı aynı mı?", "Büyük bölge sonuca daha çok etki etmeli mi?"],
      hints: [
        { t: "İstanbul'un 6.000 siparişi var, Bursa'nın 500. Alex'in formülü ikisine eşit ağırlık veriyor.", hl: ["İstanbul", "Bursa"] },
        { t: "Her bölgenin toplam tutarını hesapla (sipariş × ortalama), hepsini topla, toplam sipariş sayısına (10.000) böl." }],
      solve: ["İstanbul 6.000 × 120 = 720.000; Ankara 2.000 × 95 = 190.000.", "İzmir 1.500 × 80 = 120.000; Bursa 500 × 105 = 52.500.", "Toplam 1.082.500 / 10.000 ≈ 108 ₺."],
      takeaway: "Farklı büyüklükteki grupları birleştirirken ağırlıklı ortalama kullan.",
      visual: () => dataTable(["Bölge", "Sipariş", "Ort. sipariş"], [["İstanbul", "6.000", "120 ₺"], ["Ankara", "2.000", "95 ₺"], ["İzmir", "1.500", "80 ₺"], ["Bursa", "500", "105 ₺"]]) +
        noteCard("Alex'in formülü", "(120 + 95 + 80 + 105) / 4 = 100 ₺"),
      options: [
        { label: "100 ₺ doğru", fb: "Bu, Bursa'nın 500 siparişini İstanbul'un 6.000 siparişiyle eşit sayıyor. Her bölgenin kendi ağırlığı olmalı." },
        { label: "Yaklaşık 108 ₺, sipariş sayısıyla ağırlıklandırılmış", correct: true, fb: "(6000×120 + 2000×95 + 1500×80 + 500×105) / 10.000 ≈ 108 ₺. Büyük bölgeler olması gerektiği gibi daha çok sayılıyor." },
        { label: "120 ₺, en büyük bölgeyi kullan", fb: "İstanbul en büyük bölge ama şirketin tamamı değil." }] },
    { type: "dialog", who: "alex", cta: "Ne zaman istersen",
      lines: ["Ağırlıklı ortalama, tabii ya. Notlarıma ekliyorum.", "Hızlısın. Bir vakada ikinci bir göz istersen masam hemen şurada."] }
  ]
},
{
  id: "sq_lunch", hot: "coffee", who: "deniz", after: "case002", title: "Öğle yemeği anketi", xp: 40,
  rewards: { statistics: 6, dataQuality: 5 }, lesson: "Ankete kimin cevap verdiği sonucu belirler. Seçim yanlılığı bir anketin gerçeğin tam tersini söylemesine yol açabilir.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Hmm",
      lines: ["Müjde: insanların %92'si yeni yemekhaneye bayılıyor! 12:30'da Slack'te anket açtım, sonuçlar harika.", "Yemekhane sözleşmesini üç yıl uzatacağım."] },
    { type: "choice", prompt: "Bu anketin sorunu ne?",
      goal: "Seçim yanlılığını (selection bias) fark etmek.",
      think: ["Anket açıkken yemekhaneyi kullananlar neredeydi?", "Cevap verenler tüm çalışanları temsil ediyor mu?"],
      hints: [{ t: "Anketin açık olduğu saat ile yemekhanenin yoğun olduğu saati karşılaştır.", hl: ["Anket detayları"] }],
      solve: ["Anket 12:30–13:00 arası açıktı; yemekhane kullananlar o saatte masada değildi.", "Cevap verenler çoğunlukla yemekhaneyi kullanmayanlardı.", "Sonuç, en ilgili kişilerin görüşünü dışarıda bırakıyor: seçim yanlılığı."],
      takeaway: "Bir anket sonucunu okumadan önce sor: kim cevap verdi, kim veremedi?",
      visual: () => kpiStrip([["Yanıt", "48"], ["Bayıldı", "%92"], ["Çalışan", "210"]]) +
        noteCard("Anket detayları", "Slack'te 12:30'da açıldı, 13:00'te kapandı. Yemekhaneyi kullananların çoğu 12:15–13:15 arası orada."),
      options: [
        { label: "48 yanıt bir şey söylemek için çok az", fb: "Az, evet; ama asıl sorun o 48 kişinin kim olduğu." },
        { label: "Yemekhanedekiler Slack'ten uzaktaydı; anket çoğunlukla yemekhaneyi kullanmayanlara ulaştı", correct: true, fb: "Seçim yanlılığı. En ilgili görüşe sahip kişiler cevap verme ihtimali en düşük olanlardı." },
        { label: "%92 şüpheli derecede yüksek, sahte olmalı", fb: "Sayı gerçek. Sadece Deniz'in sandığından farklı bir grubu anlatıyor." }] }
  ]
},
{
  id: "sq_inbox", hot: "inbox", who: "zeynep", after: "case002", title: "Acil Slack talebi", xp: 35,
  rewards: { businessThinking: 7, dataExploration: 3 }, lesson: "Acil talepler de bir karar sorusuna ihtiyaç duyar. Kapsamı netleştirmek analizin parçasıdır, gecikme değil.",
  steps: [
    { type: "dialog", who: "zeynep", cta: "Mesajı oku",
      lines: ["ACİL: Toplantı için müşteri performansını gönderebilir misin?", "Toplantı kırk dakika sonra başlıyor. Talebin tamamı bu."] },
    { type: "choice", prompt: "İlk cevabın ne olur?",
      goal: "Belirsiz bir talebi netleştirmek.",
      think: ["'Müşteri performansı' kaç farklı şey demek olabilir?", "Hangi bilgiler olmadan doğru analizi yapamazsın?"],
      hints: [{ t: "Üç kısa soru belirsiz bir talebi odaklı bir analize çevirir: hangi karar, hangi kitle, hangi dönem?" }],
      solve: ["Dev bir tablo göndermek hızlıdır ama Zeynep cevabı yine kendisi bulmak zorunda kalır.", "Tahmin etmek bazen tutar ama yanlış cevap tek soru sormaktan daha yavaştır.", "Karar, kitle ve dönemi sormak 40 dakikayı en verimli kullanır."],
      takeaway: "Veri çekmeden önce sor: hangi karar, kimin için, hangi dönem?",
      options: [
        { label: "Tüm müşteri metriklerini dışa aktar ve büyük bir tablo gönder", fb: "Hızlı çıktı, düşük fayda. Zeynep cevabı yine kendisi bulmak zorunda kalır." },
        { label: "Toplantının hangi kararı vereceğini, kitleyi ve dönemi sor", correct: true, fb: "Üç kısa soru belirsiz bir talebi odaklı bir analize çevirir." },
        { label: "Gelir genelde önemlidir, geçen ayın gelirini gönder", fb: "Belki tutar; ama karar bağlamını tahmin etmek önlenebilir bir risk." }] }
  ]
},
{
  id: "sq_selin", hot: "lounge", who: "zeynep", after: "case003", title: "Yarısı gitti, yarısı geldi", xp: 40,
  rewards: { dataLiteracy: 6, businessThinking: 6 }, lesson: "Yüzdesel değişimler simetrik değildir: %50 düşüşü telafi etmek için %100 artış gerekir. Her zaman başlangıç değerine göre hesapla.",
  steps: [
    { type: "dialog", who: "zeynep", cta: "Hesaplayalım",
      lines: ["Paket analizi için tekrar teşekkürler! Hızlı bir soru:", "Bir ürünün satışları Q1'de %50 düştü, Q2'de %50 arttı. Yani başa döndük, değil mi? Sunumuma öyle yazacağım."] },
    { type: "choice", prompt: "Zeynep'e ne söylersin?",
      goal: "Yüzdesel değişimlerin hangi tabana göre hesaplandığını görmek.",
      think: ["Başlangıcı 100 kabul et. %50 düşüş sonrası kaç olur?", "Yeni değerin %50 artışı, eski değerin %50'siyle aynı şey mi?"],
      hints: [{ t: "100 → %50 düşüş → 50. Şimdi 50'nin %50 fazlası kaç?", hl: ["Q2"] }],
      solve: ["100'den %50 düşüş: 50.", "50'nin %50 artışı: 75. Başlangıcın %25 altındayız.", "Başa dönmek için 50'den %100 artış gerekirdi."],
      takeaway: "Yüzde değişim her sbuserinde yeni tabana göre hesaplanır; düşüş ve artış birbirini sıfırlamaz.",
      visual: () => kpiStrip([["Başlangıç", "100"], ["Q1 (−%50)", "50"], ["Q2 (+%50)", "?"]]),
      options: [
        { label: "Evet, −%50 ve +%50 birbirini götürür", fb: "100'ün yarısı 50, 50'nin %50 fazlası 75. Başa dönülmedi." },
        { label: "Hayır, satışlar başlangıcın %25 altında; telafi için %100 artış gerekirdi", correct: true, fb: "Aynen. Artış daha küçük bir tabana uygulandığı için kaybı kapatmıyor." },
        { label: "Başlangıcın %50 üstündeyiz", fb: "Q2'deki artış Q1'deki düşüşü bile kapatmıyor. Değerleri 100'den başlayarak hesapla." }] }
  ]
},
{
  id: "sq_mentor", hot: "maya", who: "maya", after: "case003", title: "Maya ile birebir", xp: 50,
  rewards: { businessThinking: 8, visualization: 4 }, lesson: "Bir bulgu, 'peki ne olacak' (so what) eklendiğinde içgörüye dönüşür: bir karar için ne anlama geldiği.",
  steps: [
    { type: "dialog", who: "maya", cta: "Tabii",
      lines: ["On dakikan var mı? Seninle bir şeyi çalışmak istiyorum: 'peki ne olacak?' sorusu.", "Medyan siparişin 96 ₺ olduğunu buldun. Harika. Şimdi pazarlama direktörünün 'peki ne olacak?' dediğini düşün."] },
    { type: "choice", prompt: "En güçlü 'peki ne olacak' cevabını seç.",
      goal: "Bulguyu karara bağlamak.",
      think: ["Hangi cevap bir kararı değiştirir?", "Direktörün umurunda olan ne: istatistik terimi mi, müşteri ve fiyat mı?"],
      hints: [{ t: "Bulguyu tekrar etmek ya da teknik terim kullanmak yetmez. Hangi seçenek bir fiyat kararına bağlanıyor?" }],
      solve: ["'Medyan 96, ortalama 412' bulgunun kendisi.", "'Sağa çarpık' doğru ama direktör çarpıklık üzerine karar vermez.", "'400 ₺'lik paket müşterilerin %5'inden azına uyar; 90–120 ₺ tipik sepete uyar' bir karar cümlesi."],
      takeaway: "İçgörü = bulgu + bir karar için ne anlama geldiği.",
      options: [
        { label: "Medyan 96 ₺, ortalama ise 412 ₺", fb: "Bu yine bulgunun kendisi, ne anlama geldiği değil." },
        { label: "İstatistikler verimizin sağa çarpık olduğunu gösteriyor", fb: "Doğru ama direktör çarpıklık hakkında karar vermez." },
        { label: "400 ₺'lik paket müşterilerin %5'inden azına uyar; 90–120 ₺'lik bir paket tipik sepete uyar", correct: true, fb: "Sayıyı bir karara bağladı. İşte içgörü bu." }] }
  ]
},
{
  id: "sq_meeting", hot: "maya", who: "maya", after: "case004", title: "Yöneticilerle otuz saniye", xp: 50,
  rewards: { businessThinking: 6, visualization: 6, dataExploration: 4 }, lesson: "Yönetim toplantılarında bir kararı değiştiren tek içgörüyle, sayısıyla ve bir sonraki adımla başla.",
  steps: [
    { type: "dialog", who: "maya", cta: "Tamam, baskı yok",
      lines: ["Pşşt. Yönetim toplantısına benimle gel. CEO grafik düzeltmeni beğendi.", "Yaklaşık otuz saniyen olacak. Söyleyeceğin tek bir şey seç."] },
    { type: "choice", prompt: "Hangisini söylersin?",
      goal: "Yöneticiye tek, sayısal ve aksiyonlu mesaj vermek.",
      think: ["Otuz saniyede kaç şey hatırlanır?", "Hangi cümle bir sayı, bir eşik ve bir karar içeriyor?"],
      hints: [{ t: "Envanter (kaç KPI yaptık) ya da soyut tavsiye değil; sayı + eşik + karar içeren cümleyi ara." }],
      solve: ["24 KPI'ı kimse hatırlamaz.", "'Veri kalitesi önemli' doğru ama soyut.", "'Düşüş mevsimsel, −%2,4; −%5'i geçerse işaretleriz, bugün aksiyon gerekmiyor' sayısal, sakin ve net."],
      takeaway: "Yöneticiye: bir sayı, bir eşik, bir karar.",
      options: [
        { label: "6 sekmede 24 KPI'lık yeni bir dashboard kurduk", fb: "Kimse 24 KPI'ı hatırlamaz. Envanterle değil kararla başla." },
        { label: "Kayıt düşüşü mevsimsel, −%2,4; ancak −%5'i geçerse işaretleyeceğiz, bugün aksiyon gerekmiyor", correct: true, fb: "Sayısal, rahatlatıcı ve net bir eşikle. CEO başını sallayıp devam ediyor. Kazanç." },
        { label: "Veri kalitesi çok önemli, buna daha çok yatırım yapmalıyız", fb: "Doğru ama soyut. Yöneticiler belirli bir sayı ve belirli bir talep ister." }] }
  ]
},
{
  id: "sq_lounge", hot: "lounge", who: "alex", after: "case004", title: "Beş kişilik deney", xp: 45,
  rewards: { statistics: 8, businessThinking: 4 }, lesson: "Küçük ve elverişli bir örneklem hipotez önerebilir ama şirket geneli bir ürün kararı için yeterli kanıt değildir.",
  steps: [
    { type: "dialog", who: "alex", cta: "Ne oldu?",
      lines: ["Ürün ekibi yeni ödeme ekranını dinlenme alanında beş kişiyle test etmiş. Dördü daha hızlı bitirmiş.", "Buna %20 dönüşüm artışı diyorlar ve herkese açmak istiyorlar."] },
    { type: "choice", prompt: "Ekip bu sonucu nasıl kullanmalı?",
      goal: "Nitel gözlem ile nedensel kanıtı ayırmak.",
      think: ["Beş kişi kimdi, nasıl seçildi?", "Bu test hangi soruya iyi cevap verir, hangisine vermez?"],
      hints: [{ t: "Beş elverişli kullanıcı kullanılabilirlik sorunlarını bulmakta iyidir; dönüşüm etkisini ölçmekte değil. İkisini de kabul eden seçeneği ara." }],
      solve: ["Hemen yayına almak: 5 kişi gerçek dönüşüm oranını tahmin etmez.", "Tamamen yok saymak: kullanılabilirlik sorunlarını gösterebilir.", "Nitel kanıt olarak kullan, sonra yeterli örneklemli rastgele bir A/B testi yap."],
      takeaway: "Küçük test = fikir ve sorun bulma. Karar için yeterli örneklemli, rastgele test.",
      options: [
        { label: "Hemen yayına al. Beşte dört %80 demek.", fb: "Beş elverişli kullanıcı, gerçek dönüşümün güvenilir bir tahmini değildir." },
        { label: "Bunu nitel kanıt olarak kullan, sonra yeterli örneklemli rastgele bir test yap", correct: true, fb: "Aynen. Dinlenme alanı testi kullanılabilirlik sorunlarını bulmak için faydalı; nedensel etkiyi ölçmek için değil." },
        { label: "n=5 işe yaramaz, tamamen görmezden gel", fb: "Yine de kullanılabilirlik sorunlarını gösterebilir. Hata, onu tüm kullanıcılar için kanıt saymak." }] }
  ]
},
{
  id: "sq_peerreview", hot: "alex", who: "alex", after: "case005", title: "Kurul öncesi akran incelemesi", xp: 55,
  rewards: { dataQuality: 4, statistics: 5, businessThinking: 7 }, lesson: "Yüksek riskli bir analizden önce tanımları, paydaları, zaman pencerelerini ve alternatif açıklamaları bağımsız olarak sorgula.",
  steps: [
    { type: "dialog", who: "alex", cta: "Birlikte inceleyelim",
      lines: ["Terfi vakan yaklaşıyor. Kurul bir şey görmeden önce bir akran incelemesi yapalım.", "Senin yerine çözmeyeceğim. Sadece ilk neyi sorgulayacağını bilmek istiyorum."] },
    { type: "choice", prompt: "Hangi inceleme kontrol listesi en güçlü?",
      goal: "Analitik bir akran incelemesinin neleri kapsadığını öğrenmek.",
      think: ["Bir sonuç kendinden emin görünse bile nasıl yanlış olabilir?", "Hangi liste bu yolları tek tek kontrol ediyor?"],
      hints: [{ t: "Şimdiye kadarki vakaları düşün: tanım (002), dağılım (003), segment (001), alternatif açıklama (005). Hepsini kapsayan liste hangisi?" }],
      solve: ["Yazım ve renkler cila; analitik güvence değil.", "'Makul geliyor mu' sorusu desteklenmemiş sonuçları geçirir.", "Tanım, payda, zaman penceresi, kohort karışımı ve alternatif açıklamalar: gerçek bir analitik inceleme."],
      takeaway: "Önemli bir analizden önce tanımı, paydayı, zaman penceresini ve alternatif açıklamaları sorgula.",
      options: [
        { label: "Yazım hatalarını, grafik renklerini ve slayt sayısını kontrol et", fb: "Faydalı cila ama analitik güvence değil." },
        { label: "Tanımları, paydayı, zaman penceresini, kohort karışımını ve olası alternatif açıklamaları yeniden kontrol et", correct: true, fb: "İşte gerçek bir analitik akran incelemesi. Emin görünen bir cevabın yine de yanlış olabileceği yolları hedef alıyor." },
        { label: "Sonucun yönetime makul gelip gelmediğini sor", fb: "Bir sonuç makul gelip yine de desteklenmemiş olabilir." }] }
  ]
}
];
const QUEST_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q]));

/* Ofis görselindeki etkileşim noktaları (yüzdeler görsel boyutuna göre) */
const HOTSPOTS = {
  coffee:     { label: "Kahve Makinesi", icon: "coffee",  box: [10.32, 24.28, 16.17, 11.28], ambient: ["Makine mırıldanıyor. Bazen mola sadece moladır.", "Deniz makineye bir sayım çizelgesi yapıştırmış. Bilim!"] },
  teamboard:  { label: "Takım Panosu",   icon: "team",    box: [42.47, 22.94, 16.26, 9.94],  ambient: ["Pano sprint notları, metrik sahipleri ve yarı silinmiş oklarla dolu."] },
  whiteboard: { label: "Beyaz Tahta",    icon: "board",   box: [82.81, 16.44, 13.85, 12.05], ambient: ["Biri çok iyimser bir hokey sopası grafiği çizmiş.", "Tahtada artık '+1 pp (+%50)' yazıyor. Biri dinlemiş."] },
  maya:       { label: "Maya",           icon: "chat",    box: [19.05, 55.45, 14.22, 11.85] },
  desk:       { label: "Masam",          icon: "laptop",  box: [30.76, 77.06, 17.19, 12.05] },
  alex:       { label: "Alex",           icon: "chat",    box: [82.06, 53.92, 14.50, 11.85], locked: "Alex bir veri taşıma işine gömülmüş. Belki bir sonraki vakandan sonra.", ambient: ["Alex 900 satırlık bir SQL sorgusunu düzenliyor ve mırıldanıyor.", "Alex: 'Ağırlıklı ortalamalar. Hâlâ aklımda.'"] },
  lounge:     { label: "Dinlenme Alanı", icon: "game",    box: [82.99, 75.91, 16.17, 13.19], locked: "Dinlenme alanı şu an sessiz. Biraz sonra uğra.", ambient: ["Birkaç kişi kahve eşliğinde ürün fikirlerini tartışıyor. Ofis köpeği Veri uyukluyor."] },
  inbox:      { label: "Mesajlar",       icon: "mail",    ambient: ["Mesajlarında bekleyen yeni bir talep yok."] }
};
const AFTER_CASE = {
  case001: "İzmir'de iyi iş çıkardın. Sırada: Finans ve CRM müşteri sayısında anlaşamıyor. Bir de Deniz 'veri insanı'nı soruyordu.",
  case002: "Temiz veri, mutlu Finans. Alex seninle tanışmak istiyor; Zeynep'den de bir rica gelebilir.",
  case003: "Pazarlama paketi 109 ₺'ye çekti. Yarın CEO bir dashboard konusunda endişeli. İstersen birebir görüşmeye uğra.",
  case004: "CEO grafiğini tüm yönetim ekibine iletti. Deniz'in sana 'çok heyecan verici' bir bulgusu var.",
  case005: "Pilot önerin çok yerindeydi. Becerilerin hazır olduğunda terfi vakan masanda.",
  case006: "Tebrikler, Junior Veri Analisti. Buraya nasıl geldiğinle gurur duyuyorum."
};

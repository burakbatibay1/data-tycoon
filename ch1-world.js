
/* =====================================================================
   DÜNYA — gün sistemi, sabah sahneleri, ofis olayları, akşam seçimleri,
   Slack, ilişkiler, başarımlar ve 1. bölüm finali.
   ===================================================================== */
CASES.forEach(c => { c.kind = "case"; });
QUESTS.forEach(q => { q.kind = "quest"; q.modal = true; });
PEOPLE.ceo = { name: "Kerem Yalçın", role: "CEO", skin: "#E6B48C", hair: "#6E6E78", shirt: "#2F3B5C", style: "short" };
PEOPLE.buse = { name: "Buse Yılmaz", role: "Yeni stajyer", skin: "#F0C8A2", hair: "#3B2A1E", shirt: "#7BD3F7", style: "short" };
QUEST_BY_ID.sq_inbox.hot = "phone";
HOTSPOTS.phone = { label: "Telefon", icon: "mail", ambient: ["Telefonunda yeni bir talep yok."] };
HOTSPOTS.window = { label: "Pencere", icon: "board", box: [62.5, 37.5, 10.8, 8.2], ambient: [
  "Şehir yeni yeni uyanıyor. Boğaz'dan sabah vapuru geçiyor; İstanbul yavaş yavaş hareketleniyor.",
  "Boğaz'dan bir vapur geçiyor. Martılar peşinde; bir an veriyi unutuyorsun.",
  "Martılar pencerenin önünde bir dağılım grafiği çiziyor. Aykırı değer de var.",
  "Gün batımı şehri turuncuya boyamış. Ofiste tempo azalırken Boğaz hâlâ hareketli.",
  "Bugün İstanbul yağmurlu. Camdaki damlaların arkasından vapurun ışıkları görünüyor.",
  "Şehir ışıklarla parlıyor. Boğaz sakin; ofiste birkaç ekran hâlâ açık.",
  "Boğaz bugün sisli. Karşı kıyı güçlükle seçiliyor; şehir pusun içinde.",
  "Bugün rüzgarlı. Vapur dalgalarla yarışıyor, martılar peşinde.",
  "İstanbul'da bugün kar var. Boğaz beyaza bürünmüş; sıcak kahve iyi gider."
] };
HOTSPOTS.lounge.eveningFriday = "Cuma akşamı. Dinlenme alanında artık kimse p-değerlerini tartışmıyor. Veri köpeği Veri bile mesaiyi bırakmış.";

const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Pazartesi"];
const weekday = d => { const st = (typeof CH_START !== "undefined" ? Object.values(CH_START) : [1]).filter(x => x <= d); return WEEKDAYS[(d - (st.length ? Math.max(...st) : 1)) % 5]; };

/* ---------------------------------------------------------------------
   YENİ YAN GÖREVLER — mini vakalar, yeni etkileşim türü: "pick"
   (oyuncu doğrudan grafikte, tabloda ya da sorguda tıklar)
   --------------------------------------------------------------------- */
function pickAttrs(def, key) { return `data-action="pick" data-def="${def}" data-key="${key}" data-pick="${key}" tabindex="0" role="button" aria-label="${key}"`; }
const NEW_QUESTS = [
{
  id: "sq_ceo", kind: "quest", modal: true, hot: "phone", who: "ceo", after: "case004", title: "CEO'nun ekran görüntüsü", xp: 45,
  rewards: { visualization: 6, dataLiteracy: 4 }, lesson: "Aynı grafikte farklı toplama düzeyleri (ay ve çeyrek) karıştırılırsa sahte sıçramalar oluşur. Her çubuk aynı birimi göstermeli.",
  steps: [
    { type: "dialog", who: "ceo", cta: "Grafiğe bak",
      lines: ["WhatsApp'tan bir ekran görüntüsü geliyor. Gönderen: Kerem Yalçın, CEO.", "“Burada satışlar neden uçmuş? Yönetim kuruluna bunu göstereceğim, doğru mu?”"] },
    { type: "pick", label: "Yanıltıcı noktayı bul", correct: "q3",
      goal: "Bir grafikte birim ve toplama düzeyi tutarsızlığını yakalamak.",
      prompt: "Grafikteki yanıltıcı çubuğa tıkla.",
      think: ["Her çubuk aynı zaman aralığını mı gösteriyor?", "Çubukların altındaki etiketleri tek tek oku."],
      hints: [{ t: "Son çubuğun etiketi diğerlerinden farklı bir şey söylüyor.", hl: ["etiketler"] }],
      solve: ["İlk sekiz çubuk aylık satış.", "Son çubuk 'Q3 toplamı': üç ayın toplamı.", "Üç ayın toplamı tek bir ayla yan yana konunca satışlar 'uçmuş' görünüyor."],
      takeaway: "Bir grafikteki tüm çubuklar aynı birimi ve aynı zaman aralığını göstermeli.",
      picks: { q3: "Doğru. Bu çubuk tek bir ay değil, temmuz–eylül toplamı. Aynı grafikte aylık değerlerle yan yana durunca üç kat büyük görünüyor.", other: "Bu ay diğerleriyle uyumlu. Uçan çubuğun etiketine bak." },
      visual: (d, id) => chartCard("Satışlar, milyon ₺ (CEO'nun ekran görüntüsü)", (() => {
        const data = [["Oca", 1.7], ["Şub", 1.6], ["Mar", 1.8], ["Nis", 1.9], ["May", 1.8], ["Haz", 1.9], ["Tem", 2.0], ["Ağu", 1.93], ["Q3 toplamı", 5.7, "q3"]];
        const W = 520, H = 230, pb = 34, pt = 20, bw = 40, gap = (W - 20) / data.length, y = v => pt + (1 - v / 6.2) * (H - pt - pb);
        return `<svg class="chart" viewBox="0 0 ${W} ${H}"><line x1="10" x2="${W - 10}" y1="${H - pb}" y2="${H - pb}" class="svg-axis"/>
          ${data.map(([l, v, k], i) => { const key = k || slug(l), x = 10 + gap * i + (gap - bw) / 2;
            return `<g class="pickable" ${pickAttrs(id, key === "q3" ? "q3" : "m" + i)}><rect class="hit" x="${x - 6}" y="${pt - 6}" width="${bw + 12}" height="${H - pt}" rx="8"/>
              <rect class="bar" style="--i:${i}" x="${x}" y="${y(v)}" width="${bw}" height="${H - pb - y(v)}" rx="5" fill="${k ? "var(--mint)" : "var(--blue)"}"/>
              <text x="${x + bw / 2}" y="${y(v) - 6}" class="svg-val" text-anchor="middle">${String(v).replace(".", ",")}</text></g>`; }).join("")}
          <g data-hl="etiketler">${data.map(([l], i) => `<text x="${10 + gap * i + gap / 2}" y="${H - 12}" class="svg-lbl small" text-anchor="middle">${l}</text>`).join("")}</g></svg>`;
      })()) }
  ]
},
{
  id: "sq_monday", kind: "quest", modal: true, hot: "teamboard", who: "deniz", after: "case001", title: "Kayıp pazartesi", xp: 40,
  rewards: { dataQuality: 6, dataExploration: 4 }, lesson: "Zaman serilerinde eksik günler çizgi grafikte görünmez olabilir: çizgi boşluğun üstünden geçer. Takvimle karşılaştır, eksikleri işaretle.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Grafiği aç",
      lines: ["Panodaki rapora göre geçen haftanın sipariş toplamı %14 düşmüş. Ama mağazalar 'her şey normaldi' diyor.", "Günlük grafiğe bakar mısın? Bir şey gözümden kaçıyor olmalı."] },
    { type: "pick", label: "Eksik günü bul", correct: "d14",
      goal: "Zaman serisinde eksik veriyi bulmak.",
      prompt: "Grafikte verisi olmayan günü bul ve üzerine tıkla.",
      think: ["Siparişlerin haftalık bir düzeni var mı? Hangi gün hep zirve?", "Her günün bir noktası var mı?"],
      hints: [{ t: "Pazartesiler her hafta zirve yapıyor. Üçüncü haftanın pazartesisine bak.", hl: ["pzt"] }],
      solve: ["İlk iki haftada pazartesiler ~1.400 siparişle zirvede.", "Üçüncü haftanın pazartesisinde (14 Ekim) nokta yok: çizgi pazardan salıya doğrudan geçiyor.", "O günün verisi yüklenmemiş; haftalık toplamdaki %14 düşüş bundan kaynaklanıyor."],
      takeaway: "Bir düşüşü yorumlamadan önce veri eksiksiz mi diye kontrol et: her günün kaydı var mı?",
      picks: { d14: "Buldun. 14 Ekim pazartesinin verisi yok; çizgi o günün üstünden atlıyor. Haftalık toplamdaki %14 düşüş bir yükleme hatası.", other: "Bu günün verisi yerinde. Haftalık düzene bak: hangi zirve eksik?" },
      visual: (d, id) => chartCard("Günlük siparişler, 30 Eylül – 20 Ekim", (() => {
        const vals = []; for (let i = 0; i < 21; i++) { const dow = i % 7; vals.push(i === 14 ? null : [1400, 1180, 1120, 1090, 1150, 820, 760][dow] + ((i * 37) % 60)); }
        const days = Array.from({ length: 21 }, (_, i) => { const dd = new Date(2024, 8, 30 + i); return dd.getDate(); });
        const W = 520, H = 220, pl = 36, pr = 10, pt = 16, pb = 40, x = i => pl + i / 20 * (W - pl - pr), y = v => pt + (1 - (v - 600) / 1000) * (H - pt - pb);
        const pts = vals.map((v, i) => v == null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`).filter(Boolean).join(" ");
        return `<svg class="chart" viewBox="0 0 ${W} ${H}">
          ${vals.map((v, i) => `<g class="pickable col ${i % 7 === 0 ? "monday" : ""}" ${pickAttrs(id, i === 14 ? "d14" : "d" + i)} ${i % 7 === 0 ? 'data-hl="pzt"' : ""}><rect class="hit" x="${x(i) - 11}" y="${pt}" width="22" height="${H - pt - pb + 26}" rx="6"/>
            <text x="${x(i)}" y="${H - pb + 16}" class="svg-lbl small" text-anchor="middle">${days[i]}</text>${i % 7 === 0 ? `<text x="${x(i)}" y="${H - pb + 30}" class="svg-lbl small" text-anchor="middle">Pzt</text>` : ""}</g>`).join("")}
          <polyline class="draw-line" pathLength="1" points="${pts}" fill="none" stroke="var(--mint)" stroke-width="2.5" stroke-linejoin="round"/>
          ${vals.map((v, i) => v == null ? "" : `<circle class="dot" style="--i:${i % 12}" cx="${x(i)}" cy="${y(v)}" r="3.2" fill="var(--mint)"/>`).join("")}</svg>`;
      })()) }
  ]
},
{
  id: "sq_excel", kind: "quest", modal: true, hot: "phone", who: "zeynep", after: "case002", title: "Cehennemden gelen Excel", xp: 40,
  rewards: { dataQuality: 7, dataLiteracy: 3 }, lesson: "Tekil olması gereken bir alan (fatura no gibi) tekrar ediyorsa toplam şişer. Önce tekilliği kontrol et, sonra topla.",
  steps: [
    { type: "dialog", who: "zeynep", cta: "Tabloyu aç",
      lines: ["Sana bir Excel gönderdim. Bölge müdürü toplamın 42.150 ₺ olması gerektiğini söylüyor ama bende 45.350 ₺ çıkıyor.", "Sekiz satır, bir yerde bir şey iki kez sayılmış olmalı. Bulabilir misin?"] },
    { type: "pick", label: "Mükerrer satır", correct: "r5",
      goal: "Tekil olması gereken alanda tekrarı bulmak.",
      prompt: "İki kez sayılan satıra tıkla.",
      think: ["Hangi sütun her satırda farklı olmalı?", "Fark 3.200 ₺. Hangi satırın tutarı bu?"],
      hints: [{ t: "Fatura numarası tekil olmalı. Fatura no sütununu yukarıdan aşağı oku.", hl: ["fatura-no"] }, { t: "45.350 − 42.150 = 3.200 ₺. Bu tutarda iki satır var." }],
      solve: ["Fatura no sütunu tekil olmalı.", "FT-2207 iki kez geçiyor (2. ve 6. satır), ikisi de 3.200 ₺.", "6. satır mükerrer; çıkarınca toplam 42.150 ₺."],
      takeaway: "Toplamdan önce anahtar sütunun tekilliğini kontrol et.",
      picks: { r5: "Doğru. FT-2207 ikinci kez girilmiş; 3.200 ₺ fazla sayılmış. Çıkarınca toplam tam 42.150 ₺.", r1: "Bu FT-2207'nin ilk kaydı. Mükerrer olan ikinci kopyası; aşağıda tekrar ediyor.", other: "Bu satır tek. Fatura numaralarını karşılaştır." },
      visual: (d, id) => {
        const rows = [["FT-2201", "Ege Ofis", "4.800 ₺"], ["FT-2207", "Kuzey Toptan", "3.200 ₺"], ["FT-2209", "Bireysel", "950 ₺"], ["FT-2212", "Akdeniz Market", "12.400 ₺"], ["FT-2215", "Bireysel", "1.600 ₺"], ["FT-2207", "Kuzey Toptan", "3.200 ₺"], ["FT-2219", "Marmara Kırtasiye", "8.700 ₺"], ["FT-2224", "Ege Ofis", "10.500 ₺"]];
        return `<div class="table-wrap"><table class="data-table mono picktable"><thead><tr><th>#</th><th data-hlc="fatura-no">Fatura no</th><th>Müşteri</th><th>Tutar</th></tr></thead><tbody>
          ${rows.map((r, i) => `<tr class="pickable" ${pickAttrs(id, "r" + i)} style="--i:${i}"><td class="rownum">${i + 1}</td><td data-hlc="fatura-no">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
          <tr class="total-row"><td></td><td colspan="2">Toplam</td><td>45.350 ₺</td></tr></tbody></table></div>`;
      } }
  ]
},
{
  id: "sq_sql", kind: "quest", modal: true, hot: "alex", who: "alex", after: "case002", trust: ["alex", 2], title: "Bozuk SQL sorgusu", xp: 50,
  rewards: { dataExploration: 6, dataQuality: 4 }, lesson: "WHERE içinde AND ve OR farkı sonucu kökten değiştirir. OR koşulu, filtreyi daraltmak yerine genişletir.",
  steps: [
    { type: "dialog", who: "alex", cta: "Sorguya bak",
      lines: ["Sana güveniyorum, o yüzden utanç verici bir şey göstereceğim.", "Bu sorgu sadece İzmir'in eylül satışlarını getirmeli. Ama sonuç tüm şirketin yıllık cirosundan bile büyük çıkıyor."] },
    { type: "pick", label: "Hatalı satır", correct: "l4",
      goal: "Bir SQL filtresindeki mantık hatasını bulmak.",
      prompt: "Hatalı satıra tıkla.",
      think: ["Sorgu iki koşulu da sağlayan satırları mı istiyor, yoksa herhangi birini mi?", "OR ile birleşen koşul sonuç kümesini daraltır mı genişletir mi?"],
      hints: [{ t: "Hem İzmir hem eylül olmalı. Koşulları birbirine bağlayan kelimeye bak." }],
      solve: ["WHERE region = 'İzmir' tek başına doğru.", "Ama ikinci koşul OR ile bağlanmış: İzmir'in tüm yılı + tüm bölgelerin eylülü geliyor.", "OR yerine AND olmalı."],
      takeaway: "Filtreleri birleştirirken iki koşulun da sağlanması gerekiyorsa AND kullan; OR sonucu genişletir.",
      picks: { l4: "Aynen. OR, 'İzmir'in tüm yılı' ile 'tüm bölgelerin eylülü'nü birleştiriyor. AND olmalı.", l3: "Bölge filtresi doğru; sorun bir sonraki satırla nasıl birleştiği.", other: "Bu satır doğru görünüyor. Filtrelerin nasıl birleştiğine bak." },
      visual: (d, id) => {
        const lines = ["SELECT SUM(amount) AS satis", "FROM orders", "WHERE region = 'İzmir'", "  OR order_month = '2024-09';"];
        return `<div class="code-card"><div class="code-top"><i></i><i></i><i></i><span>alex_izmir_eylul.sql</span></div>
          ${lines.map((l, i) => `<div class="code-line pickable" ${pickAttrs(id, "l" + (i + 1))}><span class="ln">${i + 1}</span><code>${l.replace(/(SELECT|SUM|AS|FROM|WHERE|OR|AND)/g, '<b>$1</b>').replace(/('[^']*')/g, '<em>$1</em>')}</code></div>`).join("")}</div>
          ${noteCard("Sonuç", "satis = 214.880.000 ₺")}`;
      } }
  ]
},
{
  id: "sq_marketing", kind: "quest", modal: true, hot: "phone", who: "zeynep", after: "case003", title: "Pazarlama alarmı", xp: 45,
  rewards: { statistics: 5, businessThinking: 5 }, lesson: "Bir oran arttığında hem payı hem paydayı kontrol et. Payda (tanım) değiştiyse oran karşılaştırılamaz.",
  steps: [
    { type: "dialog", who: "zeynep", cta: "Rakamlara bak",
      lines: ["MÜJDE! Dönüşüm oranı %30 arttı! %5'ten %6,5'e!", "Pazarlama bunu kampanyanın başarısı olarak sunacak. Sence de harika değil mi?"] },
    { type: "choice", label: "Paydaya bak",
      goal: "Bir oranın paydasındaki değişikliği fark etmek.",
      prompt: "Bu artışı nasıl yorumlarsın?",
      think: ["Dönüşüm sayısı (pay) arttı mı?", "Ziyaretçi sayısı (payda) neden bu kadar değişti?"],
      hints: [{ t: "Dönüşüm sayısına bak: 100'den 78'e düşmüş. Oran nasıl artabilir?", hl: ["Dönüşüm"] }, { t: "Nota bak: ziyaretçi tanımı değişmiş.", hl: ["Ölçüm notu"] }],
      solve: ["Dönüşüm sayısı 100'den 78'e düştü.", "Ziyaretçi sayısı 2.000'den 1.200'e indi, çünkü tanım daraltıldı (bot ve tekrar ziyaretler çıkarıldı).", "Oran payda küçüldüğü için arttı. Aynı tanımla karşılaştırmadan başarı denemez."],
      takeaway: "Oran = pay / payda. Oran değişince önce ikisini ayrı ayrı kontrol et.",
      visual: () => dataTable(["Metrik", "Önceki ay", "Bu ay"], [["Ziyaretçi", "2.000", "1.200"], ["Dönüşüm", "100", "78"], ["Dönüşüm oranı", "%5,0", "%6,5"]]) +
        noteCard("Ölçüm notu", "Bu aydan itibaren botlar ve aynı gün tekrar eden ziyaretler ziyaretçi sayısından çıkarıldı."),
      options: [
        { label: "Harika, kampanya dönüşümü %30 artırdı", fb: "Dönüşüm sayısı aslında 100'den 78'e düştü. Oranı yükselten şey paydanın küçülmesi." },
        { label: "Payda değişti; aynı ziyaretçi tanımıyla karşılaştırmadan sonuç çıkaramayız, üstelik dönüşüm sayısı düşmüş", correct: true, fb: "Aynen. Tanım değişikliği oranı yapay olarak yükseltti. Geçen ayı yeni tanımla yeniden hesaplamak gerekir." },
        { label: "Oran arttığına göre ziyaretçi düşüşü önemli değil", fb: "Ziyaretçi düşüşü tanım değişikliğinden geliyor ve oranı doğrudan etkiliyor." }] }
  ]
},
{
  id: "sq_coffeepredict", kind: "quest", modal: true, hot: "coffee", who: "deniz", after: "case003", title: "15:00 kahve tahmini", xp: 40,
  rewards: { statistics: 6, dataExploration: 3 }, lesson: "Basit tahminler için geçmiş frekans güçlü bir başlangıçtır: 'son 10 günün kaçında oldu?' Gün türüne göre (cuma gibi) ayrıştırmayı unutma.",
  steps: [
    { type: "dialog", who: "deniz", cta: "Veriye bak",
      lines: ["Yeni bir oyun buldum: kahve makinesinin kamerasından son iki haftanın kuyruk verisini çektim.", "Soru şu: bugün saat 15:00'te kuyruk olur mu? Bahse var mısın?"] },
    { type: "choice", label: "Tahmin",
      goal: "Geçmiş veriden basit bir olasılık tahmini yapmak.",
      prompt: "Bugün 15:00'te kuyrukta 3 ya da daha fazla kişi olur mu?",
      think: ["Son 10 iş gününün kaçında 15:00'te 3+ kişi vardı?", "Hangi günler istisna? Bugün o günlerden biri mi?"],
      hints: [{ t: "15:00 satırında 3 ve üzeri olan günleri say. Cumaları ayrı düşün.", hl: ["15-00"] }],
      solve: ["15:00'te 10 günün 8'inde kuyruk 3+ kişi.", "İstisnaların ikisi de cuma (insanlar erken çıkıyor).", "Bugün cuma değilse olasılık yüksek: kahveni 14:40'ta al."],
      takeaway: "Geçmiş frekans iyi bir temel tahmindir; ama koşulları (gün türü) ayırarak bak.",
      visual: () => dataTable(["Saat", "Pzt", "Sal", "Çar", "Per", "Cum", "Pzt", "Sal", "Çar", "Per", "Cum"], [
        ["14:30", "1", "2", "1", "2", "0", "1", "1", "2", "1", "0"], ["15:00", "4", "5", "3", "4", "1", "5", "4", "3", "4", "0"], ["15:30", "2", "1", "2", "2", "0", "1", "2", "1", "2", "0"]], { mono: true }),
      options: [
        { label: "Bilinemez; kahve kuyruğu tamamen rastgele", fb: "Veride net bir düzen var: 15:00 her gün (cumalar hariç) yoğun." },
        { label: "Büyük ihtimalle evet: 10 günün 8'inde 3+ kişi vardı ve istisnalar cumaydı", correct: true, fb: "Basit ama güçlü bir tahmin: geçmiş frekans + koşula göre ayrıştırma. Deniz bahsi kaybetti." },
        { label: "Hayır, ortalama yaklaşık 3,3 kişi, yani sınırda", fb: "Ortalama cumaların sıfırlarıyla aşağı çekiliyor. Günleri ayrı ayrı say." }] }
  ]
}
];
NEW_QUESTS.forEach(q => { QUESTS.push(q); QUEST_BY_ID[q.id] = q; });

/* ---------------------------------------------------------------------
   SABAHLAR — her gün kısa, atlanabilir bir sahne + sabah iletişim sorusu
   --------------------------------------------------------------------- */
const STANDUP_GUIDE = { goal: "Bir bulguyu tek cümlede net iletmek: ne, nerede, neden, ne yapıyoruz.",
  think: ["Bu cümleyi duyan biri hangi kararı verebilir?", "Sayı, yer, neden ve sonraki adım var mı?"],
  takeaway: "İyi bir özet = ne oldu + nerede + neden + ne yapıyoruz." };
const MORNINGS = {
  2: { scene: "rain", time: "08:41", title: "Yağmurlu bir sabah", text: "İstanbul'da sağanak. Şemsiyeni silkeleyip mutfağa geçiyorsun; Alex elinde iki kahveyle bekliyor.",
    steps: [
      { type: "dialog", who: "alex", cta: "Kahveyi al", lines: ["Günaydın! Biri sana ikinci kahveyi borçluymuş, ben de getirdim.", "Dünkü veri biraz garipti, değil mi? Maya İzmir analizinden bahsetti. Bana tek cümleyle anlatır mısın?"] },
      { type: "choice", label: "Sabah özeti", who: "alex", prompt: "Alex'e dünkü bulguyu nasıl özetlersin?", ...STANDUP_GUIDE,
        hints: [{ t: "Sadece 'ne oldu' yetmez; nerede yoğunlaştığını ve nedenini de söyle." }],
        options: [
          { label: "Satışlar düştü.", fb: "Doğru ama Alex bununla bir şey yapamaz: nerede, ne kadar, neden?" },
          { label: "İzmir satışları %31 düştü.", fb: "Daha iyi, ama toplam içindeki payı ve nedeni eksik." },
          { label: "Genel düşüş İzmir'de yoğunlaşmış, diğer bölgeler stabil; nedeni geçici bir mağaza kapanışı, ekimde toparlanır.", correct: true, fb: "Alex başını sallıyor: “Net. Bunu yönetim de anlar.”" }] }] },
  3: { scene: "laptop", time: "09:02", title: "7 okunmamış mesaj", text: "Laptopunu açıyorsun. Bildirimler birbiri ardına düşüyor.",
    notifications: [["burak", "CFO dünkü mutabakatın özetini istiyor."], ["deniz", "Yazıcı yine tuhaf bir rapor bastı."], ["alex", "Öğlen müsait misin?"], ["zeynep", "Pazarlama sunumu için bir rica…"], ["maya", "Bugün yanıltıcı ortalamalar günü."], ["deniz", "Kahve makinesi tamir edildi!"], ["burak", "Bu arada teşekkürler."]],
    steps: [
      { type: "choice", label: "Finans'a özet", who: "burak", prompt: "Burak, CFO için dünkü müşteri sayısı farkının tek cümlelik özetini istiyor.", ...STANDUP_GUIDE,
        hints: [{ t: "CFO teknik ayrıntı değil, farkın nereden geldiğini ve hangi sayıya güveneceğini bilmek ister." }],
        options: [
          { label: "CRM'de veri kalitesi sorunları var.", fb: "Doğru ama belirsiz. CFO hangi sayıya güveneceğini hâlâ bilmiyor." },
          { label: "CRM tablosunda tekillik, bütünlük ve geçerlilik ihlalleri tespit edildi.", fb: "Teknik olarak doğru ama CFO için jargon. Sayıya ve karara bağla." },
          { label: "576'lık fark CRM'deki 412 mükerrer ve 164 test hesabından geliyor; Finans'ın 11.906 rakamı doğru, CRM'e filtre ekliyoruz.", correct: true, fb: "Burak: “Mükemmel, aynen iletiyorum.”" }] }] },
  4: { scene: "standup", time: "09:15", title: "Analytics Daily", text: "Maya ekibi sabah toplantısına çağırıyor. Herkes sırayla dünün özetini veriyor.",
    steps: [
      { type: "choice", label: "Stand-up", who: "maya", prompt: "Maya: “Sıra sende. Dün ne bulduk?”", ...STANDUP_GUIDE,
        hints: [{ t: "Ekip hem sayıyı hem de kararın ne olduğunu duymak istiyor." }],
        options: [
          { label: "Ortalama yanlıştı.", fb: "Ortalama yanlış değildi, yanıltıcıydı. Ne yaptığımızı da söyle." },
          { label: "Medyan 96 ₺ çıktı.", fb: "Sayı var ama anlamı ve karar yok." },
          { label: "Tipik sipariş 96 ₺; ortalamayı tek bir toptancı şişiriyordu, bu yüzden paketi 90–120 ₺ bandına çektik.", correct: true, fb: "Maya: “İşte stand-up cümlesi bu. Sıradaki.”" }] }] },
  5: { scene: "urgent", time: "08:58", title: "ACİL", text: "Telefonun titriyor. Pazarlamadan, büyük harflerle bir mesaj.",
    steps: [
      { type: "choice", label: "Hızlı cevap", who: "zeynep", prompt: "Zeynep: “ACİL! CEO dünkü grafiği soruyor: kayıtlar düşüyor mu, düşmüyor mu? TEK CÜMLE!”", ...STANDUP_GUIDE,
        hints: [{ t: "Tek cümle de olsa: sayı + bağlam + ne zaman alarm vereceğiniz." }],
        options: [
          { label: "Düşmüyor.", fb: "Küçük bir düşüş var; 'düşmüyor' demek yanlış olur." },
          { label: "Grafik hatalıydı.", fb: "Doğru ama CEO'nun sorusunu cevaplamıyor." },
          { label: "4 haftada %2,4 geriledi; normal mevsimsel aralıkta, −%5'i geçerse haber vereceğiz.", correct: true, fb: "Zeynep: “Süper, ilettim. CEO 'teşekkürler' yazdı!”" }] }] },
  6: { scene: "promo", time: "08:50", title: "Terfi günü", text: "Masana oturur oturmaz Maya yanına geliyor. Bugün farklı bir şey var.",
    steps: [
      { type: "dialog", who: "maya", cta: "Dinliyorum", lines: ["Son birkaç gündür nasıl çalıştığını izliyorum.", "Bugün senden daha bağımsız çalışmanı istiyorum. Ama önce dünkü kahve makinesi meselesini Deniz'e nasıl özetlediğini duymak istiyorum."] },
      { type: "choice", label: "Son özet", who: "maya", prompt: "Deniz'e kahve makinesi bulgusunu nasıl özetledin?", ...STANDUP_GUIDE,
        hints: [{ t: "Nedensellik hatasını ve önerdiğin testi tek cümlede birleştir." }],
        options: [
          { label: "Korelasyon yok.", fb: "Korelasyon vardı; sorun nedensellikti." },
          { label: "Makineler işe yaramıyor.", fb: "Bunu da bilmiyoruz. Veri sadece mevcut farkın büyüklükten geldiğini gösterdi." },
          { label: "İlişkiyi mağaza büyüklüğü açıklıyor; gerçek etkiyi görmek için 5 mağazalık rastgele bir pilot öneriyoruz.", correct: true, fb: "Maya gülümsüyor: “Tamam. Hazırsın.”" }] }] }
};
const MORNING_DEFS = Object.fromEntries(Object.entries(MORNINGS).map(([d, m]) => [`morning${d}`, { id: `morning${d}`, kind: "morning", day: +d, ...m }]));

/* ---------------------------------------------------------------------
   OFİS OLAYLARI — gün içinde gelir; her biri XP vermez.
   type "reply": her cevap geçerlidir, sadece ilişkiyi etkiler.
   --------------------------------------------------------------------- */
const EVENTS = [
  { id: "ev_revenue", who: "alex", days: [2, 6], notify: "Bir dakikan var mı?", title: "Gelir arttı, müşteri azaldı", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "alex", prompt: "“Gelir %12 arttı ama müşteri sayısı %18 düştü. Bu iyi haber mi?”",
      goal: "Toplam metrikleri birim metriklere ayırarak düşünmek.", think: ["Müşteri başına gelir ne oldu?", "Kimler ayrıldı, bu sürdürülebilir mi?"],
      hints: [{ t: "1,12 / 0,82 ≈ 1,37. Müşteri başına gelir ne kadar değişti?" }],
      solve: ["Müşteri başına gelir yaklaşık %37 artmış.", "Bu, fiyat artışı ya da düşük değerli müşterilerin ayrılması olabilir.", "Cevap 'duruma bağlı': kimin ayrıldığına bakmak gerek."],
      takeaway: "Toplamlar birlikte okunmalı: gelir = müşteri × müşteri başına gelir.",
      options: [
        { label: "Evet, gelir arttı, gerisi önemli değil.", fb: "Müşteri tabanı hızla küçülüyorsa bu gelir uzun sürmeyebilir." },
        { label: "Kötü haber, müşteri kaybediyoruz.", fb: "Belki; ama müşteri başına gelir ciddi artmış. Kimin ayrıldığını bilmeden karar verme." },
        { label: "Belirsiz: müşteri başına gelir ~%37 artmış; kimlerin ayrıldığına ve sürdürülebilirliğe bakmalıyız.", correct: true, fb: "Alex: “Aynen benim de takıldığım yer. Segmentlere bakalım.”" }] }] },
  { id: "ev_pipeline", who: "deniz", via: "slack", days: [3, 6], notify: "#analytics-team: Dashboard neden boş?", title: "Gece patlayan pipeline", xp: 15, rewards: { dataQuality: 3 },
    steps: [{ type: "dialog", who: "deniz", cta: "Konuşmaya katıl", lines: ["#analytics-team — Alex: Dünkü dashboard neden boş, bilen var mı?", "Deniz: Pipeline 03:12'de patlamış. Maya: Henüz hiçbir şeyi yeniden çalıştırmayın."] },
      { type: "choice", who: "maya", prompt: "Maya kanala yazıyor: “Ne yapmalıyız?”", goal: "Veri hattı hatasında önce teşhis koymak.",
        think: ["Yeniden çalıştırmak kısmi yüklenmiş veriyi ikiye katlayabilir mi?", "Dashboard'u kullananlar ne bilmeli?"],
        hints: [{ t: "Önce ne kadarının yüklendiğini bilmek gerekiyor; kullanıcıları da bilgilendirmek." }],
        solve: ["Hemen yeniden çalıştırmak kısmi yüklemeyi tekrarlayıp mükerrer kayıt yaratabilir.", "Eski veriyle doldurmak kullanıcıları yanıltır.", "Log'a bak, kısmi yüklemeyi kontrol et, dashboard'a 'veri güncel değil' notu düş."],
        takeaway: "Pipeline hatasında: önce teşhis, sonra düzeltme; bu arada kullanıcıları bilgilendir.",
        options: [
          { label: "Pipeline'ı hemen yeniden çalıştıralım.", fb: "Kısmi yükleme varsa veriyi ikiye katlayabilirsin. Maya'nın uyarısı bu yüzden." },
          { label: "Log'a bakıp kısmi yükleme olup olmadığını kontrol edelim; dashboard'a 'veri güncel değil' notu düşelim.", correct: true, fb: "Maya: “Doğru sıra. Deniz, log'ları paylaşır mısın?”" },
          { label: "Dashboard'u dünkü veriyle dolduralım, kimse fark etmez.", fb: "Eski veriyi güncel gibi göstermek güveni yok eder." }] }] },
  { id: "ev_ceo30", who: "maya", days: [4, 6], notify: "CEO 30 dakika içinde bir sayı istiyor", title: "30 dakikada bir sayı", xp: 15, rewards: { businessThinking: 3 },
    steps: [{ type: "choice", who: "maya", prompt: "“CEO 30 dakika içinde geçen çeyreğin müşteri edinme maliyetini istiyor. Veri tam temiz değil. Ne yaparız?”",
      goal: "Belirsizlik altında dürüst bir tahmin vermek.", think: ["Hiç cevap vermemek mi, kesin gibi görünen yanlış cevap mı daha kötü?"],
      hints: [{ t: "Aralık + varsayım + kesinleşme zamanı: üçü birlikte." }],
      solve: ["Beklemek CEO'yu cevapsız bırakır.", "İlk sayıyı göndermek yanlış bir kesinlik verir.", "Aralık ver, varsayımları belirt, kesin rakamın ne zaman geleceğini söyle."],
      takeaway: "Acele taleplerde: tahmini aralık + varsayımlar + kesinleşme zamanı.",
      options: [
        { label: "Veri temizlenene kadar bekletelim.", fb: "CEO bir karar verecek; hiç bilgi vermemek de bir seçim ve genelde kötüsü." },
        { label: "Tahmini bir aralık verelim, varsayımları ve kesin rakamın ne zaman geleceğini belirtelim.", correct: true, fb: "Maya: “Aynen. '420–480 ₺, kesin rakam yarın 12'de' yazıyorum.”" },
        { label: "Bulduğumuz ilk sayıyı gönderelim.", fb: "Yanlış bir sayı bir kez yönetim kuruluna girerse geri almak çok zor." }] }] },
  { id: "ev_kpi", who: "zeynep", days: [3, 6], notify: "Raporda aktif kullanıcılar %40 düşmüş!", title: "Değişen KPI tanımı", xp: 15, rewards: { dataLiteracy: 3 },
    steps: [{ type: "choice", who: "zeynep", prompt: "“Pazarlama 'aktif kullanıcı' tanımını 30 günden 7 güne çekti. Raporda aktif kullanıcı %40 düştü. Ne yazayım?”",
      goal: "Tanım değişikliğinin zaman serisini kırdığını görmek.", think: ["Bu düşüş gerçek bir davranış değişikliği mi?"],
      hints: [{ t: "Aynı şeyi ölçmeyen iki sayı karşılaştırılamaz." }],
      solve: ["7 günlük tanım doğal olarak daha az kişiyi kapsar.", "Düşüş tanımdan geliyor, davranıştan değil.", "Kırılmayı işaretle; geçmişi yeni tanımla yeniden hesapla ya da iki seriyi birlikte göster."],
      takeaway: "Metrik tanımı değişince seride kırılma olur: işaretle ve geçmişi yeniden hesapla.",
      options: [
        { label: "%40 düşüşü olduğu gibi raporla.", fb: "Bu düşüş tamamen tanımdan geliyor; olduğu gibi raporlamak paniğe yol açar." },
        { label: "Tanım değişikliğini işaretle; geçmişi yeni tanımla yeniden hesapla ya da iki seriyi birlikte göster.", correct: true, fb: "Zeynep: “Ah, mantıklı. Az kalsın kriz çıkaracaktım.”" },
        { label: "Eski tanıma geri dönelim.", fb: "Yeni tanımın iyi bir gerekçesi olabilir. Sorun tanım değil, karşılaştırma." }] }] },
  { id: "ev_intern", who: "buse", days: [4, 6], notify: "Yeni stajyer Buse sana bir şey sormak istiyor", title: "Yeni stajyer", xp: 15, rewards: { statistics: 2, businessThinking: 2 },
    steps: [{ type: "dialog", who: "deniz", cta: "Merhaba Buse", lines: ["Deniz: Sana Buse'yi tanıtayım, bugün başladı. Biraz kafası karışık.", "Buse: Medyan ile ortalama arasındaki farkı bir türlü oturtamadım. Sen nasıl anlarsın?"] },
      { type: "choice", who: "buse", prompt: "Buse'ye nasıl açıklarsın?", goal: "Bir kavramı başkasına öğretebilmek.",
        think: ["Tanımı ezberletmek mi, sezgi vermek mi daha kalıcı?"], hints: [{ t: "Somut bir örnek, formülden daha akılda kalır." }],
        solve: ["Formül doğru ama sezgi vermiyor.", "'Aynı şey' demek yanlış.", "Benzetme: odaya bir milyarder girince ortalama maaş fırlar, medyan kıpırdamaz."],
        takeaway: "Bir kavramı gerçekten anladığını, onu basit bir örnekle anlatabildiğinde bilirsin.",
        options: [
          { label: "Ortalama toplamın adede bölümüdür, medyan sıralı dizinin ortanca elemanıdır.", fb: "Doğru ama Buse'nin yüzündeki boş ifade devam ediyor." },
          { label: "Odaya bir milyarder girince ortalama maaş fırlar ama medyan neredeyse kıpırdamaz. Medyan 'ortadaki kişi'dir.", correct: true, fb: "Buse: “Haa! Şimdi oturdu. Teşekkürler!”" },
          { label: "Çoğu zaman aynı şey, takılma.", fb: "Vaka 003'te farkları 316 ₺'ydi. Hiç de aynı şey değil." }] }] },
  { id: "ev_bug", who: "alex", days: [5, 6], notify: "Galiba bir hata buldum…", title: "Çoğalan satırlar", xp: 15, rewards: { dataQuality: 3 },
    steps: [{ type: "choice", who: "alex", prompt: "“JOIN'den sonra satır sayısı 10.000'den 13.400'e çıktı. Neden olabilir?”",
      goal: "Birleştirme (join) sonrası satır çoğalmasını teşhis etmek.", think: ["Birleştirme anahtarı iki tabloda da tekil mi?"],
      hints: [{ t: "Bir tarafta aynı anahtar birden fazla kez geçerse ne olur?" }],
      solve: ["Join, eşleşen her kombinasyon için satır üretir.", "Anahtar sağ tabloda tekrar ediyorsa satırlar çoğalır.", "Çözüm: anahtarın tekilliğini kontrol et, gerekirse önce tekilleştir."],
      takeaway: "Join'den önce anahtarın tekilliğini kontrol et; sonra satır sayısını doğrula.",
      options: [
        { label: "Normal, veri büyümüş.", fb: "Join yeni veri yaratmaz; aynı veriyi çoğaltabilir." },
        { label: "Birleştirme anahtarı bir tabloda tekrar ediyor; eşleşmeler satırları çoğaltıyor.", correct: true, fb: "Alex: “Bingo. Müşteri tablosunda aynı ID iki adresle var. Tekilleştiriyorum.”" },
        { label: "SQL motorunda hata var.", fb: "Çok nadir. Önce kendi verimizden şüphelenelim." }] }] },
  { id: "ev_cancel", who: "zeynep", days: [2, 6], notify: "Kötü haber…", title: "İptal edilen toplantı",
    steps: [{ type: "reply", who: "zeynep", prompt: "“Öğleden sonraki toplantı iptal oldu. Hazırladığın slaytlar boşa gitti, kusura bakma!”",
      options: [
        { label: "Sorun değil, haftaya kullanırız.", reply: "Zeynep: “Çok iyisin. Haftaya ilk sen sunarsın.”", trust: { zeynep: 1 } },
        { label: "Keşke biraz daha erken haber verseydin.", reply: "Zeynep: “Haklısın, bir dahakine hemen yazarım.”", trust: {} },
        { label: "Slaytları sana göndereyim, vaktin olunca bakarsın.", reply: "Zeynep: “Harika, akşam okurum. Teşekkürler!”", trust: { zeynep: 1 } }] }] },
  { id: "ev_coffeechat", who: "deniz", days: [2, 6], notify: "Kahve molası?", title: "Kahve sohbeti",
    steps: [{ type: "reply", who: "deniz", prompt: "“Hafta sonu ne yaptın? Ben Belgrad Ormanı'na gittim, telefon çekmiyordu, mükemmeldi.”",
      options: [
        { label: "Ben de biraz yürüyüş yaptım, sonra kitap okudum.", reply: "Deniz: “Bir dahakine bize katıl, ekipten birkaç kişi gidiyoruz.”", trust: { deniz: 1 } },
        { label: "Açıkçası bir Kaggle yarışmasıyla uğraştım.", reply: "Deniz: “Veri insanları… Ama saygı duyuyorum.”", trust: { deniz: 1 } },
        { label: "Pek bir şey yapmadım, dinlendim.", reply: "Deniz: “Bazen en iyisi bu.”", trust: {} }] }] },
  { id: "ev_dashboard", who: "alex", days: [3, 6], notify: "Satış ekibi kafası karışmış", title: "Yenilenmeyen dashboard", xp: 15, rewards: { visualization: 3 },
    steps: [{ type: "choice", who: "alex", prompt: "“Dashboard dün gece yenilenmemiş. Satış ekibi dünkü rakamları bugünkü sanıyor. Ne yapalım?”",
      goal: "Veri güncelliğini görünür kılmak.", think: ["Kullanıcı verinin ne zaman güncellendiğini nasıl bilebilir?"],
      hints: [{ t: "Sorun sadece bu sbuser değil; kullanıcı her zaman verinin tazeliğini görebilmeli." }],
      solve: ["Sessizce düzeltmek aynı karışıklığı tekrar yaşatır.", "Dashboard'a 'son güncelleme' zamanı ekle.", "Ekibe kısa bir not geç."],
      takeaway: "Her dashboard'da 'son güncelleme zamanı' görünür olmalı.",
      options: [
        { label: "Sessizce düzeltelim.", fb: "Bu sbuser çözülür, ama bir dahaki gecikmede aynı karışıklık yaşanır." },
        { label: "Dashboard'a 'son güncelleme' zamanını ekleyelim ve satış ekibine kısa bir not geçelim.", correct: true, fb: "Alex: “Basit ama hayat kurtarır. Hemen ekliyorum.”" },
        { label: "Satış ekibine dashboard'a güvenmemelerini söyleyelim.", fb: "Bu güveni tamamen yok eder; sorunu çözmez." }] }] },
  { id: "ev_checkin", who: "maya", days: [3, 5], notify: "Nasıl gidiyor?", title: "Maya ile kısa bir sohbet",
    steps: [{ type: "reply", who: "maya", prompt: "“Birkaç gün oldu. Nasıl gidiyor? Zorlandığın bir şey var mı?”",
      options: [
        { label: "Açıkçası bazen doğru soruyu bulmakta zorlanıyorum.", reply: "Maya: “Bunu söylemen çok değerli. Herkes zorlanır; söyleyenler daha hızlı öğrenir.”", trust: { maya: 2 } },
        { label: "Her şey yolunda, sorun yok.", reply: "Maya: “Güzel. Bir şey olursa kapım açık.”", trust: {} },
        { label: "İstatistik tarafında okuyabileceğim bir kaynak önerir misin?", reply: "Maya: “'Naked Statistics' ile başla. Yarın sana notlarımı da veririm.”", trust: { maya: 1 } }] }] }
];
EVENTS.forEach(e => { e.kind = "event"; e.modal = true; });
const EVENT_BY_ID = Object.fromEntries(EVENTS.map(e => [e.id, e]));

/* ---------------------------------------------------------------------
   AKŞAM SEÇİMLERİ — fazla mesai otomatik olarak "doğru" değildir
   --------------------------------------------------------------------- */
const EVENINGS = {
  2: [{ label: "Eve git", result: "Yağmur dinmiş. Vapurla eve dönüyorsun. Kafan dinç." },
      { label: "20 dakika kal ve incele", late: true, result: "Ankara'daki küçük düşüşün de bir resmi tatile denk geldiğini fark edip not aldın.", skills: { dataExploration: 2 } },
      { label: "Çıkmadan Alex'le konuş", result: "Alex sana en sevdiği SQL kısayollarını gösterdi. İkiniz de geç kaldınız ama değdi.", trust: { alex: 1 } }],
  3: [{ label: "Eve git", result: "Erken yattın. Yarın zinde başlayacaksın." },
      { label: "20 dakika kal ve incele", late: true, result: "Yarım saat CRM tablosuna baktın ama yeni bir şey bulamadın. Bazen veri sadece veridir." },
      { label: "Çıkmadan Deniz'le konuş", result: "Deniz ofisin bütün gizli köşelerini anlattı. Kahve makinesinin bir sırrı varmış.", trust: { deniz: 1 } }],
  4: [{ label: "Eve git", result: "Akşam bir arkadaşınla buluştun. Veri kelimesini bir kez bile söylemedin." },
      { label: "20 dakika kal ve incele", late: true, result: "Dashboard'un eski bir kopyasının hâlâ bir sunumda durduğunu fark edip Maya'ya not bıraktın.", skills: { visualization: 2 }, trust: { maya: 1 } },
      { label: "Çıkmadan Zeynep'le konuş", result: "Zeynep satış ekibinin sayılara nasıl baktığını anlattı. Kullanıcını tanımak her zaman işe yarar.", trust: { zeynep: 1 } }],
  5: [{ label: "Eve git, hafta sonu başlıyor", result: "Cuma akşamı. Ofisin ışıklarını arkanda bırakıyorsun." },
      { label: "20 dakika kal ve incele", late: true, result: "Pazartesi için not çıkardın ama ofis bomboştu. Biraz yalnızlık hissettin; yine de hazırlıklısın.", skills: { businessThinking: 1 } },
      { label: "Ekiple dinlenme alanına geç", result: "Ekiple pizza yediniz. Alex kötü bir veri esprisi yaptı, herkes güldü.", trust: { alex: 1, deniz: 1, zeynep: 1 } }]
};

/* ---------------------------------------------------------------------
   SLACK — günlere göre açılan kısa konuşmalar
   --------------------------------------------------------------------- */
const SLACK = [
  { day: 1, ch: "#genel", msgs: [["deniz", "Bugün aramıza yeni bir stajyer katıldı! Hoş geldin 👋"], ["zeynep", "Hoş geldin! Satış ekibi olarak senden çok şey bekliyoruz 😄"]] },
  { day: 2, ch: "#analytics-team", msgs: [["alex", "Dünkü İzmir analizini okudum. Temiz iş."], ["maya", "Herkes hatırlasın: önce segment, sonra yorum."]] },
  { day: 3, ch: "#analytics-team", msgs: [["alex", "Dünkü dashboard neden boş, bilen var mı?"], ["deniz", "Pipeline 03:12'de patlamış."], ["maya", "Henüz hiçbir şeyi yeniden çalıştırmayın."]], event: "ev_pipeline" },
  { day: 3, ch: "#genel", msgs: [["deniz", "Kahve makinesi tamir edildi. Lütfen sevgiyle davranın."]] },
  { day: 4, ch: "#analytics-team", msgs: [["maya", "09:15 Analytics Daily. Kameralar açık lütfen."], ["alex", "Ben gecikiyorum, köprüde trafik."]] },
  { day: 5, ch: "#pazarlama", msgs: [["zeynep", "CEO dashboard'u sordu, panik yok, analitik ekibi bakıyor."], ["ceo", "Teşekkürler, sakin bir başlık iyi geldi."]] },
  { day: 5, ch: "#genel", msgs: [["deniz", "Cuma akşamı dinlenme alanında pizza var 🍕"]] },
  { day: 6, ch: "#analytics-team", msgs: [["maya", "Bugün kurul hazırlığı var. Odaklanalım."], ["alex", "Kolay gelsin, sende 💪"]] }
];

/* ---------------------------------------------------------------------
   İLİŞKİLER VE BAŞARIMLAR
   --------------------------------------------------------------------- */
const TRUST_PEOPLE = ["maya", "alex", "zeynep", "deniz"];
const TRUST_LEVELS = {
  maya:  ["Seni yeni tanıyor", "İlerlemeni yakından izliyor", "Analitik yargına güveniyor", "Seni geleceğin lideri olarak görüyor"],
  alex:  ["Henüz tanışıyorsunuz", "Seninle çalışmaktan keyif alıyor", "Kodunu sana gösterecek kadar güveniyor", "İş arkadaşından öte, bir dost"],
  zeynep: ["Seni yeni tanıyor", "Sorularını sana getiriyor", "Satış ekibinin favori analisti", "Senin cümlelerini sunumlarında kullanıyor"],
  deniz: ["Seni yeni tanıyor", "Ofisin sırlarını paylaşıyor", "Her yeni fikrini önce sana danışıyor", "Ofisin en iyi ikilisi sizsiniz"]
};
function trustLevel(id) { const v = (player.trust || {})[id] || 0; return v >= 7 ? 3 : v >= 4 ? 2 : v >= 2 ? 1 : 0; }
const ACHIEVEMENTS = {
  first_day:   { t: "İlk gün", d: "Nexora'daki ilk gününü tamamladın." },
  independent: { t: "Kendi başına", d: "Bir vakayı hiç yardım almadan çözdün." },
  caffeine:    { t: "Kafeinle çalışan analitik", d: "Bir günde kahve makinesine 10 kez gittin." },
  helper:      { t: "Ofisin yardımcısı", d: "5 yan görev tamamladın." },
  completionist: { t: "Hiçbir şey kaçmadı", d: "Tüm yan görevleri tamamladın." },
  night_owl:   { t: "Gece kuşu", d: "İki akşam fazladan kaldın." },
  communicator: { t: "Net iletişimci", d: "Tüm sabah özetlerini ilk denemede doğru verdin." },
  team_player: { t: "Takım oyuncusu", d: "Dört kişiyle de güçlü bir ilişki kurdun." },
  window:      { t: "Manzara", d: "Pencereden İstanbul'u dört kez izledin." },
  promoted:    { t: "Junior Veri Analisti", d: "İlk terfini kazandın." },
  promoted2:   { t: "Veri Analisti", d: "Yönlendirme olmadan kendi analizini kurdun." }
};
const MAYA_EVENING = {
  high: ["Bugün doğru cevabı bulmaktan çok, neden doğru olduğunu açıklaman iyiydi.", "Yardıma neredeyse hiç ihtiyacın olmadı. Bunu fark ettim.", "Soruları benden önce soruyorsun artık."],
  mid: ["İpuçlarını doğru yerde kullandın. Yarın biraz daha kendine güven.", "İyi bir gündü. Takıldığın yerler, öğrendiğin yerlerdir.", "Yaklaşımın oturuyor. Biraz daha pratik, o kadar."],
  low: ["Zor bir gündü ama sormaktan çekinmedin. Öğrenmenin en hızlı yolu bu.", "Bugün çok şey öğrendin, cevaplardan bile fazlasını.", "Yanlışlar bir analistin en iyi öğretmenidir. Yarın görüşürüz."]
};

/* ---------------------------------------------------------------------
   1. BÖLÜM FİNALİ — toplantı odası
   --------------------------------------------------------------------- */
const FINALE = { id: "finale", kind: "finale", steps: [
  { type: "dialog", who: "maya", cta: "Devam", lines: () => player.chapter === 4 ? [
    "Otur. Bu kez modelin skorunu değil, karar sistemini savundun.",
    "İki yıl önce sana problemi modelden önce kur demiştim. Bugün bunu kimse hatırlatmadan yaptın.",
    "Artık yalnızca model geliştirmiyorsun; hangi modelin hangi koşulda kullanılacağını da belirliyorsun.",
    `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. Sıradaki soru: bunu canlıya almalı mıyız?`] : player.chapter === 3 ? [
    "Otur. Bu sbuser ben dinleyeceğim.",
    "On bir ay önce 'ne oldu?' ile 'neden oldu?' arasındaki farkı konuşmuştuk. Bugün kurula nedenini sen anlattın, hem de karşılaştırma grubuyla.",
    "Veri bilimi ekibi seni istiyor. Artık sadece açıklamayacaksın; tahmin edeceksin.",
    `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. İlk dersin: model kurmadan önce problemi kur.`] : player.chapter === 2 ? [
    "Otur. Bu sbuser daha da kısa tutacağım.",
    "Üç ay önce sana 'nereden başlayacağını düşün' dedim. Bugün hiçbir şey söylemedim ve doğru yere baktın.",
    trustLevel("maya") >= 3 ? "Artık senin analizlerini kurula ben değil, sen sunacaksın." : "Hâlâ öğreneceğin çok şey var ama artık nasıl öğreneceğini biliyorsun.",
    `Bugünden itibaren ${PROMOTION.title}sin, ${playerName()}. Bir sonraki konuşmamızda soru 'ne oldu?' değil, 'neden oluyor?' olacak.`] : [
    "Otur lütfen. Kısa tutacağım.",
    "İlk geldiğinde sana hangi grafiğe bakacağını bile söylüyordum.",
    "Artık hangi soruyu sorman gerektiğini kendin buluyorsun.",
    trustLevel("maya") >= 2 ? "Bu hafta yargına güvenmeyi öğrendim. Bu kolay kazanılmaz." : "Önünde daha çok yol var ama doğru yöndesin.",
    `Bu yüzden, bugünden itibaren ${PROMOTION.title} olarak devam ediyorsun. Tebrikler, ${playerName()}.`] }
] };
CASE_BY_ID.case004.steps[3].egg = { after: 2, text: "Alex (masasından): “Bar chart ile kişisel bir problemin mi var?” 😄" };

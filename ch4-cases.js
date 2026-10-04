/* =====================================================================
   CHAPTER 4 — JUNIOR VERİ BİLİMCİ (2 yıl sonra), VAKA 024–032
   Zincir: iş problemi → zaman kurgusu → baseline → ilk model →
   dengesiz sınıf → hata maliyeti → feature engineering → leakage → review
   Rehberlik: vaka içinde ipucu yok; öğrenme vaka sonu değerlendirmesinde.
   ===================================================================== */
CH_START[4] = 24;
PROMOTIONS[4] = { title: "Veri Bilimci", req: { mlform: 3, modeling: 3, evaluation: 3, featureeng: 3, "mlform@2": 2, "evaluation@2": 2 } };
CH_PROMO_CASE[4] = "case032";

function mlTable(headers, rows) { return dataTable(headers, rows); }
const CH4_CASES = [
{
 id:"case024",num:"024",chapter:4,title:"Yapay Zekâyla Churn'ü Azaltalım",difficulty:3,xp:220,after:"case023",
 short:"CEO model istiyor. Önce model değil, karar problemini kur.",tags:["Problem kurgusu","Hedef","İş aksiyonu"],nodes:["mlform","business"],rewards:{businessThinking:10,statistics:4},
 concept:{name:"ML problem kurgusu",en:"ML problem framing",text:"Model seçmeden önce gözlem birimini, hedefi, tahmin anını ve tahminin hangi iş aksiyonunu tetikleyeceğini tanımlamak.",points:[]},
 mentor:"Bir modelin ilk satırı algoritma değildir. Karardır: kimi, ne zaman, ne için tahmin ediyoruz?",
 portfolio:{title:"Churn problem tanımı",text:"Churn talebini 30 günlük aksiyon penceresi, müşteri-gün gözlem birimi ve retention aksiyonuyla ölçülebilir bir tahmin problemine çevirdim."},
 review:{happened:"'Churn modeli yapalım' talebi tek başına uygulanabilir değildi.",discovered:"Hedef ve aksiyon birlikte tanımlanınca modelin ne zaman ve kimin için tahmin yapacağı netleşti.",habit:"Algoritmadan önce: gözlem birimi → hedef → tahmin zamanı → aksiyon.",watch:"Aksiyon model skorundan sonra geliyorsa tahmin iş değeri üretmez."},
 steps:[
  {type:"dialog",who:"ceo",cta:"Problemi kur",lines:["Rakibimiz yapay zekâyla churn'ü azaltıyormuş. Biz de bir churn modeli istiyoruz.","Maya toplantıda değil. Bu kez çerçeveyi sen kuracaksın."]},
  {type:"builder",label:"Problemi tanımla",prompt:"İş talebini tahmin problemine çevir.",goal:"Tahminin birimi, hedefi ve aksiyonunu netleştirmek.",fields:[
   {key:"unit",label:"Gözlem birimi",options:[["customer_day","Müşteri × gözlem tarihi"],["order","Sipariş"],["region","Bölge"]]},
   {key:"target",label:"Hedef",options:[["churn30","Önümüzdeki 30 günde ayrılma"],["ever","Bir gün ayrılmış olma"],["sales","Aylık toplam satış"]]},
   {key:"action",label:"Aksiyon",options:[["retain","Yüksek riskliye retention teklifi"],["report","Sadece rapora yaz"],["none","Aksiyon yok"]]}],run:"Çerçeveyi onayla",
   visual:d=>noteCard("Model sözleşmesi",`Birim: ${d.unit||"?"} · Hedef: ${d.target||"?"} · Aksiyon: ${d.action||"?"}`),
   check:d=>d.unit==="customer_day"&&d.target==="churn30"&&d.action==="retain"?{ok:true,title:"Problem kurulabilir",fb:"Tahmin, karar verilmeden önce üretilecek ve somut bir retention aksiyonunu tetikleyecek."}:{ok:false,fb:"Model çıktısının kime, hangi gelecekteki olay için ve hangi aksiyondan önce üretileceğini netleştir."}},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Yeni durum: 'Geç ödeyecek faturaları tahmin edelim.' İlk soru hangisi?",goal:"Problem kurgusunu başka bağlama taşımak.",options:[{label:"XGBoost mu LightGBM mi?",fb:"Algoritma için erken."},{label:"Tahmini hangi tarihte, hangi fatura için yapacağız ve sonuç hangi tahsilat aksiyonunu değiştirecek?",correct:true,fb:"Doğru. Önce karar bağlamı."}]}
 ]
},
{
 id:"case025",num:"025",chapter:4,title:"Zamanı Doğru Kur",difficulty:3,xp:220,after:"case024",short:"Hedef doğru ama zaman çizgisi yanlışsa gelecek geçmişe sızar.",tags:["Prediction time","Feature window","Horizon"],nodes:["mlform","featureeng"],rewards:{statistics:6,dataExploration:6},
 concept:{name:"Tahmin zamanı ve pencere",en:"prediction time & feature window",text:"Öznitelikler tahmin anından önceki bilgiden; hedef ise tahmin anından sonraki ufuktan gelmelidir.",points:[]},mentor:"Bir özelliğin tabloda bulunması, tahmin anında bilindiği anlamına gelmez.",portfolio:{title:"Churn zaman sözleşmesi",text:"T0 öncesi 90 günlük feature penceresi ve T0 sonrası 30 günlük churn ufku tanımladım."},
 review:{happened:"İptal nedeni gibi sonradan oluşan alanlar feature listesine karışmıştı.",discovered:"Zaman çizgisi feature ile hedef arasındaki sınırı görünür yaptı.",habit:"Her ML tablosunun üstüne T0 çiz: solda feature, sağda hedef.",watch:"Aynı müşterinin farklı zamanlardaki satırları rastgele bölünürse sızıntı yine oluşabilir."},
 steps:[
  {type:"choice",label:"Zaman çizgisi",prompt:"1 Haziran'da risk skoru üretilecek. Hangisi feature olabilir?",goal:"Tahmin anında gerçekten bilinen bilgiyi seçmek.",options:[{label:"15 Haziran'da açılan iptal talebi",fb:"Gelecekten geliyor."},{label:"Mart–Mayıs son 90 günlük kullanım sıklığı",correct:true,fb:"T0 öncesinde biliniyor."},{label:"Haziran sonunda gerçekleşen churn etiketi",fb:"Bu hedef; feature değil."}]},
  {type:"builder",label:"Pencereyi kur",prompt:"Zaman sözleşmesini seç.",goal:"Feature penceresi ile hedef ufkunu ayırmak.",fields:[{key:"window",label:"Feature penceresi",options:[["past90","T0'dan önceki 90 gün"],["future30","T0'dan sonraki 30 gün"]]},{key:"horizon",label:"Hedef ufku",options:[["next30","T0'dan sonraki 30 gün"],["past30","T0'dan önceki 30 gün"]]}],run:"Kontrol et",visual:d=>noteCard("T0 = 1 Haziran",`${d.window||"?"} → T0 → ${d.horizon||"?"}`),check:d=>d.window==="past90"&&d.horizon==="next30"?{ok:true,title:"Zaman sözleşmesi doğru",fb:"Model yalnızca geçmişi görüp geleceği tahmin ediyor."}:{ok:false,fb:"Feature geçmişten, hedef gelecekten gelmeli."}},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Forecast modelinde rolling mean hesaplıyorsun. Hangisi güvenli?",goal:"Zaman mantığını forecasting'e taşımak.",options:[{label:"shift(-1) sonrası rolling",fb:"Geleceği içeri alır."},{label:"Yalnızca geçmiş gözlemlerle rolling; gerekiyorsa önce shift(1)",correct:true,fb:"Aynı zaman disiplini."}]}
 ]
},
{
 id:"case026",num:"026",chapter:4,title:"Önce Temeli Geç",difficulty:3,xp:220,after:"case025",short:"Karmaşık modelden önce basit bir baseline gerçekten ne kadar iyi?",tags:["Baseline","İş aksiyonu"],nodes:["modeling","mlform"],rewards:{statistics:8,businessThinking:6},
 concept:{name:"Baseline",en:"baseline",text:"Yeni modelin değerini ölçmek için önce basit, uygulanabilir bir rbuserans performansı tanımlamak.",points:[]},mentor:"Karmaşık olmak başarı değildir. Basit kuralı geçemiyorsan model kurma.",portfolio:{title:"Churn baseline",text:"Model geliştirmeden önce çoğunluk sınıfı ve basit kural tabanlı baseline kurup gerçek kazanım eşiğini tanımladım."},
 review:{happened:"Herkese 'kalır' demek yüksek accuracy veriyordu ama hiçbir churn müşterisini yakalamıyordu.",discovered:"Baseline hem yanıltıcı metriği hem de modelin gerçekten ek değer üretip üretmediğini gösterdi.",habit:"İlk modelden önce en az bir aptal ama dürüst baseline yaz.",watch:"Baseline iş aksiyonuna uygun olmalı; yalnızca teknik skor değil."},
 steps:[
  {type:"choice",label:"Baseline",prompt:"Müşterilerin %96'sı kalıyor. En basit sınıflandırma baseline'ı nedir?",goal:"Çoğunluk sınıfı baseline'ını kurmak.",options:[{label:"Herkese 'kalır' de: %96 accuracy",correct:true,fb:"Bu çıta çok basit ama kritik."},{label:"Rastgele %50/%50 tahmin",fb:"Problem dağılımını bile kullanmıyor."}]},
  {type:"choice",label:"Karar",prompt:"İlk model %96,4 accuracy aldı. Kutlama zamanı mı?",goal:"Modeli baseline'a göre değerlendirmek.",visual:()=>mlTable(["Yaklaşım","Accuracy","Churn recall"],[["Herkese kalır","%96,0","%0"],["İlk model","%96,4","%11"]]),options:[{label:"Evet, %96,4 çok yüksek",fb:"Baseline zaten %96."},{label:"Hayır; baseline'a göre kazanım küçük ve churn müşterilerinin %89'u kaçıyor",correct:true,fb:"Modelin işi churn müşterisini bulmak."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Talep tahmininde yeni model MAE=105, geçen haftayı kopyala baseline'ı MAE=101. Ne yaparsın?",goal:"Baseline ilkesini regresyona taşımak.",options:[{label:"Yeni model daha sofistike, canlıya alırım",fb:"Sofistike ama daha kötü."},{label:"Canlıya almam; önce baseline'ı geçmesini isterim",correct:true,fb:"Baseline before sophistication."}]}
 ]
},
{
 id:"case027",num:"027",chapter:4,title:"İlk Modelin",difficulty:3,xp:230,after:"case026",short:"İlk gerçek model: doğru split ve basit bir lojistik regresyon.",tags:["Train/test","Logistic regression"],nodes:["modeling","python"],rewards:{statistics:8,dataExploration:6},
 concept:{name:"Train/test ayrımı",en:"train/test split",text:"Model geliştirme verisi ile nihai değerlendirme verisini ayırmak; test setini model seçerken kullanmamak.",points:[]},mentor:"Test seti sınav kâğıdıdır. Çalışırken cevap anahtarına bakmazsın.",portfolio:{title:"İlk churn modeli",text:"Zamana göre train/test ayrımıyla basit lojistik regresyon baseline'ı kurdum."},
 review:{happened:"Model seçimi için test setine tekrar tekrar bakmak performansı iyimserleştiriyordu.",discovered:"Train geliştirme içindir; test en sonda bir kez dürüst değerlendirme içindir.",habit:"Split'i modelden önce yap; test setini en sona sakla.",watch:"Model seçimi büyüdükçe validation/CV ihtiyacı artar."},
 steps:[
  {type:"choice",label:"Split",prompt:"Ocak–Aralık verisi var, Aralık en yeni dönem. Churn modeli için en dürüst ilk test hangisi?",goal:"Zamansal ayrımı seçmek.",options:[{label:"Tüm satırları rastgele %80/%20",fb:"Aynı müşterinin ve daha yeni davranışın geçmişe karışma riski var."},{label:"Ocak–Ekim train, Kas validation, Aralık test",correct:true,fb:"Zaman akışı korunuyor."}]},
  {type:"choice",label:"İlk model",prompt:"İlk aday olarak ne seçersin?",goal:"Yorumlanabilir basit modelle başlamak.",options:[{label:"Önce lojistik regresyon: hızlı, güçlü baseline ve yorumlanabilir",correct:true,fb:"İlk modelin görevi yarışmayı kazanmak değil, öğrenmeyi hızlandırmak."},{label:"En büyük neural network",fb:"Henüz problem hakkında öğrenmen gereken çok şey var."}]},
  {type:"choice",label:"Overfit kontrolü",prompt:"Train AUC 0,99, validation AUC 0,73. İlk yorumun?",goal:"Aşırı öğrenmeyi train–validation farkından tanımak.",options:[{label:"Model train verisini fazla öğrenmiş; genelleme zayıf",correct:true,fb:"Bu fark overfit için güçlü bir uyarı."},{label:"0,99 olduğu için model çok iyi",fb:"Canlı performansı train skoru değil, görülmemiş veri söyler."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Yeni bir kredi riski problemi geldi. İlk model yaklaşımın?",goal:"Basit model alışkanlığını taşımak.",options:[{label:"Basit, yorumlanabilir baseline + dürüst split",correct:true,fb:"Doğru."},{label:"Doğrudan en karmaşık ensemble",fb:"Önce rbuserans ve hata yapısını öğren."}]}
 ]
},
{
 id:"case028",num:"028",chapter:4,title:"%97 Doğruluk!",difficulty:3,xp:230,after:"case027",short:"Accuracy yüksek, model işe yaramıyor.",tags:["Imbalance","Accuracy","Confusion matrix"],nodes:["evaluation","modeling"],rewards:{statistics:10,businessThinking:4},
 concept:{name:"Dengesiz sınıfta değerlendirme",en:"imbalanced evaluation",text:"Azınlık sınıfı önemliyse accuracy tek başına yanıltıcıdır; confusion matrix ve sınıf odaklı metrikler gerekir.",points:[]},mentor:"Modelin doğru olduğu çoğunluğu değil, pahalı hatayı ne kadar yaptığını sor.",portfolio:{title:"Accuracy tuzağı",text:"%97 accuracy'li modelin churn recall'ının yalnızca %18 olduğunu confusion matrix ile gösterdim."},
 review:{happened:"Yüksek accuracy çoğunluk sınıfından geliyordu.",discovered:"Confusion matrix hangi hatanın saklandığını görünür yaptı.",habit:"Dengesiz sınıfta accuracy gördüğünde hemen sınıf dağılımını ve confusion matrix'i iste.",watch:"Recall'u tek başına maksimize etmek de çok fazla yanlış alarm yaratabilir."},
 steps:[
  {type:"choice",label:"Matrisi oku",prompt:"1.000 müşterinin 40'ı churn. Model 7 churn müşterisini buldu, 33'ünü kaçırdı. En kritik gerçek ne?",goal:"Accuracy yerine azınlık sınıfı başarısını okumak.",visual:()=>mlTable(["","Tahmin: Kalır","Tahmin: Churn"],[["Gerçek: Kalır","963","−3"],["Gerçek: Churn","33","7"]]),options:[{label:"Accuracy yaklaşık %97, model çok iyi",fb:"Churn'lerin çoğu kaçıyor."},{label:"Churn recall yalnızca 7/40 ≈ %18; iş problemi çözülmüyor",correct:true,fb:"Tam olarak."}]},
  {type:"choice",label:"Sonraki adım",prompt:"Ne yaparsın?",goal:"Dengesizliği doğru metrik ve eşik üzerinden ele almak.",options:[{label:"Önce precision/recall ve hata maliyetini inceleyip eşiği değerlendirmek",correct:true,fb:"SMOTE otomatik ilk cevap değil."},{label:"Accuracy'yi %98'e çıkarmaya odaklanmak",fb:"Yanlış hedefi optimize ediyorsun."},{label:"Doğrudan SMOTE uygulamak",fb:"Önce metrik, maliyet ve eşik."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Dolandırıcılık %0,5. Model %99,5 accuracy ile hiç fraud bulmuyor. Karar?",goal:"Dengesiz sınıf dersini taşımak.",options:[{label:"Model başarılı",fb:"Hiç fraud bulmuyor."},{label:"Accuracy anlamsız; fraud recall/precision ve maliyete bakarım",correct:true,fb:"Doğru."}]}
 ]
},
{
 id:"case029",num:"029",chapter:4,title:"Precision mı Recall mu?",difficulty:4,xp:240,after:"case028",short:"İki hata aynı maliyette değil. Eşiği iş kararı belirliyor.",tags:["Precision","Recall","Threshold","Cost"],nodes:["evaluation","business"],rewards:{statistics:10,businessThinking:8},
 concept:{name:"Hata maliyeti ve eşik",en:"decision threshold",text:"Sınıflandırma eşiği teknik bir sabit değil; yanlış pozitif ve yanlış negatif maliyetlerinin iş tercihidir.",points:[]},mentor:"0,5 doğa kanunu değil. Eşik, şirketin hangi hataya ne kadar dayanabildiğinin ifadesidir.",portfolio:{title:"Churn eşik politikası",text:"Retention teklif maliyeti ve kaçan churn değerini kullanarak karar eşiğini iş maliyetine göre seçtim."},
 review:{happened:"Düşük eşik daha çok churn yakaladı ama teklif maliyetini büyüttü.",discovered:"En iyi eşik model metriğinden değil toplam iş maliyetinden çıktı.",habit:"Precision/recall tartışmasını 'hangi hata daha pahalı?' sorusuna çevir.",watch:"Maliyetler ve kapasite değişirse eşik de değişmelidir."},
 steps:[
  {type:"choice",label:"Maliyet",prompt:"Kaçan bir churn müşterisinin beklenen kaybı 2.000₺; gereksiz teklif 100₺. Hangi hata daha pahalı?",goal:"FN/FP maliyetini iş bağlamına bağlamak.",options:[{label:"False negative: churn müşterisini kaçırmak",correct:true,fb:"Bu yüzden recall önemli."},{label:"False positive",fb:"Maliyeti var ama burada 20 kat daha düşük."}]},
  {type:"choice",label:"Eşik",prompt:"Aylık kapasite 2.000 teklif. Hangi politika daha dengeli?",goal:"Eşiği kapasite ve maliyetle seçmek.",visual:()=>mlTable(["Eşik","Precision","Recall","Teklif"],[["0,70","%62","%31","620"],["0,45","%43","%68","1.850"],["0,20","%18","%91","5.900"]]),options:[{label:"0,20; recall en yüksek",fb:"Kapasite 2.000, 5.900 teklif veremezsin."},{label:"0,45; kapasite içinde recall belirgin artıyor",correct:true,fb:"İş kısıtıyla uyumlu."},{label:"0,70; precision en yüksek",fb:"Çok fazla churn kaçıyor."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Kanser taramasında yanlış negatif çok pahalı. Genel öncelik?",goal:"Metrik seçimini başka alana taşımak.",options:[{label:"Recall/sensitivity'yi güçlü tutmak, sonra yanlış pozitif yükünü yönetmek",correct:true,fb:"Bağlam metriği belirler."},{label:"Her zaman precision",fb:"Her problemde aynı metrik yok."}]}
 ]
},
{
 id:"case030",num:"030",chapter:4,title:"Öznitelik Atölyesi",difficulty:4,xp:240,after:"case029",short:"Ham veriyi tahmin anında kullanılabilir özelliklere dönüştür.",tags:["Feature engineering","Missing","Encoding"],nodes:["featureeng","python","quality"],rewards:{dataExploration:8,dataQuality:8},
 concept:{name:"Öznitelik mühendisliği",en:"feature engineering",text:"Ham veriyi tahmin anında bilinen, anlamlı ve tekrarlanabilir model girdilerine dönüştürmek.",points:[]},mentor:"Feature engineering, geleceği tabloya saklamak değil; geçmişi karar için özetlemektir.",portfolio:{title:"Churn feature set",text:"Son 30/90 gün kullanım, tenure, kanal ve eksiklik göstergelerini tahmin zamanına uygun bir pipeline'da hazırladım."},
 review:{happened:"Ham kategoriler, eksikler ve zaman özetleri tutarlı pipeline olmadan modelde kırılıyordu.",discovered:"Eksik değer stratejisi ve encoding train'de öğrenilip aynı biçimde validation/test'e uygulanmalı.",habit:"Preprocessing'i elle kopyalama; train'de öğrenilen dönüşümleri pipeline'a koy.",watch:"Feature'ın anlamı ve üretim zamanı dokümante edilmezse canlıda train-serving skew oluşur."},
 steps:[
  {type:"choice",label:"Feature seç",prompt:"1 Haziran churn tahmini için hangisi iyi bir feature?",goal:"Geçmiş davranışı özetleyen feature seçmek.",options:[{label:"Son 30 gündeki aktif gün sayısı",correct:true,fb:"Geçmiş davranış, tahmin anında biliniyor."},{label:"Churn sonrası iptal nedeni",fb:"Leakage."}]},
  {type:"choice",label:"Eksik değer",prompt:"Gelir alanı müşterilerin %35'inde eksik ve eksiklik belirli kanallarda yoğun. Ne yaparsın?",goal:"Eksikliği bilgi olarak değerlendirmek.",options:[{label:"Tüm eksik satırları sil",fb:"Seçici kayıp yaratabilir."},{label:"Train'de uygun imputasyon + missing indicator; dağılımı kanala göre kontrol et",correct:true,fb:"Eksikliğin kendisi sinyal olabilir."}]},
  {type:"choice",label:"Pipeline",prompt:"Kategorik kanal kodlamasını ne zaman öğrenirsin?",goal:"Preprocessing leakage'ini önlemek.",options:[{label:"Tüm veri üzerinde, sonra split",fb:"Test bilgisi preprocessing'e sızar."},{label:"Train üzerinde fit; validation/test'e yalnız transform",correct:true,fb:"Doğru pipeline disiplini."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Yeni şehir kategorisi testte ilk kez göründü. Ne istersin?",goal:"Robust preprocessing düşüncesini taşımak.",options:[{label:"Encoder'ın bilinmeyen kategoriyi güvenli ele alması",correct:true,fb:"Canlı sistemler yeni değer görür."},{label:"Test satırını silmek",fb:"Gerçek hayatta da silemezsin."}]}
 ]
},
{
 id:"case031",num:"031",chapter:4,title:"Şüpheli Derecede Mükemmel Model",difficulty:4,xp:250,after:"case030",short:"AUC 0,99. Harika mı, yoksa gelecek tabloya mı sızdı?",tags:["Leakage","Temporal validation"],nodes:["featureeng","evaluation","modeling"],rewards:{dataQuality:10,statistics:8},
 concept:{name:"Data leakage",en:"data leakage",text:"Tahmin anında bilinmeyecek bilgi model girdisine veya değerlendirme sürecine sızdığında performans gerçek dışı görünür.",points:[]},mentor:"Mükemmel skor kutlama değil, soru işaretidir.",portfolio:{title:"Leakage denetimi",text:"0,99 AUC'li churn modelinde iptal sonrası alanları ve geleceğe bakan aggregation'ı bulup zaman bazlı değerlendirmeyi düzelttim."},
 review:{happened:"cancel_reason ve lifetime_days_after_snapshot hedef sonrası bilgiyi taşıyordu.",discovered:"Leakage çıkarılınca skor düştü ama gerçekçi hale geldi.",habit:"Şüpheli iyi skorda önce zaman çizgisi, target proxy ve preprocessing fit alanını denetle.",watch:"Leakage bazen kolon adında görünmez; aggregation penceresinde saklanır."},
 steps:[
  {type:"pick",label:"Leakage'i bul",correct:"cancel",prompt:"En açık leakage alanına tıkla.",goal:"Hedef sonrası bilgiyi tanımak.",picks:{cancel:"cancel_reason yalnızca müşteri ayrıldıktan sonra oluşuyor. Bu doğrudan hedefin gelecekteki sonucu.",tenure:"tenure tahmin anında biliniyorsa kullanılabilir.",usage:"Geçmiş 30 günlük kullanım güvenli.",channel:"Kayıt kanalı geçmiş bilgi."},visual:(d,id)=>`<div class="pick-grid"><button ${pickAttrs(id,"usage")}>usage_30d</button><button ${pickAttrs(id,"tenure")}>tenure_days</button><button ${pickAttrs(id,"channel")}>signup_channel</button><button ${pickAttrs(id,"cancel")}>cancel_reason</button></div>`},
  {type:"choice",label:"Skoru yorumla",prompt:"Leakage çıkarılınca AUC 0,99'dan 0,76'ya düştü. Ne oldu?",goal:"Gerçekçi performansı kabul etmek.",options:[{label:"Model bozuldu, leakage'i geri ekleyelim",fb:"Canlıda o bilgi yok."},{label:"Model artık dürüst ölçülüyor; 0,76 gerçek karar kalitesini tartışmak için kullanılabilir",correct:true,fb:"Düşük ama gerçek skor, yüksek sahte skordan değerlidir."}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Kredi temerrüt modelinde 'collection_status_60d_after_due' feature'ı var. Karar?",goal:"Leakage refleksini taşımak.",options:[{label:"Çıkarırım; tahmin anından sonra oluşuyor",correct:true,fb:"Doğru."},{label:"Çok güçlü feature, tutarım",fb:"Güçlü çünkü geleceği biliyor."}]}
 ]
},
{
 id:"case032",num:"032",chapter:4,title:"Model İncelemesi",difficulty:5,xp:300,after:"case031",promotion:true,short:"İlk uçtan uca model kararını savun: problem, zaman, baseline, metrik, feature ve leakage.",tags:["Promotion","Model review","Error analysis"],nodes:["mlform","modeling","evaluation","featureeng","comm"],rewards:{statistics:12,businessThinking:10,communication:10},
 concept:{name:"Model review",en:"model review",text:"Bir modelin algoritmasından önce problem tanımını, veri zamanını, baseline'ını, değerlendirmesini, hata maliyetini ve canlı aksiyonunu birlikte incelemek.",points:[]},mentor:"Bu kez modelini değil, yargını değerlendiriyoruz.",portfolio:{title:"Junior DS model review",text:"Churn çözümünü problem tanımından karar eşiğine kadar savundum; leakage'i temizledim ve kontrollü pilot önerdim."},
 review:{happened:"Kurul 'en yüksek skoru' değil, güvenilir ve aksiyona bağlı bir model kararı istedi.",discovered:"İyi modelleme tek algoritma seçimi değil; problem + veri + değerlendirme + iş kararı zinciridir.",habit:"Model review sırası: problem → zaman → baseline → split → metric → errors → leakage → action.",watch:"Bir sonraki seviyede soru artık 'model iyi mi?' değil, 'hangi model/threshold canlıya alınmalı ve neden?' olacak."},
 steps:[
  {type:"dialog",who:"maya",cta:"Başla",lines:["Model review odası hazır. Bu kez ipucu yok.","Bana algoritma adını değil, neden bu çözümün güvenilir olduğunu anlat."]},
  {type:"choice",label:"Problem",prompt:"İlk cümlen?",goal:"Model review'ı iş problemiyle başlatmak.",options:[{label:"Lojistik regresyon kullandım.",fb:"Bu çözümün aracı."},{label:"Her müşteri için ay başında, önümüzdeki 30 günlük churn riskini tahmin edip kapasite içindeki retention teklifini yönlendiriyoruz.",correct:true,fb:"Problem ve aksiyon net."}]},
  {type:"choice",label:"Kanıt",prompt:"Modeli neden güvenilir buluyorsun?",goal:"Dürüst değerlendirme zincirini sentezlemek.",options:[{label:"AUC yüksek olduğu için",fb:"Tek skor yetmez."},{label:"Zamana göre ayrılmış testte baseline'ı geçiyor; leakage denetimi temiz; churn recall/precision ve teklif kapasitesi birlikte değerlendirildi.",correct:true,fb:"Maya ilk kez not almıyor."}]},
  {type:"choice",label:"Hata analizi",prompt:"Genel recall %68 ama 0–3 aylık yeni müşterilerde %29. Ne yaparsın?",goal:"Tek genel skor yerine hata segmentlerini incelemek.",options:[{label:"Genel skor yeterli, devam",fb:"Belirli bir grupta model sistematik olarak zayıf."},{label:"Yeni müşteri segmentinin veri/feature yapısını inceler, ayrı hata analizi yapar ve pilotta bu grubu özellikle izlerim",correct:true,fb:"Model değerlendirme artık tek sayı değil."}]},
  {type:"choice",label:"Karar",prompt:"Canlıya nasıl çıkarsın?",goal:"Modeli kontrollü iş kararına bağlamak.",options:[{label:"Tüm müşterilere hemen uygularım",fb:"İş etkisini ölçmeden tam yayılım riskli."},{label:"Sınırlı bir pilotta 0,45 eşiğiyle çalıştırır, model metriği yanında churn ve teklif maliyetini izlerim; sonra yaygınlaştırırım.",correct:true,fb:"Kurul başkanı: “Bu bir model değil, karar sistemi.”"}]},
  {type:"choice",label:"Transfer",transfer:true,prompt:"Başka ekip sana %98 accuracy'li bir model getiriyor. İlk üç kontrolün?",goal:"Model review alışkanlığını taşımak.",options:[{label:"Problem/zaman tanımı, baseline+split, hata maliyeti+leakage",correct:true,fb:"Junior Veri Bilimci seviyesinden çıkıyorsun."},{label:"Algoritma, GPU, eğitim süresi",fb:"Bunlar sonra."}]}
 ]
}
];
CH4_CASES.forEach(c=>{c.kind="case";c.concept.points=[c.review.habit];CASES.push(c);CASE_BY_ID[c.id]=c;});

/* kanıt kaynakları */
(()=>{const src={
 "mf.target":["case024","case025","case032"],"mf.window":["case025","case031","case032"],"mf.action":["case024","case029","case032"],
 "mo.baseline":["case026","case028","case032"],"mo.split":["case027","case031","case032"],"mo.overfit":["case027","case032"],
 "ev.accuracy":["case026","case028"],"ev.pr":["case028","case029","case032"],"ev.threshold":["case029","case032"],"ev.error":["case028","case029","case032"],
 "fe.missing":["case030","case032"],"fe.encode":["case030","case032"],"fe.leak":["case025","case031","case032"],"py.repro":["case030","case032"]};
 Object.entries(src).forEach(([cid,s])=>{const n=SKILL_TREE.find(n=>n.concepts.some(c=>c.id===cid));if(!n)return;const c=n.concepts.find(c=>c.id===cid);s.forEach(x=>{if(!c.src.includes(x))c.src.push(x)});CONCEPT_BY_ID[cid]={...c,node:n.id};});})();

Object.assign(MORNINGS,{
 24:{scene:"promo",time:"08:35",title:"İki yıl sonra",text:"Kartında artık Junior Veri Bilimci yazıyor. İlk toplantı daveti CEO'dan: 'Churn için AI'.",steps:[{type:"dialog",who:"maya",cta:"Güne başla",lines:["Artık sana nereye bakacağını söylemeyeceğim.","Bir yaklaşım geliştir. Yanlışsa da neden yanlış olduğunu savunabilecek kadar açık olsun."]}]},
 25:{scene:"standup",time:"09:05",title:"Modelleme masası",text:"Whiteboard'da tek bir çizgi var: T0.",steps:[{type:"dialog",who:"alex",cta:"Devam",lines:["Maya T0'ı çizip çıktı. Sanırım bugünkü bütün ders bu."]}]},
 26:{scene:"laptop",time:"08:55",title:"Baseline günü",text:"Slack'te 'ilk model %96!' mesajı dolaşıyor.",steps:[{type:"dialog",who:"maya",cta:"Kontrol et",lines:["Yüzdeyi görmeden önce baseline'ı sor."]}]},
 27:{scene:"standup",time:"09:10",title:"İlk model",text:"Notebook boş. Bu kez boşluk korkutmuyor.",steps:[{type:"dialog",who:"alex",cta:"Başla",lines:["İlk modelin en iyi model olmak zorunda değil. En öğretici model olsun."]}]},
 28:{scene:"laptop",time:"08:50",title:"%97",text:"Ekranda büyük yeşil bir accuracy kartı var. Fazla güzel görünüyor.",steps:[{type:"dialog",who:"maya",cta:"İncele",lines:["Yüksek skor gördüğünde önce sevinme. Önce neyi sakladığını sor."]}]},
 29:{scene:"standup",time:"09:00",title:"Hataların fiyatı",text:"Retention ekibi aylık 2.000 teklif kapasitesini paylaştı.",steps:[{type:"dialog",who:"zeynep",cta:"Karar ver",lines:["Bize teknik olarak en iyi modeli değil, kullanabileceğimiz listeyi ver."]}]},
 30:{scene:"laptop",time:"08:45",title:"Feature atölyesi",text:"Ham müşteri tablosu 74 sütun. Yarısı modele girmemeli.",steps:[{type:"dialog",who:"alex",cta:"Temizle",lines:["Feature sayısı başarı ölçüsü değil."]}]},
 31:{scene:"rain",time:"08:40",title:"0,99",text:"Gece koşusu AUC 0,99 verdi. Kimse kutlama yapmıyor.",steps:[{type:"dialog",who:"maya",cta:"Denetle",lines:["0,99 gördüğünde bana pasta değil, leakage raporu getir."]}]},
 32:{scene:"promo",time:"08:30",title:"Model review",text:"Toplantı odasında CEO, Maya ve ürün ekibi var.",steps:[{type:"dialog",who:"maya",cta:"Hazırım",lines:["Bugün senden model anlatmanı istemiyorum.","Karar sistemini savun."]}]}
});
Object.entries(MORNINGS).forEach(([d,m])=>{if(+d>=24)MORNING_DEFS[`morning${d}`]={id:`morning${d}`,kind:"morning",day:+d,...m};});
Object.assign(AFTER_CASE,{case024:"Yarın zaman çizgisini kuracaksın.",case025:"Zaman sözleşmesi hazır. Şimdi baseline.",case026:"Baseline çıtası belli. Yarın ilk model.",case027:"İlk model koştu. Yarın accuracy kartını sorgula.",case028:"Accuracy tuzağı açık. Yarın hata maliyeti.",case029:"Eşik kararı alındı. Yarın feature pipeline.",case030:"Pipeline hazır. Yarın fazla iyi bir skor var.",case031:"Leakage temizlendi. Yarın model review.",case032:"Toplantı odasında kal. Maya seninle konuşacak."});
ACHIEVEMENTS.promoted4={t:"Veri Bilimci",d:"İlk uçtan uca model kararını problemden pilota kadar savundun."};

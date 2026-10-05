/* DATA TYCOON v6.15 — Dynamic Office Interruptions
   Kısa, beklenmedik ve öğretici iş günü müdahaleleri.
   Mevcut EVENTS scheduler'ını kullanır; ayrı görev ekranı yaratmaz. */
(() => {
  const I = [
    { id:'int_dashboard_spike', who:'maya', via:'slack', days:[7,14], notify:'Yönetim 15 dakikaya toplantıda. Dashboard satışları bir gecede %31 artmış gösteriyor.', title:'15 Dakika: Bu Rakam Gerçek mi?', xp:18, rewards:{dataQuality:3,businessThinking:2},
      steps:[{type:'choice',who:'maya',prompt:'Maya: “Bu %31 artışı yönetim slaydına koymadan önce ilk ne yaparsın?”',goal:'Büyük bir hareketi açıklamadan önce ölçümün doğru olduğunu doğrulamak.',think:['Önce hikâye mi üretmelisin, ölçümü mü doğrulamalısın?','Kaynak veri ve yükleme zamanı ne söylüyor?'],hints:[{t:'Beklenmedik sıçramalarda ilk hipotezin iş etkisi değil, ölçüm bütünlüğü de olmalı.'}],solve:['Kaynak tabloyu ve son ETL yüklemesini kontrol et.','Önceki günle satır sayısı/grain karşılaştır.','Rakam doğrulanmadan yönetim mesajına dönüştürme.'],takeaway:'Anomali → önce ölçüm doğrulama, sonra iş açıklaması.',options:[
        {label:'Kampanya iyi çalışmış; slayda %31 büyüme yazalım.',fb:'Toplantıdan sonra ETL’in aynı günü iki kez yüklediği ortaya çıkıyor. Hızlı hikâye üretmek güven kaybettirir.'},
        {label:'Önce kaynak tablo, ETL yüklemesi ve satır sayısını doğrularım.',correct:true,fb:'Maya: “Aynen. Önce rakamın gerçek olduğundan emin olalım.”'},
        {label:'Modeli yeniden çalıştırırım.',fb:'Sorunun modelle ilgisi olduğuna dair henüz kanıt yok. Önce ölçüm zincirini doğrula.'}]}]},

    { id:'int_ab_pressure', who:'zeynep', via:'slack', days:[15,23], notify:'Kampanya +%8 görünüyor. Pazarlama bugün herkese açmak istiyor.', title:'A/B Testi: +%8 Yeter mi?', xp:18, rewards:{statistics:3,businessThinking:2},
      steps:[{type:'choice',who:'zeynep',prompt:'Zeynep: “Test daha planlanan sürenin yarısında ama +%8. Açalım mı?”',goal:'Erken görülen uplift ile karar vermeden deney bütünlüğünü korumak.',think:['Planlanan süre neden vardı?','Etki tahmini ne kadar oynak olabilir?'],hints:[{t:'Ara sonuçlara bakıp erken durdurmak yanlış pozitif riskini artırabilir.'}],solve:['Önceden belirlenen süre/örnekleme sadık kal.','Etkiyi belirsizliğiyle değerlendir.','Guardrail metriklerini de kontrol et.'],takeaway:'Deney sonucu sadece uplift değildir; tasarım ve belirsizlik de kararın parçasıdır.',options:[
        {label:'Evet, +%8 yeterince büyük; hemen açalım.',fb:'Erken sonuç sonraki günlerde geri dönüyor. Peeking karar kalitesini bozdu.'},
        {label:'Planlanan süreyi tamamlayıp belirsizlik ve guardrail’lerle birlikte karar verelim.',correct:true,fb:'Zeynep: “Tamam, ekibe sonucu değil karar kuralını hatırlatıyorum.”'},
        {label:'Testi iptal edip before/after karşılaştıralım.',fb:'Randomize kontrolü bırakmak nedensel kanıtı zayıflatır.'}]}]},

    { id:'int_buse_accuracy', who:'buse', days:[24,32], notify:'Model accuracy %96 çıktı 🎉 Production’a çıkarabilir miyiz?', title:'Buse’nin %96 Accuracy’si', xp:18, rewards:{modelEvaluation:3,businessThinking:2},
      steps:[{type:'choice',who:'buse',prompt:'Buse: “Accuracy %96. Bence model hazır, değil mi?”',goal:'Tek bir yüksek metriğin model uygunluğunu kanıtlamadığını görmek.',think:['Pozitif sınıf ne kadar nadir?','Hangi hata iş için daha pahalı?'],hints:[{t:'Verinin %96’sı negatifse hiçbir şey yapmayan model de %96 accuracy alabilir.'}],solve:['Sınıf dağılımını kontrol et.','Precision/recall ve hata maliyetlerini incele.','Threshold’u operasyon kapasitesiyle birlikte seç.'],takeaway:'Model metriği iş hatasıyla birlikte okunur.',options:[
        {label:'%96 çok yüksek; production’a çıkaralım.',fb:'Pozitif sınıf yalnız %4. Model neredeyse herkese negatif diyerek bu skoru almış.'},
        {label:'Önce sınıf dağılımı, confusion matrix ve iş hata maliyetlerine bakalım.',correct:true,fb:'Buse: “Haklısın, accuracy tek başına hiçbir şey söylemiyormuş.”'},
        {label:'Accuracy yerine R² hesaplayalım.',fb:'Bu bir sınıflandırma problemi; R² doğru araç değil.'}]}]},

    { id:'int_ops_capacity', who:'deniz', via:'slack', days:[27,35], notify:'Fraud modeli 1.400 alarm üretiyor; operasyon günde sadece 250 inceleyebiliyor.', title:'250 Alarm Limiti', xp:18, rewards:{modelEvaluation:3,businessThinking:2},
      steps:[{type:'choice',who:'deniz',prompt:'Deniz: “Operasyon 250 vakadan fazlasına bakamıyor. Threshold’u nasıl ele alalım?”',goal:'Threshold kararını operasyon kapasitesine bağlamak.',think:['En yüksek skorlu kaç vaka incelenebilir?','Recall artırmak operasyonu aşarsa ne olur?'],hints:[{t:'Threshold teknik değil, kapasite ve hata maliyetiyle birlikte bir iş kararıdır.'}],solve:['Skorları sırala ve kapasiteye göre threshold belirle.','250 alarm içindeki precision ve kaçırılan fraud maliyetini ölç.','Kapasite değişirse threshold da yeniden değerlendirilir.'],takeaway:'Threshold = model + hata maliyeti + operasyon kapasitesi.',options:[
        {label:'Recall maksimum olsun; tüm 1.400 alarmı gönderelim.',fb:'Operasyon 1.150 alarmı hiç inceleyemiyor. Teorik recall gerçek süreçte karşılık bulmuyor.'},
        {label:'250 vaka kapasitesine göre threshold seçip precision ve kaçırılan fraud maliyetini birlikte izlerim.',correct:true,fb:'Deniz: “İşte production kararı böyle verilir.”'},
        {label:'Threshold’u her zaman 0.50 tutalım.',fb:'0.50 evrensel bir iş kuralı değildir.'}]}]},

    { id:'int_leakage_review', who:'buse', days:[30,40], notify:'Model AUC 0.94 oldu. Feature’lardan biri “cancel_reason”. Bir göz atar mısın?', title:'Bir Şey Fazla İyi', xp:20, rewards:{featureEngineering:3,modelEvaluation:2},
      steps:[{type:'choice',who:'buse',prompt:'Tahmin anı müşterinin iptalinden 7 gün önce. “cancel_reason” feature’ı hakkında ne düşünürsün?',goal:'Prediction-time leakage’i kendiliğinden fark etmek.',think:['Bu bilgi tahmin anında gerçekten mevcut mu?'],hints:[{t:'Bir feature’ın tabloda olması, tahmin anında bilinebileceği anlamına gelmez.'}],solve:['cancel_reason ancak iptal gerçekleşince oluşur.','Offline skor yapay olarak yükselir.','Feature’ı çıkarıp zaman uyumlu validation’ı tekrar çalıştır.'],takeaway:'Her feature için sor: “Bu bilgi prediction time’da var mıydı?”',options:[
        {label:'AUC yüksekse kullanalım.',fb:'Production’da cancel_reason henüz oluşmadığı için model aynı bilgiyi göremez.'},
        {label:'Leakage olabilir; prediction time’da bu alan mevcut değil. Çıkarıp yeniden valide edelim.',correct:true,fb:'Buse: “AUC düştü ama artık gerçekçi. İyi yakaladın.”'},
        {label:'Feature’a daha yüksek ağırlık verelim.',fb:'Leakage’i güçlendirmek problemi büyütür.'}]}]},

    { id:'int_prediction_drop', who:'maya', via:'slack', days:[41,48], notify:'Production prediction volume son 20 dakikada %42 düştü. Model mi bozuldu?', title:'Production Alarmı: −%42', xp:20, rewards:{mlops:3,dataQuality:2},
      steps:[{type:'choice',who:'maya',prompt:'Maya: “Prediction hacmi düştü. İlk kontrolün ne?”',goal:'Production incident’ta modelden önce sistem zincirini teşhis etmek.',think:['Model aynı ama input akışı durmuş olabilir mi?','Hangi monitoring sinyali katmanı ayırır?'],hints:[{t:'Prediction volume düşüşü doğrudan model performansı demek değildir.'}],solve:['Request/input hacmini kontrol et.','Upstream pipeline ve serving health’e bak.','Model dağılımı/drift kontrolü sonraki katmandır.'],takeaway:'Incident teşhisi katmanlıdır: trafik → veri → serving → model.',options:[
        {label:'Modeli hemen rollback ederim.',fb:'Input pipeline durmuşsa rollback hiçbir şeyi çözmez.'},
        {label:'Önce request hacmi, upstream veri akışı ve serving health’i kontrol ederim.',correct:true,fb:'Maya: “Doğru. Model sağlıklı; upstream event stream gecikmiş.”'},
        {label:'Modeli yeniden eğitirim.',fb:'20 dakikalık hacim düşüşünde retraining ilk müdahale değildir.'}]}]},

    { id:'int_corr_claim', who:'alex', days:[34,44], notify:'Sunumda “push bildirimi satışları artırdı” yazıyor. Korelasyon 0.71.', title:'Korelasyon Sunuma Girmek Üzere', xp:18, rewards:{causal:3,communication:2},
      steps:[{type:'choice',who:'alex',prompt:'Alex: “Cümleyi böyle bırakabilir miyiz?”',goal:'Korelasyon dilini nedensellik iddiasından ayırmak.',think:['Bildirim alanlarla almayanlar neden zaten farklı olabilir?'],hints:[{t:'Gözlemsel ilişki etki kanıtı değildir.'}],solve:['“İlişkili” de, “artırdı” deme.','Confounder ihtimalini belirt.','Etki için deney veya uygun nedensel tasarım öner.'],takeaway:'İletişimde nedensellik iddiası kanıt düzeyini aşmamalı.',options:[
        {label:'0.71 yüksek; “artırdı” diyebiliriz.',fb:'Korelasyonun büyüklüğü nedensellik kanıtı değildir.'},
        {label:'“Satışla ilişkili” diyelim; nedensel etki için deney/uygun tasarım gerektiğini belirtelim.',correct:true,fb:'Alex: “Dili düzelttim. Yönetim için küçük ama önemli fark.”'},
        {label:'Korelasyonu sunumdan tamamen çıkaralım.',fb:'İlişki yine faydalı bir bulgu; sadece doğru dille sunulmalı.'}]}]},

    { id:'int_privacy_channel', who:'deniz', via:'slack', days:[42,52], notify:'Bir ekip müşteri export’unu ortak Slack kanalına yüklemek üzere. Dosyada telefon ve e-posta var.', title:'Dosyayı Göndermeden Önce', xp:20, rewards:{privacy:3,dataGovernance:2},
      steps:[{type:'choice',who:'deniz',prompt:'Deniz: “Toplantı başlıyor, dosyayı hızlıca kanala atalım mı?”',goal:'Hız baskısı altında veri minimizasyonu ve güvenli paylaşımı uygulamak.',think:['Alıcıların bu kişisel alanlara ihtiyacı var mı?','Daha güvenli paylaşım yolu var mı?'],hints:[{t:'İş ihtiyacı olmayan kişisel veriyi paylaşma.'}],solve:['Paylaşımı durdur.','Gereksiz PII alanlarını kaldır/maskele.','Yetkili ve kontrollü kanaldan paylaş.'],takeaway:'Acil olmak, kişisel veri kontrollerini atlama gerekçesi değildir.',options:[
        {label:'Toplantı acil; şimdi atalım, sonra sileriz.',fb:'Bir kez paylaşılan kişisel verinin kopyalarını geri toplamak mümkün olmayabilir.'},
        {label:'Durduralım; gerekli alanları minimize edip yetkili paylaşım kanalını kullanalım.',correct:true,fb:'Deniz: “Tamam. Telefon ve e-postayı çıkarıp kontrollü klasöre alıyorum.”'},
        {label:'ZIP yaparsak sorun olmaz.',fb:'Dosya formatı erişim yetkisi ve veri minimizasyonunun yerini tutmaz.'}]}]},

    { id:'int_delegate_buse', who:'maya', days:[49,54], notify:'Aynı anda iki iş var: production alarmı ve yarına segment analizi. Buse boşta.', title:'Her Şeyi Kendin Yapma', xp:20, rewards:{leadership:3,businessThinking:2},
      steps:[{type:'choice',who:'maya',prompt:'Maya: “Lead olarak ikisini de sen mi alacaksın?”',goal:'Kıdem arttıkça doğru delegasyon ve review davranışını öğrenmek.',think:['Hangi iş daha acil ve riskli?','Buse için güvenli ama geliştirici görev hangisi?'],hints:[{t:'Delegasyon sorumluluğu bırakmak değil; uygun işi verip review noktası koymaktır.'}],solve:['Production alarmını sen sahiplen.','Segment analizini Buse’ye net çerçeveyle delege et.','Teslim öncesi review checkpoint koy.'],takeaway:'Lead’in işi her şeyi yapmak değil, doğru işi doğru kişiye verip kaliteyi güvencelemek.',options:[
        {label:'İkisini de kendim yaparım; daha hızlı olur.',fb:'Kısa vadede olabilir; ama ekip gelişmez ve sen darboğaz olursun.'},
        {label:'Production alarmını ben alırım; segment analizini Buse’ye çerçeve + review checkpoint ile veririm.',correct:true,fb:'Maya: “Tam olarak beklediğim Lead davranışı.”'},
        {label:'İkisini de Buse’ye veririm.',fb:'Production incident yüksek riskli; delegasyon risk ve yetkinlikle dengelenmeli.'}]}]},

    { id:'int_ceo_ai', who:'ceo', via:'slack', days:[55,59], notify:'Rakip GenAI chatbot çıkardı. Biz de 6 haftada bir tane yapalım mı?', title:'CEO: “Biz de AI Yapalım”', xp:22, rewards:{businessThinking:3,aiStrategy:3},
      steps:[{type:'choice',who:'ceo',prompt:'CEO: “Rakip yaptı. Bizim ilk kararımız ne olmalı?”',goal:'Teknolojiden önce problem, değer ve risk çerçevesi kurmak.',think:['Hangi kullanıcı problemi çözülecek?','Başarıyı nasıl ölçeceğiz?','Daha basit çözüm yeterli olabilir mi?'],hints:[{t:'“AI yapalım mı?” sorusundan önce “hangi problemi, hangi başarı metriğiyle?” sorusu gelir.'}],solve:['Use-case ve kullanıcı problemini tanımla.','Baseline ve başarı metriği belirle.','RAG/prompt/fine-tuning/vendor seçeneklerini ancak sonra değerlendir.'],takeaway:'AI stratejisi model seçimiyle değil, değer hipoteziyle başlar.',options:[
        {label:'Rakip yaptıysa biz de hemen RAG kuralım.',fb:'Teknik çözümü problemden önce seçtin. Değer üretmeyen pahalı bir demo riski var.'},
        {label:'Önce kullanıcı problemi, baseline, başarı metriği ve riskleri netleştirip sonra çözüm seçelim.',correct:true,fb:'CEO: “Güzel. Bana teknoloji listesi değil karar çerçevesi getir.”'},
        {label:'AI projeleri riskli; hiç girmeyelim.',fb:'Riskten kaçınmak da strateji değildir. Değer ve riski birlikte değerlendirmek gerekir.'}]}]}
  ];

  I.forEach(e => {
    e.kind = 'event'; e.modal = true; e.interruption = true;
    if (!EVENT_BY_ID[e.id]) { EVENTS.push(e); EVENT_BY_ID[e.id] = e; }
  });
  window.DYNAMIC_INTERRUPTION_IDS = I.map(e => e.id);
})();

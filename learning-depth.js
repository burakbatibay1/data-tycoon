/* DATA TYCOON v3.6 — Learning Depth
   Ch4–8: tüm kararları en az 4 güçlü seçeneğe çıkarır.
   Yeni seçenekler dolgu değil; analistlerin gerçek hayatta düşebileceği teknik/iş tuzaklarıdır.
   Ayrıca karar sonrası pedagojik gerekçe ve yanlış karar sonucu için metadata ekler. */
(function(){
  const manual = {
    "case041:1":"Sadece random seed'i sabitler, aynı skoru beklerim",
    "case041:2":"Notebook çıktısını PDF'e alıp audit kanıtı olarak saklarım",
    "case042:1":"Model drift; model dosyasının kendisi zamanla bozuldu",
    "case042:2":"Alarm kırmızıysa modeli hemen yeniden eğitip eskisini kapatırım",
    "case043:1":"AUC yüksek olduğu için sorun threshold'dadır; pipeline'a bakmam",
    "case043:2":"Timeout olan kayıtları metrikten çıkarıp yalnız cevap dönenleri raporlarım",
    "case044:1":"AUC artışı yeterli kanıttır; feature'ı doğrudan canlıya alırım",
    "case044:2":"Bugünkü düzeltilmiş tabloyu kullanır, sadece time split yaparım",
    "case045:1":"Basit görünse de gelecekte lazım olur diye baştan ML platformu kurarım",
    "case045:2":"Önce herkese aynı risk puanını veren tek bir sabit kural kullanırım",
    "case046:1":"Genel metrik iyi olduğu için modeli açar, alt grubu sonradan izlerim",
    "case046:2":"Hassas alanı kaldırınca adalet problemi teknik olarak çözülmüş sayılır",
    "case047:1":"Her LLM probleminde önce daha büyük bir model/fine-tuning denerim",
    "case047:2":"JSON hatasını daha fazla doküman ekleyerek RAG tarafında çözmeye çalışırım",
    "case048:1":"Önce kök nedeni tamamen bulana kadar servise müdahale etmem",
    "case048:2":"Yalnız teknik logları ve uptime grafiğini götürürüm; iş etkisini sonra hesaplarım",
    "case049:1":"Leakage'ı ben düzeltip kodu sessizce geri veririm; teslim tarihi kaçmasın",
    "case049:2":"İkinci hatada Buse'nin kritik feature'lara dokunmasını tamamen engellerim",
    "case050:1":"Her ekip kendi metriğini kullansın; dashboard'da ortalamasını gösterelim",
    "case050:2":"Tanımı sessizce günceller, geçmiş raporları da yeni formülle overwrite ederim",
    "case051:1":"Vendor demo skorunu en yüksek gördüğüm ürünü doğrudan satın alırım",
    "case051:2":"Stratejikse her bileşeni sıfırdan içeride geliştiririm; dış bağımlılık hiç olmasın",
    "case052:1":"İki haftaya full scope sözü verip kapsamı ekip içinde sessizce küçültürüm",
    "case052:2":"Deadline değişmiyorsa monitoring ve rollback planını sonraki sprint'e bırakırım",
    "case053:1":"Yalnız beklenen etkiye göre A ve C'yi seçer, efor/hazırlığı ikinci plana atarım",
    "case053:2":"Regülasyon işini ayrı tutar, yalnız ROI portföyü bittikten sonra ele alırım",
    "case054:1":"En yüksek bireysel teknik çıktıyı ve kapattığım ticket sayısını öne çıkarırım",
    "case054:2":"Ekip karar verebilsin ama tüm kararların son onayı yine bende kalsın",
    "case055:1":"Beklenen ROI'leri tek sayıya indirip en yüksek iki ortalamayı seçerim",
    "case055:2":"ROI ölçülemiyorsa teknoloji stratejik olduğu için finansal ölçüm aramam",
    "case056:1":"Pilot verisini anonimleştirdiğimizi varsayıp yalnız prompt kalitesini denetlerim",
    "case056:2":"Tek bir ağır onay süreci kurarım; böylece hiçbir kullanım gözden kaçmaz",
    "case057:1":"Her domain kendi stack, KPI ve standardını seçsin; merkez sadece danışman olsun",
    "case057:2":"Standart dışı işleri tamamen yasaklarım; istisna mekanizması tanımlamam",
    "case058:1":"Model accuracy/AUC artışını finansal faydanın doğrudan karşılığı kabul ederim",
    "case058:2":"Saat tasarrufunu tüm çalışan sayısıyla çarpıp potansiyeli gerçekleşmiş fayda yazarım",
    "case059:1":"Üç yıllık proje backlog'unu strateji olarak sunar, KPI'ları projeler başlayınca belirlerim",
    "case059:2":"Başarıyı bütçenin kullanılması ve zamanında teslim edilen proje sayısıyla izlerim"
  };

  function autoTrap(st, def){
    const s = `${st.goal||""} ${st.prompt||""}`.toLocaleLowerCase("tr");
    if (/auc|metric|metrik|accuracy|precision|recall/.test(s)) return "Tek bir teknik metriği optimize eder, iş maliyeti ve kullanım bağlamını sabit kabul ederim";
    if (/threshold|eşik/.test(s)) return "0,50 eşiğini standart kabul eder, operasyon kapasitesini ayrıca değerlendirmem";
    if (/leak|sızınt|zaman|temporal|availability/.test(s)) return "Rastgele train/test split yeterli der, bilginin ne zaman oluştuğunu ayrıca kontrol etmem";
    if (/baseline/.test(s)) return "Doğrudan daha karmaşık modeli dener, basit baseline kurmadan iyileşmeyi yorumlarım";
    if (/business|iş|aksiyon|karar/.test(s)) return "Teknik olarak en iyi görünen seçeneği alır, kararın iş akışında nasıl kullanılacağını sonra netleştiririm";
    if (/calibr|olasılık/.test(s)) return "Sıralama metriği yüksekse olasılıkların da doğru kalibre olduğunu varsayarım";
    if (/forecast|tahmin|backtest/.test(s)) return "Rastgele cross-validation kullanır, zaman sırasını ikincil kabul ederim";
    if (/xai|shap|açıkla/.test(s)) return "En yüksek SHAP değerini nedensel etki olarak yorumlarım";
    if (/rag|llm|genai|halluc/.test(s)) return "Modeli büyütmenin hem retrieval hem generation hatalarını tek başına çözeceğini varsayarım";
    if (/fair|bias|adalet|alt grup/.test(s)) return "Genel ortalama iyi olduğu sürece alt grup farklarını kabul edilebilir sayarım";
    if (/drift|monitor/.test(s)) return "Alarm eşiği aşılır aşılmaz otomatik retrain başlatırım; önce iş etkisini doğrulamam";
    if (/model|ml|tahmin/.test(s)) return "En karmaşık modeli seçerim; ek performansın bakım ve açıklanabilirlik maliyetine değdiğini varsayarım";
    return def.chapter >= 6
      ? "En hızlı görünen aksiyonu seçer, ikinci derece riskleri ve geri dönüş planını sonraya bırakırım"
      : "Teknik olarak makul görünen ilk çözümü seçer, alternatif açıklamaları ve iş bağlamını ayrıca test etmem";
  }
  function consequence(def, st, label){
    const ch=def.chapter||1;
    if(ch>=8) return "Kurul kararının ölçülebilirliği zayıflar; bütçe ve risk yanlış yöne taşınabilir.";
    if(ch===7) return "Kısa vadede hız sağlasa da ekip bağımlılığı ve karar kalitesi kötüleşir.";
    if(ch===6) return "Production riski büyür; alarmı çözmek yerine yeni bir teknik veya operasyonel borç yaratabilirsin.";
    if(ch===5) return "Model metriği iyi görünse bile gerçek kullanımda yanlış güven veya yanlış optimizasyon oluşabilir.";
    return "Analiz ikna edici görünebilir ama karar yanlış varsayıma dayanır; sonraki adımda hata büyüyebilir.";
  }
  CASES.filter(d => (d.chapter||1) >= 4 && (d.chapter||1) <= 8).forEach(def => {
    def.steps.forEach((st,si)=>{
      if(st.type!=="choice" || !Array.isArray(st.options)) return;
      let trapNo=0;
      while(st.options.length < 4){
        const manualLabel = trapNo===0 ? manual[`${def.id}:${si}`] : null;
        let label = manualLabel || autoTrap(st,def);
        if(st.options.some(o=>o.label===label)) label = trapNo%2===0
          ? "Önce en güçlü görünen teknik sinyale göre aksiyon alır, sonucu daha sonra iş metriğiyle doğrularım"
          : "Kararı hızlandırmak için mevcut ortalama metriği yeterli kabul eder, segment ve operasyon kısıtlarını sonraki iterasyona bırakırım";
        st.options.push({label, fb:"Bu seçenek ilk bakışta savunulabilir; ancak kritik bir varsayımı doğrulamadan karar veriyor.", consequence:consequence(def,st,label)});
        trapNo++;
      }
      st.options.forEach(o=>{ if(!o.correct && !o.consequence) o.consequence=consequence(def,st,o.label); });
      if(!st.learningLens && def.chapter>=3){
        st.learningLens = `${st.goal || def.review?.discovered || "Kararı bağlamla birlikte değerlendir."} ${def.review?.habit ? "Pratik kural: "+def.review.habit : ""}`.trim();
      }
    });
  });
  window.DT_LEARNING_DEPTH={version:"3.6"};
})();

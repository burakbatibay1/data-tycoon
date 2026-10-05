/* DATA TYCOON v4.0 — Progressive Pedagogy
   Goal: eliminate answer-position gaming, strengthen plausible distractors,
   and require reasoning for advanced decisions. Runs after all case definitions,
   before the engine starts. */
(function(){
  const traps = {
    metric:["Tek bir teknik metriği en yükseğe çıkarır, operasyon maliyetini sabit varsayarım","Offline skor en yüksekse modeli seçer; segment ve threshold davranışını sonra incelerim"],
    time:["Rastgele train/test split kullanır; veri çoksa zaman sırasının etkisinin küçüleceğini varsayarım","Bugün erişilebilen tüm alanları feature yapar; prediction anındaki erişilebilirliği ayrıca kontrol etmem"],
    prod:["Alarmı doğrulamadan retrain başlatır; hızlı müdahaleyi kök neden analizinden önemli görürüm","Teknik dashboard normale dönünce incident'ı kapatır; iş etkisini ayrıca doğrulamam"],
    business:["Teknik olarak en iyi seçeneği alır, kararın iş akışında nasıl kullanılacağını sonraki sprintte netleştiririm","En yüksek beklenen getiriyi seçer; belirsizlik, kapasite ve geri dönüş planını ikinci plana atarım"],
    causal:["Güçlü korelasyonu aksiyon için yeterli görür; alternatif açıklamaları ayrıca test etmem","Before/after farkını kontrol grubu olmadan müdahalenin etkisi kabul ederim"],
    ai:["Daha büyük modeli seçer; retrieval, değerlendirme ve veri sınırlarını model kapasitesinin çözeceğini varsayarım","Demo kalitesi yüksekse production için yeterli kanıt sayar; eval set ve failure taxonomy'yi sonra kurarım"],
    generic:["İlk makul açıklamayı seçer, alternatif hipotezleri doğrulamadan aksiyona geçerim","En hızlı çözümü uygular, ikinci derece riskleri ve geri dönüş planını sonraya bırakırım"]
  };
  function family(st,def){const s=((st.prompt||'')+' '+(st.goal||'')+' '+(def.tags||[]).join(' ')).toLowerCase();
    if(/auc|metric|accuracy|precision|recall|threshold|eşik|calibr/.test(s))return'metric';
    if(/time|temporal|leak|forecast|backtest|zaman|sızınt/.test(s))return'time';
    if(/drift|monitor|incident|production|pipeline|serv/.test(s))return'prod';
    if(/causal|confound|did|experiment|random|nedens/.test(s))return'causal';
    if(/llm|rag|genai|ai |yz|halluc|prompt/.test(s))return'ai';
    if(/business|iş|roi|strate|portföy|bütçe|karar/.test(s))return'business'; return'generic';}
  function consequence(ch){return ch>=8?"Kurul düzeyinde yanlış öncelik, bütçe ve risk dağılımına dönüşür.":ch===7?"Karar kısa vadede çalışsa bile ekip bağımlılığını ve yönetişim borcunu büyütür.":ch===6?"Production'da yanlış müdahale incident süresini veya model riskini artırabilir.":ch===5?"Offline başarı gerçek kullanımda yanlış güvene veya yanlış optimizasyona dönüşebilir.":ch===4?"Model iyi görünür ama problem tanımı ya da değerlendirme tasarımı nedeniyle yanlış karar üretir.":"Analiz ikna edici görünür fakat doğrulanmamış varsayım sonraki adımda büyür."}
  function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  let choiceNo=0, counts=[0,0,0,0];
  CASES.forEach(def=>def.steps.forEach((st,si)=>{
    if(st.type!=="choice"||!Array.isArray(st.options))return;
    const ch=def.chapter||1, min=ch>=4?4:3, fam=family(st,def), used=new Set(st.options.map(o=>o.label));
    for(const label of [...traps[fam],...traps.generic]){if(st.options.length>=min)break;if(!used.has(label)){st.options.push({label,fb:"Bu yaklaşım savunulabilir görünüyor; fakat kritik bir varsayımı kanıtlamadan aksiyona geçiyor.",consequence:consequence(ch)});used.add(label)}}
    st.options.forEach(o=>{if(!o.correct&&!o.consequence)o.consequence=consequence(ch)});
    // deterministic balanced correct positions. Ch4+ uses all A-D; early chapters A-C.
    const width=Math.min(st.options.length,ch>=4?4:3), target=choiceNo%width; choiceNo++;
    const ci=st.options.findIndex(o=>o.correct); if(ci>=0&&ci!==target){const [ok]=st.options.splice(ci,1);st.options.splice(target,0,ok)}
    const pos=st.options.findIndex(o=>o.correct);if(pos>=0)counts[pos]++;
    if(ch>=4){
      const why=(st.goal||def.review?.discovered||def.concept?.text||"Kararın varsayımını ve iş etkisini birlikte doğrulamak gerekir.");
      const bad1=fam==='prod'?"Çünkü hızlı aksiyon her zaman kök neden doğrulamasından daha değerlidir.":fam==='metric'?"Çünkü tek bir offline metrik business kararını temsil etmek için yeterlidir.":"Çünkü ilk makul açıklama genellikle yeterlidir; ek doğrulama yalnız teslimatı geciktirir.";
      const bad2=fam==='time'?"Çünkü veri hacmi büyüdükçe zaman ve bilgi erişilebilirliği kaynaklı leakage önemsizleşir.":fam==='ai'?"Çünkü model kapasitesi arttıkça değerlendirme ve yönetişim ihtiyacı azalır.":"Çünkü teknik olarak çalışan çözümün operasyon ve iş bağlamını ayrıca sınamaya gerek yoktur.";
      let ro=[{label:why,correct:true},{label:bad1},{label:bad2}]; const rt=hash(def.id+':'+si)%3,ri=0;const [r]=ro.splice(ri,1);ro.splice(rt,0,r);st.reasonOptions=ro;
      st.learningLens=`${why}${def.review?.habit?' Pratik kural: '+def.review.habit:''}`;
    }
  }));
  window.DT_PEDAGOGY_V4={version:'4.0',correctPositionCounts:counts};
})();

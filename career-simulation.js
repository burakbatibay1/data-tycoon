/* DATA TYCOON v7.0–v7.3 — living career simulation (no audio) */
(function(){
  const HEALTH_DEFAULT={businessImpact:50,dataTrust:50,modelReliability:50,teamHealth:50,aiRisk:30};
  const REL_DEFAULT={maya:0,deniz:0,buse:0,alex:0,zeynep:0,ceo:0};
  const HN={businessImpact:'Business Impact',dataTrust:'Data Trust',modelReliability:'Model Reliability',teamHealth:'Team Health',aiRisk:'AI Risk'};
  const HM={businessImpact:'İş kararlarının ölçülebilir değeri',dataTrust:'Veri ve dashboard’lara duyulan güven',modelReliability:'Modellerin üretimde güvenilirliği',teamHealth:'Ekip yükü, gelişimi ve çalışma sağlığı',aiRisk:'AI/mahremiyet/yönetişim riski'};
  const REL_TEXT={
    maya:['Seni gözlemliyor','Kararlarına güvenmeye başladı','Analitik yargına güveniyor','Seni lider olarak görüyor'],
    deniz:['Yeni ekip arkadaşı','Teknik refleksini biliyor','Sana teknik olarak güveniyor','Kritik işlerde seni arıyor'],
    buse:['Seni tanıyor','Senden öğreniyor','Seni mentor görüyor','Kendi kararlarını seninle tartışıyor'],
    alex:['Yeni ekip arkadaşı','Birlikte çalışmaya alıştı','Muhakemene güveniyor','Seni güçlü bir partner görüyor'],
    zeynep:['Seni tanıyor','Analizlerini takip ediyor','İş yorumuna güveniyor','Seni karar ortağı görüyor'],
    ceo:['Henüz uzaktan izliyor','Sonuçlarını fark ediyor','Karar çerçevene güveniyor','Stratejik görüşünü özellikle soruyor']
  };
  function init(){
    player.companyHealth={...HEALTH_DEFAULT,...(player.companyHealth||{})};
    player.relationships={...REL_DEFAULT,...(player.relationships||{})};
    player.careerHistory=Array.isArray(player.careerHistory)?player.careerHistory:[];
    player.longConsequences=Array.isArray(player.longConsequences)?player.longConsequences:[];
    player.mentoring={stage:0,reviews:0,delegations:0,goodFeedback:0,...(player.mentoring||{})};
    player.performanceReviews=player.performanceReviews||{};
    player.flags=player.flags||{};
  }
  init();
  const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
  function health(delta,reason){
    Object.entries(delta||{}).forEach(([k,v])=>{ if(k in player.companyHealth) player.companyHealth[k]=clamp(player.companyHealth[k]+v); });
    if(reason) player.careerHistory.push({day:player.day,type:'impact',text:reason});
  }
  function rel(who,n,reason){
    if(!(who in player.relationships)) return;
    player.relationships[who]=clamp(player.relationships[who]+n,-10,20);
    if(reason) player.careerHistory.push({day:player.day,type:'relationship',who,text:reason});
  }
  function relLevel(who){ const v=player.relationships[who]||0; return v>=10?3:v>=5?2:v>=2?1:0; }
  function companyBand(v,invert){ const x=invert?100-v:v; return x>=75?'Güçlü':x>=55?'Sağlıklı':x>=35?'Dikkat':'Riskli'; }
  function recordConsequence(id,text){ if(!player.longConsequences.some(x=>x.id===id)) player.longConsequences.push({id,day:player.day,text}); }

  const INTERRUPT_EFFECTS={
    int_dashboard_spike:{good:{dataTrust:5,businessImpact:2},bad:{dataTrust:-5,businessImpact:-2},rel:'maya',memory:'Dashboard anomalilerinde açıklamadan önce ölçümü doğruladın.'},
    int_ab_early:{good:{dataTrust:3,businessImpact:3},bad:{dataTrust:-3,businessImpact:-4},rel:'zeynep',memory:'Erken A/B sonucunu kesin etki diye sunmadın.'},
    int_accuracy_96:{good:{modelReliability:5,teamHealth:2},bad:{modelReliability:-5},rel:'buse',mentor:true,memory:'Buse ile accuracy tuzağını iş hata maliyeti üzerinden inceledin.'},
    int_ops_capacity:{good:{businessImpact:4,modelReliability:3},bad:{businessImpact:-3,modelReliability:-2},rel:'deniz',memory:'Threshold kararını operasyon kapasitesine bağladın.'},
    int_leakage_review:{good:{modelReliability:6,dataTrust:3},bad:{modelReliability:-7,dataTrust:-2},rel:'buse',mentor:true,memory:'Prediction-time leakage’i production’a gitmeden yakaladın.'},
    int_prediction_drop:{good:{modelReliability:5,teamHealth:2},bad:{modelReliability:-6,teamHealth:-2},rel:'maya',memory:'Production incident’ta trafik → veri → serving → model sırasını kullandın.'},
    int_corr_claim:{good:{dataTrust:4,businessImpact:2},bad:{dataTrust:-4,businessImpact:-2},rel:'alex',memory:'Korelasyonu nedensellik diye sunmadın.'},
    int_privacy_channel:{good:{aiRisk:-6,dataTrust:4},bad:{aiRisk:8,dataTrust:-5},rel:'deniz',memory:'Hız baskısında bile kişisel veri paylaşımını durdurdun.'},
    int_delegate_buse:{good:{teamHealth:6,businessImpact:3},bad:{teamHealth:-5,businessImpact:-2},rel:'maya',mentor:true,delegate:true,memory:'Lead olarak işi doğru kişiye verip review checkpoint koydun.'},
    int_ceo_ai:{good:{businessImpact:5,aiRisk:-4},bad:{businessImpact:-4,aiRisk:6},rel:'ceo',memory:'AI kararını teknolojiyle değil değer hipoteziyle başlattın.'}
  };

  const baseCase=COMPLETE.case, baseEvent=COMPLETE.event, baseFinale=COMPLETE.finale;
  COMPLETE.case=function(def){
    const pr=prog(def.id), clean=(pr.mistakes||0)===0 && !pr.hint && !pr.solve;
    const ch=def.chapter||player.chapter||1;
    health(clean?{dataTrust:1,businessImpact:ch>=4?1:0}:{dataTrust:-1}, clean?`${def.title}: temiz ve bağımsız karar.`:`${def.title}: karar düzeltmeyle tamamlandı.`);
    if(def.who && def.who!=='you') rel(def.who,clean?1:0);
    return baseCase(def);
  };
  COMPLETE.event=function(def){
    const pr=prog(def.id); const cfg=INTERRUPT_EFFECTS[def.id];
    if(cfg){
      const clean=(pr.mistakes||0)===0 && !pr.hint && !pr.solve;
      health(clean?cfg.good:cfg.bad, cfg.memory);
      rel(cfg.rel,clean?2:0,cfg.memory);
      if(cfg.mentor){ player.mentoring.reviews++; if(clean) player.mentoring.goodFeedback++; }
      if(cfg.delegate && clean) player.mentoring.delegations++;
      recordConsequence(def.id,cfg.memory);
    }
    return baseEvent(def);
  };
  COMPLETE.finale=function(){
    player.lastReview=buildReview(player.chapter);
    player.performanceReviews[player.chapter]=player.lastReview;
    health({businessImpact:2,teamHealth:2},`Bölüm ${player.chapter} performans değerlendirmesi tamamlandı.`);
    rel('maya',2,'Terfi değerlendirmesi');
    return baseFinale();
  };

  function avgSkill(keys){ const vals=keys.map(k=>player.skills[k]||0); return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0; }
  function buildReview(ch){
    const scores={
      'Problem Solving':avgSkill(['dataQuality','eda','businessThinking']),
      'Technical Depth':avgSkill(['sql','python','modelEvaluation','featureEngineering','mlops']),
      'Business Thinking':avgSkill(['businessThinking','communication','causal']),
      'Communication':avgSkill(['communication','visualization','businessThinking']),
      'Leadership':Math.round(clamp(25+ch*7+(player.mentoring.goodFeedback||0)*4+(player.mentoring.delegations||0)*7+relLevel('maya')*5))
    };
    const strongest=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
    const weakest=Object.entries(scores).sort((a,b)=>a[1]-b[1])[0];
    const evidence=(player.longConsequences||[]).slice(-3).map(x=>x.text);
    return {chapter:ch,day:player.day,scores,strongest:strongest[0],development:weakest[0],evidence};
  }

  const oldCareer=viewCareer;
  viewCareer=function(){
    const base=oldCareer();
    const healthCards=Object.entries(player.companyHealth).map(([k,v])=>`<div class="health-row"><div><b>${HN[k]}</b><small>${HM[k]}</small></div><span class="health-band">${companyBand(v,k==='aiRisk')}</span><strong>${v}</strong><i><em style="width:${v}%"></em></i></div>`).join('');
    const people=['maya','buse','deniz','alex','zeynep','ceo'].map(k=>`<div class="sim-rel">${avatar(k,34)}<div><b>${PEOPLE[k]?PEOPLE[k].name.split(' ')[0]:k}</b><span>${REL_TEXT[k][relLevel(k)]}</span></div></div>`).join('');
    const review=player.lastReview||player.performanceReviews[player.chapter-1];
    const reviewHtml=review?`<section class="card performance-card"><span class="eyebrow">Son performance review</span><h3>${review.strongest} güçlü tarafın</h3><p>Gelişim odağı: <b>${review.development}</b></p><div class="review-bars">${Object.entries(review.scores).map(([k,v])=>`<div><span>${k}</span><i><em style="width:${v}%"></em></i><b>${v}</b></div>`).join('')}</div></section>`:'';
    return `<div class="career-sim-grid"><section class="card company-health"><span class="eyebrow">Nexora Health</span><h3>Kararların şirkette iz bırakıyor</h3>${healthCards}</section><section class="card relationship-state"><span class="eyebrow">Çalışma ilişkileri</span><h3>İnsanlar kararlarını hatırlıyor</h3>${people}</section></div>${reviewHtml}${base}`;
  };

  const oldPromotion=viewPromotion;
  viewPromotion=function(){
    const r=player.lastReview||buildReview(player.chapter);
    const maya=relLevel('maya')>=2?'Teknik olarak hazır olmanın ötesine geçtin; artık kararlarına güveniyorum.':'Bu rol için gerekli kanıtı gösterdin. Bir sonraki dönemde daha fazla bağımsızlık bekliyorum.';
    return `<section class="promotion-review card"><span class="eyebrow">Performance Review</span><h2>${playerName()}, bu dönemin değerlendirmesi</h2><p class="quote">“${maya}” — Maya</p><div class="review-bars">${Object.entries(r.scores).map(([k,v])=>`<div><span>${k}</span><i><em style="width:${v}%"></em></i><b>${v}</b></div>`).join('')}</div><div class="review-summary"><div><small>En güçlü alan</small><b>${r.strongest}</b></div><div><small>Gelişim odağı</small><b>${r.development}</b></div></div>${r.evidence.length?`<div class="review-evidence"><small>Son kanıtlar</small>${r.evidence.map(x=>`<p>✓ ${x}</p>`).join('')}</div>`:''}</section>${oldPromotion()}`;
  };

  const oldRight=viewRightPanel;
  viewRightPanel=function(){
    const base=oldRight();
    const avg=Math.round((player.companyHealth.businessImpact+player.companyHealth.dataTrust+player.companyHealth.modelReliability+player.companyHealth.teamHealth+(100-player.companyHealth.aiRisk))/5);
    return `<section class="rp-block compact-health"><div class="rp-head"><span>Nexora Health</span><b>${avg}</b></div><div class="mini-health"><i style="width:${avg}%"></i></div><p class="muted small">Kararlarının şirket üzerindeki birikimli izi.</p></section>${base}`;
  };

  /* Buse arc: existing interruptions become a visible mentoring story without adding grind. */
  function mentoringStage(){ const ch=player.chapter||1; return ch>=7?3:ch>=5?2:ch>=3?1:0; }
  const oldRender=render;
  render=function(){
    init(); player.mentoring.stage=Math.max(player.mentoring.stage,mentoringStage());
    const st=player.mentoring.stage;
    const key=`buse_arc_${st}`;
    if(st>0 && !player.flags[key]){
      player.flags[key]=true;
      const msg=st===1?'Bir ara cohort analizime bakar mısın? Senin nasıl düşündüğünü görmek istiyorum.':st===2?'Model review’larında senden öğrendiklerimi kendi projeme uyguluyorum. Bir sonraki taslağı sana getireceğim.':'Artık junior arkadaşlar bana soru soruyor. Senin bana yaptığın gibi cevabı vermek yerine doğru soruyu sordurmaya çalışıyorum.';
      addInbox('buse',msg); rel('buse',1,'Buse mentoring hikâyesi ilerledi.'); save(true);
    }
    return oldRender();
  };

  window.DT_SIM={health,rel,relLevel,buildReview};
  save(true);
})();

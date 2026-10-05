/* DATA TYCOON v4.0 release QA */
(function(){
 const report={version:"4.0",errors:[],warnings:[],metrics:{}}; const cases=CASES||[];
 const ids=cases.map(c=>c.id);report.metrics.caseCount=ids.length;if(ids.length!==59)report.errors.push('Ana vaka sayısı 59 değil: '+ids.length);
 const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);if(dup.length)report.errors.push('Duplicate case IDs: '+[...new Set(dup)].join(', '));
 const choices=[];cases.forEach(c=>c.steps.forEach((s,si)=>{if(s.type==='choice')choices.push({c,si,s})}));
 const adv=choices.filter(x=>x.c.chapter>=4),under4=adv.filter(x=>x.s.options.length<4);report.metrics.choiceCount=choices.length;report.metrics.ch4to8ChoiceCount=adv.length;report.metrics.ch4to8Under4=under4.length;if(under4.length)report.errors.push('Ch4–8 içinde 4 seçenekten az sorular: '+under4.map(x=>x.c.id+':'+x.si).join(', '));
 const pos={A:0,B:0,C:0,D:0};adv.forEach(x=>{const i=x.s.options.findIndex(o=>o.correct);if(i>=0&&i<4)pos['ABCD'[i]]++});report.metrics.ch4to8CorrectPositions=pos;const vals=Object.values(pos),tot=vals.reduce((a,b)=>a+b,0);if(tot&&Math.max(...vals)/tot>.34)report.errors.push('Ch4–8 doğru cevap pozisyonu %34 üzerinde: '+JSON.stringify(pos));
 report.metrics.reasonGate=adv.filter(x=>Array.isArray(x.s.reasonOptions)&&x.s.reasonOptions.length>=3).length;if(report.metrics.reasonGate!==adv.length)report.errors.push('Ch4–8 reason gate coverage eksik.');
 const promos=[1,2,3,4,5,6,7,8].map(ch=>({ch,id:CH_PROMO_CASE[ch],def:CASE_BY_ID[CH_PROMO_CASE[ch]]}));report.metrics.promotionCases=promos.filter(x=>x.def).length;if(report.metrics.promotionCases!==8)report.errors.push('8/8 promotion case bulunamadı.');
 report.metrics.transferChoices=choices.filter(x=>x.s.transfer).length;report.metrics.officeEvents=EVENTS.length;report.metrics.v4ImmersionEvents=EVENTS.filter(e=>e.id.startsWith('ev40_')).length;
 setTimeout(()=>{report.metrics.viewport={w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth};if(document.documentElement.scrollWidth>innerWidth+2)report.warnings.push('Sayfa yatay taşıyor.');finish()},350);
 function finish(){report.pass=report.errors.length===0;const pre=document.createElement('pre');pre.id='qaReport';pre.style='white-space:pre-wrap;padding:24px;background:#0b1220;color:#e8eef9;font:14px/1.5 monospace';pre.textContent=JSON.stringify(report,null,2);document.body.innerHTML='';document.body.appendChild(pre);document.title=report.pass?'QA PASS — DATA TYCOON':'QA FAIL — DATA TYCOON';console.log('DT_QA',report)}
})();

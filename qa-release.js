/* DATA TYCOON release QA — run only from qa-release.html */
(function(){
 const report={version:"3.6",errors:[],warnings:[],metrics:{}};
 const cases=CASES||[];
 const ids=cases.map(c=>c.id); report.metrics.caseCount=ids.length;
 const dup=ids.filter((x,i)=>ids.indexOf(x)!==i); if(dup.length) report.errors.push("Duplicate case IDs: "+[...new Set(dup)].join(", "));
 const choices=[]; cases.forEach(c=>c.steps.forEach((s,si)=>{if(s.type==="choice")choices.push({c,si,s});}));
 const late=choices.filter(x=>x.c.chapter>=4), two=late.filter(x=>x.s.options.length<3);
 report.metrics.choiceCount=choices.length; report.metrics.ch4to8ChoiceCount=late.length; report.metrics.ch4to8Under3=two.length;
 if(two.length) report.errors.push("Ch4–8 içinde 3'ten az seçenekli sorular: "+two.map(x=>x.c.id+":"+x.si).join(", "));
 const pos={A:0,B:0,C:0,D:0}; choices.forEach(x=>{const i=x.s.options.findIndex(o=>o.correct); if(i>=0&&i<4)pos["ABCD"[i]]++;}); report.metrics.correctPositions=pos;
 const total=Object.values(pos).reduce((a,b)=>a+b,0); if(total){const mx=Math.max(...Object.values(pos)),mn=Math.min(...Object.values(pos).filter(v=>v>0)); if(mx/total>.42)report.warnings.push("Doğru cevap pozisyonlarından biri %42 üzerinde."); if(mn===0)report.warnings.push("En az bir cevap pozisyonu hiç kullanılmıyor.");}
 const promos=[1,2,3,4,5,6,7,8].map(ch=>({ch,id:CH_PROMO_CASE[ch],def:CASE_BY_ID[CH_PROMO_CASE[ch]]}));
 promos.filter(x=>!x.id||!x.def).forEach(x=>report.errors.push(`Bölüm ${x.ch} terfi vakası bulunamadı.`)); report.metrics.promotionCases=promos.filter(x=>x.def).length;
 report.metrics.transferChoices=choices.filter(x=>x.s.transfer).length;
 report.metrics.learningLens=choices.filter(x=>x.c.chapter>=3&&x.s.learningLens).length;
 // Basic mobile overflow smoke metric at current viewport.
 setTimeout(()=>{report.metrics.viewport={w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth}; if(document.documentElement.scrollWidth>innerWidth+2)report.warnings.push("Sayfa yatay taşıyor: "+document.documentElement.scrollWidth+"px > "+innerWidth+"px"); finish();},250);
 function finish(){
  report.pass=report.errors.length===0;
  const pre=document.createElement("pre"); pre.id="qaReport"; pre.style="white-space:pre-wrap;padding:24px;background:#0b1220;color:#e8eef9;font:14px/1.5 monospace"; pre.textContent=JSON.stringify(report,null,2); document.body.innerHTML=""; document.body.appendChild(pre); document.title=report.pass?"QA PASS — DATA TYCOON":"QA FAIL — DATA TYCOON"; console.log("DT_QA",report);
 }
})();

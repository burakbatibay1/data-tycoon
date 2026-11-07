/* DATA TYCOON — Consent-first, device-local monetization validation.
   No network requests, no payments, no emails. Analytics are exportable only by the player. */
(() => {
  'use strict';
  const KEY='dt_growth_v1', CONSENT='dt_growth_consent_v1', PRICES=[149,249,399];
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const put=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
  const price=()=>{const x=get();if(!PRICES.includes(x.price)){x.price=PRICES[Math.floor(Math.random()*PRICES.length)];put(x)}return x.price};
  const consent=()=>localStorage.getItem(CONSENT)==='yes';
  const event=(name,extra={})=>{if(!consent())return;const x=get();x.events=Array.isArray(x.events)?x.events:[];x.events.push({name,at:new Date().toISOString(),...extra});x.events=x.events.slice(-500);put(x)};
  let lastScreen='',lastCase='';
  function attachOffer(){
    const box=document.getElementById('growth-offer');if(!box)return;
    const pr=price();document.getElementById('growth-price').textContent=pr+' TL';
    const c=document.getElementById('growth-analytics-consent');c.checked=consent();
    c.onchange=()=>{localStorage.setItem(CONSENT,c.checked?'yes':'no');if(c.checked)event('analytics_opt_in')};
    if(box.dataset.ready==='yes')return;box.dataset.ready='yes';
    event('offer_shown',{price:pr});
    for(const [id,name,msg] of [
      ['growth-interest','interest_clicked','Teşekkürler! Henüz satış veya ödeme yok. Beta kariyerine ücretsiz devam edebilirsin.'],
      ['growth-no','not_interested','Geri bildirimin için teşekkürler. Beta tamamen ücretsiz devam ediyor.']]){
      document.getElementById(id).onclick=()=>{event(name,{price:pr});document.getElementById('growth-response').textContent=msg;};
    }
    document.getElementById('growth-export').onclick=()=>{
      const blob=new Blob([JSON.stringify({consent:consent(),data:get()},null,2)],{type:'application/json'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='data-tycoon-olcum-verileri.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    };
    document.getElementById('growth-clear').onclick=()=>{localStorage.removeItem(KEY);localStorage.removeItem(CONSENT);c.checked=false;document.getElementById('growth-response').textContent='Yerel ölçüm verileri silindi. Oyun kaydın korunuyor.';};
  }
  function inspect(){
    const screen=document.body?.dataset?.screen||'';
    if(screen!==lastScreen){if(screen==='office')event('office_view');lastScreen=screen;}
    if(typeof player!=='undefined'&&player.started){
      const current=player.screen==='case'?String(player.param||''):'';
      if(current&&current!==lastCase)event('case_opened',{case:current});lastCase=current;
    }
    if(screen==='chapter' && typeof player!=='undefined' && player.chapterDone){
      const key=String(player.chapter);
      if(lastChapterLogged!==key){event('chapter_complete',{chapter:player.chapter});lastChapterLogged=key;}
    }
    attachOffer();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    // Observe game renders without altering its navigation or save system.
    const workspace=document.getElementById('workspace');
    if(workspace){const observer=new MutationObserver(inspect);observer.observe(workspace,{childList:true});}
    inspect();
  });
  window.DTGrowth={exportLocal:()=>get(),record:event,consented:consent};
})();

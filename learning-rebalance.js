/* DATA TYCOON v6.1 — deterministic answer-position balance
   Case choices are balanced chapter-by-chapter instead of pseudo-randomly.
   Ch4–8 run after learning-depth, therefore every choice has >=4 plausible options.
   This prevents a learnable B-pattern while keeping order stable across reloads. */
(function(){
  const stats={};
  function moveCorrect(st,target){
    const correct=st.options.findIndex(o=>o&&o.correct===true); if(correct<0||target===correct)return;
    const x=st.options.splice(correct,1)[0]; st.options.splice(target,0,x);
  }
  for(let ch=1;ch<=8;ch++){
    let n=0; const pos=[0,0,0,0], lens={};
    CASES.filter(d=>(d.chapter||1)===ch).forEach(def=>{
      def.steps.forEach(st=>{
        if(st.type!=="choice"||!Array.isArray(st.options)||st.options.length<2)return;
        if(st.options.some(o=>/^[A-D][:)]\s/.test(o.label)))return;
        const len=st.options.length; const target=n%len; moveCorrect(st,target); n++;
        const ci=st.options.findIndex(o=>o&&o.correct===true); if(ci>=0&&ci<4)pos[ci]++;
        lens[len]=(lens[len]||0)+1;
      });
    });
    stats[ch]={choices:n,A:pos[0],B:pos[1],C:pos[2],D:pos[3],optionCounts:lens};
  }
  // Non-case content: stable deterministic rotation, separate from chapter audit.
  let extra=0;
  [...QUESTS,...EVENTS,...Object.values(MORNING_DEFS),...(typeof PREVIEWS!=="undefined"?PREVIEWS:[])].forEach(def=>{
    (def.steps||[]).forEach(st=>{
      if(st.type!=="choice"||!Array.isArray(st.options)||st.options.length<2)return;
      if(st.options.some(o=>/^[A-D][:)]\s/.test(o.label)))return;
      moveCorrect(st,extra%st.options.length); extra++;
    });
  });
  window.DT_ANSWER_AUDIT={version:"6.1",chapters:stats,extras:extra};
  console.table(stats);
})();

/* DATA TYCOON v3.5 — Cevap pozisyonu dengeleme (düzeltilmiş)
   v3.4'teki sürüm window.CASES'e bakıyordu; CASES bir const olduğu için window'da yoktu ve modül hiç çalışmıyordu.
   Bu sürüm tüm içerik yüklendikten sonra (polish.js'ten sonra) çalışır ve şunları dengeler:
   vakalar, yan görevler, ofis olayları ve sabah özetleri.
   Doğru cevabın yeri vaka + adım kimliğine göre deterministiktir; sayfa yenilense de aynı kalır.
   Seçenekleri görselde harfle eşlenen adımlar (örn. "A: pasta grafik") karıştırılmaz. */
(function () {
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rebalance(def) {
    if (!def || !Array.isArray(def.steps) || def._rebalanced) return;
    def._rebalanced = true;
    def.steps.forEach((st, si) => {
      if (st.type !== "choice" || !Array.isArray(st.options) || st.options.length < 2) return;
      if (st.options.some(o => /^[A-D][:)]\s/.test(o.label))) return;
      const correct = st.options.findIndex(o => o && o.correct === true); if (correct < 0) return;
      const target = hash(`${def.id}:${si}:v35`) % st.options.length;
      if (target !== correct) { const x = st.options.splice(correct, 1)[0]; st.options.splice(target, 0, x); }
    });
  }
  const defs = [...CASES, ...QUESTS, ...EVENTS, ...Object.values(MORNING_DEFS), ...(typeof PREVIEWS !== "undefined" ? PREVIEWS : [])];
  defs.forEach(rebalance);
  // Yarıda kalmış kayıtlarda seçenek sırası değiştiyse yanlış işaretler kaymasın
  if (typeof player !== "undefined" && player && player.progress) Object.values(player.progress).forEach(pr => { if (pr && !pr.solved) { pr.wrong = []; pr.fb = null; } });
  window.DT_LEARNING_REBALANCE = { version: "3.5", count: defs.length };
})();

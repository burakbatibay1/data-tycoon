# DATA TYCOON v4.0 — Career Simulation & Learning Rebuild

Bu sürüm tek parça bir öğrenme + immersion revizyonudur.

## Öğrenme ve zorluk
- Tüm 59 ana vaka korunur.
- Ch1–3: en az 3 seçenek; öğretici rehberlik kademeli azalır.
- Ch4–8: her choice en az 4 seçeneklidir.
- Doğru cevap pozisyonları runtime shuffle yerine deterministik ve dengeli A/B/C/D dağıtılır; oyuncu cevap harfi ezberleyemez.
- Ch4–8'de kritik choice adımları artık **Karar → Neden? → Sonuç** akışındadır. Doğru kararı seçmek tek başına yetmez; doğru gerekçe de seçilmelidir.
- Yanlış seçenekler gerçek analist tuzaklarından üretilir: metric fixation, leakage, otomatik retrain, offline/online mismatch, causal overclaim, AI demo bias, ROI/kapasite/risk trade-off vb.
- Yanlış kararlarda bölüm seviyesine göre gerçekçi consequence gösterilir.
- Ch4+ yarım kalmış eski progress v4'e geçerken güvenli biçimde ilgili vakanın başından başlatılır; tamamlanmış vakalar korunur.

## Ofis ve hikâye
- İlk gün Maya artık yalnız mesaj atmaz; ofiste oyuncunun masasına yürüyerek gelir ve ilk vakayı yüz yüze verir.
- Kariyer boyunca yeni rastgele insan anları eklendi: Maya beyaz tahta, Buse öğle arası, Maya koridor konuşması, Deniz incident kahvesi, Buse PR review ve CEO kurul öncesi koridor konuşması.
- Bu anlar XP dağıtan dekor değil; bölüm seviyesine uygun mini karar/transfer içerir.
- Animasyonlar reduced-motion ve oyun içi animasyon ayarına saygı gösterir.

## QA release kriterleri
- 59 ana vaka / duplicate ID yok.
- 8/8 promotion case mevcut.
- Ch4–8 iki veya üç seçenekli choice = 0; minimum 4 seçenek.
- Ch4–8 reason-gate coverage = %100.
- Ch4–8 doğru cevap A/B/C/D dağılımında tek pozisyon %34'ü geçmemeli.
- JS syntax kontrolü release öncesi çalıştırılır.
- `qa-release.html` tarayıcı içi release metriklerini gösterir.

Not: Syntax/statik QA gerçek kullanıcı browser-playtest'inin yerine geçmez. Final launch öncesi desktop + mobile gerçek oynanış QA ayrıca yapılmalıdır.

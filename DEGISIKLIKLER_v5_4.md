# DATA TYCOON v5.4 — Instant Cinematic Fix

- v5.2 karşılama tasarımı geri getirildi.
- Üç sahneli preload/loading kaldırıldı.
- Tek, yerel ve hafif `firstday-clean-3.webp` sahnesi kullanılıyor.
- Görsel head içinde yüksek öncelikle preload ediliyor.
- Maya diyalogu görsel beklemeden hızlı fade ile açılıyor.
- Görsel hata verirse `virelio-ofis.jpg` fallback kullanılıyor.
- `background-repeat` yaklaşımı yok; sahne `<img>` + `object-fit: cover` ile çiziliyor.
- v5.2 karakter/avatar tutarlılığı korunuyor.

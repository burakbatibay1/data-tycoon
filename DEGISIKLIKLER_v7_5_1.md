# DATA TYCOON v7.5.1 — Global Scope QA

- Release kontrolüne `qa-global-scope.js` eklendi.
- Kontrol, top-level `let` / `const` ile tanımlanmış isimlere `window.<isim>` üzerinden erişimi release hatası sayar.
- Böylece `let player` + `window.player` ve `const CASES` + `window.CASES` sınıfındaki hatalar çalıştırmadan önce yakalanır.
- Yorumlar ve string içerikleri yanlış pozitif üretmemesi için tarama öncesi maskelenir.
- Komut: `node qa-global-scope.js`
- Tüm JavaScript dosyaları ayrıca `node --check` ile doğrulandı.

## Final flat-directory düzenlemesi
- `tools/sound_design.py` ana dizine taşındı: `sound_design.py`.
- `tools/` klasörü kaldırıldı.
- Final paket artık runtime ve yardımcı dosyalar açısından tek dizin yapısını korur.

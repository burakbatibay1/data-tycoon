# DATA TYCOON v3.6 — Learning Depth & QA

## Öğrenme derinliği
- Chapter 4–8'de iki seçenekli `choice` adımları runtime'da en az 3 seçeneğe çıkarıldı.
- Chapter 6–8 için yeni distractor'lar vaka/adım bazında elle yazıldı; gerçek analist tuzaklarını temsil ediyor.
- Chapter 4–5 için goal/prompt bağlamına göre teknik olarak makul ama hatalı distractor üreten kontrollü şablonlar eklendi.
- Yanlış kararlarda yalnız "yanlış" mesajı yerine üretim/iş/ekip/strateji sonucu gösteriliyor.
- Chapter 3+ doğru cevaplarından sonra `Neden bu karar?` kartı gösteriliyor. `learningLens` artık UI'da gerçekten kullanılıyor.
- v3.5 deterministik cevap pozisyonu dengelemesi korunuyor ve yeni seçenekler eklendikten sonra çalışıyor.

## Trailer
- Çalışmayan/eksik ana oyun trailer düğmesi geri eklenmedi. Trailer/capture akışı ana oyun kodundan ayrı tutuluyor; release notlarında varmış gibi gösterilmiyor.

## QA
- `qa-release.html` + `qa-release.js` eklendi.
- Kontroller: 59 case, duplicate ID, Ch4–8 minimum 3 seçenek, doğru cevap pozisyon dağılımı, 8 promotion case varlığı, transfer coverage, learning-lens coverage ve viewport yatay taşma smoke check.
- Tüm `.js` dosyaları `node --check` ile doğrulandı.
- Bu paket için otomatik gerçek tarayıcıda 59/59 tam oyun akışı tamamlandı iddiası yoktur; `qa-release.html` yapısal/runtime smoke testidir.

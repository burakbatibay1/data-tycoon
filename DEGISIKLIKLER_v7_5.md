# DATA TYCOON v7.5 — Ses yeniden tasarımı

## Kök neden: ofiste ofis sesi gelmiyordu
`audio-manager.js`, ofiste olup olmadığını `window.player` ile kontrol ediyordu. `engine.js`'de oyuncu
`let player` olarak tanımlı; `let`/`const` değişkenleri `window`'a eklenmez. Kontrol her zaman "ofiste değil"
döndüğü için ortam sesi her render'da durduruluyordu. (v7.4.2.3'teki `window.DTSound` düzeltmesiyle aynı hata
sınıfı.) Yeni yönetici oyuncuyu `typeof player` ile doğrudan okur.

## Yeni ses yöneticisi
- İki katman: taban (ofis gündüz/gece) + hava (yağmur/rüzgâr). Yağmur artık ofis sesinin yerine değil, üstüne biner.
- Boşluksuz döngü: her katman iki ses öğesiyle eşit güçlü çapraz geçiş yapar; MP3 döngü boşluğu ve 60 sn'deki takılma yok.
- 200 ms'lik tek bir kontrol döngüsü sahneyi okur ve sesi yumuşakça (~0,8 sn) hedefe taşır; ani kesilme yok.
- Hava sürekliliği: sabah yağmur sahnesi ya da pencereden görülen yağmur/rüzgâr, o gün ofiste hafif bir katman olarak sürer.
- Sahneler: ofis (tam), modal açıkken ofis geri çekilir, pencere görünümünde hava öne çıkar, sabah sahneleri, gün sonu ve çıkışta gece tonu. Vaka ve diğer ekranlarda odak için sessiz.
- Efekt çalınca ortam kısa süre kısılır (ducking); terfi gibi önemli anlarda daha belirgin.
- Ortam döngüleri her seferinde rastgele bir noktadan başlar (tekrar hissi azalır).
- Ses ayarları için yeni anahtar: `dataTycoonAudioV75`.
- `DTSound.state()` QA için katman durumunu döndürür.

## Yeni sesler (44,1 kHz stereo, prosedürel; `tools/sound_design.py` ile yeniden üretilebilir)
- Ofis gündüz (60 sn): oda tonu, havalandırma ve 60 Hz uğultusu, anlaşılmayan uzak konuşmalar, yakın/uzak klavye kümeleri (ilk saniyelerde başlar), fare, fincan tıkırtısı, kâğıt hışırtısı, oda yankısı.
- Ofis gece (60 sn): daha sessiz oda tonu, belirgin havalandırma, uzak trafik, seyrek klavye.
- Yağmur (60 sn): cam arkasından dinlenen yağmur yatağı, cama vuran damlalar, pervaza düşen iri damlalar, oluk damlası, tek bir uzak gök gürültüsü.
- Rüzgâr (60 sn): esintilerle değişen rüzgâr, hafif pencere ıslığı, ara sıra pencere titremesi.
- Efektler: bildirim, başarı, uyarı, asansör, terfi (akor kabarması + pırıltı), olay (gergin ama tiz olmayan nabız), tıklama.
- Önceki mono 22 kHz WAV'lar (≈7 MB) kaldırıldı; yeni MP3'ler ≈5 MB.

## Test
Tarayıcıda: dosya yükleme hatası yok; ofiste başlar, diğer sekmelerde söner, ofise dönünce geri gelir; pencereden yağmur görülünce yağmur katmanı eklenir ve gün boyu sürer; gece geçişi; sabah yağmur sahnesi; efektler ve ducking; sessize alma; 60 sn döngü geçişinin zaman içinde izlenmesi.

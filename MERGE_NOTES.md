# DATA TYCOON — Orijinal + Growth Validation

**Kaynak:** Kullanıcının yüklediği `h(2).zip` içindeki `h/` dizini. Bu kaynak sürüm esas alındı.

Korunanlar:
- `career-simulation.js`: Virelio Health / şirket sağlığı, ilişkiler, Buse mentoring, performans değerlendirmesi
- 59 ana vaka, mevcut kariyer ve kayıt akışı, karakterler, ses ve ofis görselleri
- Mevcut diğer JavaScript dosyaları (yalnızca `engine.js` vaka tamamlama olayına tek satır eklenerek değişti)

Eklenenler:
- `growth-validation.js`: cihazda tutulan, izinli ölçüm ve fiyat araştırması
- `screens.js`: Bölüm 1 tamamlandığında satış olmayan, beta'yı kilitlemeyen teklif ekranı
- `game.css`: teklif ekranı stilleri
- `index.html`: Growth script ve PWA manifest referansları
- PWA manifest/ikonlar, release-check ve `launch-kit/` dokümanları

Ölçüm düzeltmesi:
- `case_completed` yalnızca `completeCase()` içinde gerçek tamamlanmada kaydedilir.
- `chapter_complete` bölüm ekranı gerçekten tamamlandığında, aynı ekran açık kaldığı sürece bir kez kaydedilir.
- Veriler **sunucuya gönderilmez**; JSON dışa aktarma ile cihazdan alınır.
- E-posta listesi, ödeme sistemi ve gerçek mobil uygulama henüz mevcut değildir.

Kontrol: JS sözdizimi ve script dosyası referansları doğrulandı. Tarayıcıda tam gameplay testi yapılmadı.

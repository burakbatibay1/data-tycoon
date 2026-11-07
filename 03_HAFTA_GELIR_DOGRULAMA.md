# Hafta 3 — Fiyat ve Ürün Doğrulama

## Test tasarımı
- 3 varyant: 149 TL / 249 TL / 399 TL.
- Varyant oyuncu tarayıcısında bir kez rastgele seçilir ve aynı cihazda sabit kalır.
- İlk terfi sonrasında gösterilir; ödeme alınmaz, beta kilitlenmez.
- Butonlar: 'Bu fiyattan ilgilenirdim' ve 'Şimdilik ilgilenmiyorum'.
- Bu test **satış değil beyan edilen niyet** ölçer; gerçek ödeme dönüşümünden yüksek çıkabilir.

## Analiz
Her fiyat için teklif görenler, ilgilenenler, ilgi oranı, varsayımsal gelir/100 gösterim = fiyat × ilgi oranı × 100. Sonuçları örneklem sayıları ve belirsizlikle birlikte yorumla; 100 oyuncu üç gruba ayrıldığında kesin fiyat kararı vermek için güç sınırlıdır.

## Gerçek ödeme için sonraki koşullar
- Satın alma sağlayıcısı / vergi-fatura modeli
- Sunucu tarafında doğrulanan yetki (sadece JS/localStorage kilidi değil)
- Ürün kullanım koşulları, iade ve tüketici mevzuatı
- Ücretli içeriğin public repoda açıkça dağıtılmaması
- KVKK ve veri işleme sorumlulukları

## Karar kapısı
Güçlü ödeme niyeti + yeterli tamamlanma + düşük P0/P1 hata → küçük gerçek ödeme pilotu. Zayıf sinyal → içerik/konumlandırma yeniden çalışılır; otomatik olarak mobil geliştirmeye geçilmez.

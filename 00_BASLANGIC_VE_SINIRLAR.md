# DATA TYCOON — 30 Günlük Büyüme ve Gelir Doğrulama Paketi

## Bu sürümde gerçekten çalışanlar
- Mevcut Virelio oyunu ve kayıt sistemi korunur.
- Bölüm 1 sonu, **ödeme almayan** ve oyunu kilitlemeyen 149 / 249 / 399 TL teklif araştırması.
- Oyuncunun açık tercihiyle **yalnızca kendi tarayıcısına** kaydedilen anonim ölçüm olayları.
- Ölçüm verilerini JSON olarak dışa aktarma ve oyun kaydına dokunmadan silme.
- PWA manifest ve iki uygulama ikonu; HTTPS altında uygun tarayıcılarda ana ekrana ekleme.
- Kaynak kodu ve statik dosyalar için release-check.sh.

## Henüz yapılmayanlar / dış servis gerektirenler
- Merkezi analytics, gerçek A/B raporu, uzaktan oturum sayımı: **yok**. Tarayıcıdaki ölçümler kendiliğinden geliştiriciye ulaşmaz.
- E-posta bekleme listesi: **yok**. Açık rıza ve veri saklama altyapısı kurulmadan e-posta toplamıyoruz.
- Ödeme ve gerçek paywall: **yok**.
- Otomatik offline PWA / service worker: **yok**. Eski build cache sorunu yaşamamak için bilerek eklenmedi.
- Gerçek kullanıcı tarayıcısında tüm 59 vakalık uçtan uca test: **yapılmadı**.

## Dağıtım
1. Bu paketi GitHub'da test branch'ine yükle. `.git` hariç eski build dosyalarını temizle.
2. `bash release-check.sh` çalıştır.
3. `python3 -m http.server 8000` ile aç; yeni kariyer, devam et, Chapter 1 terfisi ve teklif ekranını dene.
4. Testlerden sonra main'e al. Mevcut kullanıcıların localStorage kayıtları silinmemelidir.
5. Canlı ölçüm için ayrıca analitik servis ve KVKK/çerez değerlendirmesi gerekir.

## Dürüst teklif metni
"Bu bir satış teklifi değildir; ödeme alınmaz. Beta kariyerine ücretsiz devam edebilirsin."

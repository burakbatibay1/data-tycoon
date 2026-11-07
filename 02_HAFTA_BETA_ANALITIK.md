# Hafta 2 — Beta ve Ölçüm

## Önerilen örneklem
50–100 yeni, hedef kitleye uygun oyuncu; yalnız arkadaş çevresine yaslanma. Üniversite toplulukları, yeni mezunlar, veri analisti adayları, kariyer değiştirenler.

## Ölçüm tanımları
- Başlama: ilk kariyer oluşturma (sunucu analitiği eklenince event)
- Aktivasyon: Case 001 tamamlama
- İlk değer: Chapter 1 tamamlama
- Niyet: fiyatlı teklifte 'ilgilenirdim' tıklaması
- Güçlü niyet: ileride açık rızalı waitlist kaydı veya gerçek ön sipariş
- Retention: D1/D7 geri dönüş (cihaz bazlı pseudonymous ID + uygun aydınlatma/izin gerekir)

## Bu paketteki sınır
Yerel eventler: `office_view`, `case_opened`, `chapter_complete`, `offer_shown`, `interest_clicked`, `not_interested`, `analytics_opt_in`. İzin verilmezse kaydedilmez. Geliştirici bu olayları uzaktan göremez; gerçek funnel raporu için merkezi altyapı bağlanmalıdır.

## Görüşme soruları
1. İlk 5 dakikada ne yapacağını anladın mı?
2. Hangi vakada takıldın, neden?
3. Oyunda gerçekten ne öğrendin? Somut bir örnek verir misin?
4. Terfi anlamlı hissettirdi mi?
5. Yarın yeniden açar mısın? Neden?
6. Tam sürüm için ödeme düşünür müsün? Hangi koşulda?

## Etik ve gizlilik
E-posta, isim, IP, sağlık/veri hassasiyeti toplanmaz. Canlı analitik kurulmadan önce KVKK aydınlatma, çerez/SDK sınıflandırması, saklama süresi ve rıza mekanizması değerlendirilmelidir.

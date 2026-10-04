# Data Tycoon v2.7: Cila ve ilerleme düzeltmeleri

## Kritik hatalar
- 6., 7. ve 8. bölümde terfi vakası hiç açılmıyordu (kanıt şartları içerikle karşılanamıyordu). Kanıt bağları ve 6 yeni yan görevle tüm bölümlerde terfi erişilebilir; şansa bağlı olaylar gelmese bile.
- Tanımsız `communication` becerisi gün sonu raporunu ve 5. bölüm yan görevlerini çökertiyordu.
- 6 vaka hiçbir kavrama bağlı değildi (006, 034, 045, 047, 051, 052); hepsi bağlandı, 3 yeni kavram eklendi.
- 5–8. bölüm finallerinde Maya 1. bölümün konuşmasını yapıyordu; her bölüme kendi finali yazıldı.
- 4–8. bölüm terfileri yanlış başarımı açıyordu; her bölümün kendi başarımı ve 'Uçtan uca kariyer' başarımı eklendi.
- Hafta günleri 4. bölümden sonra kayıyordu; tüm bölümler için düzeltildi.
- Tanımsız 'coffee' sabah sahnesi boş görünüyordu.

## İlerleme ve oyun hissi
- Her bölüm başı artık 'zaman atlaması' sahnesiyle, son günü terfi sahnesiyle açılıyor; aradaki sabahlar çeşitlendi.
- Bölüm sonu başlıkları 4–8 için yazıldı.
- 4–8. bölümlere 10 ofis olayı, 8 yan görev, 5 akşam seçimi ve Slack konuşmaları eklendi (önceden bu bölümlerde hiç olay ve akşam yoktu, 4/6/7/8'de yan görev yoktu).

## Ara animasyonlar
- Bölüm giriş kartı: bölüm numarası, zaman, rol, yeni yetenek dalları ve rehberlik seviyesi.
- Vaka giriş kartı: vaka numarası, kavram, zorluk ve XP; kendiliğinden kaybolur, tıklayınca geçilir.
- Üst barda 8 parçalı kariyer ilerleme çubuğu (mevcut bölümdeki vaka ilerlemesiyle).
- Tüm yeni animasyonlar 'Animasyonlar' ayarına ve sistemdeki 'hareketi azalt' tercihine uyar.

## Test
- 3–8. bölümlerin her biri tarayıcıda otomatik olarak baştan sona oynatıldı: sabahlar, vakalar, yan görevler, olaylar, final, terfi ve bölüm sonu hatasız.
- Terfi erişilebilirliği her bölüm için ayrıca hesaplandı.

## v2.8 — Etkileşim ve derinlik turu
- 4. bölüm: train/test kod inceleme, confusion-matrix threshold laboratuvarı, maliyet tabanlı threshold simülatörü ve preprocessing leakage kod incelemesi eklendi.
- 5. bölüm: kalibrasyon/eşik adımı slider'a çevrildi; LLM değerlendirmesine retrieval-vs-generation etiketleme eklendi.
- 6. bölüm: gerçek monitoring paneli, serving-feature kod inceleme ve incident aksiyon konsolu eklendi.
- 7. bölüm: Buse model review'u gerçek kod incelemeye; portföy kararı etki/risk builder'ına dönüştürüldü.
- 8. bölüm: €2M yatırım kararı ve final 3 yıllık strateji seçimden builder'a taşındı.
- 4. bölümdeki iki kısa yan göreve transfer adımı eklendi.
- Kayıt sürümü 28'e çıkarıldı. Eski kayıtta 4–8. bölümde yarım kalmış vaka varsa yalnız o yarım vaka progress'i sıfırlanır; tamamlanmış vakalar korunur.
- Mobilde monitoring kartları, builder, kod kartları, bölüm kartları, geçiş overlay'leri ve kariyer çubuğu için 640px düzeni eklendi.

# Data Tycoon: Öğrenme Haritası v2

Oyun verisinden otomatik üretilir. Kavram seviyeleri: **Keşif** (bir kaynak), **Pratik** (iki farklı kaynak), **Transfer** (transfer adımı ipucusuz, ilk denemede), **Ustalık** (iki farklı bölümde kullanım).

Kalite kriteri: bir vaka kaldırıldığında sonraki bir vakayı anlamakta boşluk oluşmuyorsa, o vaka yan görev olmalıdır.

## Rehberlik politikası

| Bölüm | Rol | Destek | Durum |
|---|---|---|---|
| 1 | Veri Stajyeri (1. hafta) | Hedef, yaklaşım, ipucu ve birlikte çözüm | Oynanabilir |
| 2 | Junior Veri Analisti (3 ay sonra) | Birlikte çözüm kalkar | Oynanabilir |
| 3 | Veri Analisti (11 ay sonra) | İpucu XP'ye mal olur | Oynanabilir |
| 4 | Junior Veri Bilimci (2 yıl sonra) | Vaka sırasında ipucu yok, sonunda değerlendirme | Oynanabilir |
| 5 | Veri Bilimci (3,5 yıl sonra) | Sadece vaka sonu değerlendirmesi | Önizleme |
| 6 | Kıdemli Veri Bilimci (6 yıl sonra) | Problemin dışında yönlendirme yok | Önizleme |
| 7 | Lider Veri Bilimci (9 yıl sonra) | Tam belirsizlik | Önizleme |
| 8 | Veri Direktörü (12 yıl sonra) | Tam belirsizlik, kalıcı sonuçlar | Önizleme |

## Terfi gereksinimleri

**Junior Veri Analisti** (1. bölüm sonu): Veri Okuryazarlığı ≥ 3, Keşifsel Veri Analizi ≥ 3, Veri Kalitesi ≥ 3, İstatistiksel Düşünme ≥ 4, İş Odaklı Düşünme ≥ 2, İletişim ≥ 2

**Veri Analisti** (2. bölüm sonu): SQL ve Veri İşleme ≥ 4, SQL ve Veri İşleme (Pratik) ≥ 1, KPI Tasarımı ≥ 3, Deney Tasarımı ≥ 3, İstatistiksel Düşünme (Pratik) ≥ 2, Python ile Veri ≥ 1

**Junior Veri Bilimci** (3. bölüm sonu): Kohort ve Huni Analizi ≥ 2, Deney Tuzakları ≥ 3, Nedensellik ≥ 3, Python ile Veri ≥ 3, Veri Gizliliği ve KVKK ≥ 1, Tahminleme ≥ 1, Keşifsel Veri Analizi (Pratik) ≥ 3

**Veri Bilimci** (4. bölüm sonu): ML Problem Kurgusu ≥ 3, Modelleme ≥ 3, Model Değerlendirme ≥ 3, Öznitelik Mühendisliği ≥ 3, ML Problem Kurgusu (Pratik) ≥ 2, Model Değerlendirme (Pratik) ≥ 2

## Yetenekler ve kavramlar

### Veri Okuryazarlığı (1. bölüm)

Önkoşul: Veri Temelleri

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Mutlak ve göreli değişim | Vaka 001 Satış Gizemi (1. bölüm); Yan görev: Beyaz tahtadaki KPI; Vaka 007 Pazartesi Düşüşü (2. bölüm); Vaka 018 İşe Yarayan Kampanya… Belki (3. bölüm) |
| Yüzde puan | Yan görev: Beyaz tahtadaki KPI |
| Ağırlıklı ortalama | Yan görev: Alex'in pivot tablosu |
| Yüzde değişimin asimetrisi | Yan görev: Yarısı gitti, yarısı geldi |
| Birim ve toplama düzeyi | Yan görev: CEO'nun ekran görüntüsü; Ofis anı: Gelir arttı, müşteri azaldı; Vaka 013 CEO İçin Dashboard (2. bölüm) |

### Keşifsel Veri Analizi (1. bölüm)

Önkoşul: Veri Temelleri

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Bir satır neyi temsil eder? (grain) | Yan görev: Bir satır neyi temsil ediyor?; Vaka 008 İki Tablo, Tek Cevap (2. bölüm); Vaka 016 Huniyi Kur (3. bölüm) |
| EDA kontrol listesi | Yan görev: Yeni veri setinin ilk 10 dakikası |
| Segmentasyon | Vaka 001 Satış Gizemi (1. bölüm); Vaka 010 Ortalamanın Arkasındaki Müşteri (2. bölüm); Vaka 014 Yönetici Değerlendirmesi (2. bölüm); Vaka 015 Kaybolan Müşteri (3. bölüm) |
| Bir seviye in (drill-down) | Vaka 001 Satış Gizemi (1. bölüm); Vaka 014 Yönetici Değerlendirmesi (2. bölüm) |
| Eksik dönemleri bulmak | Yan görev: Kayıp pazartesi |

### İş Odaklı Düşünme (1. bölüm)

Önkoşul: Veri Temelleri

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Sayı + neden + beklenti | Vaka 001 Satış Gizemi (1. bölüm); Vaka 014 Yönetici Değerlendirmesi (2. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Metrik tanımı sözleşmesi | Yan görev: Bu KPI kimin?; Ofis anı: Değişen KPI tanımı; Vaka 009 Kimsenin Anlaşamadığı KPI (2. bölüm) |
| Payda kontrolü | Yan görev: Pazarlama alarmı; Vaka 009 Kimsenin Anlaşamadığı KPI (2. bölüm) |
| Önce pilot | Vaka 005 Korelasyon Tuzağı (1. bölüm); Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm) |
| Talebi netleştirmek | Yan görev: Acil Slack talebi |
| Belirsizlikte karar | Ofis anı: 30 dakikada bir sayı |

### Veri Kalitesi (1. bölüm)

Önkoşul: Veri Okuryazarlığı

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Mükerrer kayıt | Vaka 002 Kirli Veri (1. bölüm); Yan görev: Cehennemden gelen Excel; Vaka 008 İki Tablo, Tek Cevap (2. bölüm) |
| Eksik değer | Vaka 002 Kirli Veri (1. bölüm) |
| Geçersiz ve test kayıtları | Vaka 002 Kirli Veri (1. bölüm) |
| Mutabakat | Vaka 002 Kirli Veri (1. bölüm); Vaka 008 İki Tablo, Tek Cevap (2. bölüm) |
| Tarih formatları | Yan görev: Panodaki tuhaf rapor |
| Veri hattı hataları | Ofis anı: Gece patlayan pipeline; Ofis anı: Yenilenmeyen dashboard |

### İstatistiksel Düşünme (1. bölüm)

Önkoşul: Keşifsel Veri Analizi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Dağılım | Vaka 003 Yanıltıcı Ortalama (1. bölüm); Vaka 011 Örneklem Ne Kadar Emin? (2. bölüm) |
| Ortalama, medyan ve sağlamlık | Vaka 003 Yanıltıcı Ortalama (1. bölüm) |
| Aykırı değerler | Vaka 003 Yanıltıcı Ortalama (1. bölüm) |
| Örneklem değişkenliği | Yan görev: Her ölçüm farklı çıkıyor; Yan görev: Kahve makinesi deneyi; Vaka 011 Örneklem Ne Kadar Emin? (2. bölüm) |
| Seçim yanlılığı | Yan görev: Öğle yemeği anketi; Yan görev: Beş kişilik deney |
| Korelasyon ve nedensellik | Vaka 005 Korelasyon Tuzağı (1. bölüm); Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm) |
| Karıştırıcı değişken | Vaka 005 Korelasyon Tuzağı (1. bölüm); Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm); Vaka 018 İşe Yarayan Kampanya… Belki (3. bölüm) |

### Görselleştirme (1. bölüm)

Önkoşul: Keşifsel Veri Analizi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Dürüst eksen | Vaka 004 Dashboard Krizi (1. bölüm) |
| Bağlam | Vaka 004 Dashboard Krizi (1. bölüm); Vaka 013 CEO İçin Dashboard (2. bölüm) |
| Grafik türü seçimi | Vaka 004 Dashboard Krizi (1. bölüm); Vaka 013 CEO İçin Dashboard (2. bölüm) |
| Tutarlı birimler | Yan görev: CEO'nun ekran görüntüsü |

### İletişim (1. bölüm)

Önkoşul: İş Odaklı Düşünme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Tek cümlelik özet | Sabah özetleri; Sabah özetleri; Vaka 014 Yönetici Değerlendirmesi (2. bölüm) |
| Peki ne olacak? (so what) | Yan görev: Maya ile birebir |
| Yöneticiye otuz saniye | Yan görev: Yöneticilerle otuz saniye; Vaka 013 CEO İçin Dashboard (2. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Bir kavramı öğretmek | Ofis anı: Yeni stajyer |
| Akran incelemesi | Yan görev: Kurul öncesi akran incelemesi |

### SQL ve Veri İşleme (2. bölüm)

Önkoşul: Veri Kalitesi, Keşifsel Veri Analizi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Mantıksal filtreler (AND/OR) | Yan görev: Bozuk SQL sorgusu; Vaka 007 Pazartesi Düşüşü (2. bölüm) |
| JOIN türleri | Önizleme: İki Tablo, Tek Cevap; Vaka 008 İki Tablo, Tek Cevap (2. bölüm) |
| JOIN sonrası grain | Önizleme: İki Tablo, Tek Cevap; Vaka 008 İki Tablo, Tek Cevap (2. bölüm) |
| GROUP BY ve toplama | Vaka 007 Pazartesi Düşüşü (2. bölüm); Vaka 010 Ortalamanın Arkasındaki Müşteri (2. bölüm); Yan görev: Buse'nin GROUP BY sorusu; Vaka 014 Yönetici Değerlendirmesi (2. bölüm) |
| Pencere fonksiyonları | İleriki vakalar |
| CTE ile okunur sorgular | İleriki vakalar |
| Filtre ve tarih mantığı | Vaka 007 Pazartesi Düşüşü (2. bölüm) |
| NULL ve COUNT farkı | Yan görev: Kaybolan 312 müşteri |

### Python ile Veri (2. bölüm)

Önkoşul: Keşifsel Veri Analizi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| groupby ve merge | Yan görev: pandas'ta merge kazası |
| Eksik veriyle çalışmak | İleriki vakalar |
| Tekrarlanabilir notebook | İleriki vakalar |
| groupby ve tekil sayım | Yan görev: Buse'nin pandas sorusu; Vaka 016 Huniyi Kur (3. bölüm) |
| pivot_table ile kohort tablosu | Vaka 015 Kaybolan Müşteri (3. bölüm) |
| Tarihlerle çalışmak (shift, rolling) | Vaka 022 Gelecek Ay (3. bölüm) |
| Kişisel sütunları çıkarmak ve maskelemek | Vaka 021 Ajansa Giden Veri (3. bölüm) |
| Filtreleme (isin, maske) | Vaka 018 İşe Yarayan Kampanya… Belki (3. bölüm); Vaka 020 Önce/Sonra Yetmez (3. bölüm) |

### KPI Tasarımı (2. bölüm)

Önkoşul: İş Odaklı Düşünme, Veri Okuryazarlığı

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| KPI tanımı ve semantik | Vaka 009 Kimsenin Anlaşamadığı KPI (2. bölüm); Yan görev: Tanımları topla |
| Yönetici dashboard'u | Vaka 013 CEO İçin Dashboard (2. bölüm) |
| Paydaşları aynı tanımda buluşturmak | Vaka 009 Kimsenin Anlaşamadığı KPI (2. bölüm) |
| Doğru karşılaştırma tabanı | Vaka 007 Pazartesi Düşüşü (2. bölüm) |
| Toplamın gizlediği segment | Vaka 010 Ortalamanın Arkasındaki Müşteri (2. bölüm); Vaka 014 Yönetici Değerlendirmesi (2. bölüm) |

### Deney Tasarımı (2. bölüm)

Önkoşul: İstatistiksel Düşünme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Hipotez, birincil ve koruma metriği | Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm); Vaka 019 Deneyin Tuzakları (3. bölüm) |
| Güven aralığı | Vaka 011 Örneklem Ne Kadar Emin? (2. bölüm) |
| Örneklem büyüklüğü ve güç | Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm) |
| Koruma metriği ve randomizasyon birimi | Vaka 012 Pazarlamanın Sevdiği Deney (2. bölüm) |

### Kohort ve Huni Analizi (3. bölüm)

Önkoşul: SQL ve Veri İşleme, KPI Tasarımı

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Kohort ve tutundurma | Vaka 015 Kaybolan Müşteri (3. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Huni ve düşüş noktası | Vaka 016 Huniyi Kur (3. bölüm) |
| Fiyat–hacim dengesi | Yan görev: Fiyat sorusu |

### Veri Gizliliği ve KVKK (3. bölüm)

Önkoşul: İş Odaklı Düşünme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| KVKK ile ilk refleks | Ofis anı: Ajansa giden Excel; Vaka 021 Ajansa Giden Veri (3. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Veri minimizasyonu | Ofis anı: Ajansa giden Excel; Vaka 021 Ajansa Giden Veri (3. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Anonimleştirme ve takma ad | Vaka 021 Ajansa Giden Veri (3. bölüm) |

### Nedensellik (3. bölüm)

Önkoşul: Deney Tuzakları, Kohort ve Huni Analizi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Simpson paradoksu | Önizleme: Simpson Paradoksu; Vaka 017 Simpson Paradoksu (3. bölüm) |
| Karışım etkisi ve standardizasyon | Önizleme: Simpson Paradoksu; Vaka 017 Simpson Paradoksu (3. bölüm) |
| Fark içinde fark (DiD) | Vaka 020 Önce/Sonra Yetmez (3. bölüm); Vaka 023 Kurul Tek Cevap İstiyor (3. bölüm) |
| Uplift: kim 'bizim yüzümüzden' alır? | İleriki vakalar |
| Önce/sonra karşılaştırmasının sınırı | Vaka 018 İşe Yarayan Kampanya… Belki (3. bölüm); Vaka 020 Önce/Sonra Yetmez (3. bölüm) |

### Tahminleme (3. bölüm)

Önkoşul: İstatistiksel Düşünme, Python ile Veri

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Naif tahmin temeli | Vaka 022 Gelecek Ay (3. bölüm) |
| Trend ve mevsimsellik | Vaka 022 Gelecek Ay (3. bölüm) |
| Zamana göre ayrım ve geriye dönük test | Vaka 022 Gelecek Ay (3. bölüm) |

### Deney Tuzakları (3. bölüm)

Önkoşul: Deney Tasarımı

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Ara bakış (peeking) | Yan görev: Her gün bir bakış; Vaka 019 Deneyin Tuzakları (3. bölüm) |
| Örneklem oranı uyumsuzluğu | Vaka 019 Deneyin Tuzakları (3. bölüm) |
| Çoklu karşılaştırma | Vaka 019 Deneyin Tuzakları (3. bölüm) |
| Yenilik etkisi | Vaka 019 Deneyin Tuzakları (3. bölüm) |

### ML Problem Kurgusu (4. bölüm)

Önkoşul: İstatistiksel Düşünme, SQL ve Veri İşleme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Hedef ve tahmin ufku | Önizleme: %97 Doğruluk! |
| Öznitelik penceresi | Önizleme: %97 Doğruluk! |
| Tahminin iş aksiyonu | İleriki vakalar |

### Öznitelik Mühendisliği (4. bölüm)

Önkoşul: ML Problem Kurgusu, Veri Kalitesi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Eksik değer işleme | İleriki vakalar |
| Kodlama ve ölçekleme | İleriki vakalar |
| Sızıntıyı tanımak | İleriki vakalar |

### Modelleme (4. bölüm)

Önkoşul: ML Problem Kurgusu

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Önce temeli geç | Önizleme: %97 Doğruluk! |
| Train / test ayrımı | İleriki vakalar |
| Aşırı öğrenme | İleriki vakalar |

### Model Değerlendirme (4. bölüm)

Önkoşul: Modelleme, İstatistiksel Düşünme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Doğruluk tuzağı | Önizleme: %97 Doğruluk! |
| Eşik ve hata maliyeti | Önizleme: Eşiği Kim Belirler? |
| Precision ve recall | İleriki vakalar |
| Hata analizi | İleriki vakalar |

### Açıklanabilirlik (5. bölüm)

Önkoşul: Modelleme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Genel açıklama | İleriki vakalar |
| Tekil tahmini açıklamak | İleriki vakalar |

### Kalibrasyon (5. bölüm)

Önkoşul: Model Değerlendirme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Olasılık kalibrasyonu | Önizleme: Eşiği Kim Belirler? |
| Ayırt etme ve kalibrasyon farkı | İleriki vakalar |

### Üretken YZ Sistemleri (5. bölüm)

Önkoşul: Model Değerlendirme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| LLM değerlendirme seti | İleriki vakalar |
| Getirme mi üretme mi hatası? | İleriki vakalar |
| Prompt, RAG ya da ince ayar | İleriki vakalar |

### MLOps (6. bölüm)

Önkoşul: Modelleme, Python ile Veri

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Yeniden eğitim kararı | Önizleme: Model Bozuldu |
| Veri ve model sürümleme | İleriki vakalar |
| Geri alma planı | İleriki vakalar |

### İzleme (6. bölüm)

Önkoşul: MLOps, Model Değerlendirme

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Veri kayması | Önizleme: Model Bozuldu |
| Kavram kayması | İleriki vakalar |
| İş metriğini izlemek | İleriki vakalar |

### Sorumlu YZ (6. bölüm)

Önkoşul: Açıklanabilirlik, Veri Gizliliği ve KVKK

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Alt grup performansı | İleriki vakalar |
| İnsan gözetimi | İleriki vakalar |

### Liderlik ve Mentorluk (7. bölüm)

Önkoşul: İletişim

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Model incelemesi | Önizleme: Buse'nin Model İncelemesi |
| Gelişim odaklı geri bildirim | Önizleme: Buse'nin Model İncelemesi |
| Proje önceliklendirme | İleriki vakalar |

### Veri Yönetişimi (7. bölüm)

Önkoşul: Sorumlu YZ, KPI Tasarımı

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Ortak metrik yönetişimi | İleriki vakalar |
| Model yönetişimi | İleriki vakalar |

### Veri ve YZ Stratejisi (8. bölüm)

Önkoşul: Liderlik ve Mentorluk, Veri Yönetişimi

| Kavram | Kanıt kaynakları (tekrar kullanım dahil) |
|---|---|
| Yatırım portföyü | Önizleme: 2 Milyon Avroluk YZ Bahsi |
| ROI, risk ve ölçüm planı | Önizleme: 2 Milyon Avroluk YZ Bahsi |
| Veri organizasyonu kurmak | İleriki vakalar |

## 4. bölüm kanıt özeti

- **ML Problem Kurgusu:** Vaka 024, 025 ve 032 — hedef, tahmin ufku, feature penceresi ve iş aksiyonu.
- **Modelleme:** Vaka 026, 027, 028 ve 032 — baseline, zamansal train/validation/test ayrımı ve overfit kontrolü.
- **Model Değerlendirme:** Vaka 028, 029 ve 032 — accuracy tuzağı, precision/recall, eşik, hata maliyeti ve segment bazlı hata analizi.
- **Öznitelik Mühendisliği:** Vaka 025, 030, 031 ve 032 — eksik değer, encoding/pipeline ve leakage.
- 4. bölümde vaka içi ipucu yoktur; öğrenme değerlendirmesi vaka sonunda yapılır.

## Kariyer haritası

### 1. bölüm: Veri Stajyeri (1. hafta)

Veri okuryazarlığı, kalite, betimleme.

- 001 Satış Gizemi
- 002 Kirli Veri
- 003 Yanıltıcı Ortalama
- 004 Dashboard Krizi
- 005 Korelasyon Tuzağı
- 006 Yönetim Kurulu Sorusu

### 2. bölüm: Junior Veri Analisti (3 ay sonra)

SQL, KPI, toplama, belirsizlik, ilk deney.

- 007 Pazartesi Düşüşü
- 008 İki Tablo, Tek Cevap
- 009 Kimsenin Anlaşamadığı KPI
- 010 Ortalamanın Arkasındaki Müşteri
- 011 Örneklem Ne Kadar Emin?
- 012 Pazarlamanın Sevdiği Deney
- 013 CEO İçin Dashboard
- 014 Yönetici Değerlendirmesi

### 3. bölüm: Veri Analisti (11 ay sonra)

Kohort, huni, karıştırıcılar, deney tuzakları, nedensellik, KVKK, Python.

- 015 Kaybolan Müşteri (kohort)
- 016 Huniyi Kur (huni)
- 017 Simpson Paradoksu (karışım)
- 018 İşe Yarayan Kampanya… Belki (karıştırıcı)
- 019 Deneyin Tuzakları
- 020 Önce/Sonra Yetmez (nedensellik)
- 021 Ajansa Giden Veri (KVKK)
- 022 Gelecek Ay (tahminleme)
- 023 Kurul Tek Cevap İstiyor

### 4. bölüm: Junior Veri Bilimci (2 yıl sonra)

Problem kurgusu, temel model, ön işleme, değerlendirme.

- 024 Yapay Zekâyla Churn'ü Azaltalım (iş → tahmin problemi)
- 025 Zamanı Doğru Kur (birim, hedef, pencere, ufuk)
- 026 Önce Temeli Geç (temel ve iş aksiyonu)
- 027 İlk Modelin
- 028 %97 Doğruluk!
- 029 Precision mı Recall mu?
- 030 Öznitelik Atölyesi
- 031 Şüpheli Derecede Mükemmel Model
- 032 Model İncelemesi

### 5. bölüm: Veri Bilimci (3,5 yıl sonra)

İleri ML, tahminleme, XAI, kalibrasyon, üretken YZ.

- 033 Kim Ayrılacak?
- 034 Müşteri DNA'sı
- 035 Ağaç mı Doğrusal mı?
- 036 Eşiği Kim Belirler?
- 037 Bu Tahmini Açıkla
- 038 Yarının Satışları
- 039 LLM'i Nasıl Ölçeriz?
- 040 Canlı Aday

### 6. bölüm: Kıdemli Veri Bilimci (6 yıl sonra)

Canlı sistemler, kayma, MLOps, nedensellik, YZ sistemleri.

- 041 Tekrarlanamayan Notebook
- 042 Model Bozuldu
- 043 Çevrimdışı Harika, Canlıda Kötü
- 044 Zamansal Sızıntı
- 045 ML Kullanmalı mıyız?
- 046 Önyargılı Model
- 047 RAG mı İnce Ayar mı?
- 048 02:13'teki Olay

### 7. bölüm: Lider Veri Bilimci (9 yıl sonra)

İnceleme, mentorluk, yönetişim, portföy.

- 049 Buse'nin Model İncelemesi
- 050 Üç Ekip, Tek Metrik
- 051 Yap mı Satın Al mı?
- 052 İmkânsız Teslim Tarihi
- 053 Ekip Hangi Projeye?
- 054 Lider Değerlendirmesi

### 8. bölüm: Veri Direktörü (12 yıl sonra)

Organizasyon, yatırım, YZ yönetişimi, strateji.

- 055 2 Milyon Avroluk YZ Bahsi
- 056 YZ Yönetişim Krizi
- 057 Veri Organizasyonunu Kur
- 058 YZ Bize Para Kazandırıyor mu?
- 059 Son Yönetim Kurulu


---
### v2.5 güncellemesi — Bölüm 5 oynanabilir
Bölüm 5 (Vaka 033–040) artık oynanabilir: model karşılaştırma, clustering, model trade-off, kalibrasyon/eşik, XAI, forecasting backtest, GenAI/RAG değerlendirme ve production readiness. Rehberlik yalnız vaka sonu değerlendirmesindedir.

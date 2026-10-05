# DATA TYCOON v7.4.2.1 — Office Audio Hotfix

- Ofis sekmesine geçişte ses senkronizasyon sırası düzeltildi.
- Önceki sürümde audio sync, `player.screen` yeni ekrana atanmasından önce çalıştığı için Kariyer/Cases gibi ekranlardan Ofis'e geçerken ambience başlamıyordu.
- Audio sync artık ekran render edildikten sonra çalışıyor.
- Ofis ambience yalnızca Ofis ekranı aktifken çalıyor; başka ana sekmeye geçildiğinde duruyor.
- Calm office-day / office-night sesleri korunuyor.
- Flat-file yapı korunuyor; ayrı audio klasörü yok.

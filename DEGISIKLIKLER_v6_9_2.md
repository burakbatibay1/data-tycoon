# DATA TYCOON v6.9.2 — HTTP Flat Asset Fix

- Runtime görselleri `index.html` ile aynı root dizine taşındı.
- Kod içindeki `assets/...` bağımlılıkları kaldırıldı.
- `python3 -m http.server 8000` ve GitHub Pages root deployment için görsel yolları doğrudan root-relative hale getirildi.
- Maya ilk karşılaşma sahnesi artık `scene-firstday-clean-3.webp`; yükleme hatasında ofis fallback'ine düşmemeli.
- Maya/Alex/Deniz/Zeynep/Buse/CEO avatarları `char-*.jpg` dosyalarından yükleniyor.
- İki kişilik encounter sahneleri `encounter-*-conversation.webp` dosyalarından yükleniyor.
- Oyun state/tek-tık encounter mantığı değiştirilmedi.

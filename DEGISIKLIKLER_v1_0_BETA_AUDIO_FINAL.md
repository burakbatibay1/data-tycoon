# DATA TYCOON v1.0 Beta — Final Office Audio Fix

- Kök neden: audio-manager gündüz ofis sesi için `office-day.mp3` kullanıyordu; yalnızca WAV değiştirmek çalışan sesi değiştirmiyordu.
- Yeni gündüz ofis dosyası: `office-day-final-v1.mp3`.
- Yeni dosya adı kullanılarak tarayıcı cache'inde kalan eski `office-day.mp3` de bypass edildi.
- 90 sn doğal loop: çok düşük oda/HVAC tonu, seyrek gerçek klavye kümeleri (~8.5s, ~39.5s, ~70.5s).
- UI click sesi önceki beta davranışındaki gibi kapalı kalır; anlamlı olay SFX'leri korunur.

# DATA TYCOON v7.4.2.3 — Audio Global Bridge Fix

- Kök neden düzeltildi: `const DTSound` global lexical binding olarak tanımlıydı fakat oyun `window.DTSound` üzerinden çağırıyordu.
- `window.DTSound = DTSound` eklendi.
- Bu nedenle önceki sürümlerde Ofis ambience, Sesi Test Et, case success, promotion ve diğer çağrıların tamamı sessiz kalabiliyordu.
- Ofis ambience yalnızca Ofis ekranında çalışır.
- Flat asset yapısı korunur.

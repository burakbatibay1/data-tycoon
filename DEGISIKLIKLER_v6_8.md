# DATA TYCOON v6.8 — Single-click Encounter Fix

- Encounter konuşmalarında `Devam` artık tek tıkta bir sonraki repliği ekrana getirir.
- Kök neden: dialog adımlarında `rerender(..., "both")` çağrısı yalnız `data-panel` / `data-stage` arıyordu; dialog DOM'u yeniden çizilmiyordu.
- Düzeltme: satır ilerlemesinde dialog adımı tam yeniden çiziliyor (`rerender(..., "all")`).
- v6.7 iki kişilik gerçek encounter görselleri ve diğer oyun akışları korunmuştur.
- Cache sürümü v68.

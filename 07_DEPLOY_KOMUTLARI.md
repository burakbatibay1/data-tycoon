# Codespaces / GitHub Pages Yayın

Önce mevcut repoyu yedekle veya yeni bir `growth-beta` branch aç:

```bash
git checkout -b growth-beta
```

ZIP içeriğini repo köküne yerleştir; eski build artıkları için `.git` klasörünü silme. `bash release-check.sh` çalıştır, ardından:

```bash
python3 -m http.server 8000
```

Açılış, kariyere devam, Chapter 1 teklif, JSON dışa aktarma ve kayıt davranışını tarayıcıda test et. Sorun yoksa:

```bash
git add -A
git commit -m "DATA TYCOON growth validation beta"
git push -u origin growth-beta
```

Main'e yalnızca gerçek tarayıcı QA sonrası merge et. GitHub Pages ayarın `main / root` ise `growth-beta` branch'i tek başına canlı Pages'i güncellemez.

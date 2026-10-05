# DATA TYCOON v3.4 — Learning & Difficulty Rebalance

## Neden?
Canlı sürüm auditinde çoktan seçmeli adımların büyük bölümünde doğru cevabın B pozisyonunda toplandığı görüldü. Bu, oyuncunun kavram yerine cevap pozisyonunu öğrenmesine yol açabiliyordu.

## Bu pakette
- Doğru cevapların pozisyonu vaka + adım kimliğine göre deterministik olarak dengelenir. Sayfa yenilense de aynı soru aynı sırada kalır.
- Değerlendirme `correct:true` üzerinden devam ettiği için cevap anahtarı/evaluation mantığı bozulmaz.
- Ch3+ karar adımlarına öğrenme lensi metadata'sı eklendi; sonraki UI geliştirmelerinde karar gerekçesi ve kısmi kanıt için kullanılabilir.
- Mevcut 59-case kariyer, Buse, save, mastery, mobile CSS ve interaktif Ch4–8 yapısı korunur.
- Cache busting v34'e çıkarıldı.

## Öğrenme tasarımı standardı
Yeni/revize vakalarda hedef: Situation → Explore → Discover → Decide → Explain → Consequence → Transfer → Learning Review → Evidence.
Zorluk; formül ezberinden değil, daha az yönlendirme, daha iyi distractor, daha fazla belirsizlik ve business trade-off'tan gelmelidir.

## Push
Klasör içeriğini repo root'una kopyalayın ve mevcut dosyaların üzerine yazın. Ardından:
`git add -A && git commit -m "DATA TYCOON v3.4 learning rebalance" && git push origin main`

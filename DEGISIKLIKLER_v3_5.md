# Data Tycoon v3.5: Düzeltme ve cila

## Kritik düzeltme: cevap dengeleme çalışmıyordu
- v3.4'teki `learning-rebalance.js`, `window.CASES` ve `window.QUESTS`'e bakıyordu. Bunlar `const` olarak tanımlandığı için `window` üzerinde yoktu; modül hiçbir şeyi değiştirmiyordu.
- Ölçüm (v3.4): 187 çoktan seçmeli adımın 170'inde doğru cevap B şıkkındaydı.
- Yeni sürüm tüm içerik yüklendikten sonra çalışıyor; vakalar, yan görevler, ofis olayları, sabah özetleri ve önizlemeleri kapsıyor. Ölçüm (v3.5): doğru cevap A'da 92, B'de 78, C'de 17 adımda.
- Görselde harfle eşlenen seçenekler (Vaka 004 grafik taslakları) bilinçli olarak karıştırılmıyor.
- Yarıda kalmış kayıtlarda, seçenek sırası değiştiği için eski "yanlış" işaretleri temizleniyor.

## Mobil düzen
- Kariyer ilerleme çubuğu üst barda mobil CSS'in gizleme kurallarını kaydırıyordu; 390 px ekranda sayfa 770 px'e taşıyordu. Çubuk doğru konuma taşındı ve mobil üst bar sınırlandı. Ölçüm: taşma yok.
- Bölüm giriş kartı mobilde artık ortalanıyor.

## Metin
- Karşılama ekranındaki "6 vaka, 12 yan görev, 4 katmanlı rehberlik" ifadesi tam kariyere göre güncellendi ve gerçek içerikten hesaplanıyor (59 vaka, 52 yan görev ve ofis anı).

## Test
- 8 bölümün her biri tarayıcıda baştan sona otomatik oynatıldı: hatasız, her terfi açılıyor.
- Mobil (390 px) ve masaüstü ekran görüntüleriyle kontrol edildi.

## Açık konular
- 4–8. bölümlerdeki çoktan seçmeli adımların çoğu yalnızca iki seçenekli (6–8. bölümlerde tamamı).
- v2.9 notlarında anlatılan "Gameplay Trailer" düğmesi pakette yok.

# Kanban Board (Trello Clone) - KoçSistem Internship Case

Bu proje, 48 saatlik teknik case icin gelistirilmis modern bir Kanban Board uygulamasidir.

## Teknoloji Secimleri

- React: Bilesen tabanli yapi ile tekrar kullanilabilir ve test edilebilir UI.
- Tailwind CSS: Hizli prototipleme, responsive tasarim ve tutarli tasarim tokenlari.
- dnd-kit: Erişilebilir (keyboard support), modern ve performansli surukle-birak altyapisi.
- localStorage: Back-end bagimsiz kalicilik, case kapsaminda hizli ve yeterli cozum.

## Neden dnd-kit?

- HTML5 drag-and-drop API'sine gore daha kontrollu bir state modeli sunar.
- Pointer ve keyboard sensorleri ile erisilebilirlik odaklidir.
- `DragOverlay` sayesinde kartin hareketi sirasinda guclu gorsel geri bildirim verir.
- Sortable davranisi ile kartlarin sutun ici ve sutunlar arasi sirasi net sekilde korunur.

## Mimari Yaklasim (Data-Driven)

Veri modeli ERP mantigina uygun olarak normalize edildi:

- `Board`: ust seviye is alani.
- `Column`: is akis adimlari (`To Do`, `In Progress`, `Done`).
- `Card`: benzersiz `id`, `content`, `columnId`.

Bu tasarim sayesinde:

- Is akis kurallari veriden okunur (UI'dan bagimsizdir).
- Kartin yeri tek bir kaynakta takip edilir.
- Sira degisikligi kolay ve deterministik sekilde uygulanir.

## Proje Dizini

`src/data/initialBoard.js`: baslangic verisi  
`src/utils/storage.js`: localStorage okuma/yazma  
`src/utils/board.js`: kart tasima ve kart ekleme is kurallari  
`src/components/KanbanBoard.jsx`: dnd-kit baglanti katmani  
`src/components/KanbanColumn.jsx`: sutun ve yeni kart formu  
`src/components/KanbanCard.jsx`: suruklenebilir kart sunumu  
`src/App.jsx`: uygulama orkestrasyonu

## Kurulum ve Calistirma

```bash
npm install
npm run dev
```

## Kabul Kriterleri Karsiligi

- Board -> Column -> Card hiyerarsisi korunur.
- Her kartta benzersiz `id`, `content`, `columnId` bulunur.
- Kartlar sutun icinde ve sutunlar arasinda suruklenebilir.
- Sayfa yenilemede kartlarin konumu `localStorage` ile korunur.
- Surukleme aninda visual cues:
  - aktif kart opakligi azalir,
  - birakilacak alan renkle belirginlesir,
  - `DragOverlay` ile kartin tasi nmasi gorunur.
- Mobil uyum: yatay kaydirilabilir sutun yapisi ve responsive spacing.

## AI Kullanimi ve Surec Yonetimi (Teknik Not)

Bu proje gelistirilirken AI asistan su sekilde yonetildi:

1. Gereksinimler netlestirildi (veri modeli, UX, kalicilik, responsive, kod kalitesi).
2. AI'dan "tum kodu bir anda" degil, moduler dosya yapisi istendi.
3. Her adimda "neden bu karar?" sorusu sorularak mimari kararlar savunulabilir hale getirildi.
4. Kod parca parca uretilip manuel kontrol edildi, sonra butunlestirildi.
5. Son adimda README, teknik mulakatta anlatilabilir bir dokumana cevrildi.

Bu yaklasim, sadece kod yazdirmayi degil; AI'yi bir teknik mentorluk ve hizlandirilmis muhendislik araci olarak kullanma becerisini gosterir.

## Gelistirme Notlari

- Kart silme / duzenleme ozelligi sonraki iterasyonda eklenebilir.
- Unit test (board move logic) icin `vitest` ile test katmani planlanabilir.
- API tabanli kalicilik icin localStorage yerine backend service katmani eklenebilir.

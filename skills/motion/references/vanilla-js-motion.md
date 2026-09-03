# Vanilla JavaScript & Modern Web Motion Guide

Panduan implementasi animasi berperforma tinggi untuk proyek HTML/JavaScript murni, Vite, atau MPA (*Multi-Page Application*) menggunakan paket `"motion"`.

---

## 1. Animasi Elemen Tunggal & Timeline

Fungsi `animate()` dari Motion secara otomatis mendeteksi apakah browser mendukung Web Animations API (WAAPI) native untuk mencapai performa 120fps tanpa overhead runtime besar:

```javascript
import { animate } from "motion";

// Animasi tunggal dengan custom spring easing
const controls = animate(
  ".box",
  { transform: "translateX(100px) rotate(45deg)", opacity: 1 },
  { duration: 0.8, easing: [0.17, 0.67, 0.83, 0.67] }
);

// Kontrol playback
// controls.pause();
// controls.play();
// controls.reverse();
```

---

## 2. Animasi Timeline Multi-Elemen

Menyusun urutan animasi antar elemen berbeda dengan sinkronisasi waktu presisi:

```javascript
import { timeline } from "motion";

const sequence = [
  [".hero-title", { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 }],
  [".hero-subtitle", { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, at: "-0.2" }], // mulai 200ms lebih awal
  [".cta-button", { scale: [0.8, 1], opacity: [0, 1] }, { duration: 0.4 }]
];

timeline(sequence, {
  defaultOptions: { easing: "ease-out" }
});
```

---

## 3. Scroll-Linked Animations (Berdasarkan Gulir Halaman)

```javascript
import { scroll, animate } from "motion";

// Indikator kemajuan membaca di bagian atas halaman
scroll(
  animate(".progress-bar", { scaleX: [0, 1] }),
  { target: document.documentElement }
);

// Animasi parallax pada gambar saat digulir ke dalam viewport
scroll(
  animate(".parallax-image", { y: [-50, 50] }),
  {
    target: document.querySelector(".parallax-section"),
    offset: ["start end", "end start"]
  }
);
```

---

## 4. In-View Trigger Animations (Saat Elemen Masuk Layar)

```javascript
import { inView, animate } from "motion";

inView(".feature-card", (element) => {
  animate(
    element,
    { opacity: [0, 1], transform: ["translateY(30px)", "none"] },
    { duration: 0.6, easing: "ease-out" }
  );

  // Fungsi pembersihan opsional saat elemen keluar layar
  return () => {
    animate(element, { opacity: 0 });
  };
});
```

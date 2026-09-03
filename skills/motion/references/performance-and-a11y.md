# Panduan Performa & Aksesibilitas Animasi (Motion Performance & A11y)

Panduan teknis bagi `frontend-engineer`, `ui-ux-designer`, dan `qa-engineer` untuk menjamin animasi antarmuka mencapai kecepatan 60-120fps tanpa mengorbankan aksesibilitas.

---

## 1. Siklus Render Browser & GPU Composite Layers

Browser merender halaman melalui 4 tahapan berurutan:
```
JavaScript ──► Style Recalculation ──► Layout (Reflow) ──► Paint (Repaint) ──► Composite
```

### Aturan Emas Performa:
1. **Hanya Sentuh Tahap Composite**:
   - Properti `transform` (`translate`, `scale`, `rotate`) dan `opacity` dilewatkan langsung ke GPU (*Compositor Thread*).
   - Mereka **tidak memicu** tahapan Layout maupun Paint, sehingga animasi dapat berjalan mulus di 120fps bahkan saat thread JavaScript utama sedang sibuk.
2. **Hindari Properti Pemicu Layout**:
   - `width`, `height`, `top`, `left`, `bottom`, `right`, `margin`, `padding`.
   - Mengubah properti ini memaksa browser menghitung ulang geometri seluruh elemen lain di halaman (*Layout Thrashing*), menyebabkan penurunan frame rate dramatis pada perangkat mobile.

---

## 2. Standar Aksesibilitas (WCAG 2.1 & Prefers Reduced Motion)

Kriteria Keberhasilan WCAG 2.3.3 menyatakan bahwa animasi gerak yang dipicu oleh interaksi pengguna harus dapat dinonaktifkan kecuali jika animasi tersebut sangat esensial bagi fungsionalitas.

### Implementasi pada React:
```tsx
import { motion, useReducedMotion } from "motion/react";

export function AccessibleModal({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  // Jika pengguna menyetel "Kurangi Gerakan" di OS, gunakan transisi opacity murni tanpa gerakan sumbu Y
  const variants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 25 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.15 : 0.4 }
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" exit="hidden" variants={variants}>
      {children}
    </motion.div>
  );
}
```

### Implementasi pada CSS / Vanilla JS:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. Checklist Evaluasi QA untuk Animasi

- [ ] Tidak ada properti `top`, `left`, `width`, `height` yang dianimasikan secara berulang dalam loop.
- [ ] Frame rate stabil di angka >= 60fps saat diuji menggunakan Chrome DevTools Performance Panel.
- [ ] Pengujian emulasi `prefers-reduced-motion: reduce` di DevTools Rendering tab menonaktifkan gerakan besar.
- [ ] Elemen interaktif tetap memiliki target sentuh minimal 44x44px dan fokus keyboard tetap terlihat jelas saat animasi selesai.

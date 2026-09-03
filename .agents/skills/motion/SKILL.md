---
name: motion
description: Comprehensive UI animation skill using Motion (formerly Framer Motion) for React, Vanilla JavaScript, and Vue. Enables agents to build 120fps GPU-accelerated micro-animations, gestures, spring physics, layout transitions, exit effects, and scroll-driven interactions with full accessibility (prefers-reduced-motion) compliance.
---

# Motion (Framer Motion v12+) Animation Skill

## 1. Identitas & Peran dalam Multi-Agent Architecture

Skill **Motion** memberdayakan agent (khususnya `frontend-engineer` dan `ui-ux-designer`) untuk merancang dan mengimplementasikan animasi antarmuka kelas dunia yang memukau (*wow-factor*), berkinerja tinggi (120fps GPU-accelerated), dan deterministik.

> [!IMPORTANT]
> **Catatan Pembaruan Penting (Framer Motion -> Motion)**:
> Pustaka `framer-motion` kini resmi berganti nama menjadi `motion`.
> - **React**: Import dari `"motion/react"`, BUKAN `"framer-motion"`.
> - **Vanilla JS**: Import dari `"motion"`.
> - **Vue**: Import dari `"motion-v"`.

---

## 2. Matriks Instalasi & Import per Platform

| Ekosistem | Perintah Instalasi | Import Resmi |
|---|---|---|
| **React / Next.js** | `npm install motion` | `import { motion, AnimatePresence } from "motion/react"` |
| **Vanilla JS / TypeScript** | `npm install motion` | `import { animate, scroll, timeline } from "motion"` |
| **Vue 3** | `npm install motion-v` | `<script setup> import { motion } from "motion-v" </script>` |

---

## 3. Pola Implementasi Inti

### A. React: Animasi Deklaratif & Gestures
```tsx
"use client"; // Wajib jika menggunakan Next.js App Router
import { motion, AnimatePresence } from "motion/react";

export function PremiumCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200"
    >
      <h3>Judul Fitur Interaktif</h3>
    </motion.div>
  );
}
```

### B. React: Layout Animation & Shared Layout (`layoutId`)
Untuk transisi halus antar tab atau perpindahan posisi elemen tanpa perhitungan manual:
```tsx
import { motion } from "motion/react";

function TabIndicator({ activeTab, currentTab }) {
  return (
    <div className="relative cursor-pointer">
      {activeTab === currentTab && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 bg-blue-600 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10 px-4 py-2">Tab Label</span>
    </div>
  );
}
```

### C. Vanilla JavaScript: Animasi Imperatif Berperforma Tinggi
Menggunakan hybrid engine yang secara cerdas beralih ke native Web Animations API (WAAPI):
```javascript
import { animate, scroll } from "motion";

// 1. Animasi Elemen Tunggal
animate("#hero-card", { opacity: [0, 1], transform: ["scale(0.95)", "scale(1)"] }, {
  duration: 0.6,
  easing: [0.16, 1, 0.3, 1] // Custom cubic-bezier spring feel
});

// 2. Scroll-Linked Progress Bar
scroll(animate("#progress-bar", { scaleX: [0, 1] }), {
  target: document.body
});
```

### D. Vue 3: Animasi Reaktif
```vue
<script setup>
import { motion } from "motion-v";
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.4 }"
    class="card"
  >
    Vue 3 Smooth Motion
  </motion.div>
</template>
```

---

## 4. Aturan Emas Performa & Aksesibilitas (Guardrails)

1. **Hanya Animasikan Composite Properties**:
   - **Boleh**: `transform` (`x`, `y`, `scale`, `rotate`) dan `opacity`. Properti ini diproses langsung di GPU layer tanpa memicu reflow/repaint pada layout browser.
   - **Hindari**: Menggerakkan elemen menggunakan `top`, `left`, `width`, `height`, `margin` secara berulang (dapat menyebabkan *layout thrashing* dan penurunan fps). Jika ukuran harus berubah, gunakan atribut `layout` pada React.
2. **Kepatuhan Terhadap `prefers-reduced-motion`**:
   - Selalu hormati pengguna yang sensitif terhadap mabuk gerak (*vestibular motion sickness*):
   ```tsx
   import { useReducedMotion } from "motion/react";
   
   const shouldReduceMotion = useReducedMotion();
   const animation = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
   ```
3. **Pembersihan Event Listener**:
   - Animasi berbasis scroll atau interval wajib di-cleanup saat unmount component untuk menghindari kebocoran memori (*memory leak*).

---

## 5. Integrasi dengan Role Multi-Agent

- **`ui-ux-designer`**: Menentukan kurva timing (*easing*), durasi (rekomendasi: 150ms-300ms untuk microcopy/button, 400ms-600ms untuk modal/drawer), dan kekakuan pegas (*spring stiffness & damping*).
- **`frontend-engineer`**: Mengimplementasikan kode Motion pada komponen antarmuka, memastikan Next.js SSR kompatibel (`"use client"`).
- **`qa-engineer`**: Memverifikasi bahwa animasi tidak menyebabkan elemen keluar layar (*viewport overflow*) dan tombol tetap dapat diklik selama transisi.
- **`tech-critic`**: Memastikan animasi tidak berlebihan (*avoid animation bloat*) yang memperlambat alur kerja produktivitas pengguna.

---

## 6. Definition of Done (DoD) — Motion Animation

- [ ] Pustaka terinstal dengan benar (`motion` untuk React/JS, `motion-v` untuk Vue).
- [ ] Import menggunakan path modern (`"motion/react"`, bukan `"framer-motion"` yang usang).
- [ ] Berjalan mulus di 60-120fps tanpa layout thrashing (animasi berbasis transform/opacity).
- [ ] Mendukung media query `prefers-reduced-motion` untuk aksesibilitas.
- [ ] Komponen keluar (*exit animations*) dibungkus oleh `<AnimatePresence>`.

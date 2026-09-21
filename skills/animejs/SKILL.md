---
name: animejs
description: "Lightweight and powerful JavaScript animation engine skill for Anime.js (v3 & v4). Enables agents to build complex timeline-driven animations, SVG path morphing, SVG line drawing, staggering effects, DOM attribute manipulation, CSS transforms, and canvas physics with minimal CPU overhead via `npm install animejs`."
---

# Anime.js Animation Engine Skill

Panduan implementasi animasi presisi performa tinggi menggunakan [Anime.js](https://animejs.com).

---

## 1. Instalasi & Import

```bash
# Instalasi library inti
npm install animejs

# TypeScript types (opsional)
npm install -D @types/animejs
```

### Konvensi Import:
```javascript
// ES Modules
import anime from 'animejs';

// CommonJS
const anime = require('animejs');
```

---

## 2. Pola Animasi Unggulan (Core Patterns)

### A. SVG Path Morphing & Drawing (Garis Menggambar Sendiri)
Animasi ikon atau ilustrasi SVG yang digambar secara bertahap menggunakan manipulasi `strokeDashoffset`:

```tsx
import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export function SVGDrawnCheckmark() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    anime({
      targets: pathRef.current,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1200,
      delay: function(el, i) { return i * 250 },
      direction: 'alternate',
      loop: true
    });
  }, []);

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="stroke-indigo-500 fill-none stroke-[4]">
      <path
        ref={pathRef}
        d="M20 50 L40 70 L80 30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

### B. Staggering Ripple Grid Animation
Efek riak gelombang bertingkat pada deretan kartu atau tombol grid:

```tsx
import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export function AnimeStaggerGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    anime({
      targets: '.stagger-box',
      scale: [
        { value: 0.1, easing: 'easeOutSine', duration: 500 },
        { value: 1, easing: 'easeInOutQuad', duration: 1200 }
      ],
      delay: anime.stagger(200, { grid: [4, 4], from: 'center' }),
      loop: true
    });
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-4 gap-3 p-6 max-w-sm mx-auto">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="stagger-box h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
        />
      ))}
    </div>
  );
}
```

### C. Anime.js Timeline Berurutan (Choreography)
Menghubungkan beberapa elemen animasi dalam satu rangkaian waktu tersinkronisasi:

```typescript
export function runHeroSequence() {
  const tl = anime.timeline({
    easing: 'easeOutExpo',
    duration: 750
  });

  tl.add({
    targets: '.hero-badge',
    opacity: [0, 1],
    translateY: [-20, 0]
  })
  .add({
    targets: '.hero-title',
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 900
  }, '-=400')
  .add({
    targets: '.hero-card',
    opacity: [0, 1],
    scale: [0.95, 1],
    delay: anime.stagger(150)
  }, '-=300');
}
```

---

## 3. Best Practices & Integrasi React / Vue

1. **Cleanup on Unmount**: Selalu simpan instans `anime({ ... })` dan panggil `instance.pause()` saat komponen di-unmount guna mencegah kebocoran memori pada SPA.
2. **Kombinasi dengan CSS Hardware Acceleration**: Gunakan properti `transform` (`translateX`, `scale`, `rotate`) dan `opacity` untuk menjamin animasi berjalan 60-120fps di thread GPU browser.

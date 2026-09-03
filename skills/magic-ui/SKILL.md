---
name: magic-ui
description: UI library skill for Design Engineers featuring 50+ animated, interactive components built with React, Tailwind CSS, and Motion. Use for crafting premium landing pages, interactive SaaS dashboards, portfolio showcases, bento grids, background effects, text animations, and stunning micro-interactions with first-class visual excellence.
---

# Magic UI Skill: UI Library for Design Engineers

## 1. Identitas & Peran dalam Multi-Agent Architecture

Skill **Magic UI** memberdayakan `frontend-engineer` dan `ui-ux-designer` untuk menciptakan antarmuka modern berkualitas tinggi (*design engineer caliber*) yang memiliki daya tarik visual memukau (*wow factor*). Berbeda dari komponen UI biasa yang statis, Magic UI berfokus pada **efek gerak, pencahayaan, latar belakang dinamis, dan tipografi kinetik**.

### Prinsip Desain:
1. **Copy-Paste & CLI-Driven Architecture**: Seperti halnya `shadcn/ui`, komponen Magic UI tidak diimpor sebagai dependensi raksasa monolitik, melainkan di-generate langsung ke dalam folder komponen proyek (`components/magicui/`) sehingga dapat dimodifikasi secara bebas.
2. **Harmoni Trio Teknologi**: Menggabungkan **React**, **Tailwind CSS**, dan **Motion** (Framer Motion v12).
3. **Utility-First Styling**: Menggunakan helper `cn()` (`clsx` + `tailwind-merge`) untuk penggabungan class CSS yang bebas konflik.

---

## 2. Inisialisasi & Setup Cepat (CLI)

### Prasyarat Proyek:
Pastikan proyek memiliki dependensi pendukung dasar:
```bash
npm install clsx tailwind-merge lucide-react motion
```

### Utility Helper Wajib (`lib/utils.ts` atau `lib/utils.js`):
```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Menambahkan Komponen via CLI:
```bash
# Format Resmi Shadcn Registry (Paling Direkomendasikan & Stabil):
npx shadcn@latest add "https://magicui.design/r/[component-name]"

# Contoh:
npx shadcn@latest add "https://magicui.design/r/bento-grid"
npx shadcn@latest add "https://magicui.design/r/marquee"
npx shadcn@latest add "https://magicui.design/r/border-beam"
npx shadcn@latest add "https://magicui.design/r/particles"
npx shadcn@latest add "https://magicui.design/r/shimmer-button"
```

---

## 3. Katalog Komponen Unggulan (Top Highlights)

### A. Special Effects & Layouts
- **Bento Grid**: Tata letak kartu modular asimetris untuk fitur SaaS modern dengan hover visual interaktif.
  ```bash
  npx magicui-cli@latest add bento-grid
  ```
- **Marquee**: Galeri teks atau logo mitra berjalan mulus tanpa jeda (*infinite auto-scrolling*).
  ```bash
  npx magicui-cli@latest add marquee
  ```
- **Border Beam**: Cahaya laser dinamis yang mengitari garis batas kontainer (*animated glowing border*).
  ```bash
  npx magicui-cli@latest add border-beam
  ```
- **Orbiting Circles**: Lingkaran satelit berputar konsentris di sekitar ikon sentral.
  ```bash
  npx magicui-cli@latest add orbiting-circles
  ```
- **Dock**: Navigasi bawah gaya macOS dengan efek pembesaran ikon saat kursor mendekat.
  ```bash
  npx magicui-cli@latest add dock
  ```

### B. Backgrounds & Partikel
- **Particles**: Latar belakang interaktif partikel mengambang yang bereaksi terhadap kursor mouse.
- **Retro Grid**: Garis grid 3D perspektif bergaya retro cyberpunk.
- **Ripple**: Gelombang cincin konsentris yang memancar lembut dari titik pusat.
- **Meteors**: Efek hujan meteor meluncur di latar belakang gelap.
- **Dot Pattern / Grid Pattern**: Pola titik/garis halus untuk kedalaman latar surface.

### C. Tipografi & Teks Animasi
- **Typing Animation**: Efek mesin tik otomatis untuk headline utama.
- **Blur In**: Teks memudar masuk dari kondisi buram ke tajam secara dramatis.
- **Word Rotate**: Teks berganti kata secara vertikal dengan transisi halus.
- **Number Ticker**: Angka statistik berhitung naik secara halus saat masuk viewport (*count-up counter*).
- **Sparkles Text**: Teks dengan kilauan bintang interaktif.

### D. Tombol Aksi (*Interactive Buttons*)
- **Shimmer Button**: Tombol dengan kilau cahaya melintas horizontal (*moving shimmer sheen*).
- **Shiny Button**: Tombol gradasi modern dengan hover glow.
- **Pulsating Button**: Tombol berdenyut lembut untuk Call-To-Action (CTA) prioritas tinggi.

---

## 4. Contoh Komposisi Landing Page Mewah (Hero Section)

```tsx
"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Particles } from "@/components/magicui/particles";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export function PremiumHero() {
  return (
    <section className="relative flex min-h-[750px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-background p-8 md:p-20">
      {/* Background Partikel Halus */}
      <Particles className="absolute inset-0 z-0" quantity={80} ease={80} refresh />

      <div className="z-10 flex flex-col items-center text-center max-w-3xl space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
          ✨ Rilis Generasi Baru
        </span>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Kembangkan Produk Impian dengan{" "}
          <TypingAnimation text="Kecerdasan Agen AI" className="text-primary" />
        </h1>

        <p className="text-lg text-muted-foreground sm:text-xl">
          Orkestrasi multi-agent deterministik dengan pemisahan peran tegas, tata kelola keamanan mandiri, dan integrasi komponen visual mutakhir.
        </p>

        {/* CTA Shimmer Button */}
        <div className="relative pt-4">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-base">
              Mulai Eksplorasi Sekarang &rarr;
            </span>
          </ShimmerButton>
        </div>
      </div>

      {/* Kartu Showcase dengan Border Beam Glow */}
      <div className="relative mt-12 w-full max-w-4xl overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="h-64 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
          // Dashboard Live Metric Preview
        </div>
        <BorderBeam size={250} duration={12} delay={9} />
      </div>
    </section>
  );
}
```

---

## 5. Integrasi dengan Tim Multi-Agent

- **`ui-ux-designer`**: Menentukan penempatan komponen Magic UI (Bento Grid untuk feature breakdown, Marquee untuk social proof, Shimmer Button untuk CTA utama) agar visual terlihat elit tanpa mengorbankan hierarki informasi.
- **`frontend-engineer`**: Menjalankan CLI komponen, mengonfigurasi Tailwind CSS keyframes, dan menyesuaikan properti warna komponen ke token desain tema.
- **`qa-engineer`**: Menguji kompatibilitas browser, memastikan partikel/animasi tidak menyebabkan lag pada perangkat mobile, dan memverifikasi kontras warna teks.
- **`tech-critic`**: Memastikan efek Magic UI digunakan secara fungsional untuk menonjolkan nilai produk, bukan sekadar hiasan kosong (*gratuitous eye candy*).

---

## 6. Definition of Done (DoD) — Magic UI

- [ ] Dependensi inti (`clsx`, `tailwind-merge`, `motion`) terpasang.
- [ ] Helper `cn()` tersedia di `lib/utils`.
- [ ] Konfigurasi `tailwind.config` mencakup keyframes animasi yang diperlukan komponen.
- [ ] Komponen tidak menyebabkan layout shift tak terduga (*CLS - Cumulative Layout Shift*).
- [ ] Responsif dari layar mobile (320px) hingga monitor desktop ultra-wide.

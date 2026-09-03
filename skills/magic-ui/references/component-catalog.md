# Magic UI Component Catalog & Props Guide

Katalog lengkap komponen terpopuler Magic UI dengan perintah penambahan CLI, properti utama (*props*), dan contoh penggunaannya.

---

## 1. Bento Grid (Tata Letak SaaS Modern)

Bento Grid menyajikan fitur produk dalam tata letak kartu asimetris yang dinamis dan terorganisir.

- **Perintah CLI**: `npx magicui-cli@latest add bento-grid`
- **Komponen**: `<BentoGrid>`, `<BentoCard>`
- **Props Kunci**:
  - `name`: Judul fitur (string)
  - `className`: Posisi grid span (misal `col-span-3 lg:col-span-1`)
  - `background`: Elemen latar visual (gambar, kode, animasi)
  - `Icon`: Ikon Lucide React
  - `description`: Penjelasan ringkas manfaat fitur
  - `href`: Tautan navigasi
  - `cta`: Teks Call to Action (misal "Pelajari Lebih Lanjut")

```tsx
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BellIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

const features = [
  {
    Icon: SparklesIcon,
    name: "Otomasi Berbasis Agen",
    description: "Multi-agent swarm mengeksekusi tugas secara deterministik.",
    href: "/features/agentic",
    cta: "Jelajahi",
    className: "col-span-3 lg:col-span-2",
    background: <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />,
  },
  {
    Icon: ShieldCheckIcon,
    name: "Governance Guardrails",
    description: "Circuit breaker dan pencegah halusinasi otomatis.",
    href: "/features/security",
    cta: "Pelajari",
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />,
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
```

---

## 2. Marquee (Teks / Logo Berjalan Tak Hingga)

- **Perintah CLI**: `npx magicui-cli@latest add marquee`
- **Props Kunci**:
  - `pauseOnHover`: `boolean` (berhenti saat kursor di atas elemen)
  - `reverse`: `boolean` (arah gulir terbalik)
  - `vertical`: `boolean` (arah gulir vertikal)
  - `repeat`: `number` (pengulangan elemen, default 4)

```tsx
import { Marquee } from "@/components/magicui/marquee";

export function PartnerLogos() {
  const logos = ["Google", "Vercel", "Supabase", "PostgreSQL", "Tailwind", "Next.js"];

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8">
      <Marquee pauseOnHover className="[--duration:20s]">
        {logos.map((logo, idx) => (
          <div key={idx} className="mx-6 text-xl font-bold text-slate-500">
            {logo}
          </div>
        ))}
      </Marquee>
      {/* Gradient Fade di Kiri dan Kanan */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
```

---

## 3. Border Beam (Garis Batas Laser Menyala)

- **Perintah CLI**: `npx magicui-cli@latest add border-beam`
- **Props Kunci**:
  - `size`: Lebar sinar laser (px, default 200)
  - `duration`: Waktu keliling kontainer (detik, default 15)
  - `delay`: Penundaan awal sebelum mulai (detik)
  - `colorFrom`: Warna awal gradasi (default `#ffaa40`)
  - `colorTo`: Warna akhir gradasi (default `#9c40ff`)

```tsx
import { BorderBeam } from "@/components/magicui/border-beam";

export function GlowingCard() {
  return (
    <div className="relative rounded-2xl border bg-card p-8 shadow-xl overflow-hidden">
      <h3>Kartu dengan Border Laser</h3>
      <BorderBeam size={200} duration={10} colorFrom="#3b82f6" colorTo="#8b5cf6" />
    </div>
  );
}
```

---

## 4. Particles (Latar Belakang Partikel Interaktif)

- **Perintah CLI**: `npx magicui-cli@latest add particles`
- **Props Kunci**:
  - `quantity`: Jumlah partikel (default 50)
  - `staticity`: Resistensi terhadap gerakan kursor mouse (default 50)
  - `ease`: Kelembutan transisi gerakan (default 50)
  - `color`: Warna partikel heksadesimal (misal `#ffffff` atau `#3b82f6`)

---

## 5. Shimmer Button (Tombol Kilau Cahaya)

- **Perintah CLI**: `npx magicui-cli@latest add shimmer-button`
- **Props Kunci**:
  - `shimmerColor`: Warna garis kilau (default `#ffffff`)
  - `shimmerSize`: Ketebalan garis kilau (default `0.05em`)
  - `shimmerDuration`: Kecepatan siklus kilau (default `3s`)
  - `background`: Warna dasar tombol

# Bento Grid & High-Converting Landing Page Patterns

Panduan arsitektur penyusunan halaman landing page SaaS modern menggunakan komponen Magic UI, memadukan Bento Grid, Particles, Marquee, dan Border Beam.

---

## 1. Anatomi Landing Page Kelas Dunia (Design Engineer Blueprint)

```
+-------------------------------------------------------------+
| 1. Hero Section: Particles + TypingAnimation + ShimmerButton|
+-------------------------------------------------------------+
| 2. Social Proof Section: Marquee Logo Mitra (Infinite Loop) |
+-------------------------------------------------------------+
| 3. Feature Showcase: Bento Grid (3-Tier Card Layout)        |
|    - Card A (Span 2): Live Preview + Border Beam            |
|    - Card B (Span 1): Metric Ticker (Number Ticker)         |
|    - Card C (Span 1): Interactive Orbiting Circles          |
|    - Card D (Span 2): Code Editor Preview                   |
+-------------------------------------------------------------+
| 4. Testimonial Section: Vertical Marquee Cards              |
+-------------------------------------------------------------+
| 5. Final CTA Section: Retro Grid Background + Big Button    |
+-------------------------------------------------------------+
```

---

## 2. Pola Bento Grid 4-Kartu SaaS Modern

```tsx
"use client";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BorderBeam } from "@/components/magicui/border-beam";
import { 
  BarChart3Icon, 
  CpuIcon, 
  LockIcon, 
  ZapIcon 
} from "lucide-react";

const bentoFeatures = [
  {
    Icon: ZapIcon,
    name: "Performa Kilat 120fps",
    description: "Animasi diproses langsung pada GPU layer tanpa memicu reflow browser.",
    href: "#",
    cta: "Lihat Benchmark",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent" />
        <BorderBeam size={180} duration={8} colorFrom="#3b82f6" colorTo="#60a5fa" />
      </div>
    ),
  },
  {
    Icon: LockIcon,
    name: "Keamanan Tanpa Kompromi",
    description: "Audit OWASP terintegrasi dan proteksi kebocoran data.",
    href: "#",
    cta: "Audit Report",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
    ),
  },
  {
    Icon: CpuIcon,
    name: "Arsitektur Otonom",
    description: "Pemecahan masalah mandiri dan pemulihan sirkuit cerdas.",
    href: "#",
    cta: "Arsitektur",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent" />
    ),
  },
  {
    Icon: BarChart3Icon,
    name: "Analitik Waktu Nyata",
    description: "Metrik throughput dan token utilization dipantau live.",
    href: "#",
    cta: "Dashboard",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/10 to-transparent" />
    ),
  },
];

export function SaaSFeatureSection() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Dirancang Khusus untuk Solusi Kritis
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Paduan teknologi mutakhir yang menjamin keandalan, estetika premium, dan skalabilitas jangka panjang.
        </p>
      </div>

      <BentoGrid>
        {bentoFeatures.map((item, idx) => (
          <BentoCard key={idx} {...item} />
        ))}
      </BentoGrid>
    </section>
  );
}
```

---

## 3. Checklist Desain Landing Page untuk UI/UX Designer

- [ ] Headline utama menggunakan efek kinetik halus (Typing Animation atau Blur In) untuk mengarahkan fokus mata pengguna.
- [ ] Tombol CTA utama menonjol di atas latar belakang dengan kontras tinggi (Shimmer Button).
- [ ] Logo klien/mitra dipasang dalam Marquee yang melambat atau berhenti saat di-hover.
- [ ] Bento Grid memiliki variasi visual antar kartu (tidak monoton hanya berisi teks).
- [ ] Efek visual berat (seperti Particles) memiliki opsi nonaktif otomatis jika pengguna mengaktifkan mode hemat daya atau `prefers-reduced-motion`.

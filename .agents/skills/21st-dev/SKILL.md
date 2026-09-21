---
name: 21st-dev
description: "Premier open-source component registry for Design Engineers from 21st.dev. Features curated, ready-to-use crafted React, Tailwind CSS, and Framer Motion components: interactive hero sections, magnetic buttons, spotlight cards, dock navigation, text effects, and shadcn-compatible CLI registry installation (`npx shadcn add ...`)."
---

# 21st.dev — The Component Registry for Design Engineers

Panduan implementasi komponen kreatif mutakhir berstandar industri dari ekosistem [21st.dev](https://21st.dev).

---

## 1. Konsep & Filosofi Arsitektur

21st.dev adalah registry komponen open-source yang dirancang khusus untuk **Design Engineers**. Menggabungkan:
- **Primitif Headless**: Kompatibel penuh dengan `shadcn/ui` dan Radix UI.
- **Micro-interactions & Physics**: Ditenagai oleh `motion/react` (Framer Motion).
- **Styling Utility-First**: Tailwind CSS dengan custom utility helper `cn()` (`clsx` + `tailwind-merge`).
- **Anti-AI Slop**: Mematahkan desain standar yang membosankan dengan visual tactile, spotlight gradients, mesh noise, dan fluid typography.

---

## 2. Pemasangan & Integrasi Registry

### A. Format Registry URL Langsung (Shadcn CLI)
Komponen 21st.dev dapat langsung dipasang ke dalam proyek Next.js/React menggunakan Shadcn CLI:
```bash
npx shadcn@latest add "https://21st.dev/r/[author]/[component-name]"
```

### B. Prasyarat Dependensi Inti
```bash
npm install motion clsx tailwind-merge lucide-react
```

Pastikan helper `cn()` tersedia di `@/lib/utils`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Katalog Pola Komponen Unggulan (Production Ready)

### A. Spotlight Card dengan Pelacakan Kursor Halus
Komponen kartu interaktif dengan efek sorotan cahaya gradient yang mengikuti posisi kursor mouse:

```tsx
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(99, 102, 241, 0.15)",
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-border",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

### B. Magnetic Button dengan Spring Physics
Tombol dengan daya tarik magnetis yang mengikuti tarikan kursor kearah pusat tombol:

```tsx
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 15, mass: 0.1 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90",
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
```

---

## 4. Aturan Penggunaan Agent (Anti-AI Slop Guardrails)

1. **Jangan Gunakan Warna Abu-Abu Polos**: Gunakan HSL curated tokens dari `design-dna` atau tailwind tint yang berkarakter (misal `slate-950` dengan aksen `indigo-500` dan border `white/10`).
2. **Kedalaman Lapisan (Layering)**: Kombinasikan Spotlight Card dengan background `radial-gradient` halus atau noise overlay.
3. **Aksesibilitas Tetap Nomor Satu**: Efek hover interaktif wajib dinonaktifkan secara anggun jika pengguna mengaktifkan `prefers-reduced-motion`.

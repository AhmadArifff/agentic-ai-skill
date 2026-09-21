---
name: react-bits
description: "Comprehensive React Bits component library and GSAP animation skill. Enables agents to install, compose, and customize 100+ creative animated React components from reactbits.dev: text animations (SplitText, BlurText, ShinyText, DecryptedText), interactive backgrounds (Particles, Squares, Aurora, Hyperspeed), animations with GSAP (`npm install gsap`), cursor effects, and 3D card tilt."
---

# React Bits & GSAP Animation Skill

Panduan integrasi komponen animasi kreatif [React Bits](https://reactbits.dev) dan animasi performa tinggi menggunakan [GSAP (GreenSock Animation Platform)](https://gsap.com).

---

## 1. Instalasi & Prasyarat

Untuk menggunakan animasi berbasis GSAP dan React Bits:

```bash
# Instalasi GSAP inti
npm install gsap

# Jika menggunakan React 18 / 19, tambahkan helper hook resmi
npm install @gsap/react
```

Dependensi pendukung visual:
```bash
npm install clsx tailwind-merge motion
```

---

## 2. Pola Animasi Teks Unggulan (React Bits Patterns)

### A. Shiny Text (Gradient Shimmer Animation)
Teks dengan kilau gradient metalik/neon yang bergerak terus-menerus:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({ text, disabled = false, speed = 5, className }: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-gradient-to-r from-neutral-400 via-white to-neutral-400 bg-[200%_auto]",
        !disabled && "animate-shine",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animation: !disabled ? `shine ${animationDuration} linear infinite` : undefined,
      }}
    >
      {text}
    </span>
  );
}
```

CSS Keyframe pendukung di `tailwind.config.js` atau CSS file:
```css
@keyframes shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### B. Decrypted Text (Hacker / Cyberpunk Text Reveal)
Efek decode huruf acak yang berubah menjadi karakter sebenarnya saat muncul di layar:

```tsx
import React, { useEffect, useState, useRef } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / (maxIterations / text.length);
    }, speed);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span
      className={className}
      onMouseEnter={() => {
        setIsHovering(true);
        startAnimation();
      }}
    >
      {displayText}
    </span>
  );
}
```

---

## 3. Integrasi GSAP Produksi dengan Cleanup Memory Otomatis

Gunakan `@gsap/react` (`useGSAP`) untuk memastikan tidak terjadi kebocoran memori (*memory leaks*) saat komponen di-unmount:

```tsx
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Daftarkan plugin GSAP
gsap.registerPlugin(useGSAP, ScrollTrigger);

export function GSAPHeroStagger() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

      tl.from(".stagger-badge", { y: -20, opacity: 0, duration: 0.6 })
        .from(".stagger-heading", { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(".stagger-paragraph", { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
        .from(".stagger-btn", { scale: 0.9, opacity: 0, stagger: 0.15 }, "-=0.4");
    },
    { scope: container } // Otomatis mengisolasi dan membersihkan selector saat unmount
  );

  return (
    <div ref={container} className="flex flex-col items-center justify-center py-20 text-center">
      <span className="stagger-badge mb-4 rounded-full border px-4 py-1.5 text-xs font-semibold">
        Next-Gen Components
      </span>
      <h1 className="stagger-heading text-5xl font-extrabold tracking-tight sm:text-7xl">
        Kreativitas Tanpa Batas dengan React Bits
      </h1>
      <p className="stagger-paragraph mt-6 max-w-2xl text-lg text-muted-foreground">
        Animasi 60-120fps menggunakan GSAP timeline dan CSS modular.
      </p>
      <div className="mt-8 flex gap-4">
        <button className="stagger-btn rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
          Mulai Sekarang
        </button>
        <button className="stagger-btn rounded-xl border px-6 py-3 font-medium">
          Dokumentasi
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Aturan Emas Penggunaan

1. **Selalu Gunakan Scope pada GSAP**: Wajib menyertakan `{ scope: container }` pada `useGSAP` untuk mencegah manipulasi elemen DOM di luar komponen.
2. **Kombinasikan dengan Tailwind**: Gunakan GSAP untuk timeline dan ScrollTrigger kompleks; gunakan Tailwind untuk layout, warna HSL, dan responsiveness.

# React Motion Patterns Guide

Panduan komprehensif implementasi pola animasi pada React dan Next.js menggunakan package resmi `"motion/react"`.

---

## 1. Animasi Bertingkat (Variants & Staggering)

Variants memungkinkan orkestrasi animasi hierarki induk-anak (*parent-child*) secara terkoordinasi:

```tsx
"use client";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // delay antar elemen anak 100ms
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 25 } 
  }
};

export function FeatureList({ items }: { items: string[] }) {
  return (
    <motion.ul 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-3"
    >
      {items.map((text, idx) => (
        <motion.li key={idx} variants={itemVariants} className="p-3 bg-slate-100 rounded-lg">
          {text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

---

## 2. Animasi Keluar (Exit Animations via `AnimatePresence`)

Ketika elemen dihapus dari React component tree, Motion memerlukan `<AnimatePresence>` untuk menahan unmount hingga animasi selesai:

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-emerald-500 text-white p-4 rounded-xl flex justify-between"
        >
          <span>Operasi data berhasil disimpan!</span>
          <button onClick={() => setIsVisible(false)} className="font-bold">Tutup</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 3. Gestures & Interaksi Mikro (Hover, Tap, Drag)

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  drag="x"
  dragConstraints={{ left: -50, right: 50 }}
  className="btn-primary"
>
  Geser atau Klik Saya
</motion.button>
```

---

## 4. Hooks Reaktif (`useMotionValue`, `useTransform`, `useSpring`)

Untuk animasi berbasis kursor mouse 3D tilt effect:

```tsx
"use client";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

export function TiltCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="w-72 h-44 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
    >
      <h4 className="font-bold text-lg">Kartu Interaktif 3D</h4>
      <p className="text-sm opacity-90">Arahkan kursor mouse ke kartu ini.</p>
    </motion.div>
  );
}
```

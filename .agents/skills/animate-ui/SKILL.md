---
name: animate-ui
description: "Interactive and beautifully animated UI component library skill based on Animate UI and shadcn/ui. Provides setup and implementation patterns for `npx shadcn@latest init` from animate-ui.com: animated buttons, glowing borders, dynamic modal dialogs, tab transitions, sliding panels, tooltip springs, and micro-interactions built with Motion and Tailwind CSS."
---

# Animate UI Component Architecture Skill

Panduan integrasi komponen animasi interaktif modern dari ekosistem [Animate UI](https://animate-ui.com) yang dibangun di atas fondasi `shadcn/ui` dan `motion/react`.

---

## 1. Pemasangan & Konfigurasi Inisialisasi

### A. Inisialisasi Proyek shadcn/ui
```bash
npx shadcn@latest init -d --yes
```

### B. Dependensi Inti Animasi
```bash
npm install motion clsx tailwind-merge lucide-react
```

### C. Menambahkan Komponen Animate UI via Registry URL
```bash
npx shadcn@latest add "https://animate-ui.com/r/[component-name].json"
```

---

## 2. Pola Komponen Interaktif Unggulan

### A. Animated Tabs dengan Floating Indicator
Tab bar dengan indikator aktif yang meluncur mulus menggunakan `layoutId` dari Motion:

```tsx
import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({ tabs, defaultTab, onChange, className }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={cn("flex space-x-1 rounded-xl bg-muted/60 p-1.5 backdrop-blur-md border border-border/40", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/60"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### B. Glowing Pulse Button
Tombol Call-to-Action dengan aura cahaya neon berdenyut yang menarik perhatian pengguna:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

export function GlowingPulseButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="relative flex items-center gap-2 rounded-[10px] bg-background px-6 py-3 text-sm text-foreground transition-all duration-300 group-hover:bg-opacity-0 group-hover:text-white">
        {children}
      </span>
    </button>
  );
}
```

### C. Expandable Accordion Card
Kartu informasi yang mengembang secara mulus dengan spring physics:

```tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export function ExpandableCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-semibold text-left"
      >
        <span>{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-sm text-muted-foreground">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 3. Integrasi Sinergis dengan Ekosistem

- **shadcn-ui**: Memberikan struktur headless WAI-ARIA.
- **animate-ui**: Menyediakan layer interaktivitas dan animasi mikro visual.
- **design-dna**: Menjamin palet warna dan radius tombol serasi dengan tema visual website secara keseluruhan.

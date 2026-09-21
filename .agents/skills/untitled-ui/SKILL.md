---
name: untitled-ui
description: "Enterprise-grade component architecture and design system based on Untitled UI for React and Next.js. Provides instructions and patterns for `npx untitledui@latest init untitled-ui --nextjs`, Tailwind CSS tokens, Figma-aligned design systems, accessible application layouts, data tables, metrics badges, navigation bars, and SaaS dashboard primitives."
---

# Untitled UI React & Next.js Architecture Skill

Panduan integrasi arsitektur UI tingkat enterprise menggunakan sistem desain [Untitled UI](https://www.untitledui.com).

---

## 1. Inisialisasi & Pemasangan Proyek

### A. Non-Interactive CLI Initialization untuk Next.js (App Router)
```bash
npx untitledui@latest init untitled-ui --nextjs --yes
```

Perintah di atas secara otomatis:
1. Mengonfigurasi Tailwind CSS theme tokens (skala warna Neutral/Gray, Brand Primary, Warning, Error, Success).
2. Memasang dependensi ikonografi resmi (`lucide-react`).
3. Menyiapkan struktur direktori `@/components/untitled-ui/`.

### B. Dependensi Manual (Jika Integrasi ke Proyek yang Ada)
```bash
npm install clsx tailwind-merge lucide-react @radix-ui/react-slot
```

---

## 2. Pola Komponen Inti (Enterprise Primitives)

### A. Metric Stat Card (SaaS Dashboard KPI)
Komponen kartu metrik dengan indikator perubahan trend (persentase naik/turun):

```tsx
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "positive" | "negative";
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  description = "vs bulan lalu",
  className,
}: MetricCardProps) {
  const isPositive = trend === "positive";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            isPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-card-foreground">{value}</h3>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}
```

### B. Application Shell Navigation Bar
Navbar enterprise responsif dengan status breadcrumbs, search input terintegrasi, dan user profile dropdown:

```tsx
import React from "react";
import { Search, Bell, Settings } from "lucide-react";

export function EnterpriseNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm">
            U
          </div>
          <span>Untitled Enterprise</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="text-foreground hover:text-foreground">Dashboard</a>
          <a href="#" className="hover:text-foreground transition-colors">Pelanggan</a>
          <a href="#" className="hover:text-foreground transition-colors">Transaksi</a>
          <a href="#" className="hover:text-foreground transition-colors">Laporan</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Cari transaksi, ID, faktur..."
            className="h-9 w-64 rounded-lg border border-input bg-muted/40 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
```

---

## 3. Aturan Desain Untitled UI

1. **Konsistensi Spacing 8pt Grid**: Margin dan padding selalu kelipatan 4 atau 8 (`p-4`, `p-6`, `gap-4`).
2. **Keterbacaan Data**: Desain tabel data wajib menggunakan angka monospace (`font-mono`) pada kolom nilai mata uang agar sejajar vertikal secara sempurna.
3. **Harmoni Warna**: Gunakan aksen warna yang tenang (*subdued*) untuk dashboard profesional.

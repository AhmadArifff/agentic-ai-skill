---
name: shadcn-ui
description: Premier accessible, copy-paste component architecture for React and Next.js built on Radix UI primitives and Tailwind CSS. Use for constructing accessible, tokenized, composable design systems, form controls, dialogs, dropdowns, data tables, and enterprise UI foundations.
---

# shadcn/ui Skill: Accessible Component Architecture

## 1. Identitas & Filosofi dalam Multi-Agent Architecture

Skill **shadcn/ui** menyediakan fondasi arsitektur komponen antarmuka berstandar enterprise bagi `frontend-engineer`, `ui-ux-designer`, dan `qa-engineer`.

### Filosofi Inti: "Bukan Pustaka Dependensi Monolitik, Ini Kode Milik Anda"
Berbeda dari pustaka komponen tradisional yang dipasang via `npm install` sebagai bundel tertutup (*black-box dependency*):
1. **Open Code & Kepemilikan Penuh**: Komponen diunduh langsung ke direktori proyek lokal (`components/ui/[name].tsx`). Anda memiliki 100% kendali untuk mengubah styling, properti, dan perilakunya.
2. **Aksesibilitas Tanpa Kompromi (Radix UI Primitives)**: Dibangun di atas primitif Radix UI tanpa gaya (*headless*), menjamin kepatuhan standar WAI-ARIA, keyboard navigation otomatis, focus trapping pada dialog, dan pembaca layar (*screen reader*).
3. **Penyusunan Varian Dinamis (CVA)**: Menggunakan `class-variance-authority` untuk mendefinisikan varian komponen secara type-safe (`default`, `outline`, `ghost`, `destructive`).

---

## 2. Inisialisasi & Konfigurasi (`components.json`)

### Inisialisasi Proyek Otomatis (Non-Interaktif untuk AI Agent):
```bash
# Inisialisasi default otomatis tanpa prompt
npx shadcn@latest init -d --yes
```

### Format Berkas Konfigurasi Standar (`components.json`):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 3. Menambahkan Komponen via CLI

Agen dapat menambahkan satu atau banyak komponen secara sekaligus dalam mode non-interaktif:

```bash
# Menambahkan komponen umum:
npx shadcn@latest add button dialog dropdown-menu form input select table --yes

# Komponen navigasi & feedback:
npx shadcn@latest add sheet tabs card badge avatar tooltip sonner --yes
```

---

## 4. Pola Implementasi Tingkat Tinggi

### A. Pola Varian Tombol dengan `cva` (`components/ui/button.tsx`)
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### B. Pola Formulir Type-Safe (`react-hook-form` + `zod`)
```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(20),
  email: z.string().email("Format email tidak valid"),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", email: "" },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    console.log("Form values submitted:", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pengguna</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>Nama publik yang tampil di profil.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Simpan Perubahan</Button>
      </form>
    </Form>
  );
}
```

---

## 5. Token Desain & Sistem Variabel CSS (`globals.css`)

shadcn/ui menggunakan HSL token untuk mendukung mode terang dan gelap (*dark mode*) secara otomatis tanpa penulisan ulang class CSS:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

---

## 6. Integrasi dengan Tim Multi-Agent

- **`ui-ux-designer`**: Menentukan palet warna tema HSL, radius kelengkungan sudut (`--radius`), dan hierarki dialog modal.
- **`frontend-engineer`**: Menginisialisasi `components.json`, menjalankan `npx shadcn@latest add`, dan menyatukan validasi Zod form.
- **`qa-engineer`**: Memvalidasi kepatuhan aksesibilitas keyboard (Escape untuk menutup modal, Tab order teratur, ARIA roles sesuai).
- **`tech-critic`**: Mencegah penambahan komponen yang tidak terpakai (*dead code bloat*) dan memastikan varian tombol konsisten di seluruh aplikasi.

---

## 7. Definition of Done (DoD) — shadcn/ui

- [ ] Berkas `components.json` terkonfigurasi dengan path alias yang benar.
- [ ] Komponen diletakkan di `@/components/ui/` dan menggunakan helper `@/lib/utils` `cn()`.
- [ ] Formulir divalidasi menggunakan skema Zod dan `react-hook-form`.
- [ ] Mode gelap dan terang berfungsi sempurna dengan token variabel CSS.
- [ ] Semua modal dialog dan dropdown lolos uji aksesibilitas keyboard (WAI-ARIA).

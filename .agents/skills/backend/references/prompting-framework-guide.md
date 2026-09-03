# Prompting Best Practices — 5-Step T-C-R-E-I Framework

Panduan resmi praktik terbaik pembuatan prompt (*prompt engineering*) menggunakan **5-Step T-C-R-E-I Framework** untuk mengoptimalkan interaksi AI Agent di seluruh tahap SDLC (PM, Backend, Frontend, QA).

---

## 📐 5-Step T-C-R-E-I Framework Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  T  │ TASK        │ Persona + Definisi Tugas + Format Output Spesifik  │
├─────┼─────────────┼────────────────────────────────────────────────────┤
│  C  │ CONTEXT     │ Detail latar belakang, batasan, budget & teknologi │
├─────┼─────────────┼────────────────────────────────────────────────────┤
│  R  │ REFERENCES  │ Contoh acuan, sampel kode, atau referensi terdahulu│
├─────┼─────────────┼────────────────────────────────────────────────────┤
│  E  │ EVALUATE    │ Evaluasi mandiri terhadap kesesuaian output        │
├─────┼─────────────┼────────────────────────────────────────────────────┤
│  I  │ ITERATE     │ Penyesuaian & penambahan konteks untuk hasil presisi│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. T — Task (Tugas & Persona)
Deskripsikan tugas yang Anda inginkan secara spesifik. Sertakan **Persona** (peran ahli) dan **Format Output** yang diharapkan.

- **Definisi**: Tentukan peran agent (misal: *Senior Backend Engineer*, *UI/UX Architect*, *Product Manager*) dan bentuk output (misal: *Tabel Markdown*, *File PRD*, *Komponen Next.js TypeScript*).
- **Contoh**: *"Bertindaklah sebagai Senior Kindergarten Teacher yang paham kesukaan anak 7 tahun. Berikan 5 ide hadiah ulang tahun untuk keponakan saya."*

## 2. C — Context (Konteks & Detail)
Berikan detail latar belakang dan batasan penting agar AI memahami situasi sebenarnya.

- **Definisi**: Jelaskan teknologi yang digunakan, batasan waktu/anggaran, target pengguna, dan aturan bisnis.
- **Contoh**: *"Keponakan saya genap berusia 7 tahun dan sangat menyukai seni & kerajinan tangan. Anggaran saya adalah $20."*

## 3. R — References (Referensi & Contoh)
Sertakan contoh acuan (*examples/samples*) dari proyek sebelumnya atau standar yang berhasil agar AI dapat menirunya.

- **Definisi**: Cantumkan contoh format PRD, sampel komponen UI, struktur API, atau file referensi project.
- **Contoh**: *"Saya memberinya set kertas origami tahun lalu dan dia sangat menyukainya."*

## 4. E — Evaluate (Evaluasi Output)
Tanyakan pada diri sendiri apakah input yang diberikan sudah menghasilkan output yang sesuai kebutuhan atau ada potensi masalah yang perlu dihindari.

- **Definisi**: Periksa apakah ada *misconception*, *anti-pattern*, atau efek samping yang tidak diinginkan dari hasil output.
- **Contoh**: *"Kakak saya tidak akan senang jika saya memberi putrinya wadah berisi glitter lengket yang mengotorkan rumah..."*

## 5. I — Iterate (Iterasi & Penyesuaian)
Jika hasil lum memenuhi ekspektasi, lakukan iterasi dengan menambahkan detail konteks atau menyesuaikan prompt.

- **Definisi**: Tambahkan batasan baru atau instruksi perbaikan (misal: *"Kurangi kompleksitas", "Gunakan PWA", "Tambahkan auth guard"*).
- **Contoh**: *"...jadi saya akan menambahkan konteks lagi dan mencoba ulang: 'Saya ingin ide hadiah dengan kebutuhan pembersihan minimal.'"*

---

## 📋 Penerapan T-C-R-E-I pada Masing-Masing Role Skill

### 1. 📋 Role PM (`/pm`)
```markdown
[TASK]       : Act as a Senior PM. Create a PRD document for an E-Commerce Admin Panel.
[CONTEXT]    : Stack is Next.js, Express JS, Supabase, Prisma, Better Auth. Admin needs to manage orders and stock.
[REFERENCES] : Use prd-template.md and dynamic-masterdata-and-flow-guide.md format.
[EVALUATE]   : Check if there are any unlabelled tasks or hardcoded master data.
[ITERATE]    : Add explicit acceptance criteria for role-based access control (RBAC).
```

### 2. ⚙️ Role Backend (`/backend`)
```markdown
[TASK]       : Act as a Senior Backend Engineer. Design database schema and REST API for User Auth.
[CONTEXT]    : Express JS + Prisma ORM + Supabase PostgreSQL + Better Auth JWT. Must prevent SQL injection & N+1 queries.
[REFERENCES] : Follow safe-logic-flow-guide.md (Guard Clause + Result Pattern + Global Error Middleware).
[EVALUATE]   : Verify stack traces are sanitized on 500 errors and not leaked to client.
[ITERATE]    : Wrap DB operations in custom domain exceptions.
```

### 3. 🎨 Role Frontend (`/frontend`)
```markdown
[TASK]       : Act as a Senior Frontend & UI/UX Architect. Build a Responsive Product Detail Page.
[CONTEXT]    : Next.js + PWA + Tailwind CSS + Shadcn UI + Framer Motion. Priority: Mobile HP & Tablet FIRST.
[REFERENCES] : Follow ui-ux-pro-max-guide.md (No emoji icons, contrast >= 4.5:1, cursor-pointer).
[EVALUATE]   : Check if there is any horizontal scroll on mobile view (375px).
[ITERATE]    : Add skeleton loading state for image fetching.
```

### 4. 🧪 Role QA (`/qa`)
```markdown
[TASK]       : Act as a Senior QA Engineer. Create E2E test plan & security audit for Admin Dashboard.
[CONTEXT]    : Target app has Protected Routes, JWT Auth, and dynamic Master Data CRUD.
[REFERENCES] : Follow testing-guide.md and safe-logic-flow-guide.md.
[EVALUATE]   : Verify no hardcoded master data exists in client bundle or API endpoints.
[ITERATE]    : Add Playwright test cases for invalid token expiration scenarios.
```

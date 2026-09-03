# Panduan Product & Frontend: Standar PWA & Arsitektur Monorepo

Dokumen ini merupakan hasil ekstraksi *best practices* dari proyek **CrownJobExpiredSupbase** dan menjadi standar referensi untuk pembuatan PRD (Product Requirements Document), pengelolaan struktur Monorepo, dan pengembangan Progressive Web App (PWA) yang terpusat.

## 1. Arsitektur Monorepo (Turborepo)

Untuk aplikasi dengan skala besar dan memiliki komponen yang terpisah secara logika namun saling berkaitan, standar arsitekturnya menggunakan **Turborepo**.

### Struktur Direktori Standar
- `apps/web`: Aplikasi *Frontend* yang dibangun dengan **Next.js (App Router)**.
- `apps/api`: Aplikasi *Backend* (Express.js + Prisma).
- `packages/shared`: *Shared Library* berisi **Zod Schemas**, tipe data TypeScript (DTOs), dan *utility functions* yang dipakai bersama antara *frontend* dan *backend* guna menjaga konsistensi.

> [!TIP]  
> Pendekatan *monorepo* menghilangkan duplikasi kode *interfaces/types* antara *client* dan *server*, yang mana sangat penting untuk meminimalisir miskonsepsi (sesuai *Safe Logic Flow*).

## 2. Standar Frontend PWA (Progressive Web App)

Pembangunan UI/UX mengacu pada pendekatan "UI/UX Pro Max" yang tertuang di dokumen PRD.

### Spesifikasi UI Utama:
- **Teknologi Styling:** Tailwind CSS dengan dukungan dinamis *Dark Mode*.
- **Desain Modern:** Memanfaatkan panel *Glassmorphism*, *skeleton loaders* untuk *loading state*, dan *data tables* yang responsif.
- **State Management:** Menggunakan **Zustand** untuk mengelola *state* yang lebih ringan dan terprediksi di *client-side*.

## 3. Komponen PRD untuk Monorepo

Setiap pembuatan aplikasi lintas-platform harus mencantumkan beberapa bab wajib dalam PRD:
1. **Problem Statement:** Membahas latar belakang teknis masalah (misalnya isu *auto-pause* Supabase).
2. **Perubahan Arsitektur:** Jika ini adalah migrasi (contoh: dari *client-side* murni ke *Backend + Database server-side*).
3. **User Personas:** Pemetaan target pengguna (misal: *Developer Indie* vs *Tim Development Kecil*).
4. **Pembagian Scope:** Pembagian yang jelas antara peran `apps/web` dan `apps/api`.
5. **Autentikasi Lintas Layer:** Definisi implementasi JWT/Auth dari ujung UI ke Backend.

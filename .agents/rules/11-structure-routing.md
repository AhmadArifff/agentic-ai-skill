---
description: Structure, Routing Standards & Git Conflict Prevention (routes/**, controllers)
globs: routes/**, app/Http/Controllers/**
---

# 11. Structure & Routing Standards

Dokumen ini mengatur struktur penamaan modular, pengelompokan domain, standar import class, dan isolasi route guna mencegah *merge conflict* pada Git.

---

## 1. Pemisahan Controller Per Entitas (Single Responsibility)
* Setiap tabel atau entitas yang memiliki siklus hidup independen wajib memiliki **Controller, Service, dan Repository tersendiri**.
* **Contoh Kasus**:
  * Modul Outlet (`master-data/outlets`) memiliki `OutletController`, `OutletService`, `OutletRepository`.
  * Modul Kota (`master-data/cities`) terpisah di `CityController`, `CityService`, `CityRepository`.
  * ❌ **JANGAN** menggabungkan CRUD Kota ke dalam `OutletController` meskipun keduanya berkaitan erat.

---

## 2. Pengelompokan Folder Berdasarkan Domain (Modular Foldering)
Struktur folder pada `app/` harus konsisten mengikuti domain bisnis:

```text
app/
├── Http/Controllers/
│   ├── AdminManagement/      # Admin, Role, Permission, ActivityLog
│   ├── Agent/                # Agent, Ota
│   ├── MasterData/           # Outlet, Route, Driver
│   ├── Report/               # CsoReport, DailyReport, PackageReport
│   └── Settlement/           # SettlementTicket, SettlementPackage, SettlementVoucher
├── Services/
│   └── [Domain]/...
└── Repositories/
    └── [Domain]/...
```

---

## 3. Standar Penulisan Route & Pencegahan Merge Conflict (`routes/web.php`)

### A. Aturan Wajib `use` Statement di Header
* Setiap Controller yang dipanggil pada file route **WAJIB diimpor di header file** dengan urutan alfabetis terstruktur.
* ❌ **DILARANG KERAS** menggunakan inline FQCN pada pendefinisian route:
  ```php
  // ❌ SALAH (DILARANG KERAS):
  Route::get('data', [\App\Http\Controllers\Settlement\SettlementPackageController::class, 'get']);

  // ✅ BENAR:
  // Di bagian atas file:
  use App\Http\Controllers\Settlement\SettlementPackageController;

  // Di bagian rute:
  Route::prefix('settlement-packages')->controller(SettlementPackageController::class)->group(function () {
      Route::get('index', 'index')->name('settlements.packages.index');
      Route::get('export', 'exportExcel')->name('settlements.packages.export');
  });
  ```

### B. Isolasi Route dengan Controller Grouping
* Manfaatkan `Route::controller(NamaController::class)` untuk mengelompokkan method rute agar bersih dan mudah dibaca:
  ```php
  Route::prefix('settlements')->controller(SettlementTicketController::class)->group(function () {
      Route::get('index', 'index')->name('settlements.tickets.index');
      Route::get('export', 'exportExcel')->name('settlements.tickets.export');
  });
  ```

### C. Dilarang Menulis Logic / Closure di File Route
* ❌ **DILARANG** menulis logic SQL, manipulasi array, atau `View::make()` di dalam Closure `routes/web.php`.
* Seluruh permintaan wajib didelegasikan ke Controller yang bersangkutan. Pengecualian hanya untuk rute redirect sederhana: `Route::get('/', fn () => redirect()->route('dashboard'));`.

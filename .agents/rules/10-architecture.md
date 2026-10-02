---
description: Backend Architecture Standards - Controller, Service, Repository, Model (app/**)
globs: app/**
---

# 10. Backend Architecture (Controller ➔ Service ➔ Repository)

Sistem `adminShuttleV3` menerapkan arsitektur berorientasi lapisan (*layered architecture*) yang memisahkan tanggung jawab secara tegas (*Separation of Concerns*).

```
   [ Client / Browser ]
            │
            ▼
    [ Controller ]      ──► Validasi Form Request & Otorisasi RBAC
            │
            ▼
      [ Service ]       ──► Logika Bisnis, Kalkulasi, Transformasi Finansial
            │
            ▼
    [ Repository ]      ──► Akses Database, Eloquent Model, Query Builder
            │
            ▼
     [ Database ]
```

---

## 1. Controller (`app/Http/Controllers/`)
* **Tanggung Jawab**:
  1. Menerima `Request` dari route HTTP.
  2. Memeriksa izin hak akses via `$this->permission('read'|'create'|'update'|'delete')`.
  3. Meneruskan data ke **Service** terkait.
  4. Mengembalikan respon: `View`, `JsonResponse`, atau `BinaryFileResponse` (download file).
* **Aturan Mutlak**:
  * ❌ **JANGAN** menulis logika perhitungan finansial di controller.
  * ❌ **JANGAN** memanggil `DB::table()`, Model Eloquent, atau query langsung.
  * ❌ **JANGAN** menginjeksi atau memanggil Repository secara langsung.

```php
// ✅ CONTOH YANG BENAR
namespace App\Http\Controllers\Settlement;

use App\Http\Controllers\Controller;
use App\Services\Settlement\SettlementPackageService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SettlementPackageController extends Controller
{
    protected SettlementPackageService $settlementService;

    public function __construct(SettlementPackageService $settlementService)
    {
        parent::__construct();
        $this->settlementService = $settlementService;
        $this->parent_url = 'settlement-packages/index';
    }

    public function index(Request $request): View
    {
        $this->permission('read');
        $filters = $request->only(['date_type', 'daterange', 'payment_method']);
        $result = $this->settlementService->getSettlementData($filters);

        return view('apps.settlements.package.index', $result);
    }
}
```

---

## 2. Service (`app/Services/`)
* **Tanggung Jawab**:
  1. Pusat seluruh logika bisnis (*business logic*), alur transaksi, dan perhitungan formula.
  2. Menginjeksi satu atau lebih **Repository**.
  3. Memanipulasi struktur data untuk kebutuhan tampilan atau ekspor file.
  4. Mengatur database transaction (`DB::beginTransaction()`, `commit()`, `rollback()`) bila terjadi mutasi multi-tabel.
* **Aturan Mutlak**:
  * ❌ **JANGAN** mengimpor Eloquent Model secara langsung di file Service.
  * ❌ **JANGAN** menulis kueri database SQL / `DB::table()` di dalam Service.

```php
// ✅ CONTOH YANG BENAR
namespace App\Services\Settlement;

use App\Repositories\Settlement\SettlementPackageRepository;

class SettlementPackageService
{
    protected SettlementPackageRepository $repository;

    public function __construct(SettlementPackageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getSettlementData(array $filters): array
    {
        $rawData = $this->repository->getSettlementPackages($filters);
        // Lakukan transformasi kalkulasi finansial di sini...
        return ['reportData' => $processed, 'summaryCards' => $summary];
    }
}
```

---

## 3. Repository (`app/Repositories/`)
* **Tanggung Jawab**:
  1. Satu-satunya lapisan yang berhak berkomunikasi dengan basis data.
  2. Mengeksekusi kueri menggunakan Eloquent Model atau Query Builder (`DB::table`).
  3. Melakukan filter SQL, join tabel, pencarian, dan pagination.
* **Aturan Mutlak**:
  * ❌ **JANGAN** menaruh logika bisnis atau formula kalkulasi aplikasi di Repository.
  * ❌ **JANGAN** mengembalikan respon HTTP dari Repository.

```php
// ✅ CONTOH YANG BENAR
namespace App\Repositories\Settlement;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SettlementPackageRepository
{
    public function getSettlementPackages(array $filters): Collection
    {
        return DB::table('connex.package_transaction as pt')
            ->leftJoin('outlets as dep', 'pt.from', '=', 'dep.code')
            ->where('pt.payment_status', 'paid')
            ->get();
    }
}
```

---

## 4. Model (`app/Models/`)
* **Tanggung Jawab**:
  1. Merepresentasikan struktur tabel database.
  2. Mendefinisikan relasi (`hasOne`, `hasMany`, `belongsTo`).
  3. Mendefinisikan cast atribut (`$casts`), accessor, mutator, dan local query scope.
* **Aturan Mutlak**:
  * ❌ **JANGAN** memanggil Model di Controller atau Service.
  * Model hanya boleh berinteraksi dengan **Repository**.

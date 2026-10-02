# Workflow: Membuat Modul Baru (CRUD / Operasional)

Gunakan alur kerja terstruktur ini saat diminta mengembangkan modul baru di `adminShuttleV3`.

---

## Tahap 1: Verifikasi Skema Database & Permission
1. Periksa tabel target di database `transport_system` atau `connex`.
2. Pastikan `menu_id` sudah terdaftar di tabel `menus`. Jika belum, susun query SQL manual untuk phpMyAdmin:
   ```sql
   INSERT INTO `menus` (`id`, `label`, `group`, `name`, `link`, `icon`, `order`, `is_active`, `created_at`, `updated_at`)
   VALUES ([ID], '[LABEL]', '[GROUP]', '[NAME]', '[url-prefix/index]', 'la-icon', [ORDER], 'y', NOW(), NOW());
   ```
3. Berikan permission ke role pengguna (Super Admin):
   ```sql
   INSERT INTO `permissions` (`id`, `role_id`, `menu_id`, `create`, `read`, `update`, `delete`, `created_at`, `updated_at`)
   VALUES (UUID(), '05581f52-1a25-4b51-97a1-e915c922ed39', [ID], 1, 1, 1, 1, NOW(), NOW());
   ```
4. Bersihkan cache menu: `php artisan cache:clear`.

---

## Tahap 2: Buat Lapisan Backend (Vertical Slice)
1. **Repository**: `app/Repositories/[Domain]/[Entity]Repository.php`
   * Berisi fungsi kueri database murni (`get()`, `find()`, `store()`, `update()`, `delete()`).
2. **Service**: `app/Services/[Domain]/[Entity]Service.php`
   * Menginjeksi Repository dan menangani validasi bisnis serta transaksi database.
3. **Form Request**: `app/Http/Requests/[Domain]/Store[Entity]Request.php` & `Update[Entity]Request.php`.
4. **Controller**: `app/Http/Controllers/[Domain]/[Entity]Controller.php`
   * Set `$this->parent_url = '[url-prefix/index]';`.
   * Periksa `$this->permission('read')`, `'create'`, `'update'`, `'delete'`.
   * Kembalikan view atau json response.

---

## Tahap 3: Daftarkan Route
1. Di `routes/web.php`, impor Controller di header dengan `use`.
2. Daftarkan grup rute:
   ```php
   Route::prefix('[url-prefix]')->controller([Entity]Controller::class)->group(function () {
       Route::get('index', 'index')->name('[entity].index');
       Route::post('store', 'store')->name('[entity].store');
       Route::put('{id}', 'update')->name('[entity].update');
       Route::delete('{id}', 'destroy')->name('[entity].destroy');
   });
   ```

---

## Tahap 4: Buat Tampilan Frontend & Script
1. Buat folder view: `resources/views/apps/[domain]/[entity]/index.blade.php`.
   * Terapkan Single Clean Title Bar (Bab 35).
   * Terapkan Filter Bar dengan method GET (Bab 7 & 13).
   * Terapkan DataTables tanpa pembungkus `.table-responsive` (Bab 41).
2. Buat script client: `public/js/apps/[domain]/[entity].js`.

---

## Tahap 5: Verifikasi & Bersihkan Cache
1. Jalankan `php artisan optimize:clear`.
2. Uji eksekusi via browser bersama pengguna (*Human Verification*).
3. Hapus seluruh file pengujian sementara di `scratch/`.

# Knowledge Blueprint: Stored Procedures & Database Views Architecture

> **Database Optimization & Security Standard**: Blueprint komprehensif implementasi **Stored Procedures (SP)** dan **Database Views** untuk MySQL (`adminShuttleV3` / `transport_system`) serta Cloud Databases seperti PostgreSQL dan Supabase (`rpc` & Materialized Views).

---

## 1. Mengapa & Kapan Menggunakan Stored Procedure dan View?

Pada sistem enterprise bervolume tinggi seperti `adminShuttleV3`, penulisan query panjang berulang kali di layer aplikasi (Controller/Service) menimbulkan risiko:
- **Duplikasi Logika Bisnis**: Rumus komisi supir, perhitungan settlement tiket, atau penutupan kasir ditulis di berbagai tempat.
- **Overhead Jaringan & Latensi**: Mengirimkan lusinan query individual bolak-balik antara PHP/Node.js dan server basis data.
- **Risiko Inkonsistensi Transaksi**: Transaksi multi-tabel di layer aplikasi rentan terhadap race condition jika jaringan terputus di tengah jalan.

### Matriks Keputusan: View vs Stored Procedure vs Application Query

| Kebutuhan Teknis | Solusi Terbaik | Alasan Teknis | Contoh Kasus Nyata |
| :--- | :---: | :--- | :--- |
| **Kueri Baca Kompleks (Read-Only)**: Join multi-tabel (> 4 tabel), agregasi laporan, kalkulasi KPI | **Database View** (`CREATE VIEW`) | Mengenkapsulasi kompleksitas query; aplikasi cukup memanggil `SELECT * FROM v_... WHERE ...`. Lebih bersih, terindeks, dan reusable. | Laporan Harian Settlement Supir, Rekap Penjualan Tiket per Rute. |
| **Kueri Baca Skala Masif (High Volume Read)**: Laporan analitik berat yang tidak butuh data realtime detik itu juga | **Materialized View** (Postgres/Supabase) | Data di-cache secara fisik di disk database; diperbarui berkala via cron (`REFRESH MATERIALIZED VIEW`). Sangat cepat. | Dashboard Rekap Eksekutif Bulanan, Grafik Tren Penjualan Tahunan. |
| **Operasi Tulis Multi-Tabel (Atomic Write)**: Mutasi saldo, pencairan dana, validasi stok, log transaksi | **Stored Procedure** (`CREATE PROCEDURE` / `rpc`) | Pre-compiled di database, menjamin transaksi ACID dengan error rollback internal, memangkas latensi network. | Eksekusi Pencairan Saldo Supir (`sp_process_driver_withdrawal`), Void Tiket. |
| **CRUD Sederhana & Query Spesifik 1 Tabel**: Insert formulir kontak, update profil sederhana | **Application Query** (Eloquent / Prisma Repository) | Cukup di layer repository aplikasi tanpa menambah overhead pemeliharaan DDL di database. | Update nama outlet, ganti password user. |

---

## 2. Standar Teknis & Template: MySQL (`adminShuttleV3` & `admin-sunjaya`)

### A. Database View Standard (`v_[nama_tampilan]`)
Gunakan prefix `v_` untuk seluruh view agar teridentifikasi jelas:

```sql
-- ==============================================================================
-- VIEW: v_driver_daily_settlement
-- Deskripsi: Agregasi riwayat operasional harian supir, total trip, dan insentif
-- ==============================================================================
DROP VIEW IF EXISTS `v_driver_daily_settlement`;

CREATE VIEW `v_driver_daily_settlement` AS
SELECT 
    d.id AS driver_id,
    d.name AS driver_name,
    d.no_lambung,
    DATE(t.departure_date) AS settlement_date,
    COUNT(t.id) AS total_trips,
    COALESCE(SUM(t.total_passenger), 0) AS total_passengers,
    COALESCE(SUM(t.total_amount), 0) AS gross_revenue,
    COALESCE(SUM(i.incentive_amount), 0) AS total_incentive
FROM drivers d
LEFT JOIN trips t ON t.driver_id = d.id AND t.status = 'completed'
LEFT JOIN driver_incentives i ON i.trip_id = t.id
GROUP BY d.id, d.name, d.no_lambung, DATE(t.departure_date);
```

### B. Stored Procedure Standard (`sp_[nama_prosedur]`)
Setiap Stored Procedure di MySQL **WAJIB** mematuhi:
1. `DELIMITER //` yang valid.
2. `SQL SECURITY INVOKER` secara default (hanya gunakan `DEFINER` jika membutuhkan eskalasi izin administratif tertentu dengan alasan terdokumentasi).
3. `DECLARE EXIT HANDLER FOR SQLEXCEPTION` untuk menjamin otomatis `ROLLBACK` jika terjadi kegagalan query di tengah proses.
4. Parameter bertipe data eksplisit (`IN`, `OUT`, atau `INOUT`).

```sql
-- ==============================================================================
-- STORED PROCEDURE: sp_process_driver_withdrawal
-- Deskripsi: Eksekusi pencairan saldo supir, mutasi ledger, dan status update
-- ==============================================================================
DROP PROCEDURE IF EXISTS `sp_process_driver_withdrawal`;

DELIMITER //

CREATE PROCEDURE `sp_process_driver_withdrawal`(
    IN  p_request_id            VARCHAR(36),
    IN  p_cashier_id            VARCHAR(36),
    IN  p_source_bank_acc_id    VARCHAR(36),
    IN  p_reference_number      VARCHAR(100),
    IN  p_transfer_proof        VARCHAR(255),
    OUT p_response_code         INT,
    OUT p_response_message      VARCHAR(255)
)
SQL SECURITY INVOKER
BEGIN
    DECLARE v_driver_id     VARCHAR(36);
    DECLARE v_amount        DECIMAL(15,2);
    DECLARE v_status        VARCHAR(50);
    DECLARE v_current_saldo DECIMAL(15,2);

    -- 1. Error Handler: Rollback jika ada error SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_response_code = 500;
        SET p_response_message = 'Database Error: Gagal memproses transaksi pencairan.';
    END;

    -- 2. Mulai Transaksi Atomik
    START TRANSACTION;

    -- Ambil data request dengan Row-Level Locking (FOR UPDATE)
    SELECT driver_id, amount, status 
    INTO v_driver_id, v_amount, v_status
    FROM driver_deposite_withdraw_request
    WHERE id = p_request_id
    FOR UPDATE;

    -- Validasi 1: Request harus ada dan berstatus pending
    IF v_driver_id IS NULL THEN
        ROLLBACK;
        SET p_response_code = 404;
        SET p_response_message = 'Data pengajuan penarikan tidak ditemukan.';
    ELSEIF v_status != 'pending' THEN
        ROLLBACK;
        SET p_response_code = 400;
        SET p_response_message = 'Status pengajuan sudah tidak pending (sudah diproses sebelumnya).';
    ELSE
        -- Validasi 2: Saldo supir mencukupi
        SELECT saldo INTO v_current_saldo
        FROM drivers
        WHERE id = v_driver_id
        FOR UPDATE;

        IF v_current_saldo < v_amount THEN
            ROLLBACK;
            SET p_response_code = 422;
            SET p_response_message = 'Saldo supir tidak mencukupi untuk pencairan.';
        ELSE
            -- Eksekusi 1: Catat pencairan di tabel driver_withdrawals
            INSERT INTO driver_withdrawals (
                id, withdraw_code, withdraw_request_id, driver_id, 
                cashier_id, source_bank_account_id, amount, 
                reference_number, transfer_proof, created_at, updated_at
            ) VALUES (
                UUID(), CONCAT('WTH-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', FLOOR(RAND() * 9000 + 1000)),
                p_request_id, v_driver_id, p_cashier_id, 
                p_source_bank_acc_id, v_amount, p_reference_number, 
                p_transfer_proof, NOW(), NOW()
            );

            -- Eksekusi 2: Update status request
            UPDATE driver_deposite_withdraw_request
            SET status = 'approved', updated_at = NOW()
            WHERE id = p_request_id;

            -- Eksekusi 3: Potong saldo supir
            UPDATE drivers
            SET saldo = saldo - v_amount, updated_at = NOW()
            WHERE id = v_driver_id;

            COMMIT;
            SET p_response_code = 200;
            SET p_response_message = 'Pencairan saldo supir berhasil diproses secara atomik.';
        END IF;
    END IF;
END //

DELIMITER ;
```

---

## 3. Standar Teknis: Cloud Databases (PostgreSQL / Supabase RPC)

Pada PostgreSQL dan Supabase, Stored Procedure dan Functions dijalankan via **PL/pgSQL**.

### A. Supabase Database Functions (`rpc`)
Di Supabase, function dapat dipanggil langsung dari client-side atau backend via `supabase.rpc('function_name', { params })`.

```sql
-- ==============================================================================
-- POSTGRES / SUPABASE RPC: process_driver_withdrawal
-- Keamanan Wajib: SET search_path = public, pg_temp (Mencegah search_path hijacking)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_driver_withdrawal(
    p_request_id UUID,
    p_reference_number TEXT,
    p_transfer_proof TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Berjalan dengan izin function creator
SET search_path = public, pg_temp -- WAJIB untuk SECURITY DEFINER
AS $$
DECLARE
    v_driver_id UUID;
    v_amount NUMERIC(15,2);
    v_status TEXT;
    v_current_saldo NUMERIC(15,2);
BEGIN
    -- 1. Verifikasi Autentikasi Pengguna (RLS Check di level SP)
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 401, 'message', 'Unauthorized');
    END IF;

    -- 2. Ambil data pengajuan dengan row locking
    SELECT driver_id, amount, status 
    INTO v_driver_id, v_amount, v_status
    FROM driver_withdraw_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 404, 'message', 'Request tidak ditemukan');
    END IF;

    IF v_status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'code', 400, 'message', 'Request sudah diproses');
    END IF;

    -- 3. Cek saldo supir
    SELECT saldo INTO v_current_saldo FROM drivers WHERE id = v_driver_id FOR UPDATE;
    IF v_current_saldo < v_amount THEN
        RETURN jsonb_build_object('success', false, 'code', 422, 'message', 'Saldo tidak mencukupi');
    END IF;

    -- 4. Mutasi Data
    INSERT INTO driver_withdrawals (request_id, driver_id, cashier_id, amount, reference_number, transfer_proof)
    VALUES (p_request_id, v_driver_id, auth.uid(), v_amount, p_reference_number, p_transfer_proof);

    UPDATE driver_withdraw_requests SET status = 'approved', updated_at = NOW() WHERE id = p_request_id;
    UPDATE drivers SET saldo = saldo - v_amount, updated_at = NOW() WHERE id = v_driver_id;

    RETURN jsonb_build_object('success', true, 'code', 200, 'message', 'Pencairan berhasil diproses');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 500, 'message', SQLERRM);
END;
$$;

-- Izin Eksekusi Role Terotentikasi
REVOKE EXECUTE ON FUNCTION public.process_driver_withdrawal(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_driver_withdrawal(UUID, TEXT, TEXT) TO authenticated;
```

---

## 4. Keamanan Mutlak Stored Procedure & View (Security Checklist)

Setiap pembuatan SP atau View wajib mematuhi 5 pilar keamanan berikut:

1. **Pencegahan SQL Injection di dalam Stored Procedure**:
   - Gunakan parameter SQL langsung (`WHERE id = p_id`).
   - **DILARANG KERAS** menyusun query string dinamis via string concatenation (misal: `SET @sql = CONCAT('SELECT * FROM users WHERE id = ', p_id); PREPARE stmt FROM @sql;`) tanpa fungsi sanitasi / placeholder parameter `?`.
2. **Konteks Keamanan (DEFINER vs INVOKER)**:
   - Di MySQL: Selalu gunakan `SQL SECURITY INVOKER` kecuali ada kebutuhan hak istimewa khusus yang didokumentasikan.
   - Di PostgreSQL / Supabase: Jika menggunakan `SECURITY DEFINER`, **WAJIB menyertakan `SET search_path = public, pg_temp`** untuk mencegah eksploitasi *search path hijacking*.
3. **Audit Privilege Escalation**:
   - Jika SP melakukan bypass RLS (karena `SECURITY DEFINER`), function wajib memeriksa identitas pemanggil secara manual via `auth.uid()` atau validasi session token.
4. **Row-Level Locking (Pencegahan Race Condition / Saldo Negatif)**:
   - Gunakan klausa `FOR UPDATE` saat membaca saldo atau stok sebelum memotong nilai tersebut. Hal ini mencegah dua kasir/proses mengurangi saldo yang sama secara bersamaan (*double spending*).
5. **Rollback & Handler Idempoten**:
   - Setiap SP wajib membungkus logika dalam transaksi dan menyediakan skrip pembatalan DDL:
     ```sql
     DROP PROCEDURE IF EXISTS `sp_nama_prosedur`;
     DROP VIEW IF EXISTS `v_nama_view`;
     ```

---

## 5. Alur Kerja Sebelum & Sesudah (The Mandatory Before & After Flow)

### Alur SEBELUM Development (Review & Planning Gate):
1. **Identifikasi Kebutuhan**:
   - Jika tugas memuat agregasi baca laporan kompleks $\rightarrow$ Pertimbangkan **Database View**.
   - Jika tugas memuat mutasi multi-tabel dengan perhitungan transaksi $\rightarrow$ Pertimbangkan **Stored Procedure / RPC**.
2. **Konsultasi Proaktif kepada Pengguna (Human-in-the-Loop)**:
   Agen **WAJIB menawarkan secara transparan** di laporan review:
   > *"Untuk fitur [Nama Fitur], kami mengidentifikasi adanya logika agregasi/transaksi multi-tabel. Apakah Anda ingin kita gunakan **Stored Procedure / Database View** agar lebih optimal (kueri pre-compiled di database, logic reusable tanpa membuat fungsi berulang di controller, dan transaksi atomik aman)? Ataukah Anda ingin kueri tetap berada di layer Service/Repository aplikasi?"*
3. **Penyusunan Kontrak Parameter & Skrip DDL**:
   - Definisikan nama SP/View, parameter input/output, dan tipe data.
   - Siapkan query SQL DDL lengkap (`CREATE PROCEDURE` / `CREATE VIEW`) dan Rollback Script (`DROP ...`).
   - **Zero-Direct-CRUD Policy**: Agen menyajikan query SQL di dalam blok kode markdown agar pengguna yang mengeksekusinya di **phpMyAdmin** atau Supabase SQL Editor.
4. **Persetujuan Pengguna**: Tunggu kata "Setuju" dari pengguna sebelum menulis kode integrasi di aplikasi.

### Alur SESUDAH Development (Integration, Testing & Documentation):
1. **Eksekusi Manual oleh Pengguna**: Pengguna mengeksekusi DDL di phpMyAdmin / database console.
2. **Uji Coba Pemanggilan SQL (Smoke Test)**:
   Agen menyajikan query uji coba pemanggilan untuk diverifikasi pengguna:
   ```sql
   -- Test pemanggilan MySQL
   CALL sp_process_driver_withdrawal('REQ-001', 'USR-001', 'BANK-001', 'REF-999', 'proof.jpg', @code, @msg);
   SELECT @code, @msg;
   ```
3. **Integrasi ke Layer Repository Aplikasi**:
   - Di Laravel (Repository):
     ```php
     // Menggunakan View
     return DB::table('v_driver_daily_settlement')->where('driver_id', $driverId)->paginate(15);

     // Memanggil Stored Procedure
     $result = DB::select('CALL sp_process_driver_withdrawal(?, ?, ?, ?, ?, @code, @msg)', [
         $requestId, $cashierId, $bankId, $refNo, $proofPath
     ]);
     $output = DB::select('SELECT @code AS code, @msg AS message')[0];
     ```
   - Di Supabase (JavaScript / TypeScript):
     ```typescript
     const { data, error } = await supabase.rpc('process_driver_withdrawal', {
       p_request_id: requestId,
       p_reference_number: refNo,
       p_transfer_proof: proofPath
     });
     ```
4. **Dokumentasi & Versi Repositori**:
   - Simpan salinan file DDL di repositori proyek (misal: `database/procedures/sp_process_driver_withdrawal.sql` atau `database/views/v_driver_daily_settlement.sql`).
   - Catat nama SP/View, fungsi, dan parameternya ke dalam `.agents/session-state.json` dan `bug-cases.md`.

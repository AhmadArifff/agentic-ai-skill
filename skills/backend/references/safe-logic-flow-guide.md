# Safe Logic Flow & Error Handling Architecture Guide

Standar pengolahan alur logika aman untuk mencegah *silent bug* dan mencegah aplikasi *crash* secara liar melalui penerapan kombinasi **pola desain (*design patterns*)** dan **praktik arsitektur kode** terstandarisasi.

---

## Ringkasan Alur Kerja Aman (*Architecture Flow Matrix*)

| Lapisan Kode (*Layer*) | Metode yang Digunakan | Perilaku Saat Terjadi Kondisi Gagal |
| --- | --- | --- |
| **Validation / Input** | `if-else` / Guard Clause | Kembalikan respons validasi `400 Bad Request` ke pengguna. |
| **Business Logic (Service)** | Result Pattern & Domain Exception | Kembalikan `Result.fail()` untuk kegagalan bisnis, atau lempar `CustomException`. |
| **Infrastructure (DB / API)** | `try-catch` + Structured Logging | Tangkap error teknis, buat log detail, lalu *re-throw* atau bungkus dengan `CustomException`. |
| **Outer Layer (Framework)** | Global Exception Handler | Menangkap semua error yang lolos, menyembunyikan stack trace dari pengguna akhir, dan mengirim respons `500`. |

---

## 1. Pola Guard Clause (Early Return)

Daripada membuat sarang `if-else` yang dalam (*pyramid of doom*), lakukan validasi prasyarat di baris-baris awal fungsi. Jika kondisi tidak terpenuhi, langsung hentikan eksekusi (*return*) atau lempar *exception*.

```javascript
// AMAN & RAPI: Guard Clause
function transferSaldo(sender, receiver, amount) {
    if (!sender || !receiver) {
        return Result.fail("Akun pengirim atau penerima tidak ditemukan.");
    }
    if (amount <= 0) {
        return Result.fail("Nominal transfer harus lebih dari 0.");
    }
    if (sender.balance < amount) {
        return Result.fail("Saldo pengirim tidak mencukupi.");
    }

    // Eksekusi logika utama hanya jika semua kondisi aman
    sender.balance -= amount;
    receiver.balance += amount;
    return Result.ok("Transfer berhasil.");
}
```

---

## 2. Result Pattern (Result Object)

Sangat berguna pada *Service Layer*. Daripada mengembalikan nilai acak seperti `null`, `false`, atau melempar *exception* untuk kasus kegagalan bisnis biasa, kembalikan **objek terstruktur** yang mengindikasikan status keberhasilan secara eksplisit.

```javascript
// Kelas pembungkus hasil eksekusi
class Result {
    constructor(isSuccess, data = null, error = null) {
        this.isSuccess = isSuccess;
        this.data = data;
        this.error = error;
    }

    static ok(data) {
        return new Result(true, data, null);
    }

    static fail(error) {
        return new Result(false, null, error);
    }
}

// Penggunaan pada Service
async function registerUser(payload) {
    const existing = await userRepo.findByEmail(payload.email);
    if (existing) {
        return Result.fail("Email sudah terdaftar."); // Bukan error sistem, tapi validasi bisnis
    }

    const newUser = await userRepo.create(payload);
    return Result.ok(newUser);
}
```

---

## 3. Custom Domain Exception

Buat kelas *exception* khusus untuk membedakan antara **kesalahan logika bisnis** dan **kesalahan teknis sistem**. Ini mencegah penangkapan *exception* secara acak.

```javascript
// Exception khusus domain
class InsufficientBalanceException extends Error {
    constructor(message) {
        super(message);
        this.name = "InsufficientBalanceException";
    }
}

class DatabaseConnectionException extends Error {
    constructor(message) {
        super(message);
        this.name = "DatabaseConnectionException";
    }
}
```

---

## 4. Centralized Global Exception Handler

Jangan menangani *try-catch* teknis di setiap baris fungsi controller. Biarkan *exception* teknis yang tidak terduga melayang ke atas (*bubble up*) hingga ditangkap oleh **Global Exception Handler** di tingkat *framework* (Middleware/Filter).

- **Di Service/Model:** Biarkan error fatal terlempar jika memang gagal secara teknis (misal: koneksi DB terputus).
- **Di Global Handler:** Tangkap error tersebut, catat log lengkapnya, lalu ubah menjadi respon yang aman dan ramah pengguna (misal: HTTP Status 500 dengan pesan *"Terjadi kesalahan pada sistem"*).

```javascript
// Contoh Middleware Global Error Handler (Express/Node.js)
app.use((err, req, res, next) => {
    // 1. Log error beserta stack trace ke sistem pengawas (Winston, Sentry, dsb.)
    logger.error(`[${err.name}] ${err.message}`, { stack: err.stack });

    // 2. Jika error kustom (domain exception), tampilkan pesan yang sesuai
    if (err instanceof InsufficientBalanceException) {
        return res.status(400).json({ status: "error", message: err.message });
    }

    // 3. Jika error teknis yang tidak terduga, Sembunyikan detail sensitif dari client
    return res.status(500).json({ status: "error", message: "Terjadi gangguan internal pada server." });
});
```

---

## 5. Structured Logging & Observability

Aturan utama saat menggunakan `try-catch` adalah **selalu mencatat log**. Jangan pernah membiarkan blok `catch` kosong.

```javascript
try {
    await externalPaymentGateway.charge(paymentData);
} catch (error) {
    // WAJIB: Log context detail agar bisa di-audit saat ada laporan bug
    logger.error("Gagal melakukan charge ke Payment Gateway", {
        userId: user.id,
        amount: paymentData.amount,
        errorMessage: error.message,
        stackTrace: error.stack
    });

    // Lempar kembali atau kembalikan status gagal yang jelas
    throw new PaymentProcessException("Gagal memproses pembayaran online.");
}
```

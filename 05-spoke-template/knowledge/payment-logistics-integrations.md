# Knowledge: Payment Gateway & Logistics Integrations Blueprint (Indonesia)

> **Arsitektur Transaksi E-Commerce Indonesia**: Panduan integrasi pembayaran digital (Midtrans, QRIS dinamis, Virtual Account) dan agregator pengiriman multi-kurir (Biteship, JNE, J&T, SiCepat, GoSend, GrabExpress) dengan ketahanan tinggi (*high resiliency*).

---

## 1. Arsitektur Payment Gateway (Midtrans Snap & Direct Payment)

### A. Alur Transaksi Pembayaran
1. Pelanggan memilih metode pembayaran pada Checkout Modal (QRIS, GoPay, ShopeePay, Virtual Account BCA/BNI/Mandiri, atau Transfer Bank).
2. Backend memanggil Snap API `/snap/v1/transactions` dengan `gross_amount` dan `order_id` unik.
3. Midtrans mengembalikan `snap_token` dan `redirect_url`.
4. Frontend memicu popup Midtrans Snap via `window.snap.pay(snap_token, { onSuccess, onPending, onError, onClose })`.

### B. Validasi Webhook & Rekonsiliasi Otomatis (Idempotent Webhook)
Untuk mencegah eksploitasi notifikasi pembayaran palsu, backend **WAJIB memvalidasi tanda tangan kriptografis (`signature_key`)**:

```text
signature_key = SHA512(order_id + status_code + gross_amount + server_key)
```

```typescript
import crypto from 'crypto';

export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}, serverKey: string): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest('hex');

  return hash === payload.signature_key;
}
```

### C. Pemetaan Status Transaksi
* `transaction_status === 'settlement'` atau `'capture'` (dengan `fraud_status === 'accept'`): Status pesanan diubah ke `PAID` / `CRAFTING`.
* `transaction_status === 'pending'`: Status pesanan `PENDING_PAYMENT`.
* `transaction_status === 'deny'`, `'cancel'`, `'expire'`: Status pesanan `CANCELLED`, dan kuota/stok dikembalikan secara atomik.

### D. Resilient Simulation Fallback
Pada mode pengujian/sandbox atau saat server gateway eksternal mengalami timeout:
- Sistem backend menyediakan *simulation token* cadangan agar alur pengerjaan dan uji coba antarmuka pelanggan tidak macet.

---

## 2. Arsitektur Agregator Logistik & Ekspedisi (Biteship API)

### A. Alur Perhitungan Ongkos Kirim Real-Time
1. Pelanggan memasukkan kota/kecamatan tujuan pengiriman atau titik koordinat GPS.
2. Backend mengirim request rate checking ke Biteship API `/v1/rates/couriers`:
   - `origin_postal_code`: Kode pos gudang / florist workshop.
   - `destination_postal_code` / `destination_area_id`: Wilayah pembeli.
   - `items`: Dimensi paket (panjang, lebar, tinggi) dan berat akumulasi buket.
3. Agregator mengembalikan daftar kurir (J&T EZ, JNE REG, SiCepat BEST, Instant GoSend/GrabExpress) beserta estimasi biaya dan durasi pengiriman.

### B. Titik Temu COD (Cash on Delivery)
Untuk transaksi COD area kampus/lokal:
- Sediakan daftar titik temu resmi (*fixed meetup points*) dengan koordinat dan petunjuk lokasi yang jelas (misal: Perpustakaan Pusat UI, Gerbang Utama Gunadarma).
- Terapkan guard validasi agar pesanan COD hanya dapat diproses jika pelanggan memilih salah satu titik temu yang sah.

### C. Resilient Courier Fallback Engine
Jika kuota API pihak ketiga habis atau server ekspedisi sedang gangguan:
- Sistem backend secara otomatis mengembalikan daftar tarif kurir estimasi standar (*graceful degradation fallback*) agar pelanggan tetap dapat melanjutkan checkout tanpa mengalami crash.

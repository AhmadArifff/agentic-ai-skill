# Frontend Safe Logic Flow & Error Handling Architecture Guide

Standar pengolahan alur logika aman di sisi client (Frontend) untuk mencegah *silent bug*, *race condition*, dan aplikasi *crash/white-screen* melalui kombinasi **Guard Clauses**, **Result Pattern**, **Error Boundaries**, dan **Structured Telemetry** di **Next.js (React)** dan **Vue 3 / Nuxt 3**.

---

## Ringkasan Alur Kerja Aman (*Architecture Flow Matrix*)

| Lapisan Kode (*Layer*) | Metode yang Digunakan | Perilaku Saat Terjadi Kondisi Gagal |
| --- | --- | --- |
| **Validation / UI Input** | `if-else` / Guard Clause | Return early, tampilkan validasi inline / toast feedback. |
| **Business Logic (Hooks / Composables)** | Result Pattern & Domain Exception | Kembalikan `Result.fail()` terstruktur, hindari melempar error tak tertangkap. |
| **Infrastructure (API / Fetch / Storage)** | `try-catch` + Structured Logging | Tangkap error network/storage, log ke Sentry/console, fallback data default. |
| **Outer Layer (Framework/UI)** | Global Error Boundary | Menangkap unhandled UI render error (`onErrorCaptured` / React Error Boundary), tampilkan Fallback UI ramah pengguna. |

---

## 1. Pola Guard Clause (Early Return)

Hindari *pyramid of doom* (`if-else` bersarang). Lakukan validasi prasyarat di awal fungsi/event handler.

```typescript
// AMAN & RAPI: Guard Clause pada Event Handler / Form Submission
function handleCheckout(cartItems: CartItem[], user: User | null) {
  // Guard 1: Cek autentikasi
  if (!user) {
    toast.error('Silakan login terlebih dahulu untuk checkout.');
    router.push('/login');
    return;
  }

  // Guard 2: Cek keranjang kosong
  if (!cartItems || cartItems.length === 0) {
    toast.warning('Keranjang belanja Anda masih kosong.');
    return;
  }

  // Guard 3: Validasi ketersediaan stok
  const outOfStockItem = cartItems.find((item) => item.stock <= 0);
  if (outOfStockItem) {
    toast.error(`Produk ${outOfStockItem.name} sedang habis.`);
    return;
  }

  // Eksekusi checkout hanya jika semua kondisi aman
  executeCheckoutProcess(cartItems, user);
}
```

---

## 2. Result Pattern pada Frontend

### A. Objek Terstruktur `Result<T>`
```typescript
export interface Result<T> {
  isSuccess: boolean;
  data: T | null;
  error: string | null;
}

export const Result = {
  ok: <T>(data: T): Result<T> => ({ isSuccess: true, data, error: null }),
  fail: <T>(error: string): Result<T> => ({ isSuccess: false, data: null, error }),
};
```

### B. Implementasi pada Vue 3 Composable
```typescript
// src/composables/useProfile.ts (Vue 3 Composition API)
import { ref } from 'vue';
import { Result } from '@/utils/result';

export function useProfile() {
  const profile = ref<UserProfile | null>(null);
  const isLoading = ref(false);

  async function updateProfile(payload: UpdateProfileDTO): Promise<Result<UserProfile>> {
    // 1. Guard Clause
    if (!payload.name || payload.name.trim().length < 3) {
      return Result.fail('Nama minimal harus 3 karakter.');
    }

    isLoading.value = true;
    try {
      const response = await api.put('/user/profile', payload);
      profile.value = response.data;
      return Result.ok(response.data);
    } catch (err: any) {
      console.error('[useProfile] Update failed:', err);
      const message = err.response?.data?.message || 'Gagal memperbarui profil.';
      return Result.fail(message);
    } finally {
      isLoading.value = false;
    }
  }

  return { profile, isLoading, updateProfile };
}
```

---

## 3. Global & Component Error Boundary

### A. Vue 3 Error Boundary (`onErrorCaptured`)
```vue
<!-- src/components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { AlertCircle, RefreshCw } from 'lucide-vue-next';

const hasError = ref(false);
const errorMsg = ref('');

onErrorCaptured((err, _instance, info) => {
  hasError.value = true;
  errorMsg.value = err instanceof Error ? err.message : String(err);
  console.error('[Vue Component Error]', { err, info });
  return false; // Hentikan propagasi error
});

function retry() {
  hasError.value = false;
}
</script>

<template>
  <div v-if="hasError" class="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
    <AlertCircle class="w-8 h-8 text-rose-600 mx-auto mb-2" />
    <h4 class="text-sm font-semibold text-rose-900 dark:text-rose-200">Gagal memuat komponen</h4>
    <p class="text-xs text-rose-700 dark:text-rose-400 mt-1">{{ errorMsg }}</p>
    <button class="mt-3 px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg cursor-pointer" @click="retry">
      <RefreshCw class="w-3 h-3 inline mr-1" /> Coba Lagi
    </button>
  </div>
  <slot v-else />
</template>
```

### B. Vue 3 Global Error Handler (`main.ts`)
```typescript
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Global Error Handler]', {
    error: err,
    component: instance?.$options?.name,
    info,
  });
};
```

---

## 4. Structured Logging & Observability

Dilarang membiarkan blok `catch` kosong tanpa logging atau tanpa user feedback:

```typescript
try {
  await submitPayment(orderId);
} catch (error: any) {
  // 1. Structured Logging
  console.error('[Payment Error]', {
    orderId,
    timestamp: new Date().toISOString(),
    error: error?.message || error,
  });

  // 2. Clear & Friendly UI Feedback
  toast.error('Pembayaran tidak dapat diproses saat ini. Silakan coba kembali.');
}
```

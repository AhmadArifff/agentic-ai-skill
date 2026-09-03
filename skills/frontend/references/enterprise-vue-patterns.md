# Enterprise Vue.js Architecture & High-Concurrency Systems Guide

Panduan arsitektur tingkat lanjut untuk pengembangan aplikasi **Vue 3 (Composition API)** dan **Nuxt 3** pada sistem berskala enterprise dengan beban konkurensi tinggi, sinkronisasi real-time, dan pemisahan domain modular.

---

## 1. Arsitektur Folder (Vertical Slice / Feature-Based)

Aplikasi enterprise mengelompokkan kode berdasarkan domain bisnis, bukan tipe file teknis:

```text
src/
├── app/                           # Bootstrapping & Shell
│   ├── App.vue
│   ├── main.ts
│   ├── router/                    # Root router & dynamic module loader
│   └── styles/                    # Global CSS, tokens, Tailwind base
│
├── modules/                       # Domain Slices (Tiap fitur terisolasi mandiri)
│   ├── <feature-name>/            # Contoh: auth, booking, shuttle-tracking
│   │   ├── api/                   # Repositories & API clients spesifik modul
│   │   ├── adapters/              # Data mappers (API DTO <-> Domain Model)
│   │   ├── components/            # UI spesifik modul (Presentational / Molecule / Organism)
│   │   ├── composables/           # Reusable stateful logic & use cases
│   │   ├── routes.ts              # Rute modular
│   │   ├── stores/                # Pinia store lokal modul
│   │   ├── types/                 # Type definitions & contract interfaces
│   │   ├── views/                 # Top-level route pages (Smart / Container)
│   │   └── index.ts               # Public API (Barrel file)
│
└── shared/                        # Shared Core (Agnostik Domain)
    ├── api/                       # Base HTTP client (Fetch/Axios), interceptors
    ├── components/                # Base UI / Design System (BaseButton, BaseModal)
    ├── composables/               # Pure utility composables (useDebounce, useNetwork)
    ├── constants/                 # Konfigurasi & konstanta global
    ├── layouts/                   # Layout wrappers (DashboardLayout, BlankLayout)
    ├── types/                     # Shared DTOs, API envelope types
    └── utils/                     # Pure helper functions
```

### Aturan Batasan Arsitektur (*Architectural Boundaries*)
1. **Module ke Shared:** Diizinkan.
2. **Module A ke Module B:** **HANYA** melalui `index.ts` (Public API) milik modul tujuan. Dilarang keras melakukan *deep import* ke file internal modul lain.
3. **Module ke App:** Dilarang.
4. **Shared ke Module:** Dilarang. Komponen dan utilitas di `shared` harus murni agnostik domain.

---

## 2. Pola Desain (*Clean Design Patterns*)

### A. Repository Pattern (Abstraksi Pemanggilan HTTP)
Isolasi semua request HTTP di dalam objek repository. Komponen dan store dilarang memanggil URL endpoint atau Fetch/Axios secara langsung.

```typescript
// src/modules/booking/api/booking.repository.ts
import { apiClient } from '@/shared/api/client';
import type { SeatDto, LockSeatPayload, LockResponseDto } from '../types/booking.types';

export const bookingRepository = {
  async getSeats(scheduleId: string): Promise<SeatDto[]> {
    const { data } = await apiClient.get<SeatDto[]>(`/schedules/${scheduleId}/seats`);
    return data;
  },

  async lockSeat(payload: LockSeatPayload): Promise<LockResponseDto> {
    const { data } = await apiClient.post<LockResponseDto>('/seats/lock', payload);
    return data;
  },

  async releaseSeat(scheduleId: string, seatId: string, sessionId: string): Promise<void> {
    await apiClient.post('/seats/release', { scheduleId, seatId, sessionId });
  }
};
```

---

### B. Adapter / Data Mapper Pattern (Anti-Corruption Layer)
Format payload backend (misal: `snake_case`, raw string timestamps, integer status) harus ditransformasikan menjadi `camelCase` dan tipe data domain yang konkret sebelum masuk ke komponen UI.

```typescript
// src/modules/booking/adapters/seat.adapter.ts
import type { SeatDto, SeatModel } from '../types/booking.types';

export const seatAdapter = {
  toDomain(raw: SeatDto): SeatModel {
    return {
      id: raw.id,
      seatNumber: raw.seat_number,
      isAvailable: raw.status === 'AVAILABLE',
      price: raw.base_price,
      currency: raw.currency || 'IDR',
      lockedUntil: raw.locked_until ? new Date(raw.locked_until) : null,
      updatedAt: new Date(raw.updated_at),
    };
  },

  toDTO(model: SeatModel): Partial<SeatDto> {
    return {
      id: model.id,
      seat_number: model.seatNumber,
      base_price: model.price,
    };
  }
};
```

---

### C. Composable sebagai Use Case / Service Layer
Composable Vue 3 berfungsi sebagai penghubung antara reaktivitas state, pemanggilan repository, dan penanganan status loading/error.

```typescript
// src/modules/booking/composables/useSeatSelection.ts
import { ref } from 'vue';
import { bookingRepository } from '../api/booking.repository';
import { seatAdapter } from '../adapters/seat.adapter';
import type { SeatModel } from '../types/booking.types';

export function useSeatSelection(scheduleId: string) {
  const seats = ref<SeatModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function loadSeats() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await bookingRepository.getSeats(scheduleId);
      seats.value = data.map(seatAdapter.toDomain);
    } catch (err: any) {
      error.value = err?.message ?? 'Gagal memuat denah kursi';
      console.error('[useSeatSelection] Load error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    seats,
    isLoading,
    error,
    loadSeats,
  };
}
```

---

### D. Container (Smart) vs Presentational (Dumb) Components
- **Container Components (`views/`):** Terhubung ke Composables, Pinia Stores, dan Routes. Mengatur alur data dan passing props ke komponen anak.
- **Presentational Components (`components/`):** Hanya menerima `props` dan mengirim `emit`. Murni mengurus presentasi visual tanpa *side-effects*, mudah diuji secara terisolasi.

---

## 3. High-Concurrency & Real-Time Sync Patterns

### A. State Separation (Client State vs Server State)
- **Pinia:** Khusus untuk **Client-Side State** (token autentikasi, filter form aktif, preferensi tema, step wizard).
- **TanStack Query (`@tanstack/vue-query`):** Khusus untuk **Server-Side State** (caching data jadwal, polling data real-time, optimistic mutations, background refetch, cache invalidation).

---

### B. Real-Time Seat Locking & Race Condition
1. **Server-Authoritative:** Frontend dilarang mengunci kursi secara optimis tanpa konfirmasi backend. Frontend mengirim *intent to lock* dan menunggu konfirmasi server melalui WebSocket atau HTTP response.
2. **Data Structure Optimization:** Gunakan `Map<string, SeatModel>` di dalam composable untuk pencarian data $O(1)$ saat menerima gelombang update WebSocket berkepanduan tinggi.
3. **Timer Expiration Sync:** Hitung countdown timer berbasis timestamp absolut `expiresAt` dari server (bukan decrement lokal detik) agar terhindar dari ketidakakuratan timer background tab browser.

---

### C. Resilient Connection: Auto-Reconnect & Polling Fallback
Jika koneksi WebSocket terputus, alihkan otomatis ke *short polling* (2.5 detik) dan jalankan *exponential backoff reconnect*.

```typescript
// src/shared/composables/useResilientConnection.ts
export function useResilientConnection(url: string, fallbackFetch: () => Promise<void>, onMessage: (data: any) => void) {
  let socket: WebSocket | null = null;
  let pollingTimer: number | null = null;
  let attempts = 0;

  function startPolling() {
    if (pollingTimer) return;
    pollingTimer = window.setInterval(fallbackFetch, 2500);
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  function connect() {
    socket = new WebSocket(url);

    socket.onopen = () => {
      attempts = 0;
      stopPolling();
    };

    socket.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        onMessage(payload);
      } catch (err) {
        console.error('[WebSocket Parse Error]', err);
      }
    };

    socket.onclose = () => {
      startPolling();
      const delay = Math.min(1000 * Math.pow(2, attempts), 15000);
      attempts++;
      setTimeout(connect, delay);
    };

    socket.onerror = (err) => {
      console.error('[WebSocket Error]', err);
      socket?.close();
    };
  }

  function disconnect() {
    stopPolling();
    socket?.close();
  }

  return { connect, disconnect, startPolling, stopPolling };
}
```

---

### D. Teardown Lifecycle (Graceful Resource / Lock Release)
Mencegah resource/kursi tertahan di server jika pengguna tiba-tiba menutup tab atau navigasi mundur:

1. **Vue Router Guard:** Tangani pelepasan saat pindah rute via `onBeforeRouteLeave`.
2. **Browser Unload / Tab Close:** Gunakan event `pagehide` dengan `navigator.sendBeacon` atau `fetch` dengan `{ keepalive: true }`.

```typescript
// src/modules/booking/composables/useLockTeardown.ts
import { onMounted, onUnmounted } from 'vue';

export function useLockTeardown(releaseUrl: string, payload: Record<string, any>) {
  function handleTeardown() {
    const data = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(releaseUrl, blob);
    } else {
      fetch(releaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      });
    }
  }

  onMounted(() => {
    window.addEventListener('pagehide', handleTeardown);
  });

  onUnmounted(() => {
    window.removeEventListener('pagehide', handleTeardown);
    // Jalankan release saat komponen di-unmount dari router
    handleTeardown();
  });
}
```

---

### E. Smooth Geo-Tracking & Marker Animation (MapLibre / Mapbox LERP)
Dilarang mereaktifkan koordinat GPS mentah langsung ke virtual DOM Vue (dapat menyebabkan lag 60fps). Gunakan **Linear Interpolation (LERP)** dan kalkulasi **bearing** menggunakan `requestAnimationFrame`.

```typescript
// src/shared/utils/geo.ts
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function calculateBearing(start: [number, number], end: [number, number]): number {
  const [lng1, lat1] = start.map((d) => (d * Math.PI) / 180);
  const [lng2, lat2] = end.map((d) => (d * Math.PI) / 180);
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
```

---

## 4. Standar Validasi Form & CSS Primitives

- **Form Validation:** Gunakan `vee-validate` yang terintegrasi dengan skema `zod` untuk validasi bertipe aman:
  ```typescript
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';

  const schema = toTypedSchema(z.object({
    passengerName: z.string().min(3, 'Nama minimal 3 karakter'),
    phoneNumber: z.string().regex(/^[0-9+]{10,14}$/, 'Nomor telepon tidak valid'),
  }));

  const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
  ```
- **CSS & UI Primitives:** Gunakan **Tailwind CSS + Radix Vue** (`shadcn-vue`) untuk performa tinggi tanpa runtime overhead CSS-in-JS.

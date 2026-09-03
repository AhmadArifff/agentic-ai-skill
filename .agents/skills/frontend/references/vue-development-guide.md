# Vue.js 3 & Nuxt 3 Comprehensive Development Guide

Panduan standar arsitektur dan pengembangan frontend menggunakan **Vue 3 (Vite / PWA)** dan **Nuxt 3 (SSR / Full-stack)** untuk lingkungan produksi, mencakup konfigurasi global, state management (Pinia), typed SFC (`<script setup lang="ts">`), UI komponen (Shadcn Vue + Tailwind), navigation guards, dan *Safe Logic Flow*.

---

## 1. Project Initialization & Architecture

### A. Vue 3 SPA / PWA (Vite + TypeScript)
```bash
# 1. Inisialisasi Proyek Vue 3 + TypeScript
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app

# 2. Install Core Dependencies
npm install vue-router@4 pinia pinia-plugin-persistedstate @vueuse/core lucide-vue-next
npm install -D tailwindcss @tailwindcss/vite @types/node vite-plugin-pwa
```

### B. Nuxt 3 (SSR / Hybrid / Fullstack)
```bash
# 1. Inisialisasi Nuxt 3
npx nuxi@latest init my-nuxt-app
cd my-nuxt-app

# 2. Install Nuxt Modules
npm install -D @pinia/nuxt @nuxtjs/tailwindcss @vueuse/nuxt @vite-pwa/nuxt
```

---

## 2. Global Configuration Files

### A. `vite.config.ts` (Vue 3 + Vite + PWA + Alias + Proxy Backend)
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Enterprise Vue App',
        short_name: 'VueApp',
        description: 'Production-ready Vue 3 Enterprise Application',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests ke Express backend lokal untuk menghindari CORS saat development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### B. `nuxt.config.ts` (Nuxt 3 Enterprise Config)
```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],
  runtimeConfig: {
    // Private keys (Server-side only)
    apiSecret: process.env.API_SECRET,
    // Public keys (Client-side accessible via useRuntimeConfig().public)
    public: {
      apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    },
  },
  pwa: {
    manifest: {
      name: 'Nuxt Enterprise App',
      short_name: 'NuxtApp',
      theme_color: '#0F172A',
    },
  },
});
```

### C. `src/main.ts` (Global Error Handler & Plugin Registry)
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

// 1. Setup Pinia with Persistence
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// 2. Setup Vue Router
app.use(router);

// 3. Centralized Global Error Handler (Production Safe)
app.config.errorHandler = (err, instance, info) => {
  // Catat log detail ke service monitoring (misal Sentry / Datadog)
  console.error('[Vue Global Error Handler]', {
    error: err,
    component: instance?.$options?.name || 'AnonymousComponent',
    lifecycleHook: info,
    timestamp: new Date().toISOString(),
  });

  // Opsional: Kirim error ke backend telemetry
  // reportErrorToTelemetry({ error: String(err), info });
};

// 4. Global Promise Rejection Catch
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

app.mount('#app');
```

---

## 3. State Management with Pinia (Setup Store Syntax)

Gunakan **Setup Stores** (menggunakan syntax fungsi `defineStore('id', () => { ... })`) karena lebih fleksibel, mendukung *composables*, dan memiliki inferensi TypeScript yang lebih baik.

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'STAFF';
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const isLoading = ref(false);

    // Getters (Computed)
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.role === 'ADMIN');

    // Actions
    function setAuth(newUser: User, newToken: string) {
      user.value = newUser;
      token.value = newToken;
    }

    function clearAuth() {
      user.value = null;
      token.value = null;
    }

    return {
      user,
      token,
      isLoading,
      isAuthenticated,
      isAdmin,
      setAuth,
      clearAuth,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: ['token', 'user'], // Simpan data yang aman di persisted state
    },
  }
);
```

> [!IMPORTANT]
> **Reactivity Loss Warning**: Jangan melakukan *destructuring* langsung dari store Pinia (`const { user, token } = useAuthStore()`). Selalu gunakan `storeToRefs()` untuk mempertahankan sifat reaktif:
> ```typescript
> import { storeToRefs } from 'pinia';
> const authStore = useAuthStore();
> const { user, isAuthenticated } = storeToRefs(authStore);
> const { setAuth, clearAuth } = authStore; // Methods dapat di-destructure langsung
> ```

---

## 4. Protected Routes & Navigation Guards (Vue Router)

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
      },
      {
        path: 'master-data',
        name: 'AdminMasterData',
        component: () => import('@/views/admin/MasterDataView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
});

// Navigation Guard (Auth & Role Check)
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRole = to.meta.role as string | undefined;

  // 1. Jika halaman butuh Auth dan user belum login -> Redirect ke /login
  if (requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }

  // 2. Jika halaman khusus Guest (Login/Register) dan user sudah login -> Redirect ke Dashboard
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ path: '/admin/dashboard' });
  }

  // 3. Jika halaman membutuhkan role khusus (misal ADMIN)
  if (requiredRole && authStore.user?.role !== requiredRole) {
    return next({ path: '/unauthorized' });
  }

  next();
});

export default router;
```

---

## 5. Component Patterns (`<script setup lang="ts">`)

### A. Atom / Reusable Button with Typed Props, Emits, & Slots
```vue
<!-- src/components/ui/AppButton.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  isLoading: false,
  disabled: false,
  type: 'button',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500';
    case 'outline':
      return 'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800';
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500';
    case 'primary':
    default:
      return 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-md min-h-[36px]';
    case 'lg':
      return 'px-6 py-3 text-base rounded-xl min-h-[48px]';
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm rounded-lg min-h-[44px]'; // Min touch target 44px
  }
});

function handleClick(event: MouseEvent) {
  if (props.disabled || props.isLoading) return;
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
    ]"
    @click="handleClick"
  >
    <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </button>
</template>
```

### B. Custom Form Input with Two-Way Binding (`defineModel`)
```vue
<!-- src/components/ui/AppInput.vue (Vue 3.4+) -->
<script setup lang="ts">
interface Props {
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string | null;
  required?: boolean;
}

defineProps<Props>();

// Two-way binding model value
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="text-xs font-semibold text-slate-700 dark:text-slate-300">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    <input
      v-model="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :class="[
        'w-full px-3.5 py-2.5 text-sm rounded-lg bg-white dark:bg-slate-900 border transition-colors outline-none focus:ring-2',
        error
          ? 'border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
          : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20',
      ]"
    />
    <p v-if="error" class="text-xs text-rose-500 font-medium">{{ error }}</p>
  </div>
</template>
```

---

## 6. Safe Logic Flow & Error Handling in Composables

Pola *Result Pattern* dan *Guard Clauses* diimplementasikan ke dalam Vue Composables (`useXxx`) agar UI state konsisten tanpa melempar crash:

```typescript
// src/composables/useMasterData.ts
import { ref } from 'vue';

export interface Result<T> {
  isSuccess: boolean;
  data: T | null;
  error: string | null;
}

export interface MasterOption {
  id: string;
  code: string;
  label: string;
  colorHex?: string;
}

export function useMasterData() {
  const options = ref<MasterOption[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  async function fetchMasterData(category: string): Promise<Result<MasterOption[]>> {
    // 1. Guard Clause: Validasi Input
    if (!category || category.trim() === '') {
      const err = 'Kategori master data tidak boleh kosong.';
      errorMessage.value = err;
      return { isSuccess: false, data: null, error: err };
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
      const response = await fetch(`/api/v1/admin/master/${encodeURIComponent(category)}`);
      
      // 2. Guard Clause: Cek status HTTP
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      options.value = json.data || [];
      return { isSuccess: true, data: options.value, error: null };
    } catch (err: unknown) {
      // 3. Structured Logging & Safe Result return
      const message = err instanceof Error ? err.message : 'Gagal mengambil data master.';
      console.error('[useMasterData] Fetch Failed:', { category, error: err });
      errorMessage.value = message;
      return { isSuccess: false, data: null, error: message };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    options,
    isLoading,
    errorMessage,
    fetchMasterData,
  };
}
```

---

## 7. Vue Error Boundary Component (`onErrorCaptured`)

Komponen Error Boundary mencegah seluruh halaman putih (blank) saat salah satu komponen anak melempar error runtime:

```vue
<!-- src/components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { AlertTriangle, RefreshCw } from 'lucide-vue-next';

const hasError = ref(false);
const errorDetails = ref<string | null>(null);

onErrorCaptured((err, _instance, info) => {
  hasError.value = true;
  errorDetails.value = err instanceof Error ? err.message : String(err);

  console.error('[ErrorBoundary Captured]', {
    error: err,
    info,
    timestamp: new Date().toISOString(),
  });

  // Hentikan error agar tidak merambat ke window global
  return false;
});

function resetError() {
  hasError.value = false;
  errorDetails.value = null;
}
</script>

<template>
  <div v-if="hasError" class="p-6 my-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-900/50 text-center">
    <div class="inline-flex p-3 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 mb-3">
      <AlertTriangle class="w-6 h-6" />
    </div>
    <h3 class="text-base font-semibold text-rose-900 dark:text-rose-200">
      Terjadi Kesalahan pada Tampilan Komponen
    </h3>
    <p class="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-md mx-auto">
      {{ errorDetails || 'Komponen mengalami kendala render teknis.' }}
    </p>
    <button
      class="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
      @click="resetError"
    >
      <RefreshCw class="w-3.5 h-3.5" />
      Coba Muat Ulang Komponen
    </button>
  </div>
  <slot v-else />
</template>
```

---

## 8. UI/UX Pro Max & Animation Integration in Vue 3

### A. Vue Transition Component (Tailwind Integration)
```vue
<template>
  <!-- Fade Transition -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="modal-card">
      <slot />
    </div>
  </Transition>
</template>
```

### B. AnimeJS / Motion Choreography in Vue 3 Lifecycle
```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import anime from 'animejs';

const cardRef = ref<HTMLElement | null>(null);
let animationInstance: anime.AnimeInstance | null = null;

onMounted(() => {
  if (cardRef.value) {
    animationInstance = anime({
      targets: cardRef.value,
      translateY: [20, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 600,
    });
  }
});

// WAJIB: Cleanup animation instance saat unmount untuk mencegah memory leak
onUnmounted(() => {
  if (animationInstance) {
    animationInstance.pause();
    animationInstance = null;
  }
});
</script>

<template>
  <div ref="cardRef" class="p-6 rounded-2xl bg-white shadow-xl">
    <slot />
  </div>
</template>
```

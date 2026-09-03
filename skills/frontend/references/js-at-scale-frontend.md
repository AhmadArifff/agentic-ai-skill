# JavaScript Frontend at Scale — Architecture, Maintenance, Scalability & Performance

Panduan komprehensif untuk pengembangan frontend JavaScript pada proyek berskala besar. Mencakup arsitektur komponen, kemudahan pemeliharaan, skalabilitas, dan optimasi performa.

---

## 1. Pemilihan Teknologi & Arsitektur Dasar

### 1.1 TypeScript untuk Frontend

TypeScript adalah **standar industri** untuk proyek frontend besar:

- **Props & state yang jelas** — tidak ada "apa tipe data ini?"
- **Autocomplete yang kuat** — IDE tahu semua properti
- **Refactoring massal yang aman** — ubah interface, temukan semua error
- **Dokumentasi via tipe** — tipe adalah sumber kebenaran

```typescript
// ❌ Tanpa TypeScript — mystery props
function UserCard({ user, onEdit, showActions }) {
  return <div>{user.name}</div>; // apa isi user? tipe onEdit?
}

// ✅ Dengan TypeScript — kontrak yang jelas
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
  showActions?: boolean; // optional, default false
  variant?: 'compact' | 'detailed';
}

function UserCard({ user, onEdit, showActions = false, variant = 'compact' }: UserCardProps) {
  // TypeScript tahu semua properti user, onEdit return void, dll
}
```

### 1.2 Framework & Meta-Framework Modern

| Framework | Karakteristik | Cocok Untuk |
|-----------|--------------|-------------|
| **React** | Fleksibel, ekosistem terbesar, component-based | SPA, dashboard, app kompleks |
| **Vue.js** | Progressive, mudah dipelajari, template-based | SPA menengah, dashboard |
| **Angular** | Opinionated, enterprise-ready, DI built-in | Enterprise, aplikasi korporat |
| **Svelte** | Compile-time, no virtual DOM, minimal bundle | Performa kritis |
| **Solid.js** | Fine-grained reactivity, no virtual DOM | Performa sangat tinggi |

**Meta-Framework (SSR/SSG) — Wajib untuk SEO & Performa:**

| Meta-Framework | Base | Fitur Utama |
|---------------|------|-------------|
| **Next.js** | React | SSR, SSG, ISR, App Router, Server Components |
| **Nuxt** | Vue.js | SSR, SSG, auto-imports, modules |
| **Analog** | Angular | SSR, file-based routing |
| **SvelteKit** | Svelte | SSR, SSG, form actions |
| **Astro** | Agnostik | Content-first, partial hydration, island architecture |

**Rekomendasi untuk proyek besar:**
- **Full-stack app:** Next.js (React) atau Nuxt (Vue)
- **Content-heavy site:** Astro dengan islands
- **Enterprise SPA:** Angular atau React + custom architecture

### 1.3 Component-Based Architecture

Prinsip utama arsitektur berbasis komponen:

```
Component = UI + Logic + Style
├── Single Responsibility — satu komponen, satu tugas
├── Props = API publik — deklaratif, minimal, well-typed
├── Composition over Configuration — gabungkan, jangan konfigurasi
├── Colocation — file terkait disimpan berdekatan
└── Isolation — komponen tidak tahu konteks parent
```

---

## 2. Kemudahan Pemeliharaan (Maintenance)

### 2.1 Struktur Folder untuk Proyek Besar

```
src/
├── app/                       # Routes / pages
│   ├── (auth)/               # Route group: login, register
│   ├── (dashboard)/          # Route group: dashboard pages
│   └── layout.tsx            # Root layout
├── features/                  # Feature-based modules
│   ├── user/
│   │   ├── components/       # Feature-specific components
│   │   │   ├── UserProfile.tsx
│   │   │   ├── UserProfile.test.tsx
│   │   │   └── UserProfile.module.css
│   │   ├── hooks/            # Feature-specific hooks
│   │   │   └── useUserData.ts
│   │   ├── services/         # API calls
│   │   │   └── userApi.ts
│   │   ├── stores/           # Feature state
│   │   │   └── userStore.ts
│   │   ├── types/            # Feature types
│   │   │   └── user.types.ts
│   │   └── index.ts          # Public API (barrel export)
│   ├── order/
│   └── payment/
├── shared/                    # Shared/reusable code
│   ├── components/           # UI component library
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── DataTable/
│   │   └── index.ts
│   ├── hooks/                # Reusable hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   ├── utils/                # Utility functions
│   ├── constants/            # App constants
│   └── types/                # Global types
├── styles/                    # Global styles
│   ├── tokens.css            # Design tokens
│   ├── reset.css             # CSS reset
│   └── global.css            # Global styles
└── config/                    # App configuration
```

**Aturan Import Dependency:**
```
app/ → features/ → shared/
 ↓         ↓          ↓
(pages)  (domain)   (utils)

✅ app/ boleh import features/ dan shared/
✅ features/ boleh import shared/
❌ shared/ TIDAK boleh import features/ atau app/
❌ features/user/ TIDAK boleh import features/order/ langsung
   → gunakan event bus atau shared service
```

### 2.2 Design System & Design Tokens

```css
/* styles/tokens.css — Single source of truth */
:root {
  /* Color Tokens */
  --color-primary-50: hsl(220, 90%, 96%);
  --color-primary-100: hsl(220, 85%, 90%);
  --color-primary-500: hsl(220, 75%, 55%);
  --color-primary-600: hsl(220, 75%, 45%);
  --color-primary-700: hsl(220, 75%, 35%);

  --color-neutral-0: hsl(0, 0%, 100%);
  --color-neutral-50: hsl(210, 20%, 98%);
  --color-neutral-100: hsl(210, 15%, 95%);
  --color-neutral-800: hsl(210, 10%, 20%);
  --color-neutral-900: hsl(210, 10%, 10%);

  /* Semantic Colors */
  --color-bg-primary: var(--color-neutral-0);
  --color-bg-secondary: var(--color-neutral-50);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-border: var(--color-neutral-200);

  /* Spacing Scale (4px base) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Typography Scale */
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
  --text-2xl: clamp(1.3rem, 1.1rem + 1vw, 1.5rem);
  --text-3xl: clamp(1.6rem, 1.3rem + 1.5vw, 1.875rem);
  --text-4xl: clamp(2rem, 1.6rem + 2vw, 2.25rem);

  /* Shadows */
  --shadow-sm: 0 1px 2px hsla(0, 0%, 0%, 0.05);
  --shadow-md: 0 4px 6px -1px hsla(0, 0%, 0%, 0.1);
  --shadow-lg: 0 10px 15px -3px hsla(0, 0%, 0%, 0.1);

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;

  /* Z-index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}

/* Dark Mode Tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: var(--color-neutral-900);
    --color-bg-secondary: var(--color-neutral-800);
    --color-text-primary: var(--color-neutral-50);
    --color-text-secondary: var(--color-neutral-400);
    --color-border: var(--color-neutral-700);
  }
}

[data-theme="dark"] {
  --color-bg-primary: var(--color-neutral-900);
  --color-bg-secondary: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-400);
  --color-border: var(--color-neutral-700);
}
```

### 2.3 Component Patterns yang Scalable

```typescript
// Compound Component Pattern — untuk komponen yang kompleks
// Lebih baik daripada prop drilling/konfigurasi banyak

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: (id) => {
      setActiveTab(id);
      onChange?.(id);
    }}}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist" className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
      className={`tab ${activeTab === id ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage — clean, declarative API
<Tabs defaultTab="profile" onChange={handleTabChange}>
  <Tabs.List>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
    <Tabs.Tab id="billing">Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel id="settings"><SettingsForm /></Tabs.Panel>
  <Tabs.Panel id="billing"><BillingInfo /></Tabs.Panel>
</Tabs>
```

### 2.4 Testing Frontend yang Terstruktur

```typescript
// Unit test — hooks
import { renderHook, act } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // belum berubah

    act(() => jest.advanceTimersByTime(500));
    expect(result.current).toBe('updated'); // sekarang berubah
  });
});

// Component test — React Testing Library
describe('UserCard', () => {
  it('should render user info and handle edit click', async () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} showActions />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should not show actions when showActions is false', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});

// E2E test — Playwright
test('user can create a new order', async ({ page }) => {
  await page.goto('/dashboard/orders');
  await page.click('button:text("New Order")');
  
  await page.fill('[name="product"]', 'Widget Pro');
  await page.fill('[name="quantity"]', '5');
  await page.click('button:text("Submit")');

  await expect(page.locator('.toast-success')).toContainText('Order created');
  await expect(page.locator('table')).toContainText('Widget Pro');
});
```

---

## 3. Skalabilitas (Scalability)

### 3.1 State Management yang Terstruktur

**Pilih berdasarkan kebutuhan — jangan over-engineer:**

| State Type | Tool Rekomendasi | Kapan Digunakan |
|-----------|-----------------|-----------------|
| **Server state** | TanStack Query / SWR | Data dari API (90% kasus) |
| **Client global** | Zustand / Jotai | Auth, theme, UI global |
| **Complex global** | Redux Toolkit | State sangat kompleks |
| **Form state** | React Hook Form / Formik | Form management |
| **URL state** | nuqs / next-query-params | Filter, pagination, search |

```typescript
// Server state — TanStack Query (menggantikan 80% global state)
function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getUsers(filters),
    staleTime: 5 * 60 * 1000,      // Data dianggap fresh 5 menit
    gcTime: 30 * 60 * 1000,         // Garbage collect setelah 30 menit
    placeholderData: keepPreviousData, // Smooth pagination
  });
}

// Optimistic update
function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old) => [...old, newUser]);
      return { previous };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context.previous); // Rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Refetch
    },
  });
}

// Client global state — Zustand (simple, no boilerplate)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-preference' }
  )
);
```

### 3.2 Micro Frontends

Untuk tim besar (>20 developer), pecah frontend menjadi beberapa app independen:

```
┌─────────────────────────────────────────────────┐
│                 Shell / Host App                 │
│  (Routing, Auth, Navigation, Shared Layout)     │
├────────────┬────────────┬───────────────────────┤
│  Dashboard │  Orders    │  User Management      │
│  Micro FE  │  Micro FE  │  Micro FE             │
│  (Team A)  │  (Team B)  │  (Team C)             │
│  React     │  Vue       │  React                │
└────────────┴────────────┴───────────────────────┘
```

**Implementasi dengan Module Federation (Webpack 5):**
```javascript
// Host app — webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    dashboard: 'dashboard@https://dashboard.example.com/remoteEntry.js',
    orders: 'orders@https://orders.example.com/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18' },
    'react-dom': { singleton: true, requiredVersion: '^18' },
  },
});

// Remote app (dashboard) — webpack.config.js
new ModuleFederationPlugin({
  name: 'dashboard',
  filename: 'remoteEntry.js',
  exposes: {
    './DashboardApp': './src/DashboardApp',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18' },
    'react-dom': { singleton: true, requiredVersion: '^18' },
  },
});
```

### 3.3 Monorepo untuk Proyek Besar

```
my-project/
├── apps/
│   ├── web/                  # Main web app (Next.js)
│   ├── admin/                # Admin panel (React)
│   ├── mobile/               # React Native app
│   └── docs/                 # Documentation site
├── packages/
│   ├── ui/                   # Shared component library
│   ├── utils/                # Shared utilities
│   ├── config/               # Shared config (ESLint, TS)
│   ├── types/                # Shared TypeScript types
│   └── api-client/           # Shared API client
├── turbo.json                # Turborepo config
├── pnpm-workspace.yaml       # Workspace config
└── package.json
```

**Tools monorepo:**

| Tool | Kelebihan | Cocok Untuk |
|------|-----------|-------------|
| **Turborepo** | Caching, parallel builds, incremental | Proyek besar, CI/CD cepat |
| **Nx** | Plugin ecosystem, affected detection | Enterprise, Angular |
| **pnpm workspaces** | Built-in, symlink-based | Proyek menengah |

---

## 4. Optimasi Performa (Performance Optimization)

### 4.1 Code Splitting & Lazy Loading

```typescript
// Route-based code splitting (Next.js App Router — otomatis)
// Setiap folder di app/ adalah code split point

// Dynamic import untuk komponen berat
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/features/editor/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Disable SSR untuk komponen client-only
});

const ChartDashboard = dynamic(() => import('@/features/analytics/ChartDashboard'), {
  loading: () => <ChartSkeleton />,
});

// Intersection Observer — load saat visible
function LazyComponent({ children }: { children: React.ReactNode }) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px', // Load 200px sebelum visible
  });

  return (
    <div ref={ref}>
      {isIntersecting ? children : <Skeleton />}
    </div>
  );
}
```

### 4.2 Image Optimization

```typescript
// Next.js Image — otomatis optimize
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority           // Preload untuk LCP
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur" // Low-quality placeholder
  blurDataURL={blurDataUrl}
/>

// Responsive images dengan srcset (vanilla HTML)
<picture>
  <source
    type="image/avif"
    srcset="/img/hero-400.avif 400w, /img/hero-800.avif 800w, /img/hero-1200.avif 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <source
    type="image/webp"
    srcset="/img/hero-400.webp 400w, /img/hero-800.webp 800w, /img/hero-1200.webp 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <img
    src="/img/hero-800.jpg"
    alt="Hero image"
    loading="lazy"
    decoding="async"
    width="1200"
    height="600"
  />
</picture>
```

### 4.3 Bundle Size Optimization

```bash
# Analisis bundle
npx next-bundle-analyzer   # Next.js
npx vite-bundle-visualizer # Vite
npx webpack-bundle-analyzer stats.json # Webpack
```

**Strategi mengurangi bundle:**

| Strategi | Contoh | Penghematan |
|----------|--------|-------------|
| **Tree Shaking** | `import { debounce } from 'lodash-es'` vs `import _ from 'lodash'` | 50-90% |
| **Dynamic Import** | `const Chart = dynamic(() => import('chart.js'))` | Load on demand |
| **Lighter Alternatives** | `date-fns` vs `moment.js` (12KB vs 70KB) | 60-85% |
| **CSS Purging** | PurgeCSS / Tailwind JIT | 80-95% CSS |
| **Compression** | Brotli (`br`) instead of gzip | 15-20% smaller |

```typescript
// Import yang efisien
// ❌ Import seluruh library
import _ from 'lodash'; // 70KB
import * as Icons from 'lucide-react'; // semua icon

// ✅ Import hanya yang dibutuhkan
import debounce from 'lodash/debounce'; // 2KB
import { Search, User, Settings } from 'lucide-react'; // 3 icon
```

### 4.4 Rendering Optimization

```typescript
// React.memo — skip re-render jika props tidak berubah
const UserList = React.memo(function UserList({ users }: { users: User[] }) {
  return users.map(user => <UserCard key={user.id} user={user} />);
});

// useMemo — cache expensive computation
function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const analytics = useMemo(() => {
    return {
      total: transactions.reduce((sum, t) => sum + t.amount, 0),
      average: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
      byCategory: groupBy(transactions, 'category'),
    };
  }, [transactions]);
}

// Virtualization — render hanya item yang visible
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5,            // Render 5 items di luar viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.5 Caching & CDN

```typescript
// Service Worker untuk caching (next-pwa)
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 }, // 1 jam
      },
    },
    {
      urlPattern: /\.(png|jpg|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 hari
      },
    },
  ],
});

// HTTP Cache headers (API responses)
// Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200
```

### 4.6 Core Web Vitals Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│  Metric         │  Target  │  Cara Optimasi                    │
├─────────────────┼──────────┼───────────────────────────────────┤
│  LCP            │  < 2.5s  │  Preload hero image, SSR,         │
│  (Largest       │          │  font-display: swap, CDN,         │
│   Contentful    │          │  priority hints                   │
│   Paint)        │          │                                   │
├─────────────────┼──────────┼───────────────────────────────────┤
│  INP            │  < 200ms │  Debounce handlers, Web Workers,  │
│  (Interaction   │          │  requestIdleCallback,              │
│   to Next Paint)│          │  minimize main thread work         │
├─────────────────┼──────────┼───────────────────────────────────┤
│  CLS            │  < 0.1   │  Set width/height on images,      │
│  (Cumulative    │          │  reserve space for async content,  │
│   Layout Shift) │          │  avoid injecting content above     │
│                 │          │  existing content                  │
└─────────────────┴──────────┴───────────────────────────────────┘
```

---

## 5. Checklist: Frontend JavaScript at Scale

### Architecture Checklist
- [ ] TypeScript enabled dengan strict mode
- [ ] Feature-based folder structure
- [ ] Design tokens/CSS custom properties tersentralisasi
- [ ] Component library tersentralisasi di shared/
- [ ] Import boundaries yang jelas (feature → shared, bukan sebaliknya)
- [ ] Meta-framework (Next.js/Nuxt) untuk SSR/SSG

### Maintenance Checklist
- [ ] ESLint + Prettier configured
- [ ] Husky + lint-staged untuk pre-commit hooks
- [ ] Component testing (React Testing Library/Vue Test Utils)
- [ ] E2E testing (Playwright)
- [ ] Storybook untuk component documentation
- [ ] Visual regression testing (Chromatic/Percy)

### Scalability Checklist
- [ ] Server state management (TanStack Query/SWR)
- [ ] Code splitting per route/feature
- [ ] Monorepo setup untuk multi-app (Turborepo)
- [ ] Shared types antar frontend dan backend
- [ ] API client tersentralisasi
- [ ] Feature flags untuk progressive rollout

### Performance Checklist
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Bundle size dianalisis dan dioptimalkan
- [ ] Images: WebP/AVIF, responsive, lazy loaded
- [ ] Fonts: preloaded, font-display: swap, subset
- [ ] Lists 100+ items menggunakan virtualization
- [ ] Dynamic imports untuk komponen berat
- [ ] Service Worker/PWA untuk caching
- [ ] CDN untuk static assets

### Responsive Device Priority Checklist
- [ ] **Prioritas 1 (Utama)**: Handphone / Mobile layout dikembangkan dan dites pertama kali (0-767px)
- [ ] **Prioritas 2 (Utama)**: Tablet / iPad layout dioptimalkan untuk portrait & landscape (768-1023px)
- [ ] **Prioritas 3 (Lanjutan)**: Laptop, Desktop, & Komputer diadaptasi dari layout mobile/tablet (1024px+)
- [ ] Touch targets minimal 44x44px untuk perangkat mobile dan tablet
- [ ] Bebas dari horizontal scroll di semua resolusi HP dan Tablet

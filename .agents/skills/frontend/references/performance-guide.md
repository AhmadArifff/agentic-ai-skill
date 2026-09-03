# Performance Guide — Core Web Vitals & Optimization

Reference document for the Frontend Skill's performance optimization capability.

---

## Core Web Vitals

### Metrics & Targets

| Metric | Full Name | Target | What It Measures |
|--------|-----------|--------|-----------------|
| **LCP** | Largest Contentful Paint | < 2.5s | Loading — how fast the main content appears |
| **INP** | Interaction to Next Paint | < 200ms | Interactivity — how fast the page responds to input |
| **CLS** | Cumulative Layout Shift | < 0.1 | Visual stability — how much the layout shifts unexpectedly |

### LCP Optimization

```
Common causes of slow LCP:
├── Slow server response (TTFB > 600ms)
├── Render-blocking CSS/JS
├── Slow resource loading (hero image, web fonts)
└── Client-side rendering (CSR) delays

Fixes:
├── Optimize TTFB: caching, CDN, edge rendering
├── Preload LCP resource: <link rel="preload" href="hero.webp" as="image">
├── Inline critical CSS, defer non-critical
├── Use responsive images with srcset
├── Server-side render (SSR) or static generation (SSG) for above-the-fold
└── Priority hints: <img fetchpriority="high">
```

### INP Optimization

```
Common causes of high INP:
├── Long JavaScript tasks (> 50ms) blocking main thread
├── Heavy DOM updates (large list re-renders)
├── Expensive event handlers (complex calculations on click)
└── Synchronous layout/style recalculations

Fixes:
├── Break long tasks: use scheduler.yield() or setTimeout(0)
├── Debounce/throttle input handlers
├── Use CSS transitions instead of JS animations
├── Virtualize long lists (only render visible items)
├── Use Web Workers for heavy computation
└── Batch DOM updates
```

### CLS Optimization

```
Common causes of layout shift:
├── Images without dimensions (width/height)
├── Ads, embeds, or iframes without reserved space
├── Dynamically injected content above viewport
├── Web fonts causing FOIT/FOUT
└── Animations that trigger layout

Fixes:
├── Always set width and height on <img> and <video>
├── Use aspect-ratio CSS property for responsive media
├── Reserve space for dynamic content (min-height, skeleton)
├── Use font-display: swap with matching fallback metrics
├── Use transform for animations (not top/left/width/height)
└── Add new content below the viewport (or use sticky/fixed)
```

---

## Code Splitting

### Route-Based Splitting

```jsx
// Instead of importing all routes upfront:
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import AnalyticsPage from './pages/Analytics';

// Lazy load each route:
const HomePage = lazy(() => import('./pages/Home'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));

// Wrap in Suspense:
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
  </Routes>
</Suspense>
```

### Component-Level Splitting

```jsx
// Heavy components loaded on demand
const ChartComponent = lazy(() => import('./Chart'));
const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

// Load when visible (Intersection Observer)
const LazyChart = () => {
  const [isVisible, ref] = useIntersectionObserver();
  return (
    <div ref={ref}>
      {isVisible && (
        <Suspense fallback={<ChartSkeleton />}>
          <ChartComponent />
        </Suspense>
      )}
    </div>
  );
};
```

---

## Image Optimization

### Format Selection

| Format | Best For | Browser Support |
|--------|----------|----------------|
| **AVIF** | Photos, complex images (best compression) | Chrome, Firefox, Safari 16+ |
| **WebP** | Photos, graphics (good compression) | All modern browsers |
| **PNG** | Icons, logos with transparency | Universal |
| **SVG** | Icons, illustrations, logos | Universal |
| **JPEG** | Photos (fallback) | Universal |

### Responsive Images

```html
<!-- Responsive with multiple sizes -->
<img
  src="hero-800.webp"
  srcset="
    hero-400.webp   400w,
    hero-800.webp   800w,
    hero-1200.webp 1200w,
    hero-1600.webp 1600w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Descriptive alt text"
  width="800"
  height="450"
  loading="lazy"
  decoding="async"
/>

<!-- Art direction with <picture> -->
<picture>
  <source media="(max-width: 768px)" srcset="hero-mobile.avif" type="image/avif">
  <source media="(max-width: 768px)" srcset="hero-mobile.webp" type="image/webp">
  <source srcset="hero-desktop.avif" type="image/avif">
  <source srcset="hero-desktop.webp" type="image/webp">
  <img src="hero-desktop.jpg" alt="Hero image" width="1200" height="600">
</picture>
```

### Image Loading Strategy

| Position | Loading | Priority |
|----------|---------|----------|
| Above the fold (hero, logo) | `loading="eager"` | `fetchpriority="high"` |
| Below the fold | `loading="lazy"` | Default |
| Background/decorative | `loading="lazy"` | `fetchpriority="low"` |
| LCP image | `loading="eager"` | `fetchpriority="high"` + `<link rel="preload">` |

---

## Bundle Size Optimization

### Analysis Tools

```bash
# Webpack
npx webpack-bundle-analyzer dist/stats.json

# Vite
npx vite-bundle-visualizer

# Generic
npx source-map-explorer dist/**/*.js
```

### Common Savings

| Technique | Typical Savings | How |
|-----------|----------------|-----|
| Tree shaking | 20-50% | Import only what you use: `import { map } from 'lodash-es'` |
| Code splitting | 30-60% initial load | Route-based lazy loading |
| Minification | 40-60% | Terser (JS), cssnano (CSS) — usually default |
| Compression | 60-80% | Brotli (best) or gzip |
| Dead code removal | 10-30% | Remove unused imports, unreachable code |
| Dependency replacement | 50-90% per lib | moment → dayjs, lodash → native, etc. |
| Image optimization | 50-80% | WebP/AVIF, proper sizing, lazy loading |

### Heavy Dependencies to Watch

| Library | Size | Alternative |
|---------|------|-------------|
| `moment.js` | ~290KB | `dayjs` (~7KB), `date-fns` (tree-shakable) |
| `lodash` | ~530KB | `lodash-es` (tree-shake), native JS |
| `chart.js` | ~190KB | Lazy load, or `lightweight-charts` |
| `monaco-editor` | ~5MB | Lazy load, or `codemirror` |
| `@mui/material` | ~300KB+ | Import individual components |
| `antd` | ~1.2MB | Import individual components |

---

## Render Optimization

### Memoization Guide

| Technique | When to Use | When NOT to Use |
|-----------|-------------|-----------------|
| `React.memo()` | Component re-renders with same props | Simple/cheap components |
| `useMemo()` | Expensive calculations that don't change often | Simple computations |
| `useCallback()` | Callback passed to memoized child | Callbacks not passed to children |

```
Rule of thumb:
├── Profile FIRST, optimize SECOND
├── Don't memo everything — it has its own cost
├── Memo when: parent re-renders often but child props don't change
├── Memo when: expensive computation in render
└── Skip when: component is already fast (< 5ms render)
```

### List Virtualization

```
Use virtualization when:
├── List has 100+ items
├── Each item is complex (multiple sub-components)
├── User can scroll through all items
└── Rendering all items causes visible lag

Libraries:
├── @tanstack/react-virtual (lightweight, headless)
├── react-virtuoso (feature-rich, auto-sizing)
├── react-window (classic, simple API)
└── Custom IntersectionObserver for simpler cases
```

### Debounce & Throttle

```
Debounce (wait until user stops):
├── Search input (300ms) — wait until typing pauses
├── Window resize handler (250ms)
├── Auto-save (1000ms)

Throttle (limit frequency):
├── Scroll handlers (16ms = 60fps)
├── Mouse move tracking (50ms)
├── API polling (5000ms)
├── Analytics events (1000ms)
```

---

## Caching Strategies

### HTTP Cache Headers

| Header | Value | Use Case |
|--------|-------|----------|
| `Cache-Control: max-age=31536000, immutable` | 1 year | Hashed static assets (app.a1b2c3.js) |
| `Cache-Control: no-cache` | Always revalidate | HTML pages, API responses |
| `Cache-Control: max-age=3600, stale-while-revalidate=86400` | 1h fresh, 1d stale OK | Frequently updated content |
| `Cache-Control: no-store` | Never cache | Sensitive/private data |

### Service Worker Strategies

| Strategy | How It Works | Best For |
|----------|-------------|----------|
| **Cache First** | Serve from cache, fall back to network | Static assets, fonts |
| **Network First** | Fetch from network, fall back to cache | API data, HTML pages |
| **Stale While Revalidate** | Serve from cache, update in background | Frequently updated content |
| **Cache Only** | Only serve from cache | Offline-first PWAs |
| **Network Only** | Only serve from network | Real-time data |

---

## Performance Budget

### Recommended Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| Total JS (compressed) | < 200KB | 350KB |
| Total CSS (compressed) | < 50KB | 100KB |
| Largest image | < 200KB | 500KB |
| Total page weight | < 1MB | 2MB |
| Time to Interactive | < 3s (3G) | 5s |
| First Contentful Paint | < 1.5s | 2.5s |
| LCP | < 2.5s | 4s |
| INP | < 200ms | 500ms |
| CLS | < 0.1 | 0.25 |

# UI Design System — Tokens & Visual Guide

Reference document for the Frontend Skill's UI/UX design implementation capability.

---

## Design Tokens (CSS Custom Properties)

### Color System

Use HSL for easy manipulation (lighten, darken, adjust saturation):

```css
:root {
  /* Primary */
  --color-primary-50:  hsl(220, 90%, 96%);
  --color-primary-100: hsl(220, 85%, 90%);
  --color-primary-200: hsl(220, 80%, 80%);
  --color-primary-300: hsl(220, 75%, 70%);
  --color-primary-400: hsl(220, 70%, 60%);
  --color-primary-500: hsl(220, 70%, 50%);   /* Base */
  --color-primary-600: hsl(220, 70%, 42%);
  --color-primary-700: hsl(220, 72%, 34%);
  --color-primary-800: hsl(220, 75%, 26%);
  --color-primary-900: hsl(220, 80%, 18%);
  --color-primary-950: hsl(220, 85%, 10%);

  /* Semantic Colors */
  --color-success: hsl(142, 71%, 45%);
  --color-warning: hsl(38, 92%, 50%);
  --color-error:   hsl(0, 84%, 60%);
  --color-info:    hsl(200, 90%, 50%);

  /* Neutral (Gray) */
  --color-gray-50:  hsl(220, 14%, 96%);
  --color-gray-100: hsl(220, 13%, 91%);
  --color-gray-200: hsl(220, 12%, 83%);
  --color-gray-300: hsl(220, 10%, 71%);
  --color-gray-400: hsl(220, 8%, 56%);
  --color-gray-500: hsl(220, 8%, 46%);
  --color-gray-600: hsl(220, 10%, 37%);
  --color-gray-700: hsl(220, 12%, 28%);
  --color-gray-800: hsl(220, 14%, 18%);
  --color-gray-900: hsl(220, 16%, 12%);
  --color-gray-950: hsl(220, 20%, 6%);

  /* Surface & Background */
  --color-bg-primary:   hsl(0, 0%, 100%);
  --color-bg-secondary: hsl(220, 14%, 96%);
  --color-bg-tertiary:  hsl(220, 13%, 91%);
  --color-surface:      hsl(0, 0%, 100%);
  --color-surface-elevated: hsl(0, 0%, 100%);

  /* Text */
  --color-text-primary:   hsl(220, 16%, 12%);
  --color-text-secondary: hsl(220, 8%, 46%);
  --color-text-tertiary:  hsl(220, 8%, 56%);
  --color-text-inverse:   hsl(0, 0%, 100%);
  --color-text-link:      var(--color-primary-500);

  /* Border */
  --color-border:       hsl(220, 13%, 91%);
  --color-border-focus: var(--color-primary-500);
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary:   hsl(220, 20%, 6%);
    --color-bg-secondary: hsl(220, 16%, 10%);
    --color-bg-tertiary:  hsl(220, 14%, 14%);
    --color-surface:      hsl(220, 16%, 12%);
    --color-surface-elevated: hsl(220, 14%, 16%);

    --color-text-primary:   hsl(220, 14%, 96%);
    --color-text-secondary: hsl(220, 8%, 60%);
    --color-text-tertiary:  hsl(220, 8%, 46%);

    --color-border: hsl(220, 14%, 20%);
  }
}

/* Class-based toggle (for manual switching) */
[data-theme="dark"] {
  /* Same overrides as above */
}
```

---

### Typography Scale

```css
:root {
  /* Font Families */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-serif: 'Georgia', 'Times New Roman', serif;

  /* Font Sizes (Major Third Scale — 1.250 ratio) */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px */
  --text-5xl:  3rem;       /* 48px */
  --text-6xl:  3.75rem;    /* 60px */

  /* Line Heights */
  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   2;

  /* Font Weights */
  --font-light:    300;
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
  --font-extrabold:800;

  /* Letter Spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal: 0;
  --tracking-wide:   0.025em;
  --tracking-wider:  0.05em;
}
```

### Fluid Typography (clamp)

```css
/* Fluid heading — scales from 24px (mobile) to 48px (desktop) */
h1 {
  font-size: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  line-height: var(--leading-tight);
}

h2 {
  font-size: clamp(1.25rem, 0.9rem + 1.8vw, 2.25rem);
  line-height: var(--leading-tight);
}

/* Body text — 16px to 18px */
body {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: var(--leading-normal);
}
```

### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2');
    font-weight: 100 900;
    font-display: swap;          /* Show fallback immediately, swap when loaded */
    unicode-range: U+0000-00FF;  /* Latin subset — reduces download size */
  }
</style>
```

---

### Spacing Scale

```css
:root {
  /* Base: 4px (0.25rem) */
  --space-0:   0;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1:   0.25rem;   /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2:   0.5rem;    /* 8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;      /* 128px */
}
```

---

### Shadows & Elevation

```css
:root {
  --shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* Elevation (z-index scale) */
  --z-dropdown:  1000;
  --z-sticky:    1020;
  --z-fixed:     1030;
  --z-backdrop:  1040;
  --z-modal:     1050;
  --z-popover:   1060;
  --z-tooltip:   1070;
  --z-toast:     1080;

  /* Border Radius */
  --radius-none: 0;
  --radius-sm:   0.25rem;   /* 4px */
  --radius-md:   0.375rem;  /* 6px */
  --radius-lg:   0.5rem;    /* 8px */
  --radius-xl:   0.75rem;   /* 12px */
  --radius-2xl:  1rem;      /* 16px */
  --radius-full: 9999px;    /* Pill shape */
}
```

---

### Animation & Transition Tokens

```css
:root {
  /* Duration */
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring:  cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Common transitions */
  --transition-colors:   color, background-color, border-color var(--duration-normal) var(--ease-in-out);
  --transition-opacity:  opacity var(--duration-normal) var(--ease-in-out);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  --transition-shadow:   box-shadow var(--duration-normal) var(--ease-in-out);
  --transition-all:      all var(--duration-normal) var(--ease-in-out);
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Common Animation Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Skeleton Loading Pattern

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
```

---

### Glassmorphism Pattern

```css
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

/* Dark mode glassmorphism */
[data-theme="dark"] .glass {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

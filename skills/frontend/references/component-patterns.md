# Component Patterns — Architecture & Design Guide

Reference document for the Frontend Skill's component architecture capability across **React (Next.js)** and **Vue.js 3 / Nuxt 3**.

---

## Atomic Design Methodology

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  Complete, specific instances of templates with real data    │
├─────────────────────────────────────────────────────────────┤
│                       Templates                              │
│  Page-level layout defining content structure                │
├─────────────────────────────────────────────────────────────┤
│                       Organisms                              │
│  Complex UI sections (Header, ProductCard, SearchBar)        │
├─────────────────────────────────────────────────────────────┤
│                       Molecules                              │
│  Groups of atoms working together (FormField, NavItem)       │
├─────────────────────────────────────────────────────────────┤
│                         Atoms                                │
│  Basic building blocks (Button, Input, Badge, Icon)          │
└─────────────────────────────────────────────────────────────┘
```

### Examples by Level

| Level | Components | Characteristics |
|-------|-----------|----------------|
| **Atom** | Button, Input, Label, Icon, Badge, Avatar, Spinner | Self-contained, no dependencies, highly reusable |
| **Molecule** | FormField (Label + Input + Error), SearchInput (Input + Icon + Button) | Combines 2-3 atoms, single purpose |
| **Organism** | Header (Logo + Nav + Search + UserMenu), ProductCard (Image + Title + Price + Button) | Complex, self-contained section |
| **Template** | DashboardLayout (Sidebar + Header + Content + Footer) | Defines content structure, no real data |
| **Page** | DashboardPage (Template + real data + state) | Specific instance with actual content |

---

## Component File Organization

### Feature-Based (Recommended)

```
src/
├── components/                  # Shared, reusable components
│   ├── ui/                      # Atoms + Molecules (React / Vue)
│   │   ├── Button/
│   │   │   ├── Button.tsx / Button.vue
│   │   │   ├── Button.test.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── Modal/
│   ├── layout/                  # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── shared/                  # Cross-feature organisms
│       ├── DataTable/
│       └── FileUploader/
│
├── features/                    # Feature-specific components
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/ / composables/
│   │   └── utils/
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/ / composables/
│   │   └── api/
│   └── dashboard/
│
├── stores/                      # Zustand (React) or Pinia (Vue) stores
├── hooks/ / composables/        # Shared custom hooks / Vue composables
├── utils/                       # Shared utilities
├── styles/                      # Global styles & tokens
└── pages/ / views/              # Page-level components / routes
```

### Co-Location Rules

```
✅ Keep together:
├── Component + its styles
├── Component + its tests
├── Component + its types
├── Component + its stories (Storybook)
└── Feature + its hooks/composables/utils/api

❌ Avoid:
├── All styles in one /styles folder
├── All tests in one /tests folder
├── All types in one /types folder
└── Components divorced from their context
```

---

## Component Design Principles

### Single Responsibility

```
❌ Bad — does too many things:
<UserCard 
  user={user}
  showOrders={true}
  showSettings={true}
  onDeleteUser={handleDelete}
  onUpdateRole={handleRole}
  showAnalytics={true}
/>

✅ Good — focused components:
<UserCard user={user} />
<UserOrders userId={user.id} />
<UserSettings userId={user.id} />
<UserAnalytics userId={user.id} />
```

### Props Interface Design

```
✅ Good Props:
├── Minimal required props (only what's truly necessary)
├── Sensible defaults for optional props
├── Standard HTML attributes extended (className/class, style, id)
├── Event handlers follow onX naming (React) or typed defineEmits (Vue)
├── Boolean props default to false
└── Discriminated unions for variants

❌ Bad Props:
├── 20+ props (split into multiple components)
├── Boolean props that enable unrelated features
├── Prop drilling through 3+ levels (use context/provide-inject/stores)
├── Ambiguous naming (data, info, options)
└── Accepting entire objects when only 1-2 fields needed
```

---

## React vs Vue 3 Component Patterns Comparison

| Pattern | React / Next.js | Vue 3 / Nuxt 3 |
|---|---|---|
| **Component Syntax** | JSX / TSX Functional Components | Single File Component (`.vue` with `<script setup lang="ts">`) |
| **Props Definition** | `interface Props { ... }` in function param | `const props = withDefaults(defineProps<Props>(), { ... })` |
| **Events / Callbacks** | Prop callbacks: `onClick?: () => void` | `const emit = defineEmits<{ (e: 'click'): void }>()` |
| **Two-Way Binding** | Controlled `value` + `onChange` | `const model = defineModel<string>()` |
| **Reusable Logic** | Custom Hooks (`useForm`, `useAuth`) | Composables (`useForm`, `useAuth` returning refs) |
| **Global State** | Zustand / Context API | Pinia (`useAuthStore`) + `storeToRefs()` |
| **Slots / Content Projection** | `children` prop / render props | `<slot name="header" :item="item" />` + `defineSlots()` |
| **Context / Dependency** | `createContext` + `useContext` | `provide(key, value)` + `inject(key)` |

---

## Vue 3 Single File Component (SFC) Patterns

### 1. Composition API with `<script setup lang="ts">`
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
  initialCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
});

const emit = defineEmits<{
  (e: 'update:count', value: number): void;
  (e: 'submit', value: number): void;
}>();

// Reactive State
const count = ref(props.initialCount);

// Computed Property
const doubled = computed(() => count.value * 2);

function increment() {
  count.value++;
  emit('update:count', count.value);
}
</script>

<template>
  <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
    <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ title }}</h3>
    <p class="text-sm text-slate-600 dark:text-slate-400">Count: {{ count }} (Double: {{ doubled }})</p>
    <button
      class="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
      @click="increment"
    >
      Tambah
    </button>
  </div>
</template>
```

### 2. Vue 3 Custom Composable with Result Pattern
```typescript
// src/composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initial = 0) {
  const count = ref(initial);
  const error = ref<string | null>(null);

  const isEven = computed(() => count.value % 2 === 0);

  function increment() {
    count.value++;
    error.value = null;
  }

  function decrement() {
    // Guard Clause
    if (count.value <= 0) {
      error.value = 'Nilai tidak boleh kurang dari 0';
      return;
    }
    count.value--;
    error.value = null;
  }

  return {
    count,
    isEven,
    error,
    increment,
    decrement,
  };
}
```

---

## Styling Strategy Comparison

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Tailwind CSS** | Fast development, consistent, small bundle | Verbose HTML, learning curve | Rapid prototyping, utility-first (Standard) |
| **CSS Modules / Scoped CSS** | Scoped by default, zero runtime, standard CSS | No dynamic styles without vars | Custom styles, SFC scoped `<style scoped>` |
| **CSS Custom Properties** | Dynamic, no build tool, great for themes | No conditional logic | Design systems, themes |
| **Styled Components / Emotion** | Dynamic, co-located, full JS power | Runtime cost, learning curve | React apps, dynamic styling |

---

## Common UI Patterns

### Modal / Dialog
```
Requirements:
├── Focus trap (Tab cycles within modal)
├── Close on Escape key
├── Close on backdrop click (optional)
├── Scroll lock on body when open
├── Focus restoration on close (return to trigger element)
├── ARIA: role="dialog", aria-modal="true", aria-labelledby
└── Animation: fadeIn backdrop + slideUp/scaleIn content
```

### Toast / Notification
```
Requirements:
├── Auto-dismiss after timeout (3-5 seconds)
├── Manual dismiss with close button
├── Stack multiple toasts (newest on top or bottom)
├── Variants: success, error, warning, info
├── ARIA: role="alert" or role="status", aria-live="polite"
├── Pause auto-dismiss on hover
└── Animation: slideIn from edge + fadeOut
```

# Testing Guide — Methodology & Best Practices

Reference document for the QA Skill's testing strategy and test case generation capabilities across **Express Backend**, **Next.js (React)**, and **Vue 3 / Nuxt 3**.

---

## Test Pyramid

```
         ┌───────┐
         │  E2E  │  ← Few, slow, expensive, high confidence (Playwright)
         │ Tests │
        ┌┴───────┴┐
        │Integration│  ← Moderate count, medium speed (API, Route, Store)
        │  Tests    │
       ┌┴──────────┴┐
       │  Unit Tests  │  ← Many, fast, cheap, focused (Vitest, Vue Test Utils, RTL)
       └──────────────┘
```

### Recommended Distribution

| Test Type | Percentage | Speed | Scope | When to Use |
|-----------|-----------|-------|-------|-------------|
| **Unit** | 60-70% | < 100ms each | Single function/component | Pure logic, validators, composables, hooks, atom components |
| **Integration** | 20-30% | < 5s each | Multiple components | Pinia stores + API mocks, DB queries, Express controllers |
| **E2E** | 5-10% | < 30s each | Full user flow | Critical user journeys, auth flows, checkout, form submission |

---

## Vue 3 & Nuxt 3 Testing Standards (Vitest + Vue Test Utils)

### 1. Component Unit Test (`@vue/test-utils`)
```typescript
// tests/unit/AppButton.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppButton from '@/components/ui/AppButton.vue';

describe('AppButton.vue', () => {
  it('renders button label correctly through default slot', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Simpan Perubahan' },
    });
    expect(wrapper.text()).toContain('Simpan Perubahan');
  });

  it('emits click event when clicked and not loading/disabled', async () => {
    const wrapper = mount(AppButton);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does NOT emit click when disabled or isLoading is true', async () => {
    const wrapper = mount(AppButton, {
      props: { isLoading: true },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
```

### 2. Pinia Store Unit Test (`@pinia/testing`)
```typescript
// tests/unit/stores/auth.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store (Pinia)', () => {
  beforeEach(() => {
    // Inisialisasi Pinia bersih sebelum setiap test
    setActivePinia(createPinia());
  });

  it('initial state is unauthenticated', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it('sets user and token on setAuth', () => {
    const store = useAuthStore();
    store.setAuth({ id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' }, 'jwt-token-xyz');

    expect(store.isAuthenticated).toBe(true);
    expect(store.isAdmin).toBe(true);
    expect(store.user?.name).toBe('Admin');
  });

  it('clears state on clearAuth', () => {
    const store = useAuthStore();
    store.setAuth({ id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' }, 'jwt-token-xyz');
    store.clearAuth();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
  });
});
```

---

## Test Categories

### Happy Path Tests
Test the normal, expected flow with valid inputs:
- Standard use case with typical data
- All required fields provided correctly
- Normal business flow completion

### Edge Case Tests
Test boundary conditions and special scenarios:
- Empty inputs (empty string, empty array, null)
- Minimum and maximum valid values
- Single element collections
- Unicode/special characters in text fields
- Very large inputs (stress boundaries)
- Concurrent operations

### Error Case Tests
Test failure scenarios and error handling:
- Invalid inputs (wrong type, out of range, malformed)
- Missing required fields
- Network/service failures
- Timeout scenarios
- Permission denied
- Resource not found
- Database constraint violations

### Security Tests
Test security-related scenarios:
- SQL injection attempts
- XSS payloads in inputs
- Unauthorized access attempts
- CSRF token validation
- Rate limiting enforcement
- Input sanitization verification

---

## Test Case Design Techniques

### 1. Equivalence Partitioning

Divide input domain into classes where behavior is expected to be similar:

```
Example: Age validation (valid: 0-150)

Partitions:
├── Invalid: age < 0          → Test: -1, -100
├── Valid:   0 ≤ age ≤ 150    → Test: 0, 75, 150
└── Invalid: age > 150        → Test: 151, 999

One test per partition is sufficient for basic coverage.
```

### 2. Boundary Value Analysis

Test at exact boundaries where behavior changes:

```
Example: Discount for orders ≥ $100

Boundaries:
├── $99.99  → No discount  (just below)
├── $100.00 → Discount     (exact boundary)
└── $100.01 → Discount     (just above)

Test: boundary ± 1, boundary exact
```

---

## Test Structure

### Arrange-Act-Assert (AAA)

```typescript
// Arrange — set up the test data and preconditions
const user = createTestUser({ role: 'admin' });
const service = new UserService(mockRepo);

// Act — perform the action being tested
const result = await service.updateProfile(user.id, { name: 'New Name' });

// Assert — verify the expected outcome
expect(result.name).toBe('New Name');
expect(mockRepo.save).toHaveBeenCalledWith(user.id, { name: 'New Name' });
```

---

## Coverage Goals

| Coverage Type | Target | Description |
|---------------|--------|-------------|
| **Line Coverage** | ≥ 80% | Percentage of lines executed by tests |
| **Branch Coverage** | ≥ 75% | Percentage of conditional branches (if/else/switch) tested |
| **Function Coverage** | ≥ 90% | Percentage of functions/methods called by tests |
| **Critical Path Coverage** | 100% | All critical business flows must be fully tested |

### What NOT to Test
- Framework/library code
- Simple getters/setters with no logic
- Configuration files
- Third-party API responses (mock them instead)

### What to ALWAYS Test
- Business logic and domain rules
- Data transformations and calculations
- Validation rules & Guard clauses
- Error handling paths & Result pattern outputs
- Security-critical code & Auth Guards

# JavaScript QA at Scale — Testing, Quality Gates & Monitoring

Panduan komprehensif untuk Quality Assurance pada proyek JavaScript berskala besar. Mencakup strategi testing, quality gates, CI/CD pipeline, dan monitoring.

---

## 1. Strategi Testing untuk Proyek Besar

### 1.1 Test Pyramid untuk JavaScript

```
             ╱  E2E Tests  ╲              ← 5-10% (Playwright)
            ╱  Slow, Brittle ╲            Waktu: menit
           ╱──────────────────╲
          ╱ Integration Tests  ╲          ← 20-30% (Supertest, MSW)
         ╱  Medium Speed        ╲         Waktu: detik
        ╱────────────────────────╲
       ╱    Unit Tests            ╲       ← 60-70% (Vitest, Jest)
      ╱    Fast, Reliable          ╲      Waktu: milidetik
     ╱──────────────────────────────╲
    ╱      Static Analysis           ╲    ← TypeScript, ESLint
   ╱      Instant, Free              ╲   Waktu: 0 (compile time)
  ╱────────────────────────────────────╲
```

### 1.2 Framework Testing Rekomendasi

| Layer | Tool | Kelebihan |
|-------|------|-----------|
| **Unit Test** | Vitest | Vite-native, ESM-first, 10x lebih cepat dari Jest |
| **Unit Test** | Jest | Ekosistem terbesar, mature, snapshot testing |
| **Component Test** | React Testing Library | User-centric, accesibility-aware |
| **Component Test** | Vue Test Utils | Official Vue testing library |
| **API Integration** | Supertest | Express/Fastify HTTP testing |
| **API Mocking** | MSW (Mock Service Worker) | Network-level mocking, works everywhere |
| **E2E** | Playwright | Multi-browser, auto-wait, trace viewer |
| **Visual Regression** | Chromatic / Percy | Screenshot comparison, Storybook integration |
| **Contract Testing** | Pact | Consumer-driven contract testing |
| **Load Testing** | k6 / Artillery | Performance under load |

### 1.3 Testing Pattern per Layer

#### Unit Testing — Business Logic

```typescript
// services/__tests__/orderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../orderService';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepo: MockedObject<IOrderRepository>;
  let mockPaymentService: MockedObject<IPaymentService>;
  let mockEventBus: MockedObject<IEventBus>;

  beforeEach(() => {
    mockOrderRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    mockPaymentService = {
      charge: vi.fn(),
      refund: vi.fn(),
    };
    mockEventBus = {
      emit: vi.fn(),
    };
    service = new OrderService(mockOrderRepo, mockPaymentService, mockEventBus);
  });

  describe('createOrder', () => {
    it('should create order, charge payment, and emit event', async () => {
      const dto = { userId: 'u1', items: [{ productId: 'p1', quantity: 2 }], total: 100 };
      const mockOrder = { id: 'o1', ...dto, status: 'pending' };
      
      mockOrderRepo.create.mockResolvedValue(mockOrder);
      mockPaymentService.charge.mockResolvedValue({ transactionId: 'tx1' });
      mockOrderRepo.updateStatus.mockResolvedValue({ ...mockOrder, status: 'confirmed' });

      const result = await service.createOrder(dto);

      expect(mockOrderRepo.create).toHaveBeenCalledWith(dto);
      expect(mockPaymentService.charge).toHaveBeenCalledWith({
        orderId: 'o1', amount: 100, userId: 'u1',
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith('order.created', expect.objectContaining({ id: 'o1' }));
      expect(result.status).toBe('confirmed');
    });

    it('should rollback order if payment fails', async () => {
      mockOrderRepo.create.mockResolvedValue({ id: 'o1', status: 'pending' });
      mockPaymentService.charge.mockRejectedValue(new PaymentFailedError('Insufficient funds'));

      await expect(service.createOrder(dto)).rejects.toThrow(PaymentFailedError);
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('o1', 'cancelled');
    });

    it('should reject order with empty items', async () => {
      const emptyDto = { userId: 'u1', items: [], total: 0 };
      await expect(service.createOrder(emptyDto)).rejects.toThrow(ValidationError);
      expect(mockOrderRepo.create).not.toHaveBeenCalled();
    });
  });
});
```

#### Integration Testing — API Endpoints

```typescript
// __tests__/api/users.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { setupTestDatabase, teardownTestDatabase, seedTestData } from '../helpers/db';

describe('GET /api/users', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp({ database: testDb });
    await seedTestData();
    authToken = await getTestAuthToken(app);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should return paginated users list', async () => {
    const res = await request(app)
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(10);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('should filter users by role', async () => {
    const res = await request(app)
      .get('/api/users?role=admin')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    res.body.data.forEach((user: any) => {
      expect(user.role).toBe('admin');
    });
  });

  it('should return 401 without auth token', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });

  it('should return 403 for non-admin users', async () => {
    const viewerToken = await getTestAuthToken(app, 'viewer');
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
  });
});
```

#### E2E Testing — User Flows

```typescript
// e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete full order flow', async ({ page }) => {
    // Navigate to products
    await page.click('nav >> text=Products');
    await expect(page.locator('h1')).toContainText('Products');

    // Add product to cart
    await page.click('[data-testid="product-card-1"] >> button:text("Add to Cart")');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('h1')).toContainText('Cart');

    // Update quantity
    await page.fill('[data-testid="quantity-input-1"]', '3');
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$150.00');

    // Checkout
    await page.click('button:text("Checkout")');
    await page.fill('[name="address"]', '123 Test Street');
    await page.fill('[name="city"]', 'Test City');
    await page.click('button:text("Place Order")');

    // Verify success
    await expect(page.locator('.order-confirmation')).toBeVisible();
    await expect(page.locator('.order-id')).toContainText(/ORD-\d+/);
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/checkout');
    await page.click('button:text("Place Order")');
    
    await expect(page.locator('[data-testid="error-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-city"]')).toBeVisible();
  });
});
```

### 1.4 Mock Service Worker (MSW) untuk API Mocking

```typescript
// mocks/handlers.ts — shared antara test dan development
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      data: generateMockUsers(limit),
      pagination: { page, limit, total: 100, totalPages: 10 },
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { data: { id: 'u-new', ...body } },
      { status: 201 }
    );
  }),

  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ message: 'User deleted' });
  }),
];

// Setup untuk testing
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);

// vitest.setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 2. Quality Gates & CI/CD

### 2.1 CI/CD Pipeline Configuration

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint              # ESLint
      - run: pnpm typecheck         # tsc --noEmit
      - run: pnpm format:check      # Prettier check

  unit-test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

  integration-test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-test:
    runs-on: ubuntu-latest
    needs: [unit-test, integration-test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - run: npx audit-ci --moderate   # Dependency audit
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3

  bundle-analysis:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Check bundle size
        run: |
          SIZE=$(du -sb .next/static | awk '{print $1}')
          MAX_SIZE=5242880  # 5MB limit
          if [ "$SIZE" -gt "$MAX_SIZE" ]; then
            echo "Bundle size ($SIZE bytes) exceeds limit ($MAX_SIZE bytes)"
            exit 1
          fi
```

### 2.2 Quality Gates

```
┌────────────────────────────────────────────────────────────┐
│                    Quality Gates                            │
├────────────────┬────────────┬──────────────────────────────┤
│ Gate           │ Threshold  │ Tool                         │
├────────────────┼────────────┼──────────────────────────────┤
│ Type Safety    │ 0 errors   │ TypeScript strict            │
│ Lint           │ 0 errors   │ ESLint                       │
│ Unit Coverage  │ ≥ 80%      │ Vitest/Jest + c8/istanbul    │
│ Integration    │ All pass   │ Supertest                    │
│ E2E            │ All pass   │ Playwright                   │
│ Security       │ 0 high/crit│ npm audit / Snyk             │
│ Bundle Size    │ < 200KB JS │ webpack-bundle-analyzer      │
│ Lighthouse     │ ≥ 90       │ Lighthouse CI                │
│ a11y           │ 0 critical │ axe-core                     │
│ Dead Code      │ 0%         │ knip                         │
└────────────────┴────────────┴──────────────────────────────┘
```

### 2.3 Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ],
    "*.ts": [
      "vitest related --run"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged

# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit ${1}
```

---

## 3. Monitoring & Error Tracking

### 3.1 Error Tracking (Sentry)

```typescript
// Frontend error boundary
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});

// Error boundary component
const SentryErrorBoundary = Sentry.ErrorBoundary;

function App() {
  return (
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <RouterProvider router={router} />
    </SentryErrorBoundary>
  );
}
```

```typescript
// Backend error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Express error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err, {
    extra: {
      requestId: req.id,
      userId: req.user?.id,
      method: req.method,
      url: req.url,
      body: req.body,
    },
  });

  const statusCode = err instanceof HttpException ? err.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: config.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      requestId: req.id,
    },
  });
});
```

### 3.2 Performance Monitoring

```typescript
// Custom performance marks
performance.mark('data-fetch-start');
const data = await fetchUsers();
performance.mark('data-fetch-end');
performance.measure('Data Fetch', 'data-fetch-start', 'data-fetch-end');

// Web Vitals monitoring
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    navigationType: metric.navigationType,
    url: window.location.href,
  };
  
  // Send to analytics endpoint
  navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(body));
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## 4. Code Quality Tools Configuration

### 4.1 ESLint untuk Proyek Besar

```javascript
// eslint.config.js (Flat Config)
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: { import: importPlugin },
    rules: {
      // Import boundaries
      'import/no-cycle': 'error',
      'import/no-restricted-paths': ['error', {
        zones: [
          { target: './src/shared', from: './src/features', message: 'shared/ cannot import from features/' },
          { target: './src/shared', from: './src/app', message: 'shared/ cannot import from app/' },
        ],
      }],
      
      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // TypeScript strictness
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      
      // Complexity limits
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 3],
      'complexity': ['warn', 10],
    },
  }
);
```

### 4.2 Dead Code Detection

```bash
# knip — find unused exports, files, and dependencies
npx knip

# Output:
# Unused files (1):
#   src/utils/deprecated-helper.ts
# Unused exports (3):
#   src/services/userService.ts: formatUserName
#   src/components/Button.tsx: ButtonVariant
#   src/hooks/useOldHook.ts: useOldHook (default)
# Unused dependencies (2):
#   moment (package.json)
#   lodash (package.json)
```

---

## 5. Checklist: QA untuk JavaScript at Scale

### Testing Checklist
- [ ] Unit test coverage ≥ 80% (branches, statements, functions)
- [ ] Integration tests untuk semua API endpoints
- [ ] E2E tests untuk critical user flows
- [ ] Visual regression tests untuk UI components
- [ ] Contract tests untuk inter-service communication
- [ ] Load tests untuk endpoints kritis
- [ ] MSW untuk consistent API mocking

### Quality Gates Checklist
- [ ] TypeScript `strict: true` tanpa error
- [ ] ESLint: 0 errors, 0 warnings (di CI)
- [ ] Prettier formatting check di CI
- [ ] No `console.log` di production code
- [ ] No `any` type di TypeScript
- [ ] Import boundaries enforced
- [ ] Dead code detection (knip) berjalan di CI

### CI/CD Checklist
- [ ] Pipeline: lint → typecheck → unit → integration → e2e → deploy
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Commit message convention (Conventional Commits)
- [ ] Dependency audit (npm audit / Snyk)
- [ ] Bundle size check di CI
- [ ] Lighthouse CI dengan minimum score
- [ ] Automated changelog generation

### Monitoring Checklist
- [ ] Error tracking (Sentry) configured
- [ ] Core Web Vitals monitoring aktif
- [ ] Health check endpoints (liveness + readiness)
- [ ] Structured logging (Pino/Winston)
- [ ] Uptime monitoring (Ping)
- [ ] Performance budgets defined dan di-enforce
- [ ] Alerting untuk error rate spike

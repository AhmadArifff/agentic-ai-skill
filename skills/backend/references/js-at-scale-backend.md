# JavaScript Backend at Scale — Architecture, Maintenance, Scalability & Performance

Panduan komprehensif untuk pengembangan backend JavaScript/Node.js pada proyek berskala besar. Dokumen ini mencakup arsitektur, kemudahan pemeliharaan, skalabilitas, dan optimasi performa.

---

## 1. Pemilihan Teknologi & Arsitektur Dasar

### 1.1 Gunakan TypeScript

TypeScript adalah **keharusan** untuk proyek besar. Manfaat utama:

- **Static typing** mendeteksi error sejak compile time
- **Kontrak data yang jelas** antar modul dan layanan
- **Refactoring yang aman** — IDE bisa menemukan semua referensi
- **Dokumentasi yang hidup** — tipe adalah dokumentasi

```typescript
// ❌ Tanpa TypeScript — error hanya ditemukan saat runtime
function createUser(data) {
  return db.users.create(data); // apa isi 'data'?
}

// ✅ Dengan TypeScript — error terdeteksi saat compile
interface CreateUserDTO {
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
}

async function createUser(data: CreateUserDTO): Promise<User> {
  const validated = CreateUserSchema.parse(data);
  return db.users.create(validated);
}
```

**Konfigurasi TypeScript untuk proyek besar:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@config/*": ["src/config/*"]
    }
  }
}
```

### 1.2 Framework Backend Modern

| Framework | Karakteristik | Cocok Untuk |
|-----------|--------------|-------------|
| **Express.js** | Minimalis, mature, ekosistem terbesar | API sederhana-menengah |
| **Fastify** | 2-3x lebih cepat dari Express, schema-first | API performa tinggi |
| **NestJS** | Opinionated, Angular-style, DI built-in | Enterprise, proyek besar |
| **Hono** | Ultra-ringan, edge-first, multi-runtime | Edge computing, Cloudflare |
| **tRPC** | End-to-end type safety, no REST/GraphQL | Full-stack TypeScript |
| **AdonisJS** | Full-stack, batteries-included (like Laravel) | Rapid development |

**Rekomendasi untuk proyek besar:** NestJS atau Fastify + custom architecture.

### 1.3 Runtime Alternatif

| Runtime | Kelebihan | Pertimbangan |
|---------|-----------|--------------|
| **Node.js** | Ekosistem terbesar, paling stabil | Performance overhead |
| **Bun** | 3-5x lebih cepat, built-in bundler & test runner | Ekosistem lebih kecil |
| **Deno** | Security by default, TypeScript native | Kompatibilitas npm via shim |

---

## 2. Kemudahan Pemeliharaan (Maintenance)

### 2.1 Modular Monolith Architecture

Untuk proyek besar, gunakan **Modular Monolith** sebelum melompat ke microservices:

```
src/
├── modules/                    # Domain modules (bounded contexts)
│   ├── user/
│   │   ├── controllers/       # HTTP handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── entities/          # Domain models
│   │   ├── dtos/              # Data Transfer Objects
│   │   ├── events/            # Domain events
│   │   ├── validators/        # Input validation schemas
│   │   ├── __tests__/         # Module tests
│   │   └── user.module.ts     # Module definition
│   ├── order/
│   │   └── ...
│   └── payment/
│       └── ...
├── shared/                     # Shared utilities
│   ├── database/              # DB connection, base repository
│   ├── middleware/             # Auth, logging, rate limiting
│   ├── exceptions/            # Custom error classes
│   ├── guards/                # Authorization guards
│   └── utils/                 # Helper functions
├── config/                     # Environment config
├── infrastructure/             # External service adapters
│   ├── email/
│   ├── storage/
│   ├── cache/
│   └── queue/
├── app.ts                      # Application setup
└── server.ts                   # Server bootstrap
```

### 2.2 Layered Architecture

Setiap module mengikuti **4 layer** yang ketat:

```
┌─────────────────────────────────┐
│   Controller Layer (HTTP/API)   │  ← Menerima request, validasi input
├─────────────────────────────────┤
│   Service Layer (Business)      │  ← Logika bisnis, orchestration
├─────────────────────────────────┤
│   Repository Layer (Data)       │  ← Akses database, query
├─────────────────────────────────┤
│   Entity/Model Layer (Domain)   │  ← Domain models, business rules
└─────────────────────────────────┘
```

**Dependency rule:** Layer atas boleh bergantung ke bawah, TIDAK sebaliknya.

```typescript
// Controller → hanya memanggil Service
@Controller('/users')
class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  async create(@Body() dto: CreateUserDTO) {
    return this.userService.createUser(dto);
  }
}

// Service → mengandung business logic, memanggil Repository
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private eventBus: EventBus,
  ) {}

  async createUser(dto: CreateUserDTO): Promise<User> {
    const exists = await this.userRepo.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already registered');
    
    const user = await this.userRepo.create(dto);
    await this.emailService.sendWelcome(user);
    await this.eventBus.emit('user.created', user);
    return user;
  }
}

// Repository → hanya urusan data
class UserRepository {
  constructor(private db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE email = $1', [email]);
  }

  async create(data: CreateUserDTO): Promise<User> {
    return this.db.query(
      'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
      [data.email, data.name, data.role]
    );
  }
}
```

### 2.3 Dependency Injection (DI)

DI membuat kode testable dan modular:

```typescript
// Interface-based DI
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

interface IEmailService {
  sendWelcome(user: User): Promise<void>;
}

// Service bergantung pada interface, bukan implementasi
class UserService {
  constructor(
    private userRepo: IUserRepository,   // bisa di-mock saat testing
    private emailService: IEmailService,  // bisa diganti provider
  ) {}
}

// DI Container (manual atau framework)
const container = {
  userRepo: new PostgresUserRepository(db),
  emailService: new SendGridEmailService(apiKey),
};

// Saat testing
const mockRepo: IUserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
};
const service = new UserService(mockRepo, mockEmailService);
```

### 2.4 Automated Testing Strategy

| Tipe Test | Cakupan | Tool | Proporsi |
|-----------|---------|------|----------|
| **Unit Test** | Fungsi/method individu | Jest, Vitest | 60-70% |
| **Integration Test** | Interaksi antar layer | Supertest + Jest | 20-30% |
| **E2E Test** | Flow pengguna lengkap | Playwright, Cypress | 5-10% |
| **Contract Test** | API contract antar service | Pact | Sesuai kebutuhan |

```typescript
// Unit test — service layer
describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    service = new UserService(mockRepo, mockEmailService);
  });

  it('should throw ConflictException if email exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(existingUser);
    await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
  });
});

// Integration test — API endpoint
describe('POST /api/users', () => {
  it('should create a user and return 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);
    
    expect(res.body.data.email).toBe('test@example.com');
  });
});
```

### 2.5 Configuration Management

```typescript
// config/index.ts — centralized, validated config
import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('15m'),
  CORS_ORIGINS: z.string().transform(s => s.split(',')),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const config = ConfigSchema.parse(process.env);
export type AppConfig = z.infer<typeof ConfigSchema>;
```

---

## 3. Skalabilitas (Scalability)

### 3.1 Microservices Architecture (Node.js)

Kapan beralih dari monolith ke microservices:

| Sinyal | Aksi |
|--------|------|
| Tim > 15 developer | Pertimbangkan microservices |
| Deploy frequency > 10x/hari | Service per domain |
| Bagian tertentu butuh scaling independen | Pisahkan service tersebut |
| Teknologi berbeda per domain | Service terpisah |

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  API Gateway │────→│  Auth Service│     │  Payment    │
│  (Kong/      │     │  (JWT/OAuth) │     │  Service    │
│   Express)   │────→│              │     │  (Stripe)   │
└──────┬───────┘     └──────────────┘     └──────┬──────┘
       │                                          │
       │         ┌─────────────────┐              │
       ├────────→│  Order Service  │←─────────────┘
       │         │  (Core Domain)  │
       │         └────────┬────────┘
       │                  │
       │         ┌────────▼────────┐
       └────────→│  Notification   │
                 │  Service        │
                 │  (Email/SMS)    │
                 └─────────────────┘
```

**Komunikasi antar service:**

| Pattern | Kapan Digunakan | Tool |
|---------|-----------------|------|
| **REST/HTTP** | Synchronous, request-reply | Axios, fetch |
| **gRPC** | Inter-service, high-throughput | @grpc/grpc-js |
| **Message Queue** | Asynchronous, event-driven | RabbitMQ, BullMQ |
| **Event Streaming** | Real-time, event sourcing | Kafka, Redis Streams |

### 3.2 Database Scaling

```typescript
// Connection pooling dengan pg-pool
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Release idle connections
  connectionTimeoutMillis: 5000,
});

// Read replicas untuk scaling read
const readPool = new Pool({ connectionString: config.DATABASE_READ_URL });
const writePool = new Pool({ connectionString: config.DATABASE_WRITE_URL });

class UserRepository {
  async findById(id: string) {
    return readPool.query('SELECT * FROM users WHERE id = $1', [id]);
  }

  async create(data: CreateUserDTO) {
    return writePool.query('INSERT INTO users ...', [...]);
  }
}
```

### 3.3 Caching Layers

```typescript
// Multi-layer caching strategy
class CacheService {
  constructor(
    private redis: Redis,
    private localCache: Map<string, { data: any; expiry: number }>,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // L1: In-memory (fastest, limited size)
    const local = this.localCache.get(key);
    if (local && local.expiry > Date.now()) return local.data as T;

    // L2: Redis (shared across instances)
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached) as T;
      this.localCache.set(key, { data, expiry: Date.now() + 60_000 });
      return data;
    }

    return null;
  }

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    this.localCache.set(key, { data, expiry: Date.now() + 60_000 });
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) await this.redis.del(...keys);
    // Clear local cache entries matching pattern
    for (const [key] of this.localCache) {
      if (key.startsWith(pattern.replace('*', ''))) {
        this.localCache.delete(key);
      }
    }
  }
}
```

### 3.4 Queue & Background Jobs

```typescript
// BullMQ untuk job queue
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email', { connection: redis });
const reportQueue = new Queue('reports', { connection: redis });

// Producer — enqueue jobs
class OrderService {
  async createOrder(data: CreateOrderDTO) {
    const order = await this.orderRepo.create(data);
    
    // Asynchronous — tidak blocking response
    await emailQueue.add('order-confirmation', {
      orderId: order.id,
      userId: order.userId,
    });
    
    await reportQueue.add('generate-invoice', {
      orderId: order.id,
    }, {
      delay: 5000,          // Delay 5 detik
      attempts: 3,          // Retry 3 kali jika gagal
      backoff: { type: 'exponential', delay: 2000 },
    });
    
    return order;
  }
}

// Consumer — process jobs
const emailWorker = new Worker('email', async (job) => {
  switch (job.name) {
    case 'order-confirmation':
      await emailService.sendOrderConfirmation(job.data);
      break;
  }
}, {
  connection: redis,
  concurrency: 5,          // Process 5 jobs concurrently
  limiter: { max: 100, duration: 60_000 }, // Rate limit: 100/minute
});
```

### 3.5 Horizontal Scaling dengan PM2/Docker

```yaml
# docker-compose.yml — multi-instance
services:
  api:
    build: .
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 512M
    environment:
      - NODE_ENV=production
      - CLUSTER_MODE=true
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
```

```javascript
// cluster.js — Node.js cluster mode
import cluster from 'node:cluster';
import { cpus } from 'node:os';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} spawning ${numCPUs} workers`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, respawning...`);
    cluster.fork();
  });
} else {
  import('./server.js');
}
```

---

## 4. Optimasi Performa (Performance Optimization)

### 4.1 Database Query Optimization

```typescript
// ❌ N+1 Query Problem
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id]);
  // 1 + N queries!
}

// ✅ JOIN atau subquery
const usersWithOrders = await db.query(`
  SELECT u.*, json_agg(o.*) as orders
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
`);

// ✅ DataLoader pattern (untuk GraphQL)
import DataLoader from 'dataloader';

const orderLoader = new DataLoader(async (userIds: string[]) => {
  const orders = await db.query(
    'SELECT * FROM orders WHERE user_id = ANY($1)',
    [userIds]
  );
  return userIds.map(id => orders.filter(o => o.user_id === id));
});
```

### 4.2 Response Compression & Streaming

```typescript
import compression from 'compression';
import { pipeline } from 'node:stream/promises';

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,    // Compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Streaming large responses
app.get('/api/export/users', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  
  const cursor = db.query('SELECT * FROM users').cursor(100);
  let first = true;
  
  for await (const batch of cursor) {
    for (const row of batch) {
      if (!first) res.write(',');
      res.write(JSON.stringify(row));
      first = false;
    }
  }
  
  res.write(']');
  res.end();
});
```

### 4.3 Rate Limiting & Throttling

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limiter
const globalLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  windowMs: 15 * 60 * 1000,   // 15 menit
  max: 1000,                    // 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter untuk auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                      // 10 login attempts per 15 menit
  skipSuccessfulRequests: true,
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
```

### 4.4 Memory Management

```typescript
// Monitor memory usage
function monitorMemory() {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  });
}

// Graceful shutdown — prevent memory leaks
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown...');
  
  // Stop accepting new requests
  server.close();
  
  // Close database connections
  await pool.end();
  
  // Close Redis connections
  await redis.quit();
  
  // Close queue workers
  await emailWorker.close();
  
  console.log('Graceful shutdown complete');
  process.exit(0);
});
```

### 4.5 API Response Optimization

```typescript
// Pagination — cursor-based (better for large datasets)
app.get('/api/users', async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const users = await db.query(`
    SELECT * FROM users
    WHERE ($1::text IS NULL OR id > $1)
    ORDER BY id
    LIMIT $2
  `, [cursor, parseInt(limit) + 1]);

  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, -1) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json({
    data,
    pagination: { nextCursor, hasMore },
  });
});

// Conditional responses (ETag/Last-Modified)
import etag from 'etag';

app.get('/api/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  const tag = etag(JSON.stringify(user));
  
  if (req.headers['if-none-match'] === tag) {
    return res.status(304).end();
  }
  
  res.setHeader('ETag', tag);
  res.setHeader('Cache-Control', 'private, max-age=60');
  res.json({ data: user });
});
```

---

## 5. Observability & Monitoring

### 5.1 Structured Logging

```typescript
import pino from 'pino';

const logger = pino({
  level: config.LOG_LEVEL,
  transport: config.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Request logging middleware
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.id = requestId;
  req.log = logger.child({ requestId, method: req.method, url: req.url });
  
  const start = Date.now();
  res.on('finish', () => {
    req.log.info({
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
    }, 'request completed');
  });
  
  next();
});
```

### 5.2 Health Checks

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    queue: await checkQueue(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ready' : 'not_ready',
    checks,
  });
});

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await pool.query('SELECT 1');
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}
```

---

## 6. Checklist: Backend JavaScript at Scale

### Architecture Checklist
- [ ] TypeScript enabled dengan `strict: true`
- [ ] Modular monolith atau microservices yang jelas
- [ ] Layered architecture (Controller → Service → Repository)
- [ ] Dependency Injection untuk testability
- [ ] Configuration management yang ter-validasi (Zod/Joi)
- [ ] ES Modules (`"type": "module"` dalam package.json)

### Maintenance Checklist
- [ ] Automated testing (unit 60% + integration 30% + E2E 10%)
- [ ] CI/CD pipeline dengan build → test → deploy
- [ ] Linting (ESLint) + Formatting (Prettier) otomatis
- [ ] Git hooks (Husky + lint-staged)
- [ ] API documentation (OpenAPI/Swagger) terbaru
- [ ] Architecture Decision Records (ADRs) terdokumentasi

### Scalability Checklist
- [ ] Database connection pooling dikonfigurasi
- [ ] Redis/caching layer tersedia
- [ ] Background job processing (BullMQ/Agenda)
- [ ] Horizontal scaling ready (stateless, no in-memory sessions)
- [ ] Message queue untuk komunikasi async antar service
- [ ] Read replicas untuk database read-heavy

### Performance Checklist
- [ ] N+1 query sudah dieliminasi
- [ ] Response compression aktif
- [ ] Rate limiting per endpoint
- [ ] Cursor-based pagination untuk large datasets
- [ ] Streaming untuk export data besar
- [ ] Graceful shutdown implemented
- [ ] Memory monitoring aktif
- [ ] ETag/conditional responses untuk cache

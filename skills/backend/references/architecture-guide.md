# Architecture Patterns Guide

Reference document for the Backend Skill's architecture capability.

---

## Architecture Selection Guide

| Complexity | Recommended Architecture | When to Use |
|-----------|------------------------|-------------|
| **Simple** | Monolith + Layered | Small team, MVP, startup, < 5 devs |
| **Medium** | Monolith + Clean Architecture | Growing codebase, multiple domains, 5-15 devs |
| **Complex** | Modular Monolith | Multiple bounded contexts, preparing for microservices |
| **Very Complex** | Microservices | Large team, independent deployment needs, 15+ devs |

**Rule of thumb:** Start with a monolith. Extract microservices when you have clear boundaries and operational maturity.

---

## Layered Architecture

```
┌─────────────────────────────────┐
│       Presentation Layer         │  ← Controllers, middleware, request/response
│  (HTTP handlers, WebSocket,     │     No business logic here!
│   CLI commands, GraphQL)        │
├─────────────────────────────────┤
│       Application Layer          │  ← Use cases, orchestration, DTOs
│  (Services, Use Cases,          │     Coordinates domain objects
│   Application Events)           │     Transaction boundaries here
├─────────────────────────────────┤
│         Domain Layer             │  ← Business rules, entities, value objects
│  (Entities, Value Objects,      │     Pure business logic, no framework deps
│   Domain Events, Interfaces)    │     The heart of the application
├─────────────────────────────────┤
│      Infrastructure Layer        │  ← Implementations, external services
│  (Database, Cache, Queue,       │     Framework-specific code
│   File Storage, Email, APIs)    │     Implements domain interfaces
└─────────────────────────────────┘
```

### Dependency Rule

```
Presentation → Application → Domain ← Infrastructure

✅ Upper layers depend on lower layers
✅ Domain layer has ZERO dependencies on other layers
✅ Infrastructure implements interfaces defined in Domain
❌ Domain NEVER imports from Infrastructure
❌ Presentation NEVER directly accesses Infrastructure
```

---

## Clean Architecture

### Layer Responsibilities

| Layer | Contains | Depends On |
|-------|----------|-----------|
| **Entities** | Business objects, value objects, domain rules | Nothing |
| **Use Cases** | Application business rules, orchestration | Entities |
| **Interface Adapters** | Controllers, presenters, gateways | Use Cases, Entities |
| **Frameworks & Drivers** | DB, web framework, external APIs | Interface Adapters |

### Project Structure Example

```
src/
├── domain/                     # Entities & business rules (innermost)
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Product.ts
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── Money.ts
│   │   └── Address.ts
│   ├── repositories/           # Interfaces only (no implementation!)
│   │   ├── IUserRepository.ts
│   │   └── IOrderRepository.ts
│   ├── services/               # Domain services (business logic)
│   │   └── PricingService.ts
│   └── events/
│       ├── OrderCreated.ts
│       └── UserRegistered.ts
│
├── application/                # Use cases & app services
│   ├── use-cases/
│   │   ├── CreateOrder.ts
│   │   ├── GetUserProfile.ts
│   │   └── ProcessPayment.ts
│   ├── dto/
│   │   ├── CreateOrderDTO.ts
│   │   └── UserProfileDTO.ts
│   └── services/               # Application services (orchestration)
│       └── NotificationService.ts
│
├── infrastructure/             # External implementations (outermost)
│   ├── database/
│   │   ├── repositories/
│   │   │   ├── UserRepository.ts      # Implements IUserRepository
│   │   │   └── OrderRepository.ts
│   │   ├── migrations/
│   │   └── seeds/
│   ├── cache/
│   │   └── RedisCache.ts
│   ├── queue/
│   │   └── RabbitMQPublisher.ts
│   └── external/
│       ├── PaymentGateway.ts
│       └── EmailProvider.ts
│
└── presentation/               # HTTP layer
    ├── controllers/
    │   ├── UserController.ts
    │   └── OrderController.ts
    ├── middleware/
    │   ├── AuthMiddleware.ts
    │   └── ValidationMiddleware.ts
    ├── routes/
    │   └── index.ts
    └── validators/
        ├── CreateOrderValidator.ts
        └── UserValidator.ts
```

---

## Repository Pattern

### Interface Definition (Domain Layer)

```
// domain/repositories/IUserRepository.ts
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options: QueryOptions): Promise<PaginatedResult<User>>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### Implementation (Infrastructure Layer)

```
// infrastructure/database/repositories/UserRepository.ts
class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? UserMapper.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    await this.db.query(
      'INSERT INTO users (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ...',
      [data]
    );
    return user;
  }
}
```

### Benefits

- **Testability**: Swap real DB for in-memory implementation in tests
- **Flexibility**: Change database without touching business logic
- **Single Responsibility**: Data access logic isolated from business logic
- **Consistency**: Standard interface for all data operations

---

## Service Pattern

### Domain Service (Business Logic)

```
// domain/services/PricingService.ts
class PricingService {
  calculateOrderTotal(items: OrderItem[], discounts: Discount[]): Money {
    const subtotal = items.reduce((sum, item) => sum.add(item.total()), Money.zero());
    const discount = this.applyDiscounts(subtotal, discounts);
    const tax = this.calculateTax(subtotal.subtract(discount));
    return subtotal.subtract(discount).add(tax);
  }
}
```

### Application Service (Orchestration)

```
// application/use-cases/CreateOrder.ts
class CreateOrderUseCase {
  constructor(
    private userRepo: IUserRepository,
    private orderRepo: IOrderRepository,
    private pricingService: PricingService,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Order> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new UserNotFoundError(dto.userId);

    const order = Order.create(user, dto.items);
    order.total = this.pricingService.calculateOrderTotal(order.items, user.discounts);

    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderCreated(order));

    return order;
  }
}
```

---

## Dependency Injection

### Registration

```
// Composition root (entry point)

// Register interfaces → implementations
container.register(IUserRepository, UserRepository);
container.register(IOrderRepository, OrderRepository);
container.register(IEventBus, RabbitMQEventBus);

// Register services
container.register(PricingService);
container.register(CreateOrderUseCase);

// Register controllers
container.register(OrderController);
```

### Benefits

- **Testability**: Inject mocks/stubs in tests
- **Loose Coupling**: Components depend on interfaces, not concrete classes
- **Single Responsibility**: Each class focuses on one job
- **Configurability**: Swap implementations without code changes

---

## Event-Driven Architecture

### Event Types

| Type | Purpose | Example |
|------|---------|---------|
| **Domain Event** | Business fact that happened | `OrderPlaced`, `UserRegistered` |
| **Integration Event** | Cross-service communication | `PaymentCompleted`, `InventoryUpdated` |
| **Command** | Request to do something | `ProcessPayment`, `SendEmail` |

### Event Flow

```
┌──────────┐    Event     ┌────────────┐    Message    ┌──────────────┐
│  Service  │──────────>│  Event Bus  │──────────────>│   Handler    │
│  (Source) │           │  (Broker)   │              │  (Consumer)  │
└──────────┘            └────────────┘              └──────────────┘

Sync (in-process):  Domain Events → Event Dispatcher → Event Handlers
Async (cross-service): Integration Events → Message Queue → Consumer Services
```

### Message Queue Selection

| Queue | Best For |
|-------|----------|
| **RabbitMQ** | Complex routing, priority queues, message acknowledgment |
| **Apache Kafka** | Event streaming, high throughput, event sourcing |
| **Redis Streams** | Simple queues, already using Redis |
| **Amazon SQS** | AWS-native, serverless, managed |
| **Google Pub/Sub** | GCP-native, global distribution |

---

## Microservices Guidelines

### When to Use Microservices

```
✅ Use when:
├── Team is large enough (3+ teams, 15+ developers)
├── Different parts need independent scaling
├── Different parts need different tech stacks
├── Independent deployment is critical
└── Organization structure maps to services (Conway's Law)

❌ Don't use when:
├── Small team (< 10 developers)
├── Simple domain model
├── No DevOps maturity (need CI/CD, monitoring, logging)
├── Tight coupling between components
└── Starting a new project (start monolith, extract later)
```

### Service Communication

| Pattern | Type | Use Case | Trade-off |
|---------|------|----------|-----------|
| REST/HTTP | Sync | Simple request-response | Coupling, cascading failures |
| gRPC | Sync | High-performance, internal | Schema management |
| Message Queue | Async | Decoupled processing | Eventual consistency |
| Event Streaming | Async | Event sourcing, audit trail | Complexity |

### Data Ownership Rules

```
✅ Each service owns its data (own database)
✅ Share data through APIs or events, not shared DB
✅ Accept eventual consistency where possible
✅ Use sagas for distributed transactions
❌ Never share a database between services
❌ Never do cross-service JOINs
❌ Never directly access another service's DB
```

---

## Design Pattern Quick Reference

| Pattern | Purpose | Use When |
|---------|---------|----------|
| **Repository** | Abstract data access | Always — separates domain from persistence |
| **Service** | Encapsulate business logic | Logic spans multiple entities |
| **Factory** | Complex object creation | Object creation is complex or conditional |
| **Strategy** | Swap algorithms at runtime | Multiple ways to do the same thing |
| **Observer/Event** | Decouple side effects | Actions trigger multiple reactions |
| **Decorator** | Add behavior without modifying | Logging, caching, auth wrapping |
| **Adapter** | Convert interfaces | Integrating external libraries/APIs |
| **Facade** | Simplify complex subsystem | Multiple services behind one interface |
| **Circuit Breaker** | Handle external failures | Calling unreliable external services |
| **Retry** | Handle transient failures | Network calls, database connections |
| **Builder** | Complex object construction | Objects with many optional parameters |
| **Singleton** | Single instance | Connection pools, config, logging |

---

## Architecture Decision Records (ADRs)

### Template

```markdown
# ADR-001: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
[What is the issue? Why does this decision need to be made?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or harder as a result of this decision?]

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## Alternatives Considered
- [Option A]: [Why not chosen]
- [Option B]: [Why not chosen]
```

Keep ADRs in the repo under `docs/adr/` — they are living documentation of architectural decisions.

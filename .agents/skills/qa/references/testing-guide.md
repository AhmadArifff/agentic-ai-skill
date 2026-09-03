# Testing Guide — Methodology & Best Practices

Reference document for the QA Skill's testing strategy and test case generation capabilities.

---

## Test Pyramid

```
         ┌───────┐
         │  E2E  │  ← Few, slow, expensive, high confidence
         │ Tests │
        ┌┴───────┴┐
        │Integration│  ← Moderate count, medium speed
        │  Tests    │
       ┌┴──────────┴┐
       │  Unit Tests  │  ← Many, fast, cheap, focused
       └──────────────┘
```

### Recommended Distribution

| Test Type | Percentage | Speed | Scope | When to Use |
|-----------|-----------|-------|-------|-------------|
| **Unit** | 60-70% | < 100ms each | Single function/class | Pure logic, calculations, transformations, validators |
| **Integration** | 20-30% | < 5s each | Multiple components | Database queries, API endpoints, service interactions |
| **E2E** | 5-10% | < 30s each | Full user flow | Critical user journeys, payment flows, auth flows |

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

### Performance Tests
Test performance characteristics:
- Response time under normal load
- Behavior under high concurrency
- Memory usage patterns
- Database query performance
- Cache hit/miss ratios

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

### 3. Decision Table Testing

Map all condition combinations to expected outcomes:

```
Example: Shipping rules

| Condition              | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|------------------------|--------|--------|--------|--------|
| Order > $50            | Yes    | Yes    | No     | No     |
| Premium member         | Yes    | No     | Yes    | No     |
| → Free shipping        | ✓      | ✓      | ✓      |        |
| → Standard shipping    |        |        |        | ✓      |

Each rule = one test case.
```

### 4. State Transition Testing

Test transitions between states:

```
Example: Order lifecycle

[Created] --pay--> [Paid] --ship--> [Shipped] --deliver--> [Delivered]
    |                 |                                          |
    +-cancel--> [Cancelled]                              +--return--> [Returned]

Test:
✅ Valid transitions: Created→Paid, Paid→Shipped, Shipped→Delivered
❌ Invalid transitions: Created→Shipped (skip Paid), Delivered→Created
```

---

## Test Structure

### Arrange-Act-Assert (AAA)

```
// Arrange — set up the test data and preconditions
const user = createTestUser({ role: 'admin' });
const service = new UserService(mockRepo);

// Act — perform the action being tested
const result = await service.updateProfile(user.id, { name: 'New Name' });

// Assert — verify the expected outcome
expect(result.name).toBe('New Name');
expect(mockRepo.save).toHaveBeenCalledWith(user.id, { name: 'New Name' });
```

### Given-When-Then (BDD)

```
Given a registered user with admin role
When they update their profile name to "New Name"
Then the profile name should be updated to "New Name"
And the change should be persisted to the database
```

---

## Test Naming Convention

Use descriptive names that explain the scenario:

```
❌ testUpdate()
❌ test1()
❌ updateTest()

✅ should_return_404_when_user_not_found()
✅ updateProfile_withValidData_updatesSuccessfully()
✅ given_expired_token_when_authenticate_then_throws_unauthorized()
```

Pattern: `[method]_[scenario]_[expectedBehavior]`

---

## Test Doubles

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Stub** | Returns predetermined values | When you need controlled inputs from dependencies |
| **Mock** | Verifies interactions were made correctly | When you need to verify a method was called with specific args |
| **Spy** | Records calls while delegating to real implementation | When you want real behavior but need to verify calls |
| **Fake** | Working implementation with shortcuts | In-memory database, fake email sender, local file system |
| **Dummy** | Placeholder that's never actually used | When a parameter is required but irrelevant to the test |

### Guidelines
- **Prefer stubs over mocks** — test behavior, not implementation
- **Don't mock what you don't own** — wrap external libraries and mock the wrapper
- **Don't mock value objects** — use real instances
- **Keep mocks simple** — if mock setup is complex, the design may need refactoring

---

## Coverage Goals

| Coverage Type | Target | Description |
|---------------|--------|-------------|
| **Line Coverage** | ≥ 80% | Percentage of lines executed by tests |
| **Branch Coverage** | ≥ 75% | Percentage of conditional branches (if/else/switch) tested |
| **Function Coverage** | ≥ 90% | Percentage of functions/methods called by tests |
| **Critical Path Coverage** | 100% | All critical business flows must be fully tested |

### What NOT to Test

- Framework/library code (they have their own tests)
- Simple getters/setters with no logic
- Configuration files
- Generated code
- Third-party API responses (mock them instead)

### What to ALWAYS Test

- Business logic and domain rules
- Data transformations and calculations
- Validation rules
- Error handling paths
- Security-critical code
- Edge cases in parsing/formatting

---

## Test Quality Indicators

### Good Tests Are:

- **Fast** — Unit tests < 100ms, integration < 5s
- **Independent** — No test depends on another test's output
- **Repeatable** — Same result every time, regardless of environment
- **Self-Validating** — Pass or fail, no manual inspection needed
- **Timely** — Written alongside or before the code (TDD/BDD)
- **Readable** — Test name explains the scenario, assertion explains the expectation

### Test Smells to Flag:

| Smell | Problem | Fix |
|-------|---------|-----|
| **Flaky tests** | Pass/fail randomly | Fix timing issues, remove external dependencies |
| **Slow tests** | Take > 10s for unit tests | Mock I/O, reduce setup, parallelize |
| **Coupled tests** | Test B fails when Test A changes | Make tests independent, don't share state |
| **Test duplication** | Same scenario tested multiple ways | Use parameterized tests |
| **Missing assertions** | Test runs code but doesn't verify | Add meaningful assertions |
| **Over-mocking** | Everything is mocked, nothing is real | Only mock external boundaries |
| **Fragile tests** | Break when implementation changes | Test behavior, not implementation |

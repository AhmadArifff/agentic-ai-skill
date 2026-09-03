# Code Review Patterns & Anti-Patterns Reference

Reference document for the QA Skill's code review capability. Use this when performing detailed code reviews to ensure no common pattern is missed.

---

## Design Principles Checklist

### SOLID Principles

| Principle | What to Check | Common Violation |
|-----------|--------------|------------------|
| **S** — Single Responsibility | Does this class/function do exactly one thing? | A "UserService" that handles auth, email, logging, and database |
| **O** — Open/Closed | Can behavior be extended without modifying existing code? | Giant switch/if-else chains that grow with every new feature |
| **L** — Liskov Substitution | Can subclasses be used in place of their parent? | Subclass that throws "NotImplemented" for inherited methods |
| **I** — Interface Segregation | Are interfaces focused and cohesive? | A single interface with 20+ methods that most implementors don't need |
| **D** — Dependency Inversion | Do high-level modules depend on abstractions? | Direct instantiation of concrete classes inside business logic |

### DRY (Don't Repeat Yourself)

**Check for:**
- Copy-pasted code blocks with minor variations
- Duplicate validation logic in multiple places
- Repeated query patterns without abstraction
- Same error handling boilerplate repeated

**But avoid:**
- Over-abstraction that makes code harder to understand
- Forced sharing between unrelated domains (wrong abstraction)

### KISS (Keep It Simple, Stupid)

**Check for:**
- Over-engineered solutions for simple problems
- Unnecessary abstraction layers
- Premature optimization
- Complex inheritance hierarchies when composition would suffice

---

## Common Code Smells

### Method/Function Level

| Smell | Detection | Impact | Fix |
|-------|-----------|--------|-----|
| **Long Method** | > 30 lines (guideline) | Hard to test, hard to understand | Extract methods with descriptive names |
| **Too Many Parameters** | > 4 parameters | Indicates too many responsibilities | Use parameter objects, builder pattern |
| **Deep Nesting** | > 3 levels of indentation | Hard to follow control flow | Early returns, guard clauses, extract methods |
| **Magic Numbers/Strings** | Literal values without explanation | Unclear intent, hard to maintain | Use named constants or enums |
| **Boolean Parameters** | `doSomething(true, false, true)` | Unclear at call site what each bool means | Use separate methods, enums, or options objects |
| **Feature Envy** | Method uses more data from another class | Wrong location for this logic | Move method to the class it's envious of |

### Class Level

| Smell | Detection | Impact | Fix |
|-------|-----------|--------|-----|
| **God Class** | > 500 lines, many responsibilities | Unmaintainable, high coupling | Split into focused classes |
| **Data Class** | Only getters/setters, no behavior | Anemic domain model | Add behavior to where the data lives |
| **Refused Bequest** | Subclass ignores parent methods | Incorrect inheritance hierarchy | Use composition instead |
| **Divergent Change** | One class changed for many different reasons | Low cohesion | Split by responsibility |
| **Shotgun Surgery** | One change requires edits in many classes | High coupling | Consolidate related logic |

### Architecture Level

| Smell | Detection | Impact | Fix |
|-------|-----------|--------|-----|
| **Circular Dependencies** | Module A imports B, B imports A | Tight coupling, hard to test | Introduce interface/abstraction layer |
| **God Module** | Single file/module everything depends on | Bottleneck for changes | Split into focused modules |
| **Spaghetti Architecture** | No clear layering or boundaries | Impossible to reason about | Introduce clear layer boundaries |
| **Golden Hammer** | Using one pattern/tool for everything | Suboptimal solutions | Choose patterns appropriate to the problem |

---

## Anti-Patterns to Flag

### Error Handling Anti-Patterns

```
❌ Swallowed Exception
   catch (Exception e) { }                    // Silent failure

❌ Log and Throw
   catch (Exception e) {
       log.error(e);
       throw e;                               // Duplicate logging up the chain
   }

❌ Catch-All
   catch (Exception e) {                      // Too broad — masks real errors
       return null;
   }

❌ Exception as Flow Control
   try { int val = array[index]; }
   catch (IndexOutOfBounds) { return default; } // Use bounds check instead

✅ Proper Error Handling
   catch (SpecificException e) {
       log.warn("Context: {}", context, e);
       throw new DomainException("Meaningful message", e);
   }
```

### Naming Anti-Patterns

```
❌ Single letter variables (except loop counters): x, d, t
❌ Abbreviations without context: usr, mgr, btn, impl
❌ Misleading names: isActive (returns count), getUser (modifies state)
❌ Type-encoding: strName, intAge, lstItems
❌ Generic names: data, info, temp, result, value, item

✅ Descriptive names: activeUserCount, fetchUserProfile, formatCurrency
✅ Boolean naming: isEnabled, hasPermission, canEdit, shouldRetry
✅ Collection naming: userIds, activeOrders, pendingInvoices (plural)
```

### Concurrency Anti-Patterns

```
❌ Check-then-act without synchronization (TOCTOU)
❌ Shared mutable state without protection
❌ Blocking I/O in async context
❌ Creating threads directly instead of using thread pools
❌ Missing timeout on external calls
❌ Double-checked locking done incorrectly

✅ Immutable data for sharing between threads
✅ Thread-safe collections or proper synchronization
✅ Async I/O in async context
✅ Thread pools with bounded queue and rejection policy
✅ Timeouts on ALL external calls (HTTP, DB, queue)
```

---

## Positive Patterns to Acknowledge

When reviewing, always note what's done well:

- **Guard Clauses**: Early returns that reduce nesting
- **Intention-Revealing Names**: Names that explain *what* and *why*
- **Small Functions**: Focused, testable, composable units
- **Immutability**: Using const/final/readonly, returning new objects
- **Fail-Fast**: Validating inputs early, throwing meaningful errors
- **Dependency Injection**: Loose coupling through constructor/method injection
- **Comprehensive Error Messages**: Context-rich errors with actionable guidance
- **Test Coverage**: Existing tests with clear assertions
- **Documentation**: Meaningful comments that explain *why*, not *what*

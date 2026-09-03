# Database Patterns — Design & Optimization Guide

Reference document for the Backend Skill's database management capability.

---

## Schema Design

### Normalization Levels

| Form | Rule | Example |
|------|------|---------|
| **1NF** | No repeating groups, atomic values | Split `tags: "a,b,c"` → separate rows in junction table |
| **2NF** | 1NF + no partial dependencies on composite key | Move `product_name` out of `order_items` if it only depends on `product_id` |
| **3NF** | 2NF + no transitive dependencies | Move `city_name` to `cities` table if it depends on `zip_code`, not PK |

### When to Denormalize

| Scenario | Technique | Trade-off |
|----------|-----------|-----------|
| Frequent expensive JOINs | Duplicate column in child table | Write complexity + data sync |
| Read-heavy dashboards | Materialized view or summary table | Storage + staleness |
| Historical data (snapshot) | Copy fields at time of event | Storage vs accuracy |
| Full-text search | Denormalized search index | Sync complexity |

**Rule of thumb:** Normalize first, then denormalize specific pain points with evidence (slow queries, high JOIN cost).

---

## Data Types — Choose Wisely

| Data | Recommended Type | Avoid |
|------|-----------------|-------|
| IDs | `BIGINT` (auto-increment) or `UUID` | `INT` (too small for scale) |
| Money | `DECIMAL(19,4)` or integer cents | `FLOAT`/`DOUBLE` (precision loss!) |
| Dates | `TIMESTAMP WITH TIME ZONE` | `VARCHAR` for dates |
| Booleans | `BOOLEAN` | `TINYINT`, `CHAR(1)` |
| Short text (name) | `VARCHAR(255)` | `TEXT` (wastes index space) |
| Long text (content) | `TEXT` | `VARCHAR(10000)` |
| JSON data | `JSONB` (Postgres) / `JSON` (MySQL 8+) | `TEXT` for structured data |
| Enums | `VARCHAR` + CHECK constraint or enum type | Integer codes without mapping |
| IP addresses | `INET` (Postgres) or `VARCHAR(45)` | `INT` (IPv4-only) |

---

## Indexing Strategy

### When to Add an Index

```
✅ Add index when:
├── Column is used in WHERE clauses frequently
├── Column is used in JOIN conditions
├── Column is used in ORDER BY
├── Column has high cardinality (many unique values)
└── Column is used in GROUP BY

❌ Don't index when:
├── Table has < 1,000 rows (full scan is faster)
├── Column has low cardinality (e.g., boolean, status with 3 values)
├── Column is rarely queried
├── Table has heavy write load (indexes slow writes)
└── You already have too many indexes on the table
```

### Index Types

| Type | Use Case | Example |
|------|----------|---------|
| **B-Tree** (default) | Equality and range queries | `WHERE status = 'active' AND created_at > '2024-01-01'` |
| **Hash** | Equality only (faster than B-tree for =) | `WHERE email = 'user@example.com'` |
| **GIN** | Full-text search, JSONB, arrays | `WHERE tags @> '{"featured"}'` |
| **GiST** | Geometric, range, nearest-neighbor | `WHERE location <-> point(40.7, -74.0)` |
| **Partial** | Subset of rows | `CREATE INDEX ... WHERE deleted_at IS NULL` |
| **Covering** | Include all columns the query needs | Avoids table lookup (index-only scan) |

### Composite Index Order

```sql
-- Query: WHERE status = 'active' AND created_at > '2024-01-01' ORDER BY name
-- Index should match: equality → range → sort

CREATE INDEX idx_users_status_created_name
  ON users (status, created_at, name);

-- ✅ Uses index: WHERE status = 'active' AND created_at > '...'
-- ✅ Uses index: WHERE status = 'active'
-- ❌ Cannot use: WHERE created_at > '...' (skips first column)
-- ❌ Cannot use: WHERE name = 'John' (skips first two columns)
```

**Rule:** Leftmost prefix matters. Query must use columns from left to right.

---

## Query Optimization

### Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `SELECT *` | Fetches unnecessary data, breaks covering index | List specific columns |
| N+1 queries | 1 query for list + N queries for related data | Use JOIN or eager loading |
| `LIKE '%term%'` | Cannot use B-tree index (leading wildcard) | Use full-text search index |
| `WHERE function(column) = value` | Index on column is unusable | Rewrite: `WHERE column = inverse_function(value)` |
| No LIMIT on unbounded queries | Full table scan, OOM risk | Always add LIMIT |
| `ORDER BY RAND()` | Full table scan + sort | Use application-level randomization |
| Missing WHERE on UPDATE/DELETE | Accidentally modify all rows | Always have WHERE clause |
| Implicit type conversion | Index bypass | Match types: `WHERE id = 123` not `WHERE id = '123'` |

### EXPLAIN Reading Guide

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- Key things to check:
-- 1. Scan type: Seq Scan (bad for large tables) vs Index Scan (good)
-- 2. Rows estimate vs actual rows (if wildly different, run ANALYZE)
-- 3. Cost: lower is better
-- 4. Sort method: if "Sort Method: external merge" → needs more work_mem
-- 5. Loops: high loop count in nested loop join → consider different join
```

### N+1 Query Prevention

```
❌ N+1 Problem:
  users = User.all()                    # 1 query
  for user in users:
    orders = user.orders.all()          # N queries (one per user!)

✅ Eager Loading (ORM):
  users = User.all().prefetch_related('orders')  # 2 queries total

✅ JOIN:
  SELECT u.*, o.*
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.status = 'active'            # 1 query
```

---

## Migration Best Practices

### Safe Migration Rules

| ✅ Safe | ❌ Dangerous |
|---------|-------------|
| Add nullable column | Add non-nullable column without default |
| Add index CONCURRENTLY | Add index (locks table) |
| Add new table | Drop column (may break running code) |
| Add column with default (PG 11+) | Rename column (breaks all queries) |
| Backfill data in batches | Backfill in single transaction |

### Zero-Downtime Migration Strategy

```
For renaming a column (e.g., name → full_name):

Step 1 (Deploy A): Add new column
  ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

Step 2 (Deploy A): Dual-write
  Write to both 'name' and 'full_name'
  Backfill existing rows in batches

Step 3 (Deploy B): Switch reads
  Read from 'full_name', still write to both

Step 4 (Deploy C): Drop old column
  ALTER TABLE users DROP COLUMN name;
```

### Migration Checklist

- [ ] Migration has both UP and DOWN (reversible)
- [ ] Large table changes use batching (not single ALTER)
- [ ] Index creation uses CONCURRENTLY (PostgreSQL)
- [ ] Data backfill is idempotent (safe to re-run)
- [ ] Tested on production-size dataset copy
- [ ] Estimated lock time documented
- [ ] Rollback procedure documented

---

## Transaction Patterns

### Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Use Case |
|-------|-----------|-------------------|-------------|----------|
| Read Uncommitted | ✅ Possible | ✅ Possible | ✅ Possible | Almost never use |
| **Read Committed** (default) | ❌ Prevented | ✅ Possible | ✅ Possible | Most CRUD operations |
| Repeatable Read | ❌ Prevented | ❌ Prevented | ✅ Possible | Financial calculations |
| Serializable | ❌ Prevented | ❌ Prevented | ❌ Prevented | Critical consistency (booking) |

### Transaction Best Practices

```
✅ Do:
├── Keep transactions as short as possible
├── Acquire locks in consistent order (prevent deadlocks)
├── Use savepoints for partial rollback
├── Set statement_timeout for long-running queries
└── Use optimistic locking for concurrent updates

❌ Don't:
├── Hold transactions open during HTTP calls
├── Use transactions for read-only queries
├── Nest transactions without savepoints
├── Ignore deadlock errors (retry!)
└── Mix DDL and DML in the same transaction
```

---

## Connection Pooling

### Pool Sizing Formula

```
Optimal connections = (core_count * 2) + effective_spindle_count

For a 4-core server with SSD:
  Connections = (4 * 2) + 1 = 9

Max pool size should rarely exceed 20 per application instance.
```

### Configuration Guide

| Setting | Recommended | Purpose |
|---------|-------------|---------|
| `min_pool_size` | 2-5 | Minimum idle connections |
| `max_pool_size` | 10-20 | Maximum total connections |
| `idle_timeout` | 300s (5 min) | Close idle connections after |
| `connection_timeout` | 5s | Max wait for available connection |
| `max_lifetime` | 1800s (30 min) | Recycle connections to prevent leaks |
| `validation_query` | `SELECT 1` | Health check before use |

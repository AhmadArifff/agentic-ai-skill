# API Design Guide — REST Conventions & Patterns

Reference document for the Backend Skill's API design capability.

---

## RESTful URL Structure

### Resource Naming

```
✅ Correct                          ❌ Incorrect
/users                              /getUsers
/users/123                          /user/123
/users/123/orders                   /getUserOrders?userId=123
/users/123/orders/456               /getOrderById
/users/123/orders/456/items         /user_order_items
```

**Rules:**
- Use **plural nouns** for resources: `/users`, `/orders`, `/products`
- Use **kebab-case** for multi-word resources: `/order-items`, `/user-profiles`
- Nest sub-resources max **3 levels** deep: `/users/123/orders/456`
- Use query params for filtering, not path params: `/users?role=admin`
- No verbs in URLs — the HTTP method IS the verb

### URL Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| Collection | `GET /users` | List all resources |
| Single resource | `GET /users/123` | Get one resource |
| Sub-collection | `GET /users/123/orders` | List nested resources |
| Actions (exceptional) | `POST /users/123/activate` | Non-CRUD operations |
| Search | `GET /users/search?q=john` | Complex search |

---

## HTTP Methods

| Method | Purpose | Idempotent | Request Body | Response |
|--------|---------|------------|-------------|----------|
| `GET` | Retrieve resource(s) | ✅ Yes | ❌ No | Resource data |
| `POST` | Create new resource | ❌ No | ✅ Yes | Created resource + 201 |
| `PUT` | Full update (replace) | ✅ Yes | ✅ Yes | Updated resource |
| `PATCH` | Partial update | ❌ No* | ✅ Yes | Updated resource |
| `DELETE` | Remove resource | ✅ Yes | ❌ No | 204 No Content |

*PATCH can be idempotent depending on implementation

### Method Selection Guide

```
Need to read data?              → GET
Need to create a new resource?  → POST
Need to replace entire resource?→ PUT
Need to update some fields?     → PATCH
Need to remove a resource?      → DELETE
Need a non-CRUD action?         → POST /resource/action
```

---

## HTTP Status Codes

### Success (2xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| `200 OK` | Request succeeded | GET, PUT, PATCH success |
| `201 Created` | Resource created | POST success — include Location header |
| `202 Accepted` | Request accepted for async processing | Long-running operations |
| `204 No Content` | Success with no body | DELETE success, PUT with no return |

### Client Errors (4xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| `400 Bad Request` | Malformed request syntax | Invalid JSON, wrong content-type |
| `401 Unauthorized` | Authentication required | Missing or invalid auth token |
| `403 Forbidden` | Authenticated but not authorized | Insufficient permissions |
| `404 Not Found` | Resource doesn't exist | Invalid ID, deleted resource |
| `405 Method Not Allowed` | HTTP method not supported | POST on read-only resource |
| `409 Conflict` | Request conflicts with current state | Duplicate entry, version conflict |
| `422 Unprocessable Entity` | Valid syntax but semantic errors | Validation failures |
| `429 Too Many Requests` | Rate limit exceeded | Include Retry-After header |

### Server Errors (5xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| `500 Internal Server Error` | Unexpected server failure | Unhandled exceptions — never leak details |
| `502 Bad Gateway` | Upstream service failure | Proxy/gateway received invalid response |
| `503 Service Unavailable` | Server temporarily unavailable | Maintenance, overloaded |
| `504 Gateway Timeout` | Upstream service timeout | External service didn't respond in time |

---

## Request/Response Patterns

### Success Response Envelope

```json
// Single resource
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}

// Collection
{
  "success": true,
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

### Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid.",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "age",
        "message": "Age must be between 0 and 150.",
        "code": "OUT_OF_RANGE"
      }
    ],
    "request_id": "req_7f3a1b2c"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependent service is down |

---

## Pagination

### Cursor-Based (Recommended)

Best for real-time data, large datasets, and infinite scroll:

```
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "meta": {
    "next_cursor": "eyJpZCI6MTQzfQ",
    "prev_cursor": "eyJpZCI6MTAzfQ",
    "has_more": true,
    "limit": 20
  }
}
```

**Pros:** Consistent results with concurrent writes, performant on large tables
**Cons:** Can't jump to arbitrary page, harder to implement

### Offset-Based

Best for admin panels, small datasets, known page numbers:

```
GET /users?page=2&per_page=20

Response:
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 2,
    "per_page": 20,
    "total_pages": 8
  }
}
```

**Pros:** Simple, supports page jumping
**Cons:** Inconsistent with concurrent writes, slow on large tables (OFFSET N)

---

## Filtering & Sorting

### Query Parameter Conventions

```
# Exact match
GET /users?status=active

# Multiple values (OR)
GET /users?status=active,suspended

# Comparison
GET /orders?total_gte=100&total_lte=500
GET /users?created_after=2024-01-01

# Search
GET /users?search=john
GET /users?q=john+doe

# Sorting
GET /users?sort=created_at&order=desc
GET /users?sort=-created_at,name          # prefix - for desc

# Field selection (sparse fieldsets)
GET /users?fields=id,name,email

# Include related resources
GET /users?include=orders,profile
```

### Naming Conventions for Filters

| Operator | Suffix | Example |
|----------|--------|---------|
| Equal | (none) | `?status=active` |
| Not equal | `_ne` | `?status_ne=deleted` |
| Greater than | `_gt` | `?age_gt=18` |
| Greater or equal | `_gte` | `?price_gte=100` |
| Less than | `_lt` | `?age_lt=65` |
| Less or equal | `_lte` | `?price_lte=500` |
| Contains | `_contains` | `?name_contains=john` |
| Starts with | `_starts` | `?name_starts=jo` |
| In list | `_in` | `?id_in=1,2,3` |
| Is null | `_null` | `?deleted_at_null=true` |

---

## Versioning Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL path** (recommended) | `/api/v1/users` | Explicit, easy to route | URL pollution |
| **Query param** | `/users?version=1` | Easy to add | Easy to forget |
| **Header** | `Accept: application/vnd.api+json;v=1` | Clean URLs | Hidden, harder to test |
| **Content negotiation** | `Accept: application/vnd.myapp.v1+json` | Proper REST | Complex |

### Versioning Best Practices

- Only bump version for **breaking changes**
- Additive changes (new fields, new endpoints) don't need new version
- Support at least **2 versions** simultaneously
- Deprecation notice **6+ months** before removing old version
- Include `Deprecation` and `Sunset` headers on deprecated versions

---

## Rate Limiting

### Response Headers

```
X-RateLimit-Limit: 100          # Max requests per window
X-RateLimit-Remaining: 45       # Remaining requests
X-RateLimit-Reset: 1609459200   # Unix timestamp when window resets
Retry-After: 60                 # Seconds to wait (on 429)
```

### Strategy Selection

| Strategy | Use Case |
|----------|----------|
| **Fixed window** | Simple, 100 req/min per user |
| **Sliding window** | Smoother, prevents burst at window boundaries |
| **Token bucket** | Allows bursts while maintaining average rate |
| **Leaky bucket** | Constant processing rate, queues excess |

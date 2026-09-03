# Authentication & Authorization Patterns

Reference document for the Backend Skill's authentication and authorization capability.

---

## Authentication Strategy Selection

| Strategy | Best For | Not Suitable For |
|----------|----------|-----------------|
| **JWT (stateless)** | SPAs, mobile apps, microservices | When instant revocation is critical |
| **Session (stateful)** | Traditional web apps, SSR | Microservices, stateless architectures |
| **API Key** | Server-to-server, third-party integrations | End-user authentication |
| **OAuth 2.0** | Third-party login, delegated access | Simple internal apps |
| **Basic Auth** | Internal tools, development only | Production user-facing apps |

---

## JWT (JSON Web Token) Flow

### Access + Refresh Token Pattern

```
┌─────────┐                        ┌─────────┐                    ┌──────────┐
│  Client  │                        │   Auth   │                    │ Resource │
│  (SPA)   │                        │  Server  │                    │  Server  │
└────┬─────┘                        └────┬─────┘                    └────┬─────┘
     │                                   │                               │
     │  1. POST /auth/login              │                               │
     │  {email, password}                │                               │
     │──────────────────────────────────>│                               │
     │                                   │                               │
     │  2. {access_token, refresh_token} │                               │
     │<──────────────────────────────────│                               │
     │                                   │                               │
     │  3. GET /api/users                │                               │
     │  Authorization: Bearer <access>   │                               │
     │──────────────────────────────────────────────────────────────────>│
     │                                   │                               │
     │  4. 200 OK {data}                 │                               │
     │<──────────────────────────────────────────────────────────────────│
     │                                   │                               │
     │  5. GET /api/users (expired token)│                               │
     │──────────────────────────────────────────────────────────────────>│
     │                                   │                               │
     │  6. 401 Unauthorized              │                               │
     │<──────────────────────────────────────────────────────────────────│
     │                                   │                               │
     │  7. POST /auth/refresh            │                               │
     │  {refresh_token}                  │                               │
     │──────────────────────────────────>│                               │
     │                                   │                               │
     │  8. {new_access, new_refresh}     │                               │
     │<──────────────────────────────────│                               │
```

### JWT Best Practices

| Practice | Recommendation |
|----------|---------------|
| **Access token expiry** | 15-30 minutes (short-lived) |
| **Refresh token expiry** | 7-30 days (long-lived) |
| **Token storage (browser)** | `httpOnly` cookie (access), secure storage (refresh) |
| **Token storage (mobile)** | Secure keychain / keystore |
| **Algorithm** | `RS256` (asymmetric) for microservices, `HS256` (symmetric) for monolith |
| **Payload** | User ID, roles, permissions — NO sensitive data (PII, passwords) |
| **Token size** | Keep < 4KB (cookie limit, header overhead) |
| **Refresh rotation** | Issue new refresh token on each refresh (detect token reuse → revoke all) |

### JWT Payload Structure

```json
{
  "sub": "user_123",
  "iat": 1704067200,
  "exp": 1704069000,
  "iss": "auth.myapp.com",
  "aud": "api.myapp.com",
  "roles": ["admin", "editor"],
  "permissions": ["users:read", "users:write", "posts:read"]
}
```

### Token Revocation Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| **Short expiry** | Simple, no infra needed | Up to 15-min stale access |
| **Blacklist (Redis)** | Instant revocation | Needs shared state (Redis) |
| **Token versioning** | Revoke per-user (increment version) | DB lookup on each request |
| **Refresh token rotation** | Detects stolen tokens | Slightly complex implementation |

---

## OAuth 2.0 Flows

### Authorization Code Flow (with PKCE) — Recommended for SPAs/Mobile

```
1. Client generates code_verifier + code_challenge
2. Redirect to: /authorize?response_type=code&client_id=X&code_challenge=Y
3. User authenticates and consents
4. Redirect back with authorization code
5. Client exchanges code + code_verifier for tokens at /token
6. Server validates code_challenge matches code_verifier
7. Returns access_token + refresh_token
```

### Client Credentials Flow — Server-to-Server

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=service_a
&client_secret=SECRET
&scope=read:users

Response: { "access_token": "...", "expires_in": 3600 }
```

### Flow Selection Guide

| Flow | Use Case |
|------|----------|
| Authorization Code + PKCE | SPAs, mobile apps, server-side web apps |
| Client Credentials | Server-to-server, cron jobs, microservices |
| Device Code | Smart TVs, CLI tools, IoT devices |
| ❌ Implicit | **DEPRECATED** — use Authorization Code + PKCE instead |
| ❌ Resource Owner Password | **DEPRECATED** — only for migration from legacy |

---

## Session Management

### Secure Session Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| `cookie.httpOnly` | `true` | Prevent JavaScript access (XSS protection) |
| `cookie.secure` | `true` | HTTPS only |
| `cookie.sameSite` | `Lax` or `Strict` | CSRF protection |
| `cookie.path` | `/` | Available on all paths |
| `cookie.maxAge` | 24h - 7 days | Session duration |
| Session ID length | ≥ 128 bits | Prevent brute force |
| Session ID entropy | Cryptographically random | Prevent prediction |

### Session Security Checklist

- [ ] Regenerate session ID after login (prevent session fixation)
- [ ] Invalidate session on logout (server-side delete)
- [ ] Set idle timeout (30 min for sensitive apps)
- [ ] Set absolute timeout (8-24 hours max)
- [ ] Invalidate all sessions on password change
- [ ] Store sessions server-side (Redis/DB), not in cookies
- [ ] Bind session to user-agent or IP (optional, can cause issues)

---

## RBAC (Role-Based Access Control)

### Permission Model

```
Role:       admin, editor, viewer, user
Permission: users:read, users:write, users:delete, posts:read, posts:write
Mapping:    admin → [all], editor → [posts:*, users:read], viewer → [*:read]
```

### Implementation Pattern

```
Middleware approach:

1. Extract user from token/session
2. Load user's roles
3. Expand roles to permissions
4. Check required permission against user's permissions
5. Allow or deny (403)

Route definition:
  GET  /users          → requires("users:read")
  POST /users          → requires("users:write")
  DELETE /users/:id    → requires("users:delete")
```

### Permission Granularity

| Level | Example | When to Use |
|-------|---------|-------------|
| **Role-based** | `isAdmin()` | Simple apps with few roles |
| **Permission-based** | `can("users:write")` | Medium complexity, multiple roles |
| **Resource-based** | `can("write", specificUser)` | Multi-tenant, resource ownership |
| **Attribute-based (ABAC)** | `can("write", user) if user.dept == currentUser.dept` | Complex business rules |

---

## Password Security

### Hashing Algorithms (Ranked)

| Algorithm | Recommendation | Notes |
|-----------|---------------|-------|
| **Argon2id** | ✅ Best choice | Memory-hard, resistant to GPU/ASIC attacks |
| **bcrypt** | ✅ Excellent | Time-tested, widely supported |
| **scrypt** | ✅ Good | Memory-hard, less common than Argon2 |
| PBKDF2 | ⚠️ Acceptable | Not memory-hard, needs high iteration count |
| SHA-256/SHA-512 | ❌ Never for passwords | Too fast, vulnerable to brute force |
| MD5 | ❌ Never | Broken, trivially crackable |

### Password Policy Recommendations

```
Minimum length:     12 characters (NIST recommends 8+, but 12+ is better)
Maximum length:     128 characters (prevent DoS on hash computation)
Complexity:         Don't force special chars — encourage passphrases
Breached passwords: Check against HaveIBeenPwned API
Rate limiting:      Max 5 failed attempts, then progressive delay
Account lockout:    Temporary (15-30 min), not permanent
```

### Password Reset Flow

```
1. User requests reset → POST /auth/forgot-password {email}
2. Server generates cryptographically random token
3. Store token hash (not token itself) with expiry (1 hour max)
4. Send reset link via email with token
5. User submits new password → POST /auth/reset-password {token, new_password}
6. Server validates token hash and expiry
7. Update password, invalidate all sessions, delete token
8. Send confirmation email
```

---

## API Key Management

### Key Generation

```
Format: prefix_base62random
Example: sk_test_51XXX_YOUR_API_KEY_EXAMPLE

Components:
├── sk_       → secret key (vs pk_ for public)
├── live_     → environment (live/test/staging)
└── random    → 32+ bytes of cryptographic randomness
```

### Key Storage & Validation

```
Storage:
├── Store HASH of key (bcrypt/SHA-256), not plaintext
├── Show full key ONCE at creation, never again
├── Allow user to see last 4 characters for identification
└── Store metadata: name, created_at, last_used, scopes, rate_limit

Validation:
├── Extract prefix to identify key type
├── Hash the provided key
├── Compare hash against stored hash
├── Check key is not revoked/expired
├── Verify scopes match requested operation
└── Apply per-key rate limiting
```

---

## Multi-Factor Authentication (MFA)

### TOTP (Time-Based One-Time Password)

```
Setup Flow:
1. Generate secret key (base32 encoded, 160+ bits)
2. Generate QR code with otpauth:// URI
3. User scans QR with authenticator app
4. User enters code to verify setup
5. Store encrypted secret + generate backup codes

Verification Flow:
1. User enters 6-digit code
2. Server generates expected code for current + ±1 time windows
3. Compare (constant-time comparison!)
4. Check code hasn't been used (prevent replay)
5. Allow if match, deny after 3-5 failures
```

### Backup Codes

```
- Generate 8-10 single-use codes (8 chars each, alphanumeric)
- Hash and store (same as passwords)
- Show to user ONCE at MFA setup
- Mark as used after successful verification
- Allow regeneration (invalidates old codes)
```

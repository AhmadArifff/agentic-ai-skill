# Security Review Checklist

Reference document for the QA Skill's security review capability. Based on OWASP Top 10 (2021) and industry best practices.

---

## OWASP Top 10 (2021) Checklist

### A01:2021 — Broken Access Control

| # | Check | Severity |
|---|-------|----------|
| 1 | Every endpoint enforces authentication (no unprotected routes) | 🔴 Critical |
| 2 | Authorization checked on every request (not just UI-hidden) | 🔴 Critical |
| 3 | No IDOR (Insecure Direct Object Reference) — user can only access their own resources | 🔴 Critical |
| 4 | CORS policy is restrictive (no wildcard `*` in production) | 🟠 High |
| 5 | API endpoints enforce same authorization as web UI | 🔴 Critical |
| 6 | Admin functions are protected by role-based access control | 🔴 Critical |
| 7 | File upload paths cannot traverse directories (`../`) | 🔴 Critical |
| 8 | JWT tokens are validated (signature, expiry, issuer) | 🔴 Critical |
| 9 | Session invalidated on logout and password change | 🟠 High |
| 10 | Rate limiting on authentication endpoints | 🟠 High |

### A02:2021 — Cryptographic Failures

| # | Check | Severity |
|---|-------|----------|
| 1 | No sensitive data transmitted over HTTP (enforce HTTPS) | 🔴 Critical |
| 2 | Passwords hashed with bcrypt/argon2/scrypt (NOT MD5/SHA1) | 🔴 Critical |
| 3 | API keys and secrets not in source code or version control | 🔴 Critical |
| 4 | Sensitive data encrypted at rest (PII, payment data, health records) | 🟠 High |
| 5 | TLS 1.2+ enforced (no SSLv3, TLS 1.0/1.1) | 🟠 High |
| 6 | No sensitive data in URLs (query parameters logged in access logs) | 🟠 High |
| 7 | Encryption keys rotated periodically | 🟡 Medium |
| 8 | No custom/homegrown encryption algorithms | 🔴 Critical |

### A03:2021 — Injection

| # | Check | Severity |
|---|-------|----------|
| 1 | All SQL queries use parameterized statements / prepared statements | 🔴 Critical |
| 2 | No string concatenation in SQL queries | 🔴 Critical |
| 3 | ORM queries use parameterized binding (not raw interpolation) | 🔴 Critical |
| 4 | User input never passed to `eval()`, `exec()`, `system()`, `shell_exec()` | 🔴 Critical |
| 5 | Template engines auto-escape output (XSS prevention) | 🔴 Critical |
| 6 | User input in HTML attributes is properly escaped | 🔴 Critical |
| 7 | LDAP queries use proper escaping | 🟠 High |
| 8 | File paths from user input are sanitized and restricted | 🔴 Critical |
| 9 | Regex patterns from user input are validated (ReDoS prevention) | 🟡 Medium |
| 10 | HTTP headers from user input are sanitized (header injection) | 🟠 High |

### A04:2021 — Insecure Design

| # | Check | Severity |
|---|-------|----------|
| 1 | Business logic enforced server-side (not just client-side) | 🔴 Critical |
| 2 | Fail-secure defaults (deny by default, explicitly allow) | 🟠 High |
| 3 | Resource limits enforced (file size, request body, query result count) | 🟠 High |
| 4 | Multi-step operations validate state at each step | 🟠 High |
| 5 | Threat modeling performed for sensitive features | 🟡 Medium |

### A05:2021 — Security Misconfiguration

| # | Check | Severity |
|---|-------|----------|
| 1 | Debug mode disabled in production | 🔴 Critical |
| 2 | Default credentials changed (admin/admin, root/root) | 🔴 Critical |
| 3 | Error messages don't expose stack traces or internal details to users | 🟠 High |
| 4 | Security headers set (CSP, X-Frame-Options, X-Content-Type-Options) | 🟠 High |
| 5 | Unnecessary features/services/ports disabled | 🟡 Medium |
| 6 | Directory listing disabled on web servers | 🟡 Medium |
| 7 | CORS headers are as restrictive as possible | 🟠 High |

### A06:2021 — Vulnerable and Outdated Components

| # | Check | Severity |
|---|-------|----------|
| 1 | All dependencies are up-to-date (no known CVEs) | 🟠 High |
| 2 | Dependencies are pinned to specific versions (lock file exists) | 🟡 Medium |
| 3 | No unused dependencies in the project | 🔵 Low |
| 4 | Automated vulnerability scanning in CI/CD (npm audit, Snyk, etc.) | 🟡 Medium |
| 5 | Dependencies sourced from trusted registries | 🟠 High |

### A07:2021 — Identification and Authentication Failures

| # | Check | Severity |
|---|-------|----------|
| 1 | Password minimum length ≥ 8 characters | 🟠 High |
| 2 | Brute force protection (account lockout, rate limiting, CAPTCHA) | 🟠 High |
| 3 | Multi-factor authentication available for sensitive accounts | 🟡 Medium |
| 4 | Session IDs are random, long, and not predictable | 🟠 High |
| 5 | Session timeout enforced (idle and absolute) | 🟡 Medium |
| 6 | Password reset tokens are single-use and time-limited | 🟠 High |
| 7 | Credentials not logged in application logs | 🔴 Critical |
| 8 | Login responses don't reveal whether username or password is wrong | 🟡 Medium |

### A08:2021 — Software and Data Integrity Failures

| # | Check | Severity |
|---|-------|----------|
| 1 | CI/CD pipeline is protected (no unauthorized deployments) | 🟠 High |
| 2 | Dependencies verified with integrity checks (checksums, signatures) | 🟡 Medium |
| 3 | Deserialization of untrusted data is avoided or strictly validated | 🔴 Critical |
| 4 | Auto-update mechanisms use signed packages | 🟠 High |

### A09:2021 — Security Logging and Monitoring Failures

| # | Check | Severity |
|---|-------|----------|
| 1 | Authentication events are logged (login, logout, failed attempts) | 🟠 High |
| 2 | Authorization failures are logged | 🟠 High |
| 3 | Input validation failures are logged | 🟡 Medium |
| 4 | Logs don't contain sensitive data (passwords, tokens, PII) | 🔴 Critical |
| 5 | Logs are tamper-proof (centralized, append-only) | 🟡 Medium |
| 6 | Alerting configured for suspicious patterns | 🟡 Medium |

### A10:2021 — Server-Side Request Forgery (SSRF)

| # | Check | Severity |
|---|-------|----------|
| 1 | URLs from user input are validated against allowlist | 🔴 Critical |
| 2 | Internal network addresses blocked in user-supplied URLs | 🔴 Critical |
| 3 | Redirect responses are not blindly followed | 🟠 High |
| 4 | DNS rebinding protection in place | 🟡 Medium |

---

## Additional Security Checks

### API Security

| # | Check | Severity |
|---|-------|----------|
| 1 | API authentication on every endpoint (token/key/session) | 🔴 Critical |
| 2 | Rate limiting configured per endpoint/user | 🟠 High |
| 3 | Request body size limits enforced | 🟠 High |
| 4 | Response doesn't leak internal implementation details | 🟡 Medium |
| 5 | API versioning in place | 🟡 Medium |
| 6 | GraphQL: query depth limiting and complexity analysis | 🟠 High |
| 7 | API keys are rotatable without downtime | 🟡 Medium |

### File Upload Security

| # | Check | Severity |
|---|-------|----------|
| 1 | File type validated by content (magic bytes), not just extension | 🟠 High |
| 2 | File size limits enforced | 🟠 High |
| 3 | Uploaded files stored outside web root or served through a proxy | 🔴 Critical |
| 4 | Filenames sanitized (no path traversal, no special characters) | 🔴 Critical |
| 5 | Antivirus scanning for uploaded files | 🟡 Medium |
| 6 | Image files re-processed to strip metadata (EXIF) | 🟡 Medium |

### Data Privacy

| # | Check | Severity |
|---|-------|----------|
| 1 | PII (Personally Identifiable Information) identified and classified | 🟠 High |
| 2 | Data retention policies implemented (auto-delete expired data) | 🟡 Medium |
| 3 | User data export capability (GDPR right to portability) | 🟡 Medium |
| 4 | User data deletion capability (GDPR right to erasure) | 🟠 High |
| 5 | Consent management for data collection | 🟡 Medium |
| 6 | Data minimization — only collect what's needed | 🟡 Medium |

---

## Quick Security Scan Patterns

When doing a quick review, search for these high-risk patterns:

### Dangerous Function Calls
```
eval(          → Code injection risk
exec(          → Command injection risk
system(        → Command injection risk
shell_exec(    → Command injection risk
unserialize(   → Deserialization risk
innerHTML =    → XSS risk
document.write → XSS risk
dangerouslySetInnerHTML → XSS risk (React)
raw(           → XSS risk (template engines)
```

### Hardcoded Secrets
```
password =     → Hardcoded password
secret =       → Hardcoded secret
api_key =      → Hardcoded API key
token =        → Hardcoded token
AWS_ACCESS     → AWS credentials in code
PRIVATE_KEY    → Private key in code
-----BEGIN     → Certificate/key in code
```

### SQL Injection Vectors
```
"SELECT.*" +   → String concatenation in SQL
f"SELECT       → f-string in SQL (Python)
`SELECT.*${    → Template literal in SQL (JS)
"SELECT.*#{    → String interpolation in SQL (Ruby)
"SELECT.*$     → Variable interpolation in SQL (PHP)
.query("       → Raw query without parameterization
.rawQuery(     → Raw query method
```

### Insecure Configurations
```
debug: true           → Debug mode in config
DEBUG = True           → Debug mode enabled
AllowAny              → Open permission
cors: { origin: '*' } → Open CORS policy
verify=False          → SSL verification disabled
insecure: true        → Security bypass
```

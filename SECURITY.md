# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** Open a Public Issue

Security vulnerabilities should **not** be reported through public GitHub issues.

### 2. Report Privately

Please report security vulnerabilities by emailing:

**Email:** [Your security contact email]

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (see below)

### 4. Severity Levels

| Severity | Description | Fix Timeline |
|----------|-------------|--------------|
| **Critical** | RCE, auth bypass, data breach | 24-48 hours |
| **High** | Privilege escalation, SQL injection | 7 days |
| **Medium** | XSS, CSRF, information disclosure | 30 days |
| **Low** | Minor information leaks | 90 days |

### 5. Disclosure Policy

- We will confirm receipt of your report within 48 hours
- We will work with you to understand and resolve the issue
- We will credit you in the security advisory (unless you prefer anonymity)
- We request that you do not publicly disclose the vulnerability until we have released a fix
- Once fixed, we will publish a security advisory

## Security Measures

### Authentication & Authorization

#### Implemented ✅

1. **Supabase Authentication**
   - JWT-based session management
   - Secure password hashing (bcrypt)
   - Session expiration and refresh
   - HTTPS-only communication

2. **Row Level Security (RLS)**
   - All database tables protected
   - Users can only access their own data
   - Enforced at database level

3. **Password Requirements**
   - Minimum 8 characters
   - Requires uppercase, lowercase, number, special character
   - Enforced at signup (see `src/lib/validation/schemas.ts:428-439`)

4. **Session Management**
   - Automatic session refresh
   - Secure token storage (managed by Supabase SDK)
   - Sign out clears all session data

#### Planned 📋

- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub)
- [ ] Session timeout warnings
- [ ] IP-based rate limiting

### Input Validation

#### Implemented ✅

1. **Client-Side Validation (Zod)**
   - All user inputs validated before submission
   - Comprehensive schemas for all data models
   - Runtime type checking
   - Located in `src/lib/validation/schemas.ts`

2. **Server-Side Validation**
   - Database constraints (NOT NULL, CHECK, FOREIGN KEY)
   - RLS policies
   - Edge function validation

3. **Validation Examples**
   ```typescript
   // Ingredient validation
   ingredientInsertSchema.parse(userInput);

   // Auth validation
   signUpSchema.parse(formData);

   // Environment validation
   envSchema.parse(process.env);
   ```

#### Best Practices

- Never trust client-side validation alone
- Validate on both client and server
- Use parameterized queries (Supabase handles this)
- Sanitize user-generated content before display

### XSS Protection

#### Implemented ✅

1. **React Built-in Protection**
   - React escapes all user content by default
   - JSX prevents injection attacks

2. **Safe Content Rendering**
   - User-generated content displayed safely
   - No `dangerouslySetInnerHTML` usage

#### Planned 📋

- [ ] Content Security Policy (CSP) headers
- [ ] DOMPurify for rich text content (if added)

### CSRF Protection

#### Implemented ✅

1. **Supabase Authentication**
   - JWT tokens in Authorization header
   - Not vulnerable to CSRF (no cookies for auth)

2. **SameSite Cookies**
   - Managed by Supabase
   - SameSite=Lax/Strict

#### Planned 📋

- [ ] CSRF tokens for state-changing operations
- [ ] Additional CORS configuration if needed

### SQL Injection Protection

#### Implemented ✅

1. **Supabase Client**
   - Parameterized queries by default
   - No raw SQL in application code

2. **RLS Policies**
   - Prevent unauthorized data access
   - Enforced at database level

**Example Safe Query:**
```typescript
// Safe - uses parameterized query
await supabase
  .from('ingredients')
  .select('*')
  .eq('user_id', userId);
```

**Unsafe Pattern (Not Used):**
```typescript
// Unsafe - NEVER do this
await supabase.rpc('raw_query', {
  query: `SELECT * FROM ingredients WHERE user_id = '${userId}'`
});
```

### Secrets Management

#### Implemented ✅

1. **Environment Variables**
   - Secrets stored in `.env` (not committed)
   - Validated at startup
   - Type-safe with Zod

2. **API Key Security**
   - Supabase anon key is public (safe by design)
   - RLS policies protect data
   - Service role key never exposed to client

#### Best Practices

- Never commit `.env` file
- Use `.env.example` for template
- Rotate keys if compromised
- Different keys per environment

**Example `.env`:**
```bash
# Public keys (safe to expose)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx (public key)

# Secret keys (NEVER commit or expose)
# These should only be in server environment
SUPABASE_SERVICE_ROLE_KEY=eyJxxx (keep secret!)
```

### Rate Limiting

#### Implemented ✅

1. **Supabase Built-in**
   - Auth endpoint rate limiting
   - Database connection limits

#### Planned 📋

- [ ] Custom rate limiting for AI endpoints
- [ ] Per-user request quotas
- [ ] IP-based throttling

### Data Protection

#### Implemented ✅

1. **Encryption at Rest**
   - PostgreSQL database encrypted (Supabase)
   - Automatic backups encrypted

2. **Encryption in Transit**
   - HTTPS enforced
   - TLS 1.2+ required
   - Managed by Supabase

3. **RLS Policies**
   - User data isolation
   - No cross-user data access

#### Planned 📋

- [ ] Field-level encryption for sensitive data
- [ ] Automatic PII detection and protection

### Dependency Security

#### Implemented ✅

1. **Automated Dependency Updates**
   - Dependabot configured
   - Weekly security updates

2. **Audit on Install**
   - npm audit runs automatically
   - Zero known vulnerabilities (as of Nov 2025)

#### Best Practices

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### Error Handling

#### Implemented ✅

1. **No Sensitive Information in Errors**
   - Generic error messages for users
   - Detailed errors only in console (dev mode)

2. **Error Boundaries**
   - React ErrorBoundary catches crashes
   - Graceful degradation
   - Located in `src/main.tsx:8-70`

**Example Safe Error:**
```typescript
// User sees: "Failed to load ingredients"
// Console logs: Full error with stack trace
catch (error) {
  console.error('Ingredient fetch error:', error);
  notify('Failed to load ingredients', { type: 'error' });
}
```

### Security Headers

#### Planned 📋

Recommended headers to implement:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Security Checklist

### For Developers

- [ ] Never commit secrets or API keys
- [ ] Validate all user inputs with Zod
- [ ] Use parameterized queries
- [ ] Check RLS policies on new tables
- [ ] Review error messages (no sensitive data)
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Run `npm audit` before releases

### For Code Review

- [ ] Input validation present
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Authentication checks in place
- [ ] Authorization (RLS) verified
- [ ] Error handling appropriate
- [ ] No secrets in code
- [ ] Secure defaults used

### For Deployment

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Database backups configured
- [ ] Monitoring enabled
- [ ] Incident response plan ready

## Common Vulnerabilities & Mitigations

### 1. Broken Authentication

**Risk:** Unauthorized access to user accounts

**Mitigations:**
- ✅ Strong password requirements
- ✅ Secure session management (Supabase)
- ✅ JWT-based authentication
- 📋 2FA (planned)
- 📋 Account lockout after failed attempts

### 2. Injection Attacks

**Risk:** SQL injection, XSS, command injection

**Mitigations:**
- ✅ Parameterized queries (Supabase)
- ✅ Input validation (Zod)
- ✅ React auto-escaping
- ✅ No raw SQL queries
- ✅ No `eval()` or `innerHTML`

### 3. Sensitive Data Exposure

**Risk:** Unauthorized access to user data

**Mitigations:**
- ✅ HTTPS only
- ✅ RLS policies
- ✅ Environment variable validation
- ✅ No secrets in client code
- ✅ Encrypted at rest and in transit

### 4. Broken Access Control

**Risk:** Users accessing other users' data

**Mitigations:**
- ✅ RLS on all tables
- ✅ User ID checks in queries
- ✅ AuthContext protects routes
- ✅ Server-side authorization

### 5. Security Misconfiguration

**Risk:** Default credentials, unnecessary features enabled

**Mitigations:**
- ✅ No default passwords
- ✅ Minimal dependencies
- ✅ Production mode in deployment
- 📋 Security headers (planned)
- 📋 Regular security audits

### 6. Cross-Site Scripting (XSS)

**Risk:** Malicious scripts injected into pages

**Mitigations:**
- ✅ React auto-escaping
- ✅ No `dangerouslySetInnerHTML`
- ✅ Input validation
- 📋 CSP headers (planned)

### 7. Insecure Deserialization

**Risk:** Arbitrary code execution

**Mitigations:**
- ✅ Zod validation for all external data
- ✅ Type checking with TypeScript
- ✅ No `eval()` usage

### 8. Using Components with Known Vulnerabilities

**Risk:** Exploitable dependencies

**Mitigations:**
- ✅ Dependabot weekly updates
- ✅ npm audit on install
- ✅ Regular dependency updates
- ✅ Zero known vulnerabilities (current)

### 9. Insufficient Logging & Monitoring

**Risk:** Attacks go undetected

**Current Status:**
- ✅ Error logging to console
- ✅ Web Vitals monitoring
- 📋 Centralized error tracking (Sentry, planned)
- 📋 Security event logging
- 📋 Alerting system

### 10. Server-Side Request Forgery (SSRF)

**Risk:** Server makes requests to internal resources

**Mitigations:**
- ✅ No user-controlled URLs in server requests
- ✅ Supabase handles server-side logic
- ✅ Edge functions validated

## Security Audit History

| Date | Auditor | Severity | Status |
|------|---------|----------|--------|
| Nov 2025 | Internal | Medium | ✅ Resolved |
| - | - | - | - |

## Security Contact

For security concerns, contact:

- **Email:** [Your security contact]
- **Response Time:** 48 hours
- **PGP Key:** [Optional: Link to PGP key]

## Acknowledgments

We thank the following security researchers:

- [Name] - [Vulnerability] - [Date]

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security](https://react.dev/learn/escape-hatches#security-pitfalls)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/security.html)

---

**Last Updated:** November 2025
**Next Review:** February 2026

# TaskForge Security & Encryption Model

TaskForge employs a strict, enterprise-grid security model.

## 1. Authentication Lifecycle

### Standards Used
- JWT (JSON Web Tokens)
- HttpOnly, Secure, SameSite cookies
- bcrypt (Bcrypt key derivation function)

### Flow
1. **Registration/Login**: User credentials sent via SSL/TLS.
2. **Password Hashing**: Stored using `bcrypt` (Salt round 10).
3. **Issuance**: Server symmetrically signs access and refresh tokens using `jose` with `HS256`.
4. **Storage**: Browsers receive the tokens *strictly* as HTTP-only secure cookies. They are completely invisible to `document.cookie` / XSS risks.
5. **Access**: Next.js Middleware intercepts the cookie, decrypts it on the Edge, evaluates Role-Based permissions, and forwards user ID headers (`x-user-id`) to the downstream internal API route.
6. **Refresh**: Automated API wrapper detects `401 Unauthorized` responses and silently requests `/api/auth/refresh` using the HTTP-only refresh cookie to renew the access session seamlessly.

## 2. Field-Level Data Encryption

To protect sensitive PII and confidential business data, TaskForge encrypts critical fields before data comes to rest in PostgreSQL.

### Standards Used
- AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode)
- 32-byte symmetric master key injected via environment variable `ENCRYPTION_KEY`.

### Mechanics
- **Initialization Vector (IV)**: A cryptographically secure 16-byte random IV is generated for *every single database write*.
- **Auth Tag**: GCM mode provides an authentication tag (16-bytes) to verify ciphertext integrity and prevent tampering.
- **Storage Format**: Encrypted strings are stored in the database as `iv:authTag:ciphertext`.
- **Fields Protected**: `Task.description`, `Attachment.metadata`.

### Benefits
Even in the event of a total database dump leak, the task descriptions remain entirely unreadable without the runtime `ENCRYPTION_KEY`.

## 3. Rate Limiting

To prevent brute force, DDoS, and excessive API abuse, TaskForge uses Edge Middleware rate limiting.
- **Limit**: 200 requests per 1-minute window per IP.
- **Enforcement**: Memory Map based Token Bucket algorithm evaluated directly on the Edge runtime.

## 4. Role-Based Access Control (RBAC) & Ownership

- Data silos are enforced via strict DB queries (`where: { userId: currentUserId }`).
- Administrative override logic is wired into the routes via standard `if (role === 'ADMIN')` blocks.
- **Audit Logging**: Any destructive action or status mutation generates an immutable Audit & Activity log detailing the WHO, WHAT, and WHEN.

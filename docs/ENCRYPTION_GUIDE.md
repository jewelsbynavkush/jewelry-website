# Encryption Guide

## Industry-Standard Encryption for Sensitive Data

This guide explains the encryption strategies implemented to protect sensitive data in transit and at rest.

## Overview

The application implements a **multi-layered encryption strategy** following industry best practices:

1. **HTTPS/TLS (Primary Layer)** - Encrypts all data in transit
2. **Field-Level Encryption (Defense in Depth)** - Additional encryption for extremely sensitive data
3. **Response Masking** - Prevents sensitive data exposure in API responses
4. **JWT Token Security** - Signed and optionally encrypted tokens

## 1. HTTPS/TLS Encryption (Primary Layer)

### Implementation

- **HSTS Header**: Enforced via `Strict-Transport-Security` header
- **CSP Upgrade**: `upgrade-insecure-requests` directive forces HTTPS
- **Production Enforcement**: HTTPS is enforced for all API requests in production

### Configuration

```typescript
// Automatically enforced in production
const securityResponse = applyApiSecurity(request, {
  enforceHttps: true, // Default: true in production
});
```

### What It Protects

- **All HTTP traffic** between client and server
- **Request bodies** (passwords, personal data, payment info)
- **Response bodies** (user data, tokens, sensitive information)
- **Headers** (authentication tokens, cookies)

## 2. Field-Level Encryption

### When to Use

Field-level encryption should be used for **extremely sensitive data** that requires defense-in-depth:

- Payment card numbers
- Social Security Numbers (SSN)
- Bank account numbers
- Medical records
- Highly sensitive PII

### Server-Side Encryption

```typescript
import { encryptField, decryptField, encryptFields, decryptFields } from '@/lib/security/encryption';

// Encrypt a single field
const encryptedPassword = encryptField('userPassword123');

// Decrypt a single field
const decryptedPassword = decryptField(encryptedPassword);

// Encrypt multiple fields in an object
const encryptedData = encryptFields(
  {
    email: 'user@example.com',
    phone: '+1234567890',
    ssn: '123-45-6789',
  },
  ['ssn'] // Only encrypt SSN
);

// Decrypt multiple fields
const decryptedData = decryptFields(encryptedData, ['ssn']);
```

### Client-Side Encryption (Browser)

```typescript
import { encryptClientData, isHttpsConnection } from '@/lib/client/encryption';

// Check HTTPS before encrypting
if (!isHttpsConnection()) {
  throw new Error('HTTPS required for encryption');
}

// Encrypt sensitive data before sending
const encryptedData = await encryptClientData('sensitive-value');
```

### Encryption Algorithm

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Key Source**: Derived from JWT secret
- **IV**: Random 128-bit IV per encryption
- **Authentication**: Built-in GCM authentication tag

## 3. Response Masking

### Purpose

Prevent sensitive data exposure in API responses, even if intercepted.

### Usage

```typescript
import { maskUserData, maskOrderData, maskSensitiveFields } from '@/lib/security/response-masking';

// Mask user data in response
const maskedUser = maskUserData({
  email: 'user@example.com',
  mobile: '+1234567890',
  password: 'hashed-password',
});
// Result: email and mobile are partially masked

// Mask order data
const maskedOrder = maskOrderData({
  paymentMethod: 'card',
  billingAddress: { /* ... */ },
});
// Result: payment and address data are masked

// Custom masking
const masked = maskSensitiveFields(
  { creditCard: '1234567890123456' },
  ['creditCard']
);
// Result: creditCard is masked
```

### Masking Patterns

- **Email**: `a***@example.com`
- **Phone**: `***-***-1234` (last 4 digits visible)
- **Card**: `**** **** **** 1234` (last 4 digits visible)
- **SSN**: `***-**-1234` (last 4 digits visible)
- **Default**: `ab***cd` (first 2 and last 2 characters visible)

## 4. Sensitive Fields Identification

### Automatically Masked Fields

The system automatically identifies and masks fields based on naming patterns:

- **Password fields**: `password`, `pwd`, `pass`
- **Email fields**: `email`, `e-mail`
- **Phone fields**: `phone`, `mobile`, `tel`
- **Card fields**: `card`, `credit`, `debit`, `number`
- **Token fields**: `token`, `secret`, `key`, `api_key`

### User-Sensitive Fields

```typescript
USER_SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'emailVerificationOTP',
  'resetToken',
  'resetTokenExpires',
  'lastLoginIP',
];
```

### Order-Sensitive Fields

```typescript
ORDER_SENSITIVE_FIELDS = [
  'paymentMethod',
  'paymentDetails',
  'billingAddress',
  'shippingAddress',
];
```

## 5. API Route Examples

### Example 1: Login Endpoint (Password Handling)

```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    enforceHttps: true, // Enforce HTTPS
    requireContentType: true,
  });
  
  const { email, password } = await request.json();
  
  // Password is already protected by HTTPS
  // No field-level encryption needed (bcrypt handles storage)
  
  // Response: Never return password
  return createSecureResponse({
    success: true,
    user: maskUserData(userData), // Mask sensitive fields
  });
}
```

### Example 2: Payment Processing (Field-Level Encryption)

```typescript
// app/api/payments/route.ts
import { decryptFields } from '@/lib/security/encryption';

export async function POST(request: NextRequest) {
  const securityResponse = applyApiSecurity(request, {
    enforceHttps: true, // Critical: HTTPS required
  });
  
  const body = await request.json();
  
  // Decrypt sensitive payment data
  const decryptedData = decryptFields(body, ['cardNumber', 'cvv']);
  
  // Process payment with decrypted data
  // ...
  
  // Response: Mask all payment data
  return createSecureResponse({
    success: true,
    paymentId: payment.id,
    // Never return card details
  });
}
```

### Example 3: User Profile (Response Masking)

```typescript
// app/api/users/profile/route.ts
import { maskUserData } from '@/lib/security/response-masking';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  const user = await User.findById(authResult.user.userId);
  
  // Mask sensitive data in response
  const maskedUser = maskUserData({
    email: user.email,
    mobile: user.mobile,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  
  return createSecureResponse(maskedUser);
}
```

## 6. Best Practices

### ✅ DO

1. **Always use HTTPS in production** - This is the primary encryption layer
2. **Mask sensitive data in responses** - Never expose full sensitive data
3. **Use field-level encryption for extremely sensitive data** - Payment cards, SSN, etc.
4. **Validate HTTPS before encryption** - Check `isHttps()` before encrypting
5. **Log encryption failures** - Monitor for encryption/decryption errors

### ❌ DON'T

1. **Don't encrypt everything** - HTTPS already encrypts all traffic
2. **Don't return sensitive data in responses** - Always mask or exclude
3. **Don't store encryption keys in code** - Use environment variables
4. **Don't use weak encryption** - Always use AES-256-GCM or stronger
5. **Don't skip HTTPS enforcement** - Always enforce in production

## 7. Security Layers Summary

| Layer | Technology | Protects | When to Use |
|-------|-----------|----------|-------------|
| **HTTPS/TLS** | TLS 1.2+ | All data in transit | Always (required) |
| **Field Encryption** | AES-256-GCM | Extremely sensitive fields | Payment cards, SSN, medical data |
| **Response Masking** | Pattern matching | API responses | All sensitive data in responses |
| **JWT Security** | Signed tokens | Authentication tokens | All authenticated requests |

## 8. Environment Variables

```env
# JWT Secret (used for encryption key derivation)
JWT_SECRET=your-secret-key-here

# HTTPS Enforcement
NODE_ENV=production # Enables HTTPS enforcement
```

## 9. Testing

### Development

- HTTPS enforcement is **disabled** in development
- Field encryption still works for testing
- Response masking is always active

### Production

- HTTPS enforcement is **enabled** automatically
- All sensitive endpoints require HTTPS
- Non-HTTPS requests are rejected with 403

## 10. Compliance

This encryption strategy supports compliance with:

- **PCI DSS** - Payment card data encryption
- **HIPAA** - Healthcare data encryption
- **GDPR** - Personal data protection
- **SOC 2** - Security controls

## Additional Resources

- [OWASP Encryption Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST Encryption Standards](https://csrc.nist.gov/publications/detail/sp/800-175b/rev-1/final)
- [TLS Best Practices](https://www.ssllabs.com/ssl-best-practices.html)

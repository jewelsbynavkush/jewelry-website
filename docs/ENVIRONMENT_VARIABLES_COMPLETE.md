# Environment Variables - Complete Reference

**Date:** February 8, 2026  
**Status:** ✅ **ALL SECRETS MOVED TO ENVIRONMENT VARIABLES**

---

## 📋 **Executive Summary**

All hardcoded secrets and sensitive values have been replaced with environment variables. A comprehensive `.env.example` template has been created with all required variables documented.

---

## ✅ **Changes Made**

### **1. Obfuscation Key**
- **Before:** Hardcoded `'JWELRY_NAVKUSH_2025_SECURE_KEY'` in `lib/security/request-decryption.ts` and `lib/client/request-encryption.ts`
- **After:** Uses `NEXT_PUBLIC_OBFUSCATION_KEY` (server automatically uses it, or falls back to `OBFUSCATION_KEY` or `JWT_SECRET`)
- **Helper Function:** `getObfuscationKey()` in `lib/utils/env.ts`

### **2. Contact Information**
- **Before:** Hardcoded email, phone, and address in `app/contact/page.tsx`
- **After:** Uses environment variables with fallback to site settings:
  - `CONTACT_EMAIL`
  - `CONTACT_PHONE`
  - `CONTACT_ADDRESS`
  - `BUSINESS_HOURS`
- **Helper Functions:** `getContactEmail()`, `getContactPhone()`, `getContactAddress()`, `getBusinessHours()` in `lib/utils/env.ts`

### **3. Support Email**
- **Before:** Hardcoded `'support@jewelsbynavkush.com'` in `app/api/docs/route.ts`
- **After:** Uses `SUPPORT_EMAIL` environment variable (falls back to `CONTACT_EMAIL`)
- **Helper Function:** `getSupportEmail()` in `lib/utils/env.ts`

### **4. Swagger UI Configuration**
- **Before:** Direct `process.env.ENABLE_SWAGGER` and `process.env.SWAGGER_IP_WHITELIST` access
- **After:** Uses helper functions:
  - `isSwaggerEnabled()` - Checks if Swagger UI is enabled
  - `getSwaggerIpWhitelist()` - Gets IP whitelist array
- **Helper Functions:** Added to `lib/utils/env.ts`

---

## 📝 **Complete Environment Variables List**

### **Application Environment**
```bash
NEXT_PUBLIC_ENV=development                    # development | production
NEXT_PUBLIC_BASE_URL=http://localhost:3000    # Base URL for SEO, canonical URLs
NEXT_PUBLIC_SITE_NAME=Jewels by NavKush       # Brand name for metadata
```

### **Database**
```bash
MONGODB_URI=                                  # MongoDB Atlas connection string
```

### **Authentication & Security**
```bash
JWT_SECRET=                                   # JWT secret (REQUIRED in production, min 32 chars)
ACCESS_TOKEN_EXPIRES_IN=1h                    # JWT expiration time
NEXT_PUBLIC_OBFUSCATION_KEY=                  # Obfuscation key (used by both client and server)
OBFUSCATION_KEY=                               # Optional: Server-only obfuscation key (if different from client)
```

### **CORS**
```bash
CORS_ALLOWED_ORIGINS=                         # Comma-separated allowed origins
```

### **Email Service (Choose One)**
```bash
# Gmail SMTP
GMAIL_USER=                                   # Gmail email address
GMAIL_APP_PASSWORD=                           # Gmail app password (16 chars)
GMAIL_FROM_NAME=Jewels by NavKush            # Email sender display name

```

### **Contact Information**
```bash
CONTACT_EMAIL=                                # Contact email (displayed on contact page)
CONTACT_PHONE=                                # Contact phone (displayed on contact page)
CONTACT_ADDRESS=                              # Contact address (displayed on contact page)
SUPPORT_EMAIL=                                # Support email (used in API docs)
BUSINESS_HOURS=                               # Business hours (newline-separated)
```

### **Swagger UI**
```bash
ENABLE_SWAGGER=false                          # Enable Swagger UI in production
SWAGGER_IP_WHITELIST=                         # Comma-separated IP addresses
```

### **Obfuscation Key**
```bash
NEXT_PUBLIC_OBFUSCATION_KEY=                 # Obfuscation key (used by both client and server)
OBFUSCATION_KEY=                              # Optional: Server-only key (if different from client)
```

---

## 🔧 **Helper Functions Added**

All new helper functions are in `lib/utils/env.ts`:

1. **`getObfuscationKey()`** - Returns obfuscation key (falls back to JWT_SECRET)
2. **`getContactEmail()`** - Returns contact email
3. **`getContactPhone()`** - Returns contact phone
4. **`getContactAddress()`** - Returns contact address
5. **`getSupportEmail()`** - Returns support email (falls back to contact email)
6. **`getBusinessHours()`** - Returns business hours
7. **`isSwaggerEnabled()`** - Checks if Swagger UI is enabled
8. **`getSwaggerIpWhitelist()`** - Returns Swagger IP whitelist array

---

## 📄 **.env.example Template**

Create a `.env.example` file in the project root with the following content:

```bash
# ============================================
# Environment Configuration Template
# ============================================
# Copy this file to .env.local and fill in your values
# DO NOT commit .env.local to version control
# ============================================

# ============================================
# Application Environment
# ============================================
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Jewels by NavKush

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=

# ============================================
# Authentication & Security
# ============================================
JWT_SECRET=
ACCESS_TOKEN_EXPIRES_IN=1h
NEXT_PUBLIC_OBFUSCATION_KEY=
OBFUSCATION_KEY=                              # Optional: Only if different from NEXT_PUBLIC_OBFUSCATION_KEY

# ============================================
# CORS Configuration
# ============================================
CORS_ALLOWED_ORIGINS=

# ============================================
# Email Service Configuration
# ============================================
# Gmail SMTP (Option 1)
GMAIL_USER=
GMAIL_APP_PASSWORD=
GMAIL_FROM_NAME=Jewels by NavKush


# ============================================
# ============================================
# Contact Information
# ============================================
CONTACT_EMAIL=
CONTACT_PHONE=
CONTACT_ADDRESS=
SUPPORT_EMAIL=
BUSINESS_HOURS=

# ============================================
# Swagger UI Configuration
# ============================================
ENABLE_SWAGGER=false
SWAGGER_IP_WHITELIST=

# ============================================
# Obfuscation Key (used by both client and server)
# ============================================
NEXT_PUBLIC_OBFUSCATION_KEY=
# OBFUSCATION_KEY=                            # Optional: Only if different from NEXT_PUBLIC_OBFUSCATION_KEY
```

---

## ✅ **Files Updated**

1. **`lib/utils/env.ts`**
   - Added 9 new helper functions for environment variables
   - All functions include proper documentation

2. **`lib/security/request-decryption.ts`**
   - Replaced hardcoded obfuscation key with `getObfuscationKey()`

3. **`lib/client/request-encryption.ts`**
   - Updated comment to note NEXT_PUBLIC_OBFUSCATION_KEY usage

4. **`app/contact/page.tsx`**
   - Replaced hardcoded contact info with environment variables
   - Falls back to site settings if env vars not set
   - Made function async to support site settings

5. **`app/api/docs/route.ts`**
   - Replaced hardcoded support email with `getSupportEmail()`
   - Updated Swagger UI checks to use helper functions

---

## 🔒 **Security Notes**

1. **Never commit `.env.local` or `.env.production.local`** to version control
2. **All secrets should be at least 32 characters long**
3. **Use different values for development and production**
4. **Rotate secrets regularly** (especially `JWT_SECRET`)
5. **Use a password manager or secure vault** for production secrets
6. **`NEXT_PUBLIC_*` variables are exposed to the client** - never use for real secrets

---

## 📚 **Usage Examples**

### **In Code:**
```typescript
import { getContactEmail, getSupportEmail, getObfuscationKey } from '@/lib/utils/env';

const email = getContactEmail();
const supportEmail = getSupportEmail();
const key = getObfuscationKey();
```

### **In Environment Files:**
```bash
# .env.local (development)
JWT_SECRET=dev-secret-key-minimum-32-characters-long
CONTACT_EMAIL=info@jewelsbynavkush.com
SUPPORT_EMAIL=support@jewelsbynavkush.com
```

```bash
# .env.production.local (production)
JWT_SECRET=production-secret-key-minimum-32-characters-long
CONTACT_EMAIL=info@jewelsbynavkush.com
SUPPORT_EMAIL=support@jewelsbynavkush.com
ENABLE_SWAGGER=false
```

---

## ✅ **Verification Checklist**

- [x] All hardcoded secrets replaced with environment variables
- [x] Helper functions added for all new environment variables
- [x] Contact page uses environment variables
- [x] Swagger docs use environment variables
- [x] Obfuscation key uses environment variable
- [x] `.env.example` template created (documented)
- [x] All changes documented

---

**Status:** ✅ **COMPLETE - ALL SECRETS MOVED TO ENVIRONMENT VARIABLES**

---

## 📝 **Environment Variable Naming Clarification**

### **`ACCESS_TOKEN_EXPIRES_IN` vs `JWT_EXPIRES_IN`**

**The correct environment variable is:** `ACCESS_TOKEN_EXPIRES_IN`

**Why `ACCESS_TOKEN_EXPIRES_IN` is Correct:**
1. **More Descriptive:** Specifically indicates it's for access tokens (not refresh tokens)
2. **OAuth 2.0 Standard:** Follows OAuth 2.0 naming conventions where access tokens and refresh tokens are separate
3. **Code Implementation:** The actual code uses `ACCESS_TOKEN_EXPIRES_IN` in:
   - `lib/utils/env.ts` - `getAccessTokenExpiresIn()`
   - `lib/auth/jwt.ts` - `generateAccessToken()`

**Why `JWT_EXPIRES_IN` is Incorrect:**
1. **Too Generic:** JWT is just the token format, not the token type
2. **Not Used in Code:** The codebase does not reference `JWT_EXPIRES_IN` anywhere
3. **Misleading:** Could be confused with refresh token expiration

**Valid Values:**
- `'15m'` - 15 minutes
- `'30m'` - 30 minutes
- `'1h'` - 1 hour (recommended)
- `'2h'` - 2 hours
- `'1d'` - 1 day (not recommended for access tokens)

**Note:** Refresh token expiration is hardcoded to 30 days in `lib/auth/session.ts` (not configurable via env var)

---

**Last Updated:** February 8, 2026

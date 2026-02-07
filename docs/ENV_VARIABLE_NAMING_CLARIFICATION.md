# Environment Variable Naming Clarification

**Date:** February 6, 2025  
**Status:** ✅ **CLARIFIED**

---

## 📋 **Issue: `ACCESS_TOKEN_EXPIRES_IN` vs `JWT_EXPIRES_IN`**

There was an inconsistency in the codebase where some documentation referenced `JWT_EXPIRES_IN` while the actual code uses `ACCESS_TOKEN_EXPIRES_IN`.

---

## ✅ **Correct Variable Name**

**The correct environment variable is:** `ACCESS_TOKEN_EXPIRES_IN`

### **Why `ACCESS_TOKEN_EXPIRES_IN` is Correct:**

1. **More Descriptive:** Specifically indicates it's for access tokens (not refresh tokens)
2. **OAuth 2.0 Standard:** Follows OAuth 2.0 naming conventions where access tokens and refresh tokens are separate
3. **Code Implementation:** The actual code uses `ACCESS_TOKEN_EXPIRES_IN` in:
   - `lib/utils/env.ts` - `getAccessTokenExpiresIn()`
   - `lib/auth/jwt.ts` - `generateAccessToken()`

### **Why `JWT_EXPIRES_IN` is Incorrect:**

1. **Too Generic:** JWT is just the token format, not the token type
2. **Not Used in Code:** The codebase does not reference `JWT_EXPIRES_IN` anywhere
3. **Misleading:** Could be confused with refresh token expiration

---

## 📝 **Usage**

### **In Code:**
```typescript
import { getAccessTokenExpiresIn } from '@/lib/utils/env';

const expiresIn = getAccessTokenExpiresIn(); // Returns '1h', '15m', etc.
```

### **In Environment Files:**
```bash
# .env.local
ACCESS_TOKEN_EXPIRES_IN=1h
```

### **Valid Values:**
- `'15m'` - 15 minutes
- `'30m'` - 30 minutes
- `'1h'` - 1 hour (recommended)
- `'2h'` - 2 hours
- `'1d'` - 1 day (not recommended for access tokens)

---

## 🔄 **Migration from `JWT_EXPIRES_IN`**

If you were using `JWT_EXPIRES_IN` in your environment files, update to `ACCESS_TOKEN_EXPIRES_IN`:

**Before:**
```bash
JWT_EXPIRES_IN=1h
```

**After:**
```bash
ACCESS_TOKEN_EXPIRES_IN=1h
```

---

## ✅ **Files Updated**

1. **`tests/setup.ts`** - Changed from `JWT_EXPIRES_IN` to `ACCESS_TOKEN_EXPIRES_IN`
2. **Documentation** - All references updated to use `ACCESS_TOKEN_EXPIRES_IN`

---

## 📚 **Related Environment Variables**

- **`ACCESS_TOKEN_EXPIRES_IN`** - Access token expiration (short-lived, 15m-1h recommended)
- **Refresh Token Expiration** - Hardcoded to 30 days in `lib/auth/session.ts` (not configurable via env var)

---

**Status:** ✅ **CLARIFIED - USE `ACCESS_TOKEN_EXPIRES_IN`**

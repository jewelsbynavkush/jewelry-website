# Obfuscation Keys Clarification: NEXT_PUBLIC_OBFUSCATION_KEY vs OBFUSCATION_KEY

**Date:** February 6, 2025  
**Status:** ✅ **MERGED - Use NEXT_PUBLIC_OBFUSCATION_KEY only**

---

## 📋 **Overview**

The codebase now supports using a single obfuscation key (`NEXT_PUBLIC_OBFUSCATION_KEY`) for both client-side and server-side operations. The server automatically uses `NEXT_PUBLIC_OBFUSCATION_KEY` if `OBFUSCATION_KEY` is not set.

---

## 🔑 **Key Differences**

| Aspect | `NEXT_PUBLIC_OBFUSCATION_KEY` | `OBFUSCATION_KEY` |
|--------|------------------------------|-------------------|
| **Location** | Client-side (browser) | Server-side (Node.js) |
| **Exposure** | ✅ Exposed to client bundle | ❌ Server-only, never exposed |
| **Usage** | Obfuscates data before sending | Deobfuscates data after receiving |
| **File** | `lib/client/request-encryption.ts` | `lib/security/request-decryption.ts` |
| **Function** | `obfuscateSensitiveValue()` | `deobfuscateSensitiveValue()` |
| **Security** | ⚠️ Visible in browser dev tools | ✅ Secure, server-only |
| **Required** | ✅ Required for client-side obfuscation | ✅ Required (or falls back to `JWT_SECRET`) |

---

## 🔄 **How They Work Together**

### **Flow:**

1. **Client-Side (Browser):**
   ```typescript
   // lib/client/request-encryption.ts
   // Uses NEXT_PUBLIC_OBFUSCATION_KEY
   const obfuscated = obfuscateSensitiveValue('password123');
   // Sends obfuscated value to server
   ```

2. **Server-Side (API):**
   ```typescript
   // lib/security/request-decryption.ts
   // Uses OBFUSCATION_KEY (or JWT_SECRET)
   const original = deobfuscateSensitiveValue(obfuscated);
   // Processes original value
   ```

### **Important:**
- Both keys must match for obfuscation/deobfuscation to work
- If keys don't match, the server cannot deobfuscate the data
- The server will fall back to treating the value as plain text if deobfuscation fails

---

## 🔒 **Security Considerations**

### **NEXT_PUBLIC_OBFUSCATION_KEY:**
- ⚠️ **Exposed to Client:** The `NEXT_PUBLIC_` prefix means this value is bundled into the client-side JavaScript
- ⚠️ **Visible in Dev Tools:** Anyone can view this value in browser dev tools or by inspecting the bundle
- ✅ **Purpose:** This is intentional - it's obfuscation, not encryption
- ✅ **Real Security:** HTTPS/TLS provides the actual encryption in transit

### **OBFUSCATION_KEY:**
- ✅ **Server-Only:** Never exposed to the client
- ✅ **Secure:** Only accessible on the server
- ✅ **Fallback:** Falls back to `JWT_SECRET` if not set
- ✅ **Validation:** Must be at least 32 characters if set

---

## 📝 **Configuration**

### **Option 1: Use Same Key (Recommended for Simplicity)**

```bash
# .env.local
OBFUSCATION_KEY=your-secure-obfuscation-key-minimum-32-characters-long
NEXT_PUBLIC_OBFUSCATION_KEY=your-secure-obfuscation-key-minimum-32-characters-long
```

**Pros:**
- Simple configuration
- Keys match automatically
- Easy to maintain

**Cons:**
- Client-side key is exposed (but this is expected for obfuscation)

### **Option 2: Use Different Keys (More Secure)**

```bash
# .env.local
OBFUSCATION_KEY=server-side-secure-key-minimum-32-characters-long
NEXT_PUBLIC_OBFUSCATION_KEY=client-side-key-minimum-32-characters-long
```

**Pros:**
- Different keys for client and server
- Server key remains secure even if client key is exposed

**Cons:**
- ⚠️ **Won't Work:** If keys don't match, deobfuscation will fail
- Server will treat values as plain text (backward compatibility)

**Note:** Currently, the code requires matching keys. Using different keys will cause deobfuscation to fail, and the server will fall back to treating values as plain text.

### **Option 3: Use JWT_SECRET as Fallback**

```bash
# .env.local
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
NEXT_PUBLIC_OBFUSCATION_KEY=your-jwt-secret-minimum-32-characters-long
```

**Pros:**
- Server uses `JWT_SECRET` as fallback (no need for separate `OBFUSCATION_KEY`)
- Only need to set `NEXT_PUBLIC_OBFUSCATION_KEY` explicitly

**Cons:**
- Client key is exposed (expected for obfuscation)
- Using JWT_SECRET for obfuscation is less ideal (should be separate)

---

## ⚠️ **Important Notes**

### **1. Obfuscation vs Encryption:**
- This is **obfuscation**, not encryption
- It makes data unreadable in network tab, but it's reversible
- **HTTPS/TLS provides the real encryption**
- This is defense-in-depth, not primary security

### **2. Client Exposure:**
- `NEXT_PUBLIC_OBFUSCATION_KEY` is intentionally exposed to the client
- This is expected behavior for client-side obfuscation
- The security model assumes the key can be seen
- Real security comes from HTTPS/TLS encryption

### **3. Key Matching:**
- For obfuscation/deobfuscation to work, keys must match
- If keys don't match, server will treat values as plain text (backward compatibility)
- This allows the system to work with both obfuscated and plain text values

### **4. Production Recommendations:**
- Use the same key for both (simplest)
- Ensure keys are at least 32 characters long
- Use different keys for development and production
- Rotate keys periodically (especially if compromised)

---

## 📚 **Code References**

### **Client-Side (Browser):**
```typescript
// lib/client/request-encryption.ts
function obfuscateSensitiveValue(value: string): string {
  const key = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_OBFUSCATION_KEY environment variable is not set');
  }
  // XOR obfuscation with key
  // Returns base64-encoded obfuscated value
}
```

### **Server-Side (API):**
```typescript
// lib/security/request-decryption.ts
export function deobfuscateSensitiveValue(obfuscatedValue: string): string {
  const { getObfuscationKey } = require('@/lib/utils/env');
  const key = getObfuscationKey(); // Uses OBFUSCATION_KEY or JWT_SECRET
  // XOR deobfuscation with key
  // Returns original plaintext value
}
```

### **Server-Side Helper:**
```typescript
// lib/utils/env.ts
export function getObfuscationKey(): string {
  // Priority 1: OBFUSCATION_KEY (server-only, if set)
  const obfuscationKey = process.env.OBFUSCATION_KEY;
  if (obfuscationKey) {
    return obfuscationKey;
  }
  // Priority 2: NEXT_PUBLIC_OBFUSCATION_KEY (can be used by both client and server)
  const publicObfuscationKey = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
  if (publicObfuscationKey) {
    return publicObfuscationKey;
  }
  // Priority 3: JWT_SECRET (final fallback)
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    return jwtSecret;
  }
  throw new Error('OBFUSCATION_KEY, NEXT_PUBLIC_OBFUSCATION_KEY, or JWT_SECRET must be set');
}
```

---

## ✅ **Recommended Configuration**

### **Simplified (Recommended):**
```bash
# .env.local
# Only set NEXT_PUBLIC_OBFUSCATION_KEY - server will use it automatically
NEXT_PUBLIC_OBFUSCATION_KEY=your-secure-obfuscation-key-minimum-32-characters-long
```

### **Alternative (If you want separate keys):**
```bash
# .env.local
# Server uses OBFUSCATION_KEY if set, otherwise falls back to NEXT_PUBLIC_OBFUSCATION_KEY
OBFUSCATION_KEY=server-only-key-minimum-32-characters-long
NEXT_PUBLIC_OBFUSCATION_KEY=client-key-minimum-32-characters-long
```

**Note:** For simplicity, just set `NEXT_PUBLIC_OBFUSCATION_KEY`. The server will automatically use it if `OBFUSCATION_KEY` is not set.

---

## 🔄 **Migration Guide**

### **Simplified Setup (Recommended):**

Just set `NEXT_PUBLIC_OBFUSCATION_KEY` - the server will use it automatically:

```bash
# .env.local
NEXT_PUBLIC_OBFUSCATION_KEY=your-secure-key-minimum-32-characters-long
```

### **If you're currently using both keys:**

You can now remove `OBFUSCATION_KEY` and just use `NEXT_PUBLIC_OBFUSCATION_KEY`:

```bash
# Before (both required)
OBFUSCATION_KEY=your-key
NEXT_PUBLIC_OBFUSCATION_KEY=your-key

# After (only one needed)
NEXT_PUBLIC_OBFUSCATION_KEY=your-key
```

---

## 📋 **Summary**

| Question | Answer |
|----------|--------|
| **Do I need both?** | No, just set `NEXT_PUBLIC_OBFUSCATION_KEY` |
| **Can I use only NEXT_PUBLIC_OBFUSCATION_KEY?** | Yes, server will use it automatically |
| **Is client key secure?** | No, it's exposed (but this is expected) |
| **Is server key secure?** | Yes, if using `OBFUSCATION_KEY` (server-only) |
| **What if keys don't match?** | Deobfuscation fails, server treats as plain text |
| **Can I skip client-side obfuscation?** | Yes, but sensitive data will be visible in network tab |

---

**Status:** ✅ **MERGED**

**Key Takeaway:** Just set `NEXT_PUBLIC_OBFUSCATION_KEY` - the server will automatically use it. No need to set both keys. The client key is intentionally exposed - real security comes from HTTPS/TLS.

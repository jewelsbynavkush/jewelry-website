# Swagger/OpenAPI API Documentation

**Interactive API documentation for all 29 endpoints**

---

## 📋 **Overview**

Complete Swagger/OpenAPI documentation has been created for all API endpoints:
- ✅ OpenAPI 3.0 specification
- ✅ Interactive Swagger UI
- ✅ All endpoints documented
- ✅ Request/response schemas
- ✅ Authentication details
- ✅ Error responses

---

## 🚀 **Access Documentation**

### **Option 1: Swagger UI (Interactive)**

Visit: **`http://localhost:3000/api/docs?ui=true`** (development)  
Or: **`https://yourdomain.com/api/docs?ui=true`** (production)

**Note:** Add `?ui=true` to see Swagger UI, or visit with browser (HTML request)

**Features:**
- ✅ Interactive API testing
- ✅ Try it out functionality
- ✅ Request/response examples
- ✅ Authentication support
- ✅ Schema validation

### **Option 2: OpenAPI JSON**

Get raw OpenAPI spec: **`/api/docs`**

**Example:**
```bash
curl http://localhost:3000/api/docs
```

**Use with:**
- Swagger Editor
- Postman (import OpenAPI)
- Insomnia (import OpenAPI)
- Other OpenAPI tools

---

## 📚 **What's Documented**

### **All API Endpoints:**

1. **Cart API** (5 endpoints)
   - GET /api/cart
   - POST /api/cart
   - DELETE /api/cart
   - PATCH /api/cart/{itemId}
   - DELETE /api/cart/{itemId}

2. **Orders API** (5 endpoints)
   - POST /api/orders
   - GET /api/orders
   - GET /api/orders/{orderId}
   - POST /api/orders/{orderId}/cancel

3. **Authentication API** (7 endpoints)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/verify-mobile
   - POST /api/auth/resend-otp
   - POST /api/auth/reset-password
   - POST /api/auth/reset-password/confirm

4. **User Profile API** (7 endpoints)
   - GET /api/users/profile
   - PATCH /api/users/profile
   - GET /api/users/addresses
   - POST /api/users/addresses
   - PATCH /api/users/addresses/{addressId}
   - DELETE /api/users/addresses/{addressId}
   - PATCH /api/users/password

5. **Products API** (2 endpoints)
   - GET /api/products
   - GET /api/products/{slug}

6. **Categories API** (1 endpoint)
   - GET /api/categories

---

## 🔐 **Authentication & Security**

### **Authentication in Swagger UI**

1. **Get JWT Token:**
   - Use `/api/auth/login` endpoint in Swagger UI
   - Copy the `token` from response

2. **Authorize:**
   - Click **"Authorize"** button (top right)
   - Enter: `Bearer <your-token>`
   - Click **"Authorize"**

3. **Test Protected Endpoints:**
   - All protected endpoints will now use your token
   - Token is included in `Authorization` header automatically

### **Security Configuration**

Swagger UI is protected by multiple security layers:

#### **1. Admin Authentication Required**
- Only users with `admin` role can access Swagger UI
- Uses JWT token authentication via `Authorization` header or HTTP-only cookie
- Returns `401 Unauthorized` if not authenticated
- Returns `403 Forbidden` if user is not an admin

#### **2. Production Environment Protection**
- Swagger UI is **disabled by default in production**
- To enable in production, set environment variable:
  ```bash
  ENABLE_SWAGGER=true
  ```
- **Warning:** Only enable in production if absolutely necessary and with additional protections

#### **3. IP Whitelisting (Optional)**
- Restrict access to specific IP addresses
- Set environment variable with comma-separated IPs:
  ```bash
  SWAGGER_IP_WHITELIST=192.168.1.100,10.0.0.50,203.0.113.42
  ```
- If not set, all authenticated admin users can access (after other checks)
- Supports proxy headers (`X-Forwarded-For`, `X-Real-IP`)

#### **4. Rate Limiting**
- 100 requests per minute per IP
- Prevents abuse and brute force attacks

#### **5. Security Headers**
- Custom CSP headers for Swagger UI
- Allows `unpkg.com` CDN resources (Swagger UI dependencies)
- All other security headers applied (HSTS, XSS protection, etc.)

### **Configuration**

Add to your `.env` or `.env.local`:

```bash
# Enable Swagger UI in production (default: disabled)
# Only set to 'true' if absolutely necessary
ENABLE_SWAGGER=false

# Optional: IP whitelist (comma-separated)
# If not set, all authenticated admin users can access
SWAGGER_IP_WHITELIST=192.168.1.100,10.0.0.50
```

### **Development vs Production**

**Development:**
- Swagger UI is accessible to authenticated admin users
- No IP whitelist required (unless set)
- Useful for API testing and documentation

**Production:**
- Swagger UI is **disabled by default**
- Must set `ENABLE_SWAGGER=true` to enable
- **Strongly recommended:** Use IP whitelisting in production
- Consider using VPN or private network access

### **Security Best Practices**

1. **Never expose Swagger UI publicly** without authentication
2. **Use IP whitelisting in production** to restrict access to office/VPN IPs
3. **Disable in production by default** - only enable when needed
4. **Rotate admin credentials regularly**
5. **Monitor access logs** for unauthorized access attempts
6. **Consider using a separate documentation server** for public API docs (without sensitive endpoints)

### **Troubleshooting**

**"Access denied from this IP address"**
- Check `SWAGGER_IP_WHITELIST` environment variable
- Verify your IP is in the whitelist
- Check proxy headers if behind a load balancer

**"API documentation is not available in production"**
- Set `ENABLE_SWAGGER=true` in production environment
- Ensure you understand the security implications

**"Admin access required"**
- Verify you're logged in as an admin user
- Check JWT token is valid and not expired
- Ensure user role is `admin` in database

---

## 📝 **Documentation Features**

### **For Each Endpoint:**

- ✅ **Summary & Description**
- ✅ **Request Parameters** (path, query, body)
- ✅ **Request Body Schema** (with examples)
- ✅ **Response Schemas** (success & error)
- ✅ **Authentication Requirements**
- ✅ **Rate Limiting Information**
- ✅ **Error Codes** (400, 401, 404, 429, 500)

### **Schemas Defined:**

- ✅ `Cart` - Shopping cart structure
- ✅ `Order` - Order structure
- ✅ `User` - User profile structure
- ✅ `Error` - Error response structure
- ✅ `Success` - Success response structure

---

## 🛠️ **Using with Other Tools**

### **Postman:**

1. Import OpenAPI spec:
   - File → Import
   - Select URL: `http://localhost:3000/api/docs`
   - Or paste JSON from `/api/docs`

2. All endpoints imported with:
   - Request examples
   - Response schemas
   - Authentication setup

### **Insomnia:**

1. Import OpenAPI:
   - Create → Import from URL
   - Enter: `http://localhost:3000/api/docs`

2. All endpoints available with full documentation

### **Swagger Editor:**

1. Visit: https://editor.swagger.io/
2. File → Import URL
3. Enter: `http://localhost:3000/api/docs`
4. Edit and validate your API spec

---

## 🔄 **Updating Documentation**

### **File Location:**

- **OpenAPI Spec & Swagger UI:** `app/api/docs/route.ts`
  - Returns JSON when `Accept: application/json`
  - Returns HTML (Swagger UI) when `Accept: text/html` or `?ui=true`

### **To Add New Endpoint:**

1. Edit `app/api/docs/route.ts`
2. Add endpoint to `paths` object
3. Define request/response schemas
4. Documentation updates automatically

### **Example:**

```typescript
'/new-endpoint': {
  get: {
    summary: 'Get something',
    description: 'Description here',
    tags: ['Tag Name'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
    },
  },
},
```

---

## ✅ **Status**

- ✅ OpenAPI 3.0 spec created
- ✅ Swagger UI page created
- ✅ All 29 endpoints documented
- ✅ Authentication documented
- ✅ Error responses documented
- ✅ Request/response schemas defined
- ✅ Examples provided

---

## 📚 **Related Documentation**

- [API Guide](./API_GUIDE.md) - Complete API documentation including quick reference
- [API Guide](./API_GUIDE.md) - Complete API documentation

---

**Last Updated:** January 2025  
**Access:** `/api/docs` (Swagger UI page and OpenAPI JSON)

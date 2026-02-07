# Swagger UI Security Configuration

## Overview

Swagger UI is protected by multiple security layers to prevent unauthorized access to API documentation.

## Security Measures

### 1. **Admin Authentication Required**
- Only users with `admin` role can access Swagger UI
- Uses JWT token authentication via `Authorization` header or HTTP-only cookie
- Returns `401 Unauthorized` if not authenticated
- Returns `403 Forbidden` if user is not an admin

### 2. **Production Environment Protection**
- Swagger UI is **disabled by default in production**
- To enable in production, set environment variable:
  ```bash
  ENABLE_SWAGGER=true
  ```
- **Warning:** Only enable in production if absolutely necessary and with additional protections

### 3. **IP Whitelisting (Optional)**
- Restrict access to specific IP addresses
- Set environment variable with comma-separated IPs:
  ```bash
  SWAGGER_IP_WHITELIST=192.168.1.100,10.0.0.50,203.0.113.42
  ```
- If not set, all authenticated admin users can access (after other checks)
- Supports proxy headers (`X-Forwarded-For`, `X-Real-IP`)

### 4. **Rate Limiting**
- 100 requests per minute per IP
- Prevents abuse and brute force attacks

### 5. **Security Headers**
- Custom CSP headers for Swagger UI
- Allows `unpkg.com` CDN resources (Swagger UI dependencies)
- All other security headers applied (HSTS, XSS protection, etc.)

## Configuration

### Environment Variables

Add to your `.env` or `.env.local`:

```bash
# Enable Swagger UI in production (default: disabled)
# Only set to 'true' if absolutely necessary
ENABLE_SWAGGER=false

# Optional: IP whitelist (comma-separated)
# If not set, all authenticated admin users can access
SWAGGER_IP_WHITELIST=192.168.1.100,10.0.0.50
```

### Development vs Production

**Development:**
- Swagger UI is accessible to authenticated admin users
- No IP whitelist required (unless set)
- Useful for API testing and documentation

**Production:**
- Swagger UI is **disabled by default**
- Must set `ENABLE_SWAGGER=true` to enable
- **Strongly recommended:** Use IP whitelisting in production
- Consider using VPN or private network access

## Access

1. **Authenticate as Admin:**
   ```bash
   POST /api/auth/login
   {
     "identifier": "admin@example.com",
     "password": "your-password"
   }
   ```

2. **Access Swagger UI:**
   - Browser: Navigate to `/api/docs?ui=true`
   - Or: `/api/docs` with `Accept: text/html` header

3. **Get OpenAPI JSON:**
   ```bash
   GET /api/docs
   Authorization: Bearer <admin-token>
   Accept: application/json
   ```

## Best Practices

1. **Never expose Swagger UI publicly** without authentication
2. **Use IP whitelisting in production** to restrict access to office/VPN IPs
3. **Disable in production by default** - only enable when needed
4. **Rotate admin credentials regularly**
5. **Monitor access logs** for unauthorized access attempts
6. **Consider using a separate documentation server** for public API docs (without sensitive endpoints)

## Security Checklist

- [x] Admin authentication required
- [x] Production disabled by default
- [x] Optional IP whitelisting
- [x] Rate limiting
- [x] Security headers (CSP, HSTS, etc.)
- [x] JWT token validation
- [x] User role verification

## Troubleshooting

### "Access denied from this IP address"
- Check `SWAGGER_IP_WHITELIST` environment variable
- Verify your IP is in the whitelist
- Check proxy headers if behind a load balancer

### "API documentation is not available in production"
- Set `ENABLE_SWAGGER=true` in production environment
- Ensure you understand the security implications

### "Admin access required"
- Verify you're logged in as an admin user
- Check JWT token is valid and not expired
- Ensure user role is `admin` in database

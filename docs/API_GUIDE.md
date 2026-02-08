# API Documentation - Complete Guide

**Date:** January 2026  
**Status:** ✅ **ALL APIs IMPLEMENTED**

---

## 📋 **Overview**

Complete guide to all API endpoints, including authentication, security, request/response formats, and Swagger documentation.

---

## 🚀 **Quick Access**

- **Swagger UI:** `http://localhost:3000/api/docs?ui=true`
- **OpenAPI JSON:** `http://localhost:3000/api/docs`

---

## ✅ **API Endpoints (29 Total)**

### **Authentication APIs (7 endpoints)**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-mobile` - Mobile OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset

### **Cart APIs (4 endpoints)**
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/[itemId]` - Update item quantity
- `DELETE /api/cart/[itemId]` - Remove item
- `DELETE /api/cart` - Clear cart

### **Order APIs (3 endpoints)**
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/[orderId]` - Get order details
- `PATCH /api/orders/[orderId]` - Update order status (admin)
- `POST /api/orders/[orderId]/cancel` - Cancel order

### **User Profile APIs (7 endpoints)**
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/addresses` - List addresses
- `POST /api/users/addresses` - Add address
- `PATCH /api/users/addresses/[addressId]` - Update address
- `DELETE /api/users/addresses/[addressId]` - Delete address
- `PATCH /api/users/password` - Change password

### **Product APIs (2 endpoints)**
- `GET /api/products` - List products
- `GET /api/products/[slug]` - Get product by slug

### **Category APIs (1 endpoint)**
- `GET /api/categories` - List active categories

### **Inventory APIs (4 endpoints)**
- `GET /api/inventory/[productId]` - Get inventory status
- `POST /api/inventory/[productId]/restock` - Restock product (admin)
- `GET /api/inventory/logs` - Get inventory logs (admin)
- `GET /api/inventory/low-stock` - Get low stock alerts (admin)

### **Other APIs (2 endpoints)**
- `GET /api/site-settings` - Get site settings
- `POST /api/contact` - Submit contact form

---

## 🔐 **Security**

### **All APIs Include:**
- ✅ CORS protection
- ✅ CSRF protection (state-changing operations)
- ✅ Rate limiting
- ✅ Security headers
- ✅ Input validation (Zod)
- ✅ Input sanitization

### **Authentication:**
- ✅ JWT tokens (5-minute expiration)
- ✅ HTTP-only cookies
- ✅ Secure session management

**See:** `SWAGGER_API_DOCUMENTATION.md` for detailed security and API documentation. For adding or changing APIs, use the checklist in `BACKEND_STANDARDS.md`.

---

## 📝 **Request/Response Format**

### **Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    { "field": "fieldName", "message": "Validation error" }
  ]
}
```

### **Type Definitions:**
All request/response types defined in `types/api.ts`

---

## 📝 **Request/Response Examples**

### **Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "mobile": "9876543210",
  "countryCode": "+91",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### **Add to Cart**
```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

### **Create Order**
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India",
    "phone": "9876543210"
  },
  "billingAddress": { ... },
  "paymentMethod": "cod",
  "customerNotes": "Please deliver before 5 PM"
}
```

## 🔐 **Authentication**

Most endpoints require authentication via:
- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `auth-token` (set automatically)

**Public Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`
- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/categories`
- `GET /api/site-settings`

## 📚 **Additional Documentation**

- **Swagger Documentation:** `SWAGGER_API_DOCUMENTATION.md`

---

**Last Updated:** January 2026  

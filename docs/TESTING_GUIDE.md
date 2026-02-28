# Testing Guide - Complete Test Architecture

**Status:** ✅ Test Infrastructure Setup Complete

---

## 📋 **Table of Contents**

1. [Test Architecture Overview](#test-architecture-overview)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Model Tests](#model-tests)
6. [API Tests](#api-tests)
7. [Integration Tests](#integration-tests)
8. [Test Coverage](#test-coverage)
9. [Best Practices](#best-practices)

---

## 🏗️ **Test Architecture Overview**

### **Testing Stack:**
- **Vitest** - Fast, modern test runner (Jest alternative)
- **MongoDB Memory Server** - In-memory database for testing
- **TypeScript** - Full type safety in tests
- **Test Utilities** - Reusable helpers and factories

### **Test Types:**
1. **Unit Tests** - Model methods, utilities, helpers
2. **API Tests** - Endpoint testing with mocked requests
3. **Integration Tests** - Full flow testing (e.g., order creation)
4. **Edge Case Tests** - Boundary conditions, error handling

---

## 🚀 **Test Setup**

### **Install Dependencies:**

```bash
cd jewelry-website
npm install --save-dev vitest @vitest/ui mongodb-memory-server
```

### **Environment Variables:**

Create `.env.test`:
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test
JWT_SECRET=test-jwt-secret-key-for-testing-only
ACCESS_TOKEN_EXPIRES_IN=1h
```

---

## ▶️ **Running Tests**

### **Run All Tests:**
```bash
npm test
```

### **Run Tests in Watch Mode:**
```bash
npm run test:watch
```

### **Run Tests with Coverage:**
```bash
npm run test:coverage
```

### **Run Tests with UI:**
```bash
npm run test:ui
```

### **Run Specific Test File:**
```bash
npm test tests/models/Product.test.ts
```

### **Run Tests Matching Pattern:**
```bash
npm test -- --grep "Product Model"
```

---

## 📁 **Test Structure**

```
tests/
├── setup.ts                    # Test environment setup
├── helpers/
│   ├── test-utils.ts          # Factory functions, test data generators
│   └── api-helpers.ts          # API request builders, response validators
├── models/
│   ├── Product.test.ts        # Product model tests
│   ├── User.test.ts           # User model tests
│   ├── Order.test.ts          # Order model tests
│   ├── Cart.test.ts           # Cart model tests
│   ├── Category.test.ts        # Category model tests
│   ├── InventoryLog.test.ts   # InventoryLog model tests
│   └── SiteSettings.test.ts   # SiteSettings model tests
├── api/
│   ├── auth/
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   ├── logout.test.ts
│   │   ├── verify-mobile.test.ts
│   │   └── reset-password.test.ts
│   ├── cart/
│   │   ├── route.test.ts
│   │   └── [itemId].test.ts
│   ├── orders/
│   │   ├── route.test.ts
│   │   ├── [orderId].test.ts
│   │   └── [orderId]/cancel.test.ts
│   ├── users/
│   │   ├── profile.test.ts
│   │   ├── addresses.test.ts
│   │   └── password.test.ts
│   └── inventory/
│       ├── [productId].test.ts
│       └── logs.test.ts
└── integration/
    ├── checkout-flow.test.ts
    ├── order-lifecycle.test.ts
    └── inventory-management.test.ts
```

### Mocking and test data

Tests use **mocked data access** and a **local in-memory database** (MongoDB Memory Server). They do not call the real database.

- **`tests/setup.ts`:** Imports mocks first (`database-mocks`, `address-validation-mocks`, `external-services-mocks`), then starts MongoDB Memory Server and connects Mongoose to it.
- **`tests/helpers/mocks/database-mocks.ts`:** Mocks getCategories, getDefaultCountry, getSiteSettings, and related helpers so API/model tests get consistent test data.
- **`tests/helpers/mocks/address-validation-mocks.ts`:** Mocks address validation (isValidPincode, createAddressSchema, etc.) with mocked country settings.
- **`tests/helpers/mocks/external-services-mocks.ts`:** Mocks all outbound external services (e.g. email/Gmail). **Always mock external services in tests** – never call real SMTP, payment gateways, or third-party APIs.
- **`tests/helpers/test-setup-helpers.ts`:** setupTestCountry(), setupTestCategories(), setupTestData() for populating the in-memory DB when needed.

Model operations (create, save, find) run against the in-memory DB; data access from lib (categories, site settings, country) is mocked so tests are fast and deterministic.

---

## 🧪 **Model Tests**

### **Test Coverage:**

Each model test covers:
- ✅ Schema validation (required fields, types, constraints)
- ✅ Unique constraints
- ✅ Virtual properties
- ✅ Instance methods
- ✅ Static methods
- ✅ Pre-save/post-save hooks
- ✅ Edge cases (null, undefined, invalid data)
- ✅ Concurrent operations (race conditions)

### **Example: Product Model Tests**

```typescript
describe('Product Model', () => {
  describe('Schema Validation', () => {
    it('should create a product with valid data', async () => {
      // Test valid creation
    });

    it('should require slug', async () => {
      // Test required field
    });

    it('should enforce unique slug', async () => {
      // Test unique constraint
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate availableQuantity correctly', async () => {
      // Test virtual property
    });
  });

  describe('Static Methods - Stock Management', () => {
    it('should reserve stock atomically', async () => {
      // Test atomic operation
    });
  });
});
```

---

## 🔌 **API Tests**

### **Test Coverage:**

Each API test covers:
- ✅ Successful requests
- ✅ Validation errors (missing fields, invalid formats)
- ✅ Authentication/authorization
- ✅ Business logic (stock checks, duplicate prevention)
- ✅ Security (CORS, CSRF, rate limiting)
- ✅ Error handling
- ✅ Edge cases

### **Example: Cart API Tests**

```typescript
describe('POST /api/cart', () => {
  it('should add item to cart for authenticated user', async () => {
    const request = createAuthenticatedRequest(
      userId,
      mobile,
      'customer',
      'POST',
      'http://localhost:3000/api/cart',
      { productId, quantity: 2 }
    );

    const response = await POST(request);
    const data = await getJsonResponse(response);

    expectStatus(response, 200);
    expectSuccess(data);
  });

  it('should reject insufficient stock', async () => {
    // Test stock validation
  });
});
```

---

## 🔗 **Integration Tests**

### **Test Complete Flows:**

1. **Checkout Flow:**
   - Add to cart → Checkout → Create order → Update stock

2. **Order Lifecycle:**
   - Create order → Confirm → Ship → Deliver → Cancel

3. **Inventory Management:**
   - Restock → Reserve → Confirm sale → Log changes

---

## 📊 **Test Coverage Goals**

- **Models:** 100% coverage
- **API Routes:** 95%+ coverage
- **Business Logic:** 100% coverage
- **Edge Cases:** All critical paths covered

---

## ✅ **Best Practices**

### **1. Test Isolation:**
- Each test is independent
- Database is cleared before each test
- No shared state between tests

### **2. Test Data:**
- Use factory functions for test data
- Generate unique data for each test
- Clean up after tests

### **3. Assertions:**
- Test both success and failure cases
- Verify data integrity
- Check side effects

### **4. Edge Cases:**
- Null/undefined values
- Empty arrays/strings
- Boundary values
- Concurrent operations
- Invalid input formats

### **5. Security Testing:**
- Authentication required
- Authorization checks
- Input validation
- SQL injection prevention
- XSS prevention

### **6. Mock external services:**
- Never call real external services in tests (email/SMTP, payment APIs, SMS, etc.).
- Global mocks for email live in `tests/helpers/mocks/external-services-mocks.ts`.
- When adding new outbound services, add a mock in that file (or a new mock file) and import it in `tests/setup.ts`.

---

## 📝 **Writing New Tests**

### **Model Test Template:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Model from '@/models/Model';
import { createTestModel } from '../helpers/test-utils';

describe('Model Tests', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Schema Validation', () => {
    it('should create with valid data', async () => {
      // Test
    });
  });
});
```

### **API Test Template:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/endpoint/route';
import { createAuthenticatedRequest, getJsonResponse, expectStatus } from '../../helpers/api-helpers';

describe('POST /api/endpoint', () => {
  it('should handle request', async () => {
    const request = createAuthenticatedRequest(userId, mobile, 'customer', 'POST', url, body);
    const response = await POST(request);
    const data = await getJsonResponse(response);
    
    expectStatus(response, 200);
  });
});
```

---

## 🎯 **Test Checklist**

### **Model Tests:**
- [ ] Schema validation
- [ ] Required fields
- [ ] Unique constraints
- [ ] Virtual properties
- [ ] Instance methods
- [ ] Static methods
- [ ] Hooks (pre-save, post-save)
- [ ] Edge cases

### **API Tests:**
- [ ] Successful requests
- [ ] Validation errors
- [ ] Authentication
- [ ] Authorization
- [ ] Business logic
- [ ] Security checks
- [ ] Error handling
- [ ] Edge cases

---

## 📚 **Related Documentation**

- [API Guide](./API_GUIDE.md) - Complete API documentation including quick reference
- [Models Guide](./MODELS_GUIDE.md)
- [API Guide](./API_GUIDE.md)

---

**Last Updated:** January 2026  
**Test Framework:** Vitest 2.1.8  
**Coverage Target:** 95%+

# Environment Variables Setup

**Quick guide to add environment variables to all environment files (JWT, Fast2SMS, etc.).**

---

## 📋 **Environment Variables Required**

```bash
# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

**Notes:**
- `JWT_EXPIRES_IN=5m` means tokens expire after 5 minutes
- `FAST2SMS_API_KEY` - Get from Fast2SMS dashboard after signup. No DLT registration required for Quick SMS route.
- `GMAIL_USER` - Your Gmail address (e.g., your-email@gmail.com)
- `GMAIL_APP_PASSWORD` - Gmail App Password (16 characters). Generate from Google Account → Security → 2-Step Verification → App passwords
- `GMAIL_FROM_NAME` - Optional, defaults to "Jewels by NavKush"

---

## 🔧 **Files to Update**

### **1. `.env.local`** (Local Development)

Add these lines:

```bash
# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

### **2. `.env.development.local`** (Development Environment)

Add these lines:

```bash
# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

### **3. `.env.production.local`** (Production Environment)

Add these lines:

```bash
# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

**⚠️ Important:** Use a **different** `JWT_SECRET` for production than development!

### **4. `.env.example`** (Template - Commit to Git)

Add these lines:

```bash
# JWT Authentication
JWT_SECRET=
JWT_EXPIRES_IN=5m
```

---

## 🔐 **Generating a Secure JWT_SECRET**

### **Option 1: Using Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Option 2: Using OpenSSL**

```bash
openssl rand -hex 64
```

### **Option 3: Online Generator**

Use a secure random string generator (at least 32 characters, preferably 64+).

---

## 📝 **Complete Example Files**

### **`.env.local`** (Complete)

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@dev-cluster.mongodb.net/jewelry-website-dev?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Zoho Mail (optional)
ZOHO_MAIL_API_KEY=your_mail_key

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

### **`.env.development.local`** (Complete)

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=https://dev2026.jewelsbynavkush.com

# MongoDB Atlas (Dev)
MONGODB_URI=mongodb+srv://username:password@dev-cluster.mongodb.net/jewelry-website-dev?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# Zoho Mail (Dev)
ZOHO_MAIL_API_KEY=your_dev_mail_key
```

### **`.env.production.local`** (Complete)

```bash
# Environment
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://jewelsbynavkush.com

# MongoDB Atlas (Prod)
MONGODB_URI=mongodb+srv://username:password@prod-cluster.mongodb.net/jewelry-website-prod?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-different-secure-random-secret-key-for-production
JWT_EXPIRES_IN=5m

# Zoho Mail (Prod)
ZOHO_MAIL_API_KEY=your_prod_mail_key
```

### **`.env.example`** (Complete Template)

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=

# JWT Authentication
JWT_SECRET=
JWT_EXPIRES_IN=5m

# Zoho Mail
ZOHO_MAIL_API_KEY=

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=

# Gmail Email Service
GMAIL_USER=
GMAIL_APP_PASSWORD=
GMAIL_FROM_NAME=Jewels by NavKush
```

---

## 🚀 **Vercel Environment Variables**

### **Development Project**

1. Go to Vercel dev project → **Settings** → **Environment Variables**
2. Add:
   - `JWT_SECRET` = `your-secure-random-secret-key-change-in-production`
   - `JWT_EXPIRES_IN` = `5m`
   - `FAST2SMS_API_KEY` = `your_fast2sms_api_key`
   - `GMAIL_USER` = `your-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_app_password`
   - `GMAIL_FROM_NAME` = `Jewels by NavKush` (optional)
3. Select environments: **Production, Preview, Development**

### **Production Project**

1. Go to Vercel prod project → **Settings** → **Environment Variables**
2. Add:
   - `JWT_SECRET` = `your-different-secure-random-secret-key-for-production`
   - `JWT_EXPIRES_IN` = `5m`
   - `FAST2SMS_API_KEY` = `your_fast2sms_api_key`
   - `GMAIL_USER` = `your-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_app_password`
   - `GMAIL_FROM_NAME` = `Jewels by NavKush` (optional)
3. Select environments: **Production, Preview, Development**

**⚠️ Important:** Use **different** `JWT_SECRET` values for dev and prod!

---

## ✅ **Verification**

After adding the variables:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Test authentication:**
   - Try registering a user
   - Try logging in
   - Check that tokens are generated

3. **Check token expiration:**
   - Login and get a token
   - Wait 5 minutes
   - Try using the token - it should be expired

---

## 📚 **Related Documentation**

- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md)
- [API Guide](./API_GUIDE.md)
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md)

---

**Last Updated:** January 2025

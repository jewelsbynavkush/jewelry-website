# Email Setup Guide - Gmail & Zoho Mail

**Complete guide for setting up email services for the jewelry website.**

---

## 📋 **Table of Contents**

1. [Gmail Setup (Free)](#gmail-setup-free)
2. [Zoho Mail Setup (Business Email)](#zoho-mail-setup-business-email)
3. [Environment Variables](#environment-variables)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## 📧 **Gmail Setup (Free)**

### **Quick Setup - Just 3 Steps!**

#### **Step 1: Enable 2-Step Verification**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Follow the setup process

#### **Step 2: Generate App Password**
1. Go to [Google Account → Security → 2-Step Verification](https://myaccount.google.com/security)
2. Scroll down to **App passwords**
3. Click **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter name: "Jewels by NavKush"
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### **Step 3: Add to Environment Variables**
Add this to your `.env.local` file:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
GMAIL_FROM_NAME=Jewels by NavKush
```

**That's it!** No API keys, no complex setup. Just your Gmail account.

### **How Gmail Works**

The code automatically:
- ✅ Sends OTP emails when users register
- ✅ Sends OTP emails when users request resend
- ✅ Sends OTP emails when users update their email
- ✅ Handles errors gracefully
- ✅ Works in development (logs email to console)

### **Gmail Limitations**

- **Daily Limits**: Gmail allows ~500 emails/day for free accounts
- **Security**: App passwords are safer than using your main password
- **2FA Required**: You must enable 2-Step Verification to generate app passwords

---

## 📧 **Zoho Mail Setup (Business Email)**

For professional business email addresses (e.g., support@jewelsbynavkush.com), use Zoho Mail.

### **Free Tier Details**

- ✅ **5 free email accounts** per domain
- ✅ **5GB storage** per account
- ✅ **25MB attachment** limit
- ✅ **Webmail interface**
- ✅ **Mobile apps** (iOS & Android)
- ✅ **IMAP/POP3** support
- ✅ **Email forwarding**

### **Setup Steps**

See **[Zoho Mail Setup Guide](./ZOHO_MAIL_SETUP.md)** for complete setup instructions.

### **Zoho Mail API Key**

After setting up Zoho Mail, generate an API key:

1. Go to [Zoho Mail API Console](https://api-console.zoho.com/)
2. Create a new API key
3. Add to environment variables:

```env
ZOHO_MAIL_API_KEY=your_zoho_api_key
```

---

## 🔧 **Environment Variables**

### **Gmail Configuration**

```env
# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
```

### **Zoho Mail Configuration**

```env
# Zoho Mail API (for business emails)
ZOHO_MAIL_API_KEY=your_zoho_api_key
```

### **Important Notes**

- **App Password**: Use the 16-character app password, NOT your regular Gmail password
- **2FA Required**: You must enable 2-Step Verification to generate app passwords
- **Security**: App passwords are safer than using your main password

---

## 🧪 **Testing**

### **Test Gmail Setup**

1. Register a new user with email
2. Check your email inbox for OTP
3. Verify OTP works correctly
4. Done! 🎉

### **Test Zoho Mail Setup**

1. Send a test email using Zoho Mail API
2. Verify email is received
3. Check email formatting and content

---

## 🔧 **Troubleshooting**

### **Gmail Issues**

#### **Error: "Invalid login"**
- **Solution**: Make sure you're using the App Password, not your regular password
- Verify 2-Step Verification is enabled

#### **Error: "Less secure app access"**
- **Solution**: Use App Password instead (more secure)
- App passwords bypass "less secure app" restrictions

#### **Emails not received**
- Check spam folder
- Verify GMAIL_USER and GMAIL_APP_PASSWORD are correct
- Check Gmail account for security alerts
- Verify daily sending limit hasn't been reached

### **Zoho Mail Issues**

See **[Zoho Mail Setup Guide](./ZOHO_MAIL_SETUP.md)** troubleshooting section.

---

## 📝 **Summary**

**For Development/Testing:**
- ✅ Use **Gmail** (free, easy setup, 500 emails/day)

**For Production:**
- ✅ Use **Zoho Mail** (professional business emails, 5 free accounts)

**Both services are free and work perfectly for the jewelry website!**

---

**Last Updated:** January 2025

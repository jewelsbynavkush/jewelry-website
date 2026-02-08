# Email Setup Guide - Gmail & Zoho Mail

**Complete guide for setting up email services for the jewelry website.**

---

## 📋 **Table of Contents**

1. [Gmail Setup (Free)](#gmail-setup-free)
2. [Zoho Mail (business / custom domain)](#zoho-mail-business--custom-domain)
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

## 📧 **Zoho Mail (business / custom domain)**

Use Zoho Mail for professional addresses on your own domain (e.g. support@jewelsbynavkush.com).

**Forever Free plan:** Up to 5 users, 5GB per user, webmail, mobile apps, IMAP/POP3, custom domain.

**Prerequisites:** Domain name, access to DNS (registrar or hosting), Zoho account.

**Steps (summary):**

1. **Sign up:** [mail.zoho.com](https://mail.zoho.com) → Forever Free Plan → enter your domain.
2. **Verify domain:** Add the TXT (or CNAME) record Zoho provides to your DNS; wait 5–30 min; click Verify in Zoho.
3. **Configure DNS for email:** Add MX records (e.g. mx.zoho.com priority 10, mx2.zoho.com priority 20), SPF TXT (`v=spf1 include:zoho.com ~all`), and optionally DKIM/DMARC as shown in Zoho’s domain authentication.
4. **Create mailboxes:** In Zoho Mail admin, create user accounts (e.g. support@, info@).
5. **Use in app:** For sending via SMTP from the app, use Zoho’s SMTP settings and an app-specific password if required; or keep using Gmail for OTP/transactional and use Zoho only for receiving/support.

For detailed DNS screenshots and step-by-step, see [Zoho Mail Help](https://www.zoho.com/mail/help/).

---

## 🔧 **Environment Variables**

### **Gmail Configuration**

```env
# Gmail Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush
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


---

## 📝 **Summary**

**For Development/Testing:**
- ✅ Use **Gmail** (free, easy setup, 500 emails/day)

**For Production:** Gmail (OTP/transactional) or Zoho (custom-domain addresses); both free. Use Zoho for support@/info@ and Gmail for app-generated emails if preferred.

---

**Last Updated:** January 2026

# Email Setup Guide - Gmail & Zoho Mail

**Complete guide for setting up email services for the jewelry website.**

---

## 📋 **Table of Contents**

1. [Gmail Setup (Free)](#gmail-setup-free)
2. [Environment Variables](#environment-variables)
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

**For Production:**

**Both services are free and work perfectly for the jewelry website!**

---

**Last Updated:** January 2026

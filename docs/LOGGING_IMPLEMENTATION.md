# Centralized Logging Implementation

This document describes the centralized logging system implemented across the entire application.

## Overview

All logging throughout the application now uses a centralized logger utility (`lib/utils/logger.ts`) for consistent formatting, log levels, and behavior across all modules.

## Logger API

### Import
```typescript
import logger from '@/lib/utils/logger';
```

### Methods

#### `logger.info(message: string, data?: LogData | unknown)`
Logs informational messages. Always logged.

```typescript
logger.info('User registered successfully', { userId: user.id });
```

#### `logger.error(message: string, error?: unknown, data?: LogData)`
Logs error messages. Always logged. Error object is formatted automatically.

```typescript
logger.error('Failed to send email', error, { email: user.email });
```

#### `logger.warn(message: string, data?: LogData | unknown)`
Logs warning messages. Always logged.

```typescript
logger.warn('DLT Template ID missing', { countryCode: '+91' });
```

#### `logger.debug(message: string, data?: LogData | unknown)`
Logs debug messages. Only logged in development/test environments.

```typescript
logger.debug('OTP generated', { mobile: '+91 9876543210', otp: '123456' });
```

## Log Format

All logs follow a consistent format:
```
[LEVEL] [CONTEXT] TIMESTAMP - message
```

Example:
```
[INFO] 2026-01-15T10:30:45.123Z - OTP SMS sent successfully
[ERROR] 2026-01-15T10:30:45.123Z - Failed to send email
```

## Files Updated

### Core Logger
- ✅ `lib/utils/logger.ts` - Centralized logger implementation

### Services
- ✅ `lib/email/gmail.ts` - Replaced local logger with centralized logger

### Error Handling
- ✅ `lib/security/error-handler.ts` - Updated to use centralized logger

### API Routes
- ✅ `app/api/auth/register/route.ts` - Replaced console.log with logger
- ✅ `app/api/auth/resend-otp/route.ts` - Replaced console.log with logger
- ✅ `app/api/auth/resend-email-otp/route.ts` - Replaced console.log with logger
- ✅ `app/api/auth/reset-password/route.ts` - Replaced console.log with logger
- ✅ `app/api/users/profile/route.ts` - Replaced console.log with logger

### Infrastructure
- ✅ `lib/mongodb.ts` - Replaced console.log/warn with logger
- ✅ `lib/utils/env.ts` - Replaced console.warn/error with logger
- ✅ `lib/api/client.ts` - Replaced console.error with logger

### Components
- ✅ `components/ErrorBoundary.tsx` - Replaced console.error with logger

## Log Levels

### Production
- **Info**: All informational messages
- **Error**: All error messages
- **Warn**: All warning messages
- **Debug**: Not logged (filtered out)

### Development/Test
- **Info**: All informational messages
- **Error**: All error messages with full stack traces
- **Warn**: All warning messages
- **Debug**: All debug messages

## Best Practices

### 1. Use Appropriate Log Levels
```typescript
// ✅ Good
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', error);
logger.warn('Rate limit approaching', { remaining: 5 });
logger.debug('Request details', { headers, body });

// ❌ Bad
logger.info('Critical error occurred', error); // Should be error
logger.error('User logged in', { userId: user.id }); // Should be info
```

### 2. Include Contextual Data
```typescript
// ✅ Good
logger.info('Order created', { orderId: order.id, total: order.total });

// ❌ Bad
logger.info('Order created');
```

### 3. Don't Log Sensitive Data
```typescript
// ✅ Good
logger.info('User authenticated', { userId: user.id });

// ❌ Bad
logger.info('User authenticated', { password: user.password, token: user.token });
```

### 4. Use Error Parameter for Errors
```typescript
// ✅ Good
logger.error('Failed to send email', error, { email: user.email });

// ❌ Bad
logger.error('Failed to send email', { error: error.message, email: user.email });
```

## Migration Notes

### Before
```typescript
console.log('[SMS] OTP sent', { mobile: user.mobile });
console.error('[ERROR] Failed to send', error);
```

### After
```typescript
logger.info('OTP sent', { mobile: user.mobile });
logger.error('Failed to send', error);
```

## Benefits

1. **Consistency**: All logs follow the same format
2. **Centralized Control**: Easy to modify logging behavior globally
3. **Environment Awareness**: Debug logs automatically filtered in production
4. **Structured Data**: Consistent JSON formatting for log data
5. **Error Handling**: Automatic error formatting with stack traces in development

## Future Enhancements

Potential improvements:
- Integration with external logging services (e.g., Sentry, LogRocket)
- Log rotation and file-based logging
- Request correlation IDs in all logs
- Performance metrics logging
- Structured logging with log levels for filtering

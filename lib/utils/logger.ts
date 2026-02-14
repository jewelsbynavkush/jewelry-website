/**
 * Centralized Logger Utility
 * In production outputs a single JSON line per log for log aggregation (e.g. Datadog, CloudWatch).
 */

import { isDevelopment, isProduction, isTest } from './env';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogData {
  [key: string]: unknown;
}

interface Logger {
  info: (message: string, data?: LogData | unknown) => void;
  error: (message: string, error?: unknown, data?: LogData) => void;
  warn: (message: string, data?: LogData | unknown) => void;
  debug: (message: string, data?: LogData | unknown) => void;
}

function toStructuredPayload(level: LogLevel, message: string, data?: LogData | unknown): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    level,
    timestamp: new Date().toISOString(),
    message,
  };
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    Object.assign(payload, data as Record<string, unknown>);
  } else if (data !== undefined) {
    payload.data = data;
  }
  return payload;
}

/**
 * Format error for logging
 */
function formatError(error: unknown): LogData {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: isDevelopment() || isTest() ? error.stack : undefined,
    };
  }
  return { error };
}

/**
 * Format log data for output
 */
function formatLogData(data?: LogData | unknown): string {
  if (!data) return '';
  
  try {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  } catch {
    return '[Unable to stringify data]';
  }
}

/**
 * Should log at this level?
 */
function shouldLog(level: LogLevel): boolean {
  if (level === 'error' || level === 'warn') {
    return true;
  }
  
  if (level === 'debug') {
    return isDevelopment() || isTest();
  }
  
  return true;
}

function createPrefix(level: LogLevel, context?: string): string {
  const timestamp = new Date().toISOString();
  const levelUpper = level.toUpperCase();
  const contextPart = context ? ` [${context}]` : '';
  return `[${levelUpper}]${contextPart} ${timestamp}`;
}

const logger: Logger = {
  info: (message: string, data?: LogData | unknown) => {
    if (!shouldLog('info')) return;
    if (isProduction()) {
      console.log(JSON.stringify(toStructuredPayload('info', message, data)));
      return;
    }
    const prefix = createPrefix('info');
    const formattedData = formatLogData(data);
    if (formattedData) {
      console.log(`${prefix} - ${message}`, formattedData);
    } else {
      console.log(`${prefix} - ${message}`);
    }
  },

  error: (message: string, error?: unknown, data?: LogData) => {
    if (!shouldLog('error')) return;
    const errorFields = error ? formatError(error) : {};
    if (isProduction()) {
      console.error(
        JSON.stringify(toStructuredPayload('error', message, { ...errorFields, ...(data ?? {}) }))
      );
      return;
    }
    const prefix = createPrefix('error');
    const errorData = error ? formatError(error) : null;
    const additionalData = data ? formatLogData(data) : null;
    const allData = [errorData, additionalData].filter(Boolean).join('\n');
    if (allData) {
      console.error(`${prefix} - ${message}`, allData);
    } else {
      console.error(`${prefix} - ${message}`);
    }
  },

  warn: (message: string, data?: LogData | unknown) => {
    if (!shouldLog('warn')) return;
    if (isProduction()) {
      console.log(JSON.stringify(toStructuredPayload('warn', message, data)));
      return;
    }
    const prefix = createPrefix('warn');
    const formattedData = formatLogData(data);
    if (formattedData) {
      console.warn(`${prefix} - ${message}`, formattedData);
    } else {
      console.warn(`${prefix} - ${message}`);
    }
  },

  debug: (message: string, data?: LogData | unknown) => {
    if (!shouldLog('debug')) return;
    if (isProduction()) {
      console.log(JSON.stringify(toStructuredPayload('debug', message, data)));
      return;
    }
    const prefix = createPrefix('debug');
    const formattedData = formatLogData(data);
    if (formattedData) {
      console.log(`${prefix} - ${message}`, formattedData);
    } else {
      console.log(`${prefix} - ${message}`);
    }
  },
};

export default logger;

export function logApiResponse(params: {
  method: string;
  path: string;
  status: number;
  correlationId: string;
}): void {
  if (isTest()) return;
  const payload = toStructuredPayload('info', 'api', {
    ...params,
    type: 'api_response',
  });
  if (isProduction()) {
    console.log(JSON.stringify(payload));
  } else {
    logger.info(`API ${params.method} ${params.path} ${params.status} [${params.correlationId}]`);
  }
}

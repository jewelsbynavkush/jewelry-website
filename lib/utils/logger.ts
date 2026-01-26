/**
 * Centralized Logger Utility
 * 
 * Provides consistent logging across the entire application.
 * Supports different log levels and formats data consistently.
 */

import { isDevelopment, isTest } from './env';

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
  // Always log errors and warnings
  if (level === 'error' || level === 'warn') {
    return true;
  }
  
  // Only log debug in development/test
  if (level === 'debug') {
    return isDevelopment() || isTest();
  }
  
  // Always log info
  return true;
}

/**
 * Create log prefix
 */
function createPrefix(level: LogLevel, context?: string): string {
  const timestamp = new Date().toISOString();
  const levelUpper = level.toUpperCase();
  const contextPart = context ? ` [${context}]` : '';
  return `[${levelUpper}]${contextPart} ${timestamp}`;
}

/**
 * Centralized logger instance
 */
const logger: Logger = {
  info: (message: string, data?: LogData | unknown) => {
    if (!shouldLog('info')) return;
    
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

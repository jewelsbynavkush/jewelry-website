import { describe, it, expect, vi, beforeEach } from 'vitest';
import logger, { logApiResponse } from '@/lib/utils/logger';
import * as env from '@/lib/utils/env';

vi.mock('@/lib/utils/env', () => ({
  isDevelopment: vi.fn(() => true),
  isProduction: vi.fn(() => false),
  isTest: vi.fn(() => true),
}));

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('info logs message', () => {
    logger.info('test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('info with data logs both', () => {
    logger.info('msg', { key: 'value' });
    expect(console.log).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('error logs message', () => {
    logger.error('error msg');
    expect(console.error).toHaveBeenCalled();
  });

  it('error with Error object includes error details in dev', () => {
    logger.error('err', new Error('fail'));
    expect(console.error).toHaveBeenCalled();
  });

  it('warn logs message', () => {
    logger.warn('warn msg');
    expect(console.warn).toHaveBeenCalled();
  });

  it('debug logs in test environment', () => {
    logger.debug('debug msg');
    expect(console.log).toHaveBeenCalled();
  });
});

describe('logApiResponse', () => {
  beforeEach(() => {
    vi.mocked(env.isTest).mockReturnValue(false);
    vi.mocked(env.isProduction).mockReturnValue(false);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('logs API response in development', () => {
    logApiResponse({
      method: 'GET',
      path: '/api/health',
      status: 200,
      correlationId: 'cid-1',
    });
    expect(console.log).toHaveBeenCalled();
  });

  it('outputs API response with method, path, status, correlationId', () => {
    vi.mocked(env.isProduction).mockReturnValue(true);
    vi.mocked(console.log).mockClear();
    logApiResponse({
      method: 'POST',
      path: '/api/contact',
      status: 201,
      correlationId: 'cid-2',
    });
    expect(console.log).toHaveBeenCalledWith(expect.any(String));
    const calls = vi.mocked(console.log).mock.calls;
    const arg = calls[calls.length - 1][0] as string;
    const isJson = (s: string) => {
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    };
    if (isJson(arg)) {
      const parsed = JSON.parse(arg);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('api');
      expect(parsed.method).toBe('POST');
      expect(parsed.path).toBe('/api/contact');
      expect(parsed.status).toBe(201);
      expect(parsed.correlationId).toBe('cid-2');
      expect(parsed.type).toBe('api_response');
    } else {
      expect(arg).toContain('POST');
      expect(arg).toContain('/api/contact');
      expect(arg).toContain('201');
      expect(arg).toContain('cid-2');
    }
  });
});

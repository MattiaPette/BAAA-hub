import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorCode } from '@baaa-hub/shared-types';
import { webhookSecretMiddleware, WebhookContext } from '../webhook.js';

// Mock the config module
vi.mock('../../config/index.js', () => ({
  default: {
    webhook: {
      secret: 'test-webhook-secret',
    },
  },
}));

/**
 * Creates a mock Koa context for testing webhook middleware
 */
const createMockContext = (
  webhookSecret?: string | string[],
): WebhookContext => {
  const headers: Record<string, string | string[] | undefined> = {};
  if (webhookSecret !== undefined) {
    headers['x-webhook-secret'] = webhookSecret;
  }

  return {
    status: 200,
    body: {},
    state: {},
    headers,
    request: {
      body: {},
    },
  } as unknown as WebhookContext;
};

describe('webhookSecretMiddleware', () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 401 if webhook secret header is missing', async () => {
    const ctx = createMockContext();

    await webhookSecretMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({
      error: 'Missing webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if webhook secret header is empty string', async () => {
    const ctx = createMockContext('');

    await webhookSecretMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({
      error: 'Missing webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if webhook secret is invalid', async () => {
    const ctx = createMockContext('wrong-secret');

    await webhookSecretMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({
      error: 'Invalid webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if webhook secret length does not match', async () => {
    const ctx = createMockContext('short');

    await webhookSecretMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({
      error: 'Invalid webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next if webhook secret is valid', async () => {
    const ctx = createMockContext('test-webhook-secret');

    await webhookSecretMiddleware(ctx, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(ctx.state.webhookValidated).toBe(true);
  });

  it('should handle array headers correctly (reject)', async () => {
    const ctx = createMockContext(['secret1', 'secret2']);

    await webhookSecretMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({
      error: 'Missing webhook secret',
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('webhookSecretMiddleware with unconfigured secret', () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockResolvedValue(undefined);
    // Override the mock to return empty secret
    vi.doMock('../../config/index.js', () => ({
      default: {
        webhook: {
          secret: '',
        },
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Note: This test verifies the error handling path when config is not set
  // In production, the secret should always be configured
  it('should return 500 if secret is not configured', async () => {
    // We need to re-import the module with the new mock
    vi.resetModules();
    vi.doMock('../../config/index.js', () => ({
      default: {
        webhook: {
          secret: '',
        },
      },
    }));

    const { webhookSecretMiddleware: middleware } = await import(
      '../webhook.js'
    );
    const ctx = createMockContext('any-secret');

    await middleware(ctx, mockNext);

    expect(ctx.status).toBe(500);
    expect(ctx.body).toEqual({
      error: 'Webhook secret not configured',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

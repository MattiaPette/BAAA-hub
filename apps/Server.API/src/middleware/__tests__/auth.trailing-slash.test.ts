import { describe, it, expect, vi } from 'vitest';
import type { Next } from 'koa';

// Mock config module with trailing slash in URL
vi.mock('../../config/index.js', () => ({
  default: {
    keycloak: {
      url: 'http://localhost:8180/', // Note the trailing slash!
      realm: 'test-realm',
      clientId: 'test-client',
    },
  },
}));

// Import after mocking
const { authMiddleware } = await import('../auth');
import type { AuthContext } from '../auth';

const createMockContext = (authHeader?: string): AuthContext => {
  return {
    headers: {
      authorization: authHeader,
    },
    status: 200,
    body: undefined,
    state: {},
  } as unknown as AuthContext;
};

/**
 * Create a valid JWT token (without signature verification for testing)
 */
const createTestToken = (
  payload: Record<string, unknown>,
  expOffset = 3600,
): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = {
    iat: now,
    exp: now + expOffset,
    iss: 'http://localhost:8180/realms/test-realm', // Standard issuer WITHOUT double slash
    ...payload,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    'base64url',
  );
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString(
    'base64url',
  );
  const signature = 'test-signature';

  return `${base64Header}.${base64Payload}.${signature}`;
};

describe('authMiddleware with trailing slash in Keycloak URL', () => {
  it('should accept valid tokens when config URL has trailing slash', async () => {
    // The token has the standard issuer format without double slashes
    const token = createTestToken({
      sub: 'keycloak-user123',
      email: 'test@example.com',
      email_verified: true,
      name: 'Test User',
      preferred_username: 'testuser',
    });
    const ctx = createMockContext(`Bearer ${token}`);
    const next: Next = vi.fn();

    await authMiddleware(ctx, next);

    // Should succeed even though config has trailing slash
    expect(next).toHaveBeenCalled();
    expect(ctx.state.auth).toEqual({
      userId: 'keycloak-user123',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      nickname: 'testuser',
      picture: undefined,
    });
  });

  it('should handle minimal token payload with trailing slash config', async () => {
    const token = createTestToken({ sub: 'keycloak-user456' });
    const ctx = createMockContext(`Bearer ${token}`);
    const next: Next = vi.fn();

    await authMiddleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.state.auth).toEqual({
      userId: 'keycloak-user456',
      email: undefined,
      emailVerified: undefined,
      name: undefined,
      nickname: undefined,
      picture: undefined,
    });
  });
});

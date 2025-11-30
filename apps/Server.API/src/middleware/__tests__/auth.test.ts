import { describe, it, expect, vi } from 'vitest';
import type { Next } from 'koa';
import { ErrorCode } from '@baaa-hub/shared-types';
import { authMiddleware, optionalAuthMiddleware, AuthContext } from '../auth';

// Mock config module
vi.mock('../../config/index.js', () => ({
  default: {
    keycloak: {
      url: 'http://localhost:8180',
      realm: 'test-realm',
      clientId: 'test-client',
    },
  },
}));

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
    iss: 'http://localhost:8180/realms/test-realm',
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

describe('authMiddleware', () => {
  describe('missing or invalid Authorization header', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const ctx = createMockContext();
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Authorization header missing or invalid',
        code: ErrorCode.UNAUTHORIZED,
      });
    });

    it('should return 401 when Authorization header is not Bearer type', async () => {
      const ctx = createMockContext('Basic dXNlcjpwYXNz');
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Authorization header missing or invalid',
        code: ErrorCode.UNAUTHORIZED,
      });
    });

    it('should return 401 when Bearer token is empty', async () => {
      const ctx = createMockContext('Bearer ');
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Invalid token format',
        code: ErrorCode.INVALID_TOKEN,
      });
    });
  });

  describe('invalid token format', () => {
    it('should return 401 for token with wrong number of parts', async () => {
      const ctx = createMockContext('Bearer invalid.token');
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Invalid token format',
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('should return 401 for token with invalid base64 payload', async () => {
      const ctx = createMockContext('Bearer header.!!!invalid!!!.signature');
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Invalid token format',
        code: ErrorCode.INVALID_TOKEN,
      });
    });
  });

  describe('token validation', () => {
    it('should return 401 when token is expired', async () => {
      const token = createTestToken({ sub: 'keycloak-123' }, -3600); // Expired 1 hour ago
      const ctx = createMockContext(`Bearer ${token}`);
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Token expired or invalid',
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('should return 401 when issuer does not match', async () => {
      const token = createTestToken({
        sub: 'keycloak-123',
        iss: 'http://wrong-keycloak:8180/realms/test-realm',
      });
      const ctx = createMockContext(`Bearer ${token}`);
      const next: Next = vi.fn();

      await authMiddleware(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: 'Token expired or invalid',
        code: ErrorCode.INVALID_TOKEN,
      });
    });
  });

  describe('successful authentication', () => {
    it('should extract user info and call next for valid token', async () => {
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

    it('should work with minimal user info', async () => {
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
});

describe('optionalAuthMiddleware', () => {
  describe('without Authorization header', () => {
    it('should call next without setting auth state', async () => {
      const ctx = createMockContext();
      const next: Next = vi.fn();

      await optionalAuthMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.state.auth).toBeUndefined();
    });
  });

  describe('with invalid Authorization header', () => {
    it('should call next without setting auth state for non-Bearer token', async () => {
      const ctx = createMockContext('Basic credentials');
      const next: Next = vi.fn();

      await optionalAuthMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.state.auth).toBeUndefined();
    });

    it('should call next without setting auth state for invalid token', async () => {
      const ctx = createMockContext('Bearer invalid.token');
      const next: Next = vi.fn();

      await optionalAuthMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.state.auth).toBeUndefined();
    });

    it('should call next without setting auth state for expired token', async () => {
      const token = createTestToken({ sub: 'keycloak-123' }, -3600);
      const ctx = createMockContext(`Bearer ${token}`);
      const next: Next = vi.fn();

      await optionalAuthMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.state.auth).toBeUndefined();
    });
  });

  describe('with valid Authorization header', () => {
    it('should extract user info and call next for valid token', async () => {
      const token = createTestToken({
        sub: 'keycloak-user789',
        email: 'optional@example.com',
        email_verified: false,
        name: 'Optional User',
        preferred_username: 'optionaluser',
      });
      const ctx = createMockContext(`Bearer ${token}`);
      const next: Next = vi.fn();

      await optionalAuthMiddleware(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.state.auth).toEqual({
        userId: 'keycloak-user789',
        email: 'optional@example.com',
        emailVerified: false,
        name: 'Optional User',
        nickname: 'optionaluser',
        picture: undefined,
      });
    });
  });
});

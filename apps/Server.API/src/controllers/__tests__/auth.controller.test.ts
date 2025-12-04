import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { register } from '../auth.controller.js';
import type { Context } from 'koa';

// Mock the config
vi.mock('../../config/index.js', () => ({
  default: {
    keycloak: {
      url: 'http://localhost:8180',
      realm: 'test-realm',
      clientId: 'test-client',
      adminClientId: 'admin-client',
      adminClientSecret: 'admin-secret',
    },
  },
}));

describe('Auth Controller', () => {
  let mockContext: Partial<Context>;

  beforeEach(() => {
    mockContext = {
      request: {
        body: {},
      } as Context['request'],
      status: 200,
      body: undefined,
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should return 400 if email is missing', async () => {
      mockContext.request!.body = { password: 'password123' };

      await register(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should return 400 if password is missing', async () => {
      mockContext.request!.body = { email: 'test@example.com' };

      await register(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should return 400 if email format is invalid', async () => {
      mockContext.request!.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      await register(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should return 400 if password is too short', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'short',
      };

      await register(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        error: 'Password must be at least 8 characters',
        code: 'PASSWORD_POLICY',
      });
    });

    it('should return 201 when user is created successfully', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock fetch for token and user creation
      const mockFetch = vi.fn();
      mockFetch
        // First call: get admin token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'admin-token',
            expires_in: 3600,
            token_type: 'Bearer',
          }),
        })
        // Second call: create user
        .mockResolvedValueOnce({
          status: 201,
          ok: true,
        });

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body).toEqual({
        message: 'User registered successfully',
      });
    });

    it('should return 409 when user already exists', async () => {
      mockContext.request!.body = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockFetch = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'admin-token',
            expires_in: 3600,
            token_type: 'Bearer',
          }),
        })
        .mockResolvedValueOnce({
          status: 409,
          ok: false,
          json: async () => ({}),
        });

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(409);
      expect(mockContext.body).toEqual({
        error: 'A user with this email already exists',
        code: 'USER_EXISTS',
      });
    });

    it('should return 409 when username is taken', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'password123',
        username: 'existinguser',
      };

      const mockFetch = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'admin-token',
            expires_in: 3600,
            token_type: 'Bearer',
          }),
        })
        .mockResolvedValueOnce({
          status: 400,
          ok: false,
          json: async () => ({
            errorMessage: 'Username already exists',
          }),
        });

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(409);
      expect(mockContext.body).toEqual({
        error: 'Username is already taken',
        code: 'USERNAME_EXISTS',
      });
    });

    it('should return 400 when password policy is not met', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'weakpassword',
      };

      const mockFetch = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'admin-token',
            expires_in: 3600,
            token_type: 'Bearer',
          }),
        })
        .mockResolvedValueOnce({
          status: 400,
          ok: false,
          json: async () => ({
            errorMessage: 'Password policy not met',
          }),
        });

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        error: 'Password does not meet requirements',
        code: 'PASSWORD_POLICY',
      });
    });

    it('should return 500 when admin token fetch fails', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_client',
        }),
      });

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(500);
      expect(mockContext.body).toEqual({
        error: 'Failed to authenticate with Keycloak admin API',
        code: 'SERVER_ERROR',
      });
    });

    it('should return 500 on unexpected errors', async () => {
      mockContext.request!.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'));

      vi.stubGlobal('fetch', mockFetch);

      await register(mockContext as Context);

      expect(mockContext.status).toBe(500);
      expect(mockContext.body).toEqual({
        error: 'An error occurred during registration',
        code: 'SERVER_ERROR',
      });
    });
  });
});

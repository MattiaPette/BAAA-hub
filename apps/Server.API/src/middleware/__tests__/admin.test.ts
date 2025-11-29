import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorCode, UserRole } from '@baaa-hub/shared-types';
import { adminMiddleware, AdminContext } from '../admin.js';

// Mock the user model
const mockFindByAuthId = vi.fn();
vi.mock('../../models/user.model.js', () => ({
  User: {
    findByAuthId: (authId: string) => mockFindByAuthId(authId),
  },
}));

/**
 * Creates a mock Koa context for testing admin middleware
 */
const createMockContext = (userId: string = 'auth0|123'): AdminContext => {
  return {
    status: 200,
    body: {},
    state: {
      auth: {
        userId,
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
      },
    },
    headers: {},
  } as unknown as AdminContext;
};

describe('adminMiddleware', () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    mockFindByAuthId.mockResolvedValue(null);
    const ctx = createMockContext();

    await adminMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(404);
    expect(ctx.body).toEqual({
      error: 'User not found',
      code: ErrorCode.USER_NOT_FOUND,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if user is blocked', async () => {
    mockFindByAuthId.mockResolvedValue({
      id: 'user-123',
      isBlocked: true,
      roles: [UserRole.ADMIN],
    });
    const ctx = createMockContext();

    await adminMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(403);
    expect(ctx.body).toEqual({
      error: 'User account is blocked',
      code: ErrorCode.USER_BLOCKED,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have admin role', async () => {
    mockFindByAuthId.mockResolvedValue({
      id: 'user-123',
      isBlocked: false,
      roles: [UserRole.MEMBER],
    });
    const ctx = createMockContext();

    await adminMiddleware(ctx, mockNext);

    expect(ctx.status).toBe(403);
    expect(ctx.body).toEqual({
      error: 'Admin privileges required',
      code: ErrorCode.FORBIDDEN,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next if user has admin role', async () => {
    mockFindByAuthId.mockResolvedValue({
      id: 'user-123',
      isBlocked: false,
      roles: [UserRole.MEMBER, UserRole.ADMIN],
    });
    const ctx = createMockContext();

    await adminMiddleware(ctx, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(ctx.state.adminUser).toEqual({
      id: 'user-123',
      roles: [UserRole.MEMBER, UserRole.ADMIN],
    });
  });

  it('should call next if user only has admin role', async () => {
    mockFindByAuthId.mockResolvedValue({
      id: 'user-123',
      isBlocked: false,
      roles: [UserRole.ADMIN],
    });
    const ctx = createMockContext();

    await adminMiddleware(ctx, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(ctx.state.adminUser.id).toBe('user-123');
  });

  it('should use correct authId from context', async () => {
    mockFindByAuthId.mockResolvedValue({
      id: 'user-456',
      isBlocked: false,
      roles: [UserRole.ADMIN],
    });
    const ctx = createMockContext('custom-auth-id');

    await adminMiddleware(ctx, mockNext);

    expect(mockFindByAuthId).toHaveBeenCalledWith('custom-auth-id');
  });
});

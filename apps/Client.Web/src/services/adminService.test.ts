import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import axios from 'axios';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
} from '@baaa-hub/shared-types';
import {
  listUsers,
  getUserById,
  updateUserRoles,
  updateUserBlocked,
  ListUsersParams,
} from './adminService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      patch: vi.fn(),
    })),
  },
}));

const createMockUser = (overrides = {}) => ({
  id: '1',
  authId: 'auth0|1',
  name: 'John',
  surname: 'Doe',
  nickname: 'johndoe',
  email: 'john@example.com',
  dateOfBirth: '1990-01-01',
  sportTypes: [SportType.RUNNING],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isBlocked: false,
  isEmailVerified: true,
  mfaEnabled: false,
  mfaType: MfaType.NONE,
  roles: [UserRole.MEMBER],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
  ...overrides,
});

describe('adminService', () => {
  let mockAxiosInstance: {
    get: Mock;
    patch: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      patch: vi.fn(),
    };

    (axios.create as Mock).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('listUsers', () => {
    it('should fetch users without any params', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser()],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await listUsers('test-token');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/admin/users?');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with pagination params', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser()],
          pagination: {
            page: 2,
            perPage: 20,
            total: 50,
            totalPages: 3,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        page: 2,
        perPage: 20,
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?page=2&perPage=20',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with search param', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser()],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        search: 'john',
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?search=john',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with role filter', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser({ roles: [UserRole.MEMBER, UserRole.ADMIN] })],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        role: UserRole.ADMIN,
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?role=ADMIN',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with blocked filter', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser({ isBlocked: true })],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        blocked: true,
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?blocked=true',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with emailVerified filter', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser({ isEmailVerified: true })],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        emailVerified: true,
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?emailVerified=true',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with mfaEnabled filter', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser({ mfaEnabled: true, mfaType: MfaType.TOTP })],
          pagination: {
            page: 1,
            perPage: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        mfaEnabled: true,
      };

      const result = await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?mfaEnabled=true',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with multiple params', async () => {
      const mockResponse = {
        data: {
          data: [createMockUser()],
          pagination: {
            page: 1,
            perPage: 25,
            total: 10,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params: ListUsersParams = {
        page: 1,
        perPage: 25,
        search: 'test',
        role: UserRole.MEMBER,
        blocked: false,
        emailVerified: true,
        mfaEnabled: false,
      };

      await listUsers('test-token', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users?page=1&perPage=25&search=test&role=MEMBER&blocked=false&emailVerified=true&mfaEnabled=false',
      );
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by ID', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getUserById('test-token', 'user-123');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/admin/users/user-123',
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle user with admin role', async () => {
      const mockUser = createMockUser({
        roles: [UserRole.MEMBER, UserRole.ADMIN],
      });
      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getUserById('test-token', 'admin-user-id');

      expect(result.roles).toContain(UserRole.ADMIN);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles', async () => {
      const updatedUser = createMockUser({
        roles: [UserRole.MEMBER, UserRole.ADMIN],
      });
      const mockResponse = {
        data: {
          user: updatedUser,
        },
      };

      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updateUserRoles('test-token', 'user-123', [
        UserRole.MEMBER,
        UserRole.ADMIN,
      ]);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/api/admin/users/user-123/roles',
        { roles: [UserRole.MEMBER, UserRole.ADMIN] },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should remove admin role', async () => {
      const updatedUser = createMockUser({
        roles: [UserRole.MEMBER],
      });
      const mockResponse = {
        data: {
          user: updatedUser,
        },
      };

      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updateUserRoles('test-token', 'user-123', [
        UserRole.MEMBER,
      ]);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/api/admin/users/user-123/roles',
        { roles: [UserRole.MEMBER] },
      );
      expect(result.roles).toEqual([UserRole.MEMBER]);
    });
  });

  describe('updateUserBlocked', () => {
    it('should block a user', async () => {
      const updatedUser = createMockUser({ isBlocked: true });
      const mockResponse = {
        data: {
          user: updatedUser,
        },
      };

      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updateUserBlocked('test-token', 'user-123', true);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/api/admin/users/user-123/blocked',
        { isBlocked: true },
      );
      expect(result.isBlocked).toBe(true);
    });

    it('should unblock a user', async () => {
      const updatedUser = createMockUser({ isBlocked: false });
      const mockResponse = {
        data: {
          user: updatedUser,
        },
      };

      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updateUserBlocked('test-token', 'user-123', false);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/api/admin/users/user-123/blocked',
        { isBlocked: false },
      );
      expect(result.isBlocked).toBe(false);
    });
  });
});

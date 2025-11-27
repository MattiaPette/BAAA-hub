import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import axios from 'axios';
import {
  SportType,
  CreateUserRequest,
  UpdateUserRequest,
} from '@baaa-hub/shared-types';
import {
  checkProfileStatus,
  createUserProfile,
  getCurrentUser,
  updateUserProfile,
  checkNicknameAvailability,
} from './userService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    })),
  },
}));

describe('userService', () => {
  let mockAxiosInstance: {
    get: Mock;
    post: Mock;
    patch: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    };

    (axios.create as Mock).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkProfileStatus', () => {
    it('should return profile status when user has a profile', async () => {
      const mockResponse = {
        data: {
          hasProfile: true,
          user: {
            id: '1',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await checkProfileStatus('test-token');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/users/profile/status',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return profile status when user has no profile', async () => {
      const mockResponse = {
        data: {
          hasProfile: false,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await checkProfileStatus('test-token');

      expect(result).toEqual({ hasProfile: false });
    });
  });

  describe('createUserProfile', () => {
    it('should create a new user profile', async () => {
      const createData: CreateUserRequest = {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        dateOfBirth: '1990-05-15',
        sportTypes: [SportType.RUNNING],
      };

      const mockUser = {
        id: '1',
        ...createData,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createUserProfile('test-token', createData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/users',
        createData,
      );
      expect(result).toEqual(mockUser);
    });

    it('should pass optional fields when provided', async () => {
      const createData: CreateUserRequest = {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        dateOfBirth: '1990-05-15',
        sportTypes: [SportType.RUNNING, SportType.CYCLING],
        stravaLink: 'https://www.strava.com/athletes/12345',
        instagramLink: 'https://www.instagram.com/johndoe',
      };

      const mockUser = {
        id: '1',
        ...createData,
      };

      mockAxiosInstance.post.mockResolvedValue({ data: { user: mockUser } });

      const result = await createUserProfile('test-token', createData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/users',
        createData,
      );
      expect(result.stravaLink).toBe(createData.stravaLink);
      expect(result.instagramLink).toBe(createData.instagramLink);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      const mockUser = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        dateOfBirth: '1990-05-15',
        sportTypes: [SportType.RUNNING],
      };

      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getCurrentUser('test-token');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with provided fields', async () => {
      const updateData: UpdateUserRequest = {
        name: 'Jane',
        surname: 'Smith',
      };

      const mockUser = {
        id: '1',
        name: 'Jane',
        surname: 'Smith',
        nickname: 'johndoe',
        email: 'john@example.com',
      };

      const mockResponse = {
        data: {
          user: mockUser,
        },
      };

      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updateUserProfile('test-token', updateData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        '/api/users/me',
        updateData,
      );
      expect(result).toEqual(mockUser);
    });

    it('should update sport types', async () => {
      const updateData: UpdateUserRequest = {
        sportTypes: [SportType.SWIMMING, SportType.TRIATHLON],
      };

      const mockUser = {
        id: '1',
        sportTypes: [SportType.SWIMMING, SportType.TRIATHLON],
      };

      mockAxiosInstance.patch.mockResolvedValue({ data: { user: mockUser } });

      const result = await updateUserProfile('test-token', updateData);

      expect(result.sportTypes).toEqual([
        SportType.SWIMMING,
        SportType.TRIATHLON,
      ]);
    });

    it('should update social links', async () => {
      const updateData: UpdateUserRequest = {
        stravaLink: 'https://www.strava.com/athletes/99999',
        instagramLink: 'https://www.instagram.com/newuser',
      };

      const mockUser = {
        id: '1',
        stravaLink: 'https://www.strava.com/athletes/99999',
        instagramLink: 'https://www.instagram.com/newuser',
      };

      mockAxiosInstance.patch.mockResolvedValue({ data: { user: mockUser } });

      const result = await updateUserProfile('test-token', updateData);

      expect(result.stravaLink).toBe(updateData.stravaLink);
      expect(result.instagramLink).toBe(updateData.instagramLink);
    });
  });

  describe('checkNicknameAvailability', () => {
    it('should return available true when nickname is available', async () => {
      const mockResponse = {
        data: {
          available: true,
          nickname: 'available_nick',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await checkNicknameAvailability('available_nick');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/users/nickname/available_nick/available',
      );
      expect(result).toEqual({ available: true, nickname: 'available_nick' });
    });

    it('should return available false when nickname is taken', async () => {
      const mockResponse = {
        data: {
          available: false,
          nickname: 'taken_nick',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await checkNicknameAvailability('taken_nick');

      expect(result).toEqual({ available: false, nickname: 'taken_nick' });
    });

    it('should encode special characters in nickname', async () => {
      const mockResponse = {
        data: {
          available: true,
          nickname: 'test@nick',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await checkNicknameAvailability('test@nick');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/users/nickname/test%40nick/available',
      );
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance without auth header when no token is provided', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { available: true, nickname: 'test' },
      });

      await checkNicknameAvailability('test');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create axios instance with auth header when token is provided', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { hasProfile: true },
      });

      await checkProfileStatus('my-access-token');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer my-access-token',
        },
      });
    });
  });
});

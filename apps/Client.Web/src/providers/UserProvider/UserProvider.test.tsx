import { waitFor, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ReactNode } from 'react';
import { User, SportType, PrivacyLevel, MfaType } from '@baaa-hub/shared-types';
import { UserProvider, useUser } from './UserProvider';
import * as AuthProviderModule from '../AuthProvider/AuthProvider';
import * as userService from '../../services/userService';

// Mock the user service
vi.mock('../../services/userService', () => ({
  checkProfileStatus: vi.fn(),
}));

const mockUser: User = {
  id: '1',
  authId: 'auth0|123',
  name: 'John',
  surname: 'Doe',
  nickname: 'johndoe',
  email: 'john@example.com',
  dateOfBirth: '1990-05-15',
  sportTypes: [SportType.RUNNING],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isBlocked: false,
  isEmailVerified: true,
  mfaEnabled: false,
  mfaType: MfaType.NONE,
  roles: [],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
};

describe('UserProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = () =>
    function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
      return <UserProvider>{children}</UserProvider>;
    };

  describe('when authenticated', () => {
    beforeEach(() => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        token: {
          idToken: 'test-id-token',
          accessToken: 'test-access-token',
          idTokenPayload: { email: 'test@example.com' },
        },
        isAuthenticated: true,
        localStorageAvailable: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        authenticate: vi.fn(),

        userPermissions: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it('should fetch user profile on mount', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(userService.checkProfileStatus).toHaveBeenCalledWith(
        'test-access-token',
      );
      expect(result.current.hasProfile).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should set hasProfile to false when user has no profile', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: false,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasProfile).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle error when fetching profile status fails', async () => {
      (userService.checkProfileStatus as Mock).mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load profile');
      expect(result.current.hasProfile).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should allow refreshing user data', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the mock to track refresh call
      vi.clearAllMocks();

      const updatedUser = { ...mockUser, name: 'Jane' };
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: updatedUser,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(userService.checkProfileStatus).toHaveBeenCalled();
      expect(result.current.user?.name).toBe('Jane');
    });

    it('should allow setting user directly', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newUser = { ...mockUser, name: 'Updated' };

      act(() => {
        result.current.setUser(newUser);
      });

      expect(result.current.user?.name).toBe('Updated');
    });

    it('should allow setting user to null', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
    });

    it('should clear error on successful refresh', async () => {
      // First call fails
      (userService.checkProfileStatus as Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load profile');
      });

      // Second call succeeds
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        token: null,
        isAuthenticated: false,
        localStorageAvailable: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        authenticate: vi.fn(),

        userPermissions: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it('should not fetch profile when not authenticated', async () => {
      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(userService.checkProfileStatus).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.hasProfile).toBe(false);
    });

    it('should clear user data when becoming unauthenticated', async () => {
      // Start authenticated
      const authMock = vi.spyOn(AuthProviderModule, 'useAuth');
      authMock.mockReturnValue({
        token: {
          idToken: 'test-id-token',
          accessToken: 'test-access-token',
          idTokenPayload: { email: 'test@example.com' },
        },
        isAuthenticated: true,
        localStorageAvailable: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        authenticate: vi.fn(),

        userPermissions: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result, rerender } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Become unauthenticated
      authMock.mockReturnValue({
        token: null,
        isAuthenticated: false,
        localStorageAvailable: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        authenticate: vi.fn(),

        userPermissions: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.hasProfile).toBe(false);
      });
    });
  });

  describe('useUser hook', () => {
    it('should throw error when used outside UserProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(useUser);
      }).toThrow('useUser must be used within a UserProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('context value memoization', () => {
    beforeEach(() => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        token: {
          idToken: 'test-id-token',
          accessToken: 'test-access-token',
          idTokenPayload: { email: 'test@example.com' },
        },
        isAuthenticated: true,
        localStorageAvailable: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        authenticate: vi.fn(),

        userPermissions: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it('should provide stable context value', async () => {
      (userService.checkProfileStatus as Mock).mockResolvedValue({
        hasProfile: true,
        user: mockUser,
      });

      const { result } = renderHook(useUser, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Context should have all expected properties
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('hasProfile');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refreshUser');
      expect(result.current).toHaveProperty('setUser');
    });
  });
});

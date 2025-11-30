import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { User, UserRole, PrivacyLevel, MfaType } from '@baaa-hub/shared-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import * as userService from '../../services/userService';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';

// Mock the userService
vi.mock('../../services/userService', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock the AuthProvider
vi.mock('../../providers/AuthProvider/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('useCurrentUser', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const mockUser: User = {
    id: '1',
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-01-01',
    sportTypes: [],
    authId: 'keycloak-user-123',
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
  };

  it('should fetch user data when authenticated', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      token: {
        idToken: 'mock-id-token',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      userPermissions: [],
      authClientData: {} as never,
      keycloak: null,
    });

    vi.spyOn(userService, 'getCurrentUser').mockResolvedValue(mockUser);

    const { result } = renderHook(useCurrentUser, { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(userService.getCurrentUser).toHaveBeenCalledWith('mock-id-token');
  });

  it('should not fetch when not authenticated', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      token: null,
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      userPermissions: [],
      authClientData: {} as never,
      keycloak: null,
    });

    const { result } = renderHook(useCurrentUser, { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(true);
    expect(userService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should not fetch when token is missing', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      token: null,
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      userPermissions: [],
      authClientData: {} as never,
      keycloak: null,
    });

    const { result } = renderHook(useCurrentUser, { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(userService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should handle errors when fetching user data', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      token: {
        idToken: 'mock-id-token',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      userPermissions: [],
      authClientData: {} as never,
      keycloak: null,
    });

    const mockError = new Error('Failed to fetch user');
    (userService.getCurrentUser as Mock).mockRejectedValue(mockError);

    const { result } = renderHook(useCurrentUser, { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should not fetch when idToken is missing', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      token: {
        idToken: undefined as never,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      isLoading: false,
      localStorageAvailable: true,
      login: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      signup: vi.fn(),
      setLoading: vi.fn(),
      userPermissions: [],
      authClientData: {} as never,
      keycloak: null,
    });

    const { result } = renderHook(useCurrentUser, { wrapper });

    // The query should not be enabled, so it should remain in pending state
    expect(result.current.isPending).toBe(true);
    expect(userService.getCurrentUser).not.toHaveBeenCalled();
  });
});

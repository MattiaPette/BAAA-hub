import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnackbarProvider } from 'notistack';
import {
  UserRole,
  PrivacyLevel,
  SportType,
  MfaType,
} from '@baaa-hub/shared-types';
import { Administration } from './Administration';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import * as AuthProviderModule from '../../providers/AuthProvider/AuthProvider';
import * as UserProviderModule from '../../providers/UserProvider/UserProvider';
import * as adminService from '../../services/adminService';

// Mock the services
vi.mock('../../services/adminService', () => ({
  listUsers: vi.fn(),
  updateUserBlocked: vi.fn(),
  updateUserRoles: vi.fn(),
}));

// Mock the UserProvider module
vi.mock('../../providers/UserProvider/UserProvider', async () => {
  const actual = await vi.importActual(
    '../../providers/UserProvider/UserProvider',
  );
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

const mockUsers = [
  {
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
    mfaEnabled: true,
    mfaType: MfaType.TOTP,
    roles: [UserRole.MEMBER, UserRole.ADMIN],
    privacySettings: {
      email: PrivacyLevel.PUBLIC,
      dateOfBirth: PrivacyLevel.PUBLIC,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  },
  {
    id: '2',
    authId: 'auth0|2',
    name: 'Jane',
    surname: 'Smith',
    nickname: 'janesmith',
    email: 'jane@example.com',
    dateOfBirth: '1995-06-15',
    sportTypes: [SportType.CYCLING],
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    isBlocked: true,
    isEmailVerified: false,
    mfaEnabled: false,
    mfaType: MfaType.NONE,
    roles: [UserRole.MEMBER],
    privacySettings: {
      email: PrivacyLevel.PRIVATE,
      dateOfBirth: PrivacyLevel.PRIVATE,
      sportTypes: PrivacyLevel.PUBLIC,
      socialLinks: PrivacyLevel.PUBLIC,
    },
  },
];

describe('Administration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the auth context
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      token: {
        idToken: 'test-id-token',
        idTokenPayload: {
          email: 'admin@example.com',
          nickname: 'admin',
          name: 'Admin User',
          picture: 'https://example.com/avatar.png',
          updated_at: '2024-01-01T00:00:00.000Z',
          iss: 'https://test.auth0.com/',
          aud: 'test-client-id',
          iat: 1234567890,
          exp: 1234567890,
          sub: 'auth0|admin',
          at_hash: 'hash',
          sid: 'session-id',
          nonce: 'nonce',
          db_roles: ['admin'],
        },
      },
      isAuthenticated: true,
      localStorageAvailable: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      authenticate: vi.fn(),
      loginWithRedirect: vi.fn(),
      isLoading: false,
      setLoading: vi.fn(),
      authClientData: {
        domain: 'test.auth0.com',
        clientID: 'test-client-id',
        responseType: 'token',
        userDatabaseConnection: 'Username-Password-Authentication',
        scope: 'openid profile email',
        redirectUri: 'http://localhost:3000',
      },
      userPermissions: ['admin'],
    });

    // Mock the useUser hook
    vi.mocked(UserProviderModule.useUser).mockReturnValue({
      user: {
        id: 'admin-user-id',
        authId: 'auth0|admin',
        name: 'Admin',
        surname: 'User',
        nickname: 'admin',
        email: 'admin@example.com',
        dateOfBirth: '1990-01-01',
        sportTypes: [SportType.RUNNING],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isBlocked: false,
        isEmailVerified: true,
        mfaEnabled: true,
        mfaType: MfaType.TOTP,
        roles: [UserRole.MEMBER, UserRole.ADMIN],
        privacySettings: {
          email: PrivacyLevel.PUBLIC,
          dateOfBirth: PrivacyLevel.PUBLIC,
          sportTypes: PrivacyLevel.PUBLIC,
          socialLinks: PrivacyLevel.PUBLIC,
        },
      },
      hasProfile: true,
      isLoading: false,
      error: null,
      refreshUser: vi.fn(),
      setUser: vi.fn(),
    });

    // Mock the listUsers service
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: mockUsers,
      pagination: {
        page: 1,
        perPage: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  const renderAdministration = () =>
    render(
      <SnackbarProvider>
        <BreadcrumProvider>
          <Administration />
        </BreadcrumProvider>
      </SnackbarProvider>,
    );

  it('should render Administration page title', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });
  });

  it('should render page description', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByText('Manage users, roles, and account status.'),
      ).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name, email, or nickname...'),
      ).toBeInTheDocument();
    });
  });

  it('should render table headers', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Nickname')).toBeInTheDocument();
    });
  });

  it('should fetch and display users', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('should display user roles as chips', async () => {
    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should display loading indicator while fetching', async () => {
    vi.mocked(adminService.listUsers).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: [],
              pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 },
            });
          }, 1000);
        }),
    );

    renderAdministration();

    // Loading indicator should be shown initially
    const progressIndicator = screen.queryByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    vi.mocked(adminService.listUsers).mockRejectedValue(
      new Error('Network error'),
    );

    renderAdministration();

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load users. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should display no users message when list is empty', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    });

    renderAdministration();

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});
